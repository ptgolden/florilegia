"use strict";

const h = require('react-hyperscript')
    , { connect } = require('react-redux')

const Annotation = ({ annot }) => {
  let els = []

  const page = annot.target.selector[0] || annot.target.selector

  els.push(h('h3', page.value));

  switch(annot.motivation) {
    case 'oa:commenting':
      els.push(h('div', annot.body['cnt:chars']))
      break;

    case 'oa:highlighting':
      els.push(h('blockquote', annot.target.selector[1]['oa:exact']))
      break;

    default:
      break;
  }

  // els.push(h('pre', JSON.stringify(annot, true, '  ')));

  return h('div', els)
}

const OpenedSource = props =>
  h('div', props.openedSource.annotations.map(annot =>
    h(Annotation, { key: annot.id, annot })
  ))


module.exports = connect(state => ({
  openedSource: state.openedSource || { annotations: [] },
}))(OpenedSource);
