"use strict";

const R = require('ramda')
    , shortid = require('shortid')
    , { Util } = require('n3')

const prefixes = Object.assign({}, require('pdf2oac/js/prefixes'), {
  pcdm: 'http://pcdm.org/models#',
  flor: 'http://purl.org/florilegia/ns#',
  florGraph: 'flor://graph/',
  florFiles: 'flor://files/'
})

const builder = require('rdf-builder')({ prefixes })

function generateNotebook(filename, name='', description='') {
  const id = shortid.generate()
      , notebookURI = prefixes.florGraph + id
      , $ = builder.withGraph(notebookURI)

  const $container = $(notebookURI)
      , $document = $(notebookURI + ':document')
      , $annots = $(notebookURI + ':annots')
      , pdfURI = `${prefixes.florFiles}${id}:${filename}`

  const triples = [].concat(
    $container({
      'rdf:type': 'flor:Notebook',
      'pcdm:hasMember': [$document, $annots],
      'rdfs:label': Util.createLiteral(name),
      'dce:description': Util.createLiteral(description),
    }),

    $document({
      'rdf:type': 'pcdm:Object',
      'pcdm:hasFile': pdfURI
    }),

    $annots({
      'rdf:type': 'flor:AnnotationCollection',
    })
  )

  return {
    notebookTriples: triples,
    notebookURI,
    pdfURI,
    annotCollectionURI: $annots.subject
  }
}

const matches = R.curry((pattern, triple) => {
  let s, p, o, g

  if (!pattern) return;

  if (Array.isArray(pattern)) {
    [s, p, o, g] = pattern;
  } else {
    s = pattern.subject || pattern.s;
    p = pattern.predicate || pattern.p;
    o = pattern.object || pattern.o;
    g = pattern.graph || pattern.g;
  }

  const parsed = {
    subject: s,
    predicate: p,
    object: o,
  }

  if (triple.graph || pattern.graph) {
    parsed.graph = g;
  }

  let match = true;

  for (const attr of Object.keys(parsed)) {
    const item = triple[attr]
        , test = parsed[attr]

    if (!test) continue;

    if (typeof test === 'function') {
      match = test(item, triple);
    } else if (Util.isIRI(test)) {
      match = (
        item === test ||
        item === expand(test)
      )
    } else {
      match = item === test;
    }

    if (!match) break;
  }

  return match
})

const matchesType = R.curry(
  (type, triple) => matches([null, 'rdf:type', type], triple))

function expand(iri) {
  return Util.expandPrefixedName(iri, prefixes)
}

module.exports = {
  $: builder,
  prefixes,
  generateNotebook,
  matches,
  matchesType,
  expand
}
