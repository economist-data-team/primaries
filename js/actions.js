export const UPDATE_DATA = 'UPDATE_DATA';
export const UPDATE_PARTY = 'UPDATE_PARTY';

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
