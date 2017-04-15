"use strict";

const h = require('react-hyperscript')
    , { connect } = require('react-redux')
    , { getAnnotsForNotebook } = require('../actions')

const NotebookList = props =>
  h('ul', props.availableNotebooks.map(notebook =>
    h('li', { key: notebook.id },
      h('a', {
        href: notebook.id,
        onClick: e => {
          e.preventDefault();
          props.dispatch(getAnnotsForNotebook(notebook.id))
            .catch(err => {
              throw err;
            })
        }
      }, notebook.id))))


module.exports = connect(state => ({
  availableNotebooks: state.availableNotebooks,
}))(NotebookList);
