"use strict";

function extend(toObj, withObj) {
  return Object.assign({}, toObj, withObj)
}

function cleanRecord(record) {
  const ret = {}

  record._keys.forEach(k => {
    ret[k] = record[k];
  })

  return ret;
}

const initialState = {
  loadingDocuments: {},
  availableNotebooks: [],
  openedSource: null,
}

function app(state=initialState, action) {
  if (action.type === '@@redux/INIT') return state;

  return action.case({
    SetAvailableNotebooks(availableNotebooks)  {
      availableNotebooks = availableNotebooks.map(cleanRecord);
      return extend(state, {
        availableNotebooks
      });
    },

    SetOpenAnnotations(source, annotations) {
      return extend(state, {
        openedSource: {
          source,
          annotations
        }
      })
    },

    SetDocumentLoadProgress(filename, progress) {
      return extend(state, {
        loadingDocuments: extend(state.loadingDocuments, {
          [filename]: progress
        })
      })
    },
  })
}

module.exports = app;
