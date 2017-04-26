"use strict";

const h = require('react-hyperscript')
    , querystring = require('querystring')
    , { connect } = require('react-redux')

const Annotation = ({ annot }) => {
  let els = []

  const page = annot.target.selector[0] || annot.target.selector

  els.push(h('div', [
        'Page ',
        querystring.parse(page.value.slice(1)).page,
        ' – ',
        annot.motivation
  ]));

  switch(annot.motivation) {
    case 'oa:commenting':
      els.push(h('div', annot.body['cnt:chars']))
      break;

    case 'oa:highlighting':
      els.push(h('blockquote', annot.target.selector[1]['oa:exact']))
      break;

    case 'oa:bookmarking':
      els.push(h('img', {
        src: `data:image/png;base64,${annot.body['cnt:bytes']}`
      }))
      break;

    default:
      break;
  }

  // els.push(h('pre', JSON.stringify(annot, true, '  ')));

  return h('div', { style: { marginBottom: '.33em' }}, els)
}

const OpenedSource = props =>
  h('div', props.openedSource.annotations.map(annot =>
    h(Annotation, { key: annot.id, annot })
  ))


module.exports = connect(state => ({
  openedSource: state.openedSource || { annotations: [] },
}))(OpenedSource);
