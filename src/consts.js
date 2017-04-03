"use strict";

const Type = require('union-type')

const DocumentActions = Type({
  ListDocuments: {
  },

  AddDocument: {
  }
})

exports.DocumentActions = DocumentActions;

exports.LIST_DOCUMENTS = 'LIST_DOCUMENTS';
exports.ADD_DOCUMENT = 'ADD_DOCUMENT';
exports.OPEN_DOCUMENT = 'OPEN_DOCUMENT';
exports.GENERAL_ERROR = 'GENERAL_ERROR';

Object.freeze(exports);
