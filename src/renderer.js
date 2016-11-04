const h = require('react-hyperscript')
    , { render } = require('react-dom')

const el = document.createElement('div')

document.body.appendChild(el);

render(h('h1', 'Florilegia'), el)
