"use strict";

const fs = require('fs')
    , N3 = require('n3')
    , path = require('path')
    , pump = require('pump')
    , jsonld = require('jsonld')
    , concat = require('concat-stream')
    , through = require('through2')
    , parseAnnots = require('pdf2oac')
    , ld = require('./ld')
    , { $ } = ld
    , { Actions, Notebook } = require('./types')

module.exports = {
  listNotebooks,
  addNotebook,
  getPDFDocument,
  getAnnotsForNotebook,
}

/*
function dumpTurtle(graph=null) {
  return async (dispatch, getState, { graphDB }) => {
    const docs = await new Promise((resolve, reject) =>
      pump(
        graphDB.getStream({}),
        N3.StreamWriter({ prefixes: ld.prefixes }),
        concat(data => {
          resolve(data)
        }))
      .on('error', reject)
    )

    return docs;
  }
}
*/

function search(graphDB, fn, materialized) {
  const args = [fn(graphDB)].concat(materialized ? [{ materialized }] : [])

  return new Promise((resolve, reject) =>
    graphDB.search(...args, (err, results) => {
      if (err) reject(err);
      resolve(results)
    }))
}

function get(graphDB, pattern) {
  return new Promise((resolve, reject) =>
    graphDB.get(pattern, (err, results) => {
      if (err) reject(err);
      resolve(results)
    }))
}

function listNotebooks() {
  return async (dispatch, getState, { graphDB }) => {
    const docs = await search(graphDB, db =>
      $(db.v('uri'))({
        'rdf:type': 'flor:Notebook',
        'rdfs:label': db.v('name'),
        'dce:description': db.v('description')
      }))

    dispatch(Actions.SetAvailableNotebooks(
      docs.map(Notebook.NotebookOf)
    ))

    return;
  }
}

function getAnnotsForNotebook(notebookURI) {
  return async (dispatch, getState, { graphDB }) => {
    let rdf;
    console.log('loading');

    await new Promise((resolve, reject) =>
      pump(
        graphDB.getStream({ graph: notebookURI }),
        N3.StreamWriter({ format: 'N-triples' }),
        concat(_rdf => {
          rdf = _rdf;
          resolve()
        })).on('error', reject))

    const doc = await jsonld.promises.fromRDF(rdf)

    const normalized = await jsonld.promises.frame(doc, {
      "@context": Object.assign({}, ld.prefixes, {
        'type': '@type',
        'Annotation': 'oa:Annotation'
      })
    })

    const annots = normalized['@graph'].filter(item => item.type === 'Annotation')

    console.log(annots);

    return;
  }
}

function getPDFDocument(pdfURI) {
  return async (dispatch, getState, { pdfDB }) => {
    await new Promise((resolve, reject) =>
      pump(pdfDB.createReadStream(pdfURI), concat(data => {
        data;
      })).on('error', reject).on('done', resolve))
  }
}

function addNotebook(pdfFilename, name, description) {
  const {
    notebookTriples,
    notebookURI,
    pdfURI,
    annotCollectionURI
  } = ld.generateNotebook(path.basename(pdfFilename), name, description)

  return async (dispatch, getState, { graphDB, pdfDB }) => {
    await new Promise((resolve, reject) => {
      fs.createReadStream(pdfFilename)
        .on('error', reject)
        .pipe(pdfDB.createWriteStream(pdfURI))
        .on('error', reject)
        .on('close', () => resolve())
    })

    await new Promise((resolve, reject) => {
      const opts = {
        pdfURI,
        graphURI: notebookURI,
        baseURI: notebookURI + '#',
      }

      let first = true

      const annotStream = pump(parseAnnots(pdfFilename, opts), through.obj(function (triple, enc, cb) {
        if (first) {
          notebookTriples.forEach(triple => {
            this.push(triple);
          })

          first = false;
        }

        if (ld.matchesType('oa:Annotation', triple)) {
          this.push(ld.$.withGraph(notebookURI)(annotCollectionURI)('pcdm:hasPart')(triple.subject));
        }

        this.push(triple)
        cb();
      }))

      annotStream
        .on('error', reject)
        .pipe(graphDB.putStream())
        .on('error', reject)
        .on('close', () => resolve())
    })

    return;
  }
}
