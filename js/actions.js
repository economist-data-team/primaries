export const UPDATE_DATA = 'UPDATE_DATA';
export const UPDATE_PARTY = 'UPDATE_PARTY';
export const UPDATE_FOCUS_PRIMARY = 'UPDATE_FOCUS_PRIMARY';
export const UPDATE_FOCUS_CANDIDATE = 'UPDATE_FOCUS_CANDIDATE';

export function updateData(data) {
  return {
    type : UPDATE_DATA,
    data
  };
}

export function updateParty(data) {
  return {
    type : UPDATE_PARTY,
    data
  };
}
window.focusPrimary = focusPrimary;

export function focusPrimary(data) {
  return {
    type : UPDATE_FOCUS_PRIMARY,
    data
  };
}
export function clearFocusPrimary() {
  return {
    type : UPDATE_FOCUS_PRIMARY,
    data : null
  };
}

export function focusCandidate(data) {
  return {
    type : UPDATE_FOCUS_CANDIDATE,
    data
  };
}
export function clearFocusCandidate() {
  return {
    type : UPDATE_FOCUS_CANDIDATE,
    data : null
  };
}
