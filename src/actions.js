"use strict";

const fs = require('fs')
    , N3 = require('n3')
    , path = require('path')
    , pump = require('pump')
    , jsonld = require('jsonld')
    , concat = require('concat-stream')
    , through = require('through2')
    , parseAnnots = require('pdf2oac')
    , { PopplerDocument } = require('poppler-simple')
    , ld = require('./ld')
    , types = require('./types')
    , { Actions, Notebook } = types

module.exports = {
  addNotebook,
  listNotebooks,
  getAnnotsForNotebook,
}

const frame = {
  '@context': ld.context,
  '@type': 'oa:Annotation',
}


function listNotebooks() {
  return async (dispatch, getState, { notebookDB }) => {
    await new Promise((resolve, reject) =>
      pump(notebookDB.createValueStream(), concat(nbs => {
        dispatch(Actions.SetAvailableNotebooks(
          nbs.map(Notebook.NotebookOf)
        ));
        resolve();
      })).on('error', reject))
  }
}

function getAnnotStream(source, { annotDB }) {
  return source.case({
    Notebook: id =>
      annotDB.createValueStream({
        gt: id,
        lte: id + 'ÿ'
      }),

    _: () => {
      throw new Error('Not implemented: ' + source)
    }
  })
}

function promisePump(...streams) {
  return new Promise((resolve, reject) =>
    pump(...streams, err => {
      if (err) reject(err);
      resolve()
    }))
}


function getAnnotsForNotebook(notebookURI) {
  return async (dispatch, getState, { annotDB, notebookDB }) => {
    const source = types.AnnotationSource.NotebookOf({
      notebook: notebookURI
    })

    let annotations

    await promisePump(
      getAnnotStream(source, { annotDB }),
      concat(_annotations => annotations = _annotations))

    dispatch(Actions.SetOpenAnnotations(
      source,
      annotations
    ))

    return;
  }
}

const zeroPad = (places, number) => {
  let str = number.toString()

  while (str.length < places) {
    str = '0' + str;
  }

  return str;
}


function addNotebook(pdfFilename, name, description) {
  pdfFilename = path.resolve(pdfFilename)

  const notebook = ld.generateNotebook(pdfFilename, name, description)
      , baseURI = notebook['@context']['@base']
      , pdfURI = 'file://' + pdfFilename
      , annots = []

  const addAnnotation = annot => {
    notebook.annotations.push(annot.id);
    annots.push(annot);
  }

  const doc = new PopplerDocument(pdfURI)

  const totalPages = doc.pageCount + 1

  return async (dispatch, getState, { pdfDB, annotDB, notebookDB }) => {
    const opts = {
      pdfURI,
      baseURI,
      mintAnnotURI(part, i, annot) {
        return [
          baseURI,
          'annot',
          zeroPad(5, annot.page),
          '-',
          zeroPad(5, i),
          part ? ('/' + part) : ''
        ].join('')
      }
    }

    function updateProgress(pageNumber) {
      const progress =
        pageNumber === Infinity
          ? 1
          : pageNumber / totalPages

      dispatch(Actions.SetDocumentLoadProgress(
        pdfFilename,
        progress
      ))
    }

    await new Promise((resolve, reject) =>
      fs.createReadStream(pdfFilename)
        .pipe(pdfDB.createWriteStream(pdfURI))
        .on('error', reject)
        .on('close', resolve))

    await promisePump(
      parseAnnots(pdfFilename, opts),
      new N3.StreamWriter({ format: 'N-Triples' }),
      through.obj(function (trip, enc, cb) {
        const pageMatch = /"#page=(\d+).*\./.exec(trip)

        if (pageMatch) {
          updateProgress(pageMatch[1])
        }

        this.push(trip);
        cb();
      }),
      concat(rdf => {
        jsonld.fromRDF(rdf, (err, doc) => {
          if (err) throw err;
          jsonld.frame(doc, frame, (err, doc) => {
            if (err) throw err;
            doc['@graph'].forEach(addAnnotation);
          })
        })
      }))

    const ops = annots.map(annot => ({
      type: 'put',
      key: annot.id,
      value: annot,
    })).concat({
      type: 'put',
      key: notebook.id,
      value: notebook,
      prefix: notebookDB
    })

    await new Promise((resolve, reject) =>
      annotDB.batch(ops, err => {
        if (err) reject(err);
        resolve();
      }))

    updateProgress(Infinity);

    await dispatch(listNotebooks());

    return;
  }
}
