"use strict";

const { createReducer } = require('redux-immutablejs')
    , { ApplicationState } = require('./records')

const {
  LIST_DOCUMENTS,
  OPEN_DOCUMENT,
  GENERAL_ERROR,
} = require('./consts')



module.exports = createReducer(new ApplicationState(),  {
  [GENERAL_ERROR]: (state, action) => {
    const { msg } = action

    return state.update('errors', errors => errors.push(msg))
  },

  [LIST_DOCUMENTS]: (state, action) =>
    state.set('availableDocuments', action.docs),

  [OPEN_DOCUMENT]: (state, action) =>
    state.set('openedDocument', action.doc),
})
