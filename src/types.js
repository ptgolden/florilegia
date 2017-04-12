"use strict";

const Type = require('union-type')
    , { isIRI, isLiteral } = require('n3').Util

const Notebook = Type({ Notebook: {
  uri: isIRI,
  name: isLiteral,
  description: isLiteral,
}})

const Actions = Type({
  SetAvailableNotebooks: {
    documents: Type.ListOf(Notebook)
  }
})

exports.Notebook = Notebook;
exports.Actions = Actions;

Object.freeze(exports);
