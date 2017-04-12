"use strict";

const path = require('path')
    , h = require('react-hyperscript')
    , React = require('react')
    , { Provider } = require('react-redux')
    , makeStore = require('./store')
    // , LayoutPanel = require('./components/Panel')


const Root = React.createClass({
  propTypes: {
    store: React.PropTypes.object.isRequired,
  },

  childContextTypes: {
    rebass: React.PropTypes.object,
  },

  getChildContext() {
    return {
      rebass: {
        colors: {
          // From https://standards.usa.gov/colors/

          // "Primary colors"
          primary: '#0071bc',
          primaryDarker: '#205493',
          primaryDarkest: '#112e51',

          base: '#212121',
          // grayDark: '#323a45',
          // grayLight: '#aeb0b5',
          white: '#fff',

          // "Secondary colors"
          primaryAlt: '#02bfe7',
          primaryAltDarkest: '#046b99',
          primaryAltDark: '#00a6d2',
          primaryAltLight: '#9bdaf1',
          primaryAltLightest: '#elf3f8',

          secondary: '#e31c3d',
          secondaryDarkest: '#981b1e',
          secondaryDark: '#cd2026',
          secondaryLight: '#e59c93',
          secondaryLightest: '#f9dede',

          // "Background colors"
          grayDark: '#323a45',
          gray: '#5b616b',
          grayLight: '#aeb0b5',
          grayLighter: '#d6d7d9',
          grayLightest: '#f1f1f1',
          grayWarmDark: '#494440',
          grayWarmLight: '#e4e2e0',
          grayCoolLight: '#dce4ef',

          // "Primary colors"
          gold: '#fdb81e',
          goldLight: '#fdb81e',
          goldLighter: '#fdb81e',
          goldLightest: '#fdb81e',
          green: '#fdb81e',
          greenLight: '#fdb81e',
          greenLighter: '#fdb81e',
          greenLightest: '#fdb81e',
          coolBlue: '#fdb81e',
          coolBlueLight: '#fdb81e',
          coolBlueLighter: '#fdb81e',
          coolBlueLightest: '#fdb81e',

          // "Special state colors"
          focus: '#3e94cf',
          visited: '#4c2c92',
        }

      }
    }
  },

  componentDidMount() {
    const { listNotebooks } = require('./actions')
    this.props.store.dispatch(listNotebooks());
  },


  render() {
    const { store } = this.props
        , AddDocument = require('./components/AddDocument')
        , NotebookList = require('./components/NotebookList')

    return (
      h(Provider, { store }, h('div #main', [
        h('h1', 'Florilegia'),
        h(AddDocument),

        h(NotebookList),
      ]))
    )
  }
})


module.exports = ({ initialState }) => {
  const store = makeStore(path.join(__dirname, '..', 'data'), initialState)

  return h(Root, { store });

}
