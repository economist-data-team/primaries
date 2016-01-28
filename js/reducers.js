import { generateReducer } from './utilities.js';
import { UPDATE_DATA, UPDATE_PARTY } from './actions.js';
import { DEMOCRAT, REPUBLICAN } from './us-primary.js';

var initialState = {
  data : [],
  party : REPUBLICAN
};

var dataReducer = generateReducer(initialState.data, UPDATE_DATA);
var partyReducer = generateReducer(initialState.party, UPDATE_PARTY);

export default function updateState(state = initialState, action) {
  return {
    data : dataReducer(state.data, action),
    party : partyReducer(state.party, action)
  };
}
