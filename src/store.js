"use strict";

const thunk = require('redux-thunk').default
    , levelup = require('level')
    , levelstore = require('level-store')
    , levelgraph = require('levelgraph')
    , sublevel = require('level-sublevel')
    , { createStore, applyMiddleware, compose } = require('redux')
    , rootReducer = require('./reducers')
    , { ApplicationState } = require('./records')

module.exports = function initStore(directory, initialState) {
  const db = sublevel(levelup(directory))
      , graphDB = levelgraph(db.sublevel('graph'))
      , pdfDB = levelstore(db.sublevel('pdfs'))

  // Storage mechanisms which will be exposed as arguments to actions
  const exposedStorage = { graphDB, pdfDB }

  const store = createStore(
    rootReducer,
    (initialState || new ApplicationState()),
    compose(
      applyMiddleware(thunk.withExtraArgument(exposedStorage)),
      (global.window || {}).devToolsExtension ? window.devToolsExtension() : a => a
    )
  )

  store.db = db;

  return store;
}
