"use strict";

const shortid = require('shortid')
    , { Util } = require('n3')

const prefixes = Object.assign({}, require('pdf2oac/js/prefixes'), {
  pcdm: 'http://pcdm.org/models#',
  flor: 'http://purl.org/florilegia/ns#',
})

function expand(name) {
  return Util.expandPrefixedName(name, prefixes)
}

const idOf = type => ({ '@id': type, '@type': '@id' })

const context = Object.assign({}, prefixes, {
  // Internal identifier prefixes, meant to be overridden on export
  _data: 'flor://data/',
  _files: 'flor://files/',

  id: '@id',
  type: '@type',

  Notebook: 'flor:Notebook',

  motivation: idOf('oa:hasMotivation'),
  conformsTo: idOf('oa:conformsTo'),
  source: idOf('oa:hasSource'),
  selector: idOf('oa:hasSelector'),
  target: idOf('oa:hasTarget'),
  body: idOf('oa:hasBody'),

  subject: 'dc:subject',
  description: 'dc:description',
  label: 'rdfs:label',
  value: 'rdf:value',

  hasFile: idOf('pcdm:hasFile')
})

function generateNotebook(filename, name='', description='') {
  const id = `_data:notebooks/${shortid.generate()}`
      , pdfURI = `_files:pdfs/${id}`

  return {
    "@context": {
      "@base": id + '#'
    },
    id,
    type: 'Notebook',
    name,
    description,

    document: {
      id: 'document',
      type: 'pcdm:Object',
      'hasFile': pdfURI
    },

    annotations: []
  }
}


module.exports = {
  expand,
  context,
  prefixes,
  generateNotebook,
}
