"use strict";

const h = require('react-hyperscript')
    , { dialog } = require('electron').remote
    , { connect } = require('react-redux')
    , { addNotebook } = require('../actions')

const AddDocument = props =>
  h('button', {
    onClick: () =>
      dialog.showOpenDialog({
        filters: [
          { name: 'PDF Documents', extensions: ['pdf']}
        ]
      }, files => {
        if (files.length) {
          props.dispatch(addNotebook(files[0]))
            .then(() => {
              alert('Finished!');
            })
        }
      })
  }, 'Add document')

module.exports = connect()(AddDocument);
