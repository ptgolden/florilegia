"use strict";

const thunk = require('redux-thunk').default
    , levelup = require('level')
    , levelstore = require('level-store')
    , levelgraph = require('levelgraph')
    , sublevel = require('level-sublevel')
    , { createStore, applyMiddleware, compose } = require('redux')
    , rootReducer = require('./reducers')
    , { ApplicationState } = require('./records')


function isUnionTypeRecord(obj) {
  return '_keys' in obj && '_name' in obj && 'caseOn' in obj;
}

const unionTypeMiddleware = store => next => action => {
  if (action.constructor === Object) {
    if (!isUnionTypeRecord(action)) {
      throw new Error('Actions should be called by creating a union type record.')
    }

    const type = action._name;

    return next({
      type,
      case: action.case.bind(action),
    })
  }

  return next(action)
}

module.exports = function initStore(directory, initialState) {
  const db = sublevel(levelup(directory))
      , graphDB = levelgraph(db.sublevel('graph'))
      , pdfDB = levelstore(db.sublevel('pdfs'))

  // Storage mechanisms which will be exposed as arguments to actions
  const exposedStorage = { graphDB, pdfDB }

  const store = createStore(
    rootReducer,
    compose(
      applyMiddleware(unionTypeMiddleware, thunk.withExtraArgument(exposedStorage)),
      (global.window || {}).devToolsExtension ? window.devToolsExtension() : a => a
    )
  )

  store.db = db;

  return store;
}
