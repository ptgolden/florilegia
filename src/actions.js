"use strict";

const fs = require('fs')
    , path = require('path')
    , pump = require('pump')
    , concat = require('concat-stream')
    , through = require('through2')
    , parseAnnots = require('pdf2oac')
    , ld = require('./ld')
    , { Actions, Notebook } = require('./consts')

module.exports = {
  listNotebooks,
  addNotebook,
  getPDFDocument,
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

function listNotebooks() {
  return async (dispatch, getState, { graphDB }) => {
    const docs = await new Promise((resolve, reject) =>
      graphDB.search(
        ld.$(graphDB.v('uri'))({
          'rdf:type': 'flor:Notebook',
          'rdfs:label': graphDB.v('name'),
          'dce:description': graphDB.v('description')
        }), (err, list) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(list)
        }))

    dispatch(Actions.SetAvailableNotebooks(
      docs.map(Notebook.NotebookOf)
    ))

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
