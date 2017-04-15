"use strict";

const h = require('react-hyperscript')
    , { dialog } = require('electron').remote
    , { connect } = require('react-redux')
    , { addNotebook } = require('../actions')

function asPercentage(progress) {
  const percent = progress === 1
    ? '100'
    : progress.toFixed(2).slice(2)

  return percent + '%';
}

const AddDocument = props =>
  h('div', [
    h('button', {
      onClick: () =>
        dialog.showOpenDialog({
          filters: [
            { name: 'PDF Documents', extensions: ['pdf']}
          ]
        }, files => {
          if (files.length) {
            props.dispatch(addNotebook(files[0]))
          }
        })
    }, 'Add document'),

    props.loadingDocuments && h('div', {}, Object.keys(props.loadingDocuments).map(filename =>
      h('div', { key: filename }, `${filename}: ${asPercentage(props.loadingDocuments[filename])}`)
    ))
  ])

module.exports = connect(state => ({
  loadingDocuments: Object.keys(state.loadingDocuments).length
    ? state.loadingDocuments
    : null
}))(AddDocument);
