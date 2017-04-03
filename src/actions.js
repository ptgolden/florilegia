"use strict";

const fs = require('fs')
    , tmp = require('tmp')
    , shortid = require('shortid')
    , { getAnnotations } = require('pdf2oac')
    , annotsToOAC = require('pdf2oac/oac')

const {
  LIST_DOCUMENTS,
  GENERAL_ERROR,
} = require('./consts')

module.exports = {
  addError,

  listDocuments,
  addPDFDocument,
}


function addError(msg) {
  return {
    type: GENERAL_ERROR,
    msg
  }
}

function listDocuments(project) {
  return dispatch => {
    fs.readDir(`projects/${project}/documents`, (err, files) => {
      if (err) {
        dispatch({
          GENERAL_ERROR,
          msg: `Could not open documents for project ${project}`
        })

        return;
      }

      dispatch({
        type: LIST_DOCUMENTS,
        docs: files
      })
    })
  }
}

const imageDir = tmp.dirSync();

function addPDFDocument(pdfFilename, pdfReadstream) {
  const id = shortid.generate()

  return (dispatch, { graph, pdfStore }) => {
    const pdfFile = tmp.fileSync
        , a = fs.createWriteStream(pdfFile.name)
        , b = pdfStore.createWriteStream(`${id}.pdf`)

    pdfReadstream.pipe(a);
    pdfReadstream.pipe(b);

    a.on('finish', () => {
      const annots = getAnnotations(pdfFile.name, imageDir.name)

      const writeStream = graph.n3.putStream()

      annotsToOAC(annots, {
        imageDirectory: imageDir.name,
        baseURI: `florilegia-internal:items#`,
        pdfURI: `florilegia-internal:files#${pdfFilename}`,
        outstream: writeStream
      });

      writeStream.on('error', err => {
        throw err;
      })

      writeStream.on('finish', () => {
        process.stdout.write('finished\n')
      })
    })
  }
}
