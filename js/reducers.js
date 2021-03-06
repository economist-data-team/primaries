import { generateReducer } from './utilities.js';
import {
  UPDATE_DATA, UPDATE_PARTY, UPDATE_FOCUS_PRIMARY,
  UPDATE_FOCUS_CANDIDATE
} from './actions.js';
import { DEMOCRAT, REPUBLICAN } from './us-primary.js';

var initialState = {
  data : [],
  party : REPUBLICAN,
  focusPrimary : null,
  focusCandidate : null
};

var dataReducer = generateReducer(initialState.data, UPDATE_DATA);
var partyReducer = generateReducer(initialState.party, UPDATE_PARTY);
function focusPrimaryReducer(state=initialState.focusPrimary, action) {
  if(action.type !== UPDATE_FOCUS_PRIMARY) { return state; }
  return action.data;
}
var focusCandidateReducer = generateReducer(
  initialState.focusCandidate, UPDATE_FOCUS_CANDIDATE);

export default function updateState(state = initialState, action) {
  return {
    data : dataReducer(state.data, action),
    party : partyReducer(state.party, action),
    focusPrimary : focusPrimaryReducer(state.focusPrimary, action),
    focusCandidate : focusCandidateReducer(state.focusCandidate, action)
  };
}
