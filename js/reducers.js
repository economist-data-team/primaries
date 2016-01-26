import { UPDATE_DATA } from './actions.js';

var initialState = {
  data : []
};

function dataReducer(state = [], action) {
  if(action.type !== UPDATE_DATA) { return state; }
  return action.data;
}

export default function updateState(state = initialState, action) {
  return {
    data : dataReducer(state.data, action)
  };
}
