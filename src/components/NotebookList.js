"use strict";

const h = require('react-hyperscript')
    , { connect } = require('react-redux')
    , { getAnnotsForNotebook } = require('../actions')

const NotebookList = props =>
  h('ul', props.availableNotebooks.map(notebook =>
    h('li', { key: notebook.uri },
      h('a', {
        href: notebook.uri,
        onClick: e => {
          e.preventDefault();
          props.dispatch(getAnnotsForNotebook(notebook.uri))
            .catch(err => {
              throw err;
            })
        }
      }, notebook.uri))))


module.exports = connect(state => ({
  availableNotebooks: state.availableNotebooks
}))(NotebookList);
