"use strict";

const Type = require('union-type')

const Notebook = Type({ Notebook: {
  id: String,
  name: String,
  description: String,
  annotations: Type.ListOf(String)
}})

const Tag = Type({ Tag: {
  id: String,
  name: String,
  annotations: Type.ListOf(String)
}})

const AnnotationSource = Type({
  Notebook: {
    notebook: String
  },

  Tag: {
    tag: Tag
  },

  Search: {
    query: String
  }
})

const Actions = Type({
  SetAvailableNotebooks: {
    documents: Type.ListOf(Notebook)
  },

  SetOpenAnnotations: {
    source: AnnotationSource,
    annotations: Type.ListOf(Object)
  },

  SetDocumentLoadProgress: {
    filename: String,
    progress: Number,
  }
})

exports.Notebook = Notebook;
exports.Actions = Actions;
exports.AnnotationSource = AnnotationSource;

Object.freeze(exports);
