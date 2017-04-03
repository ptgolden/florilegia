"use strict";

const Immutable = require('immutable')

exports.ApplicationState = Immutable.Record({
  openedDocument: null,
  availableDocuments: Immutable.List(),
  errors: Immutable.List(),
})
