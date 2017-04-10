"use strict";

function extend(toObj, withObj) {
  return Object.assign({}, toObj, withObj)
}

function cleanRecord(record) {
  const ret = {}

  record._keys.forEach(k => {
    ret[k] = record[k];
  })

  return ret;
}

const initialState = {
  availableNotebooks: [],
}

function app(state=initialState, action) {
  if (action.type === '@@redux/INIT') return state;

  return action.case({
    SetAvailableNotebooks(availableNotebooks)  {
      availableNotebooks = availableNotebooks.map(cleanRecord);
      return extend(state, { availableNotebooks });
    }
  })
}

module.exports = app;
