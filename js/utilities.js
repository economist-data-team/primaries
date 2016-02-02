import _ from 'lodash';
import { connect } from 'react-redux';
import DOMProperty from 'react/lib/DOMProperty';
import ReactInjection from 'react/lib/ReactInjection';

import 'babel/polyfill';

///////////////////////
// UTILITY FUNCTIONS //
///////////////////////

/**
 * returns the values of an object as an array
 *
 * @param {Object}  obj The object to iterate over
 *
 * @return {Array}      The values from that object
 */
export function values(obj) {
  var arr = [];
  for(var k of Object.keys(obj)) {
    arr.push(obj[k]);
  }
  return arr;
}

/**
 * Maps the values on an object
 *
 * @param  {Object}   obj The object to iterate over
 * @param  {Function} fn  The function to apply to each value
 *
 * @return {Object}       The new, modified object
 */
export function mapValues(obj, fn) {
  var newObj = {};
  for(var k of Object.keys(obj)) {
    newObj[k] = fn(obj[k]);
  }
  return newObj;
};

/**
 * maps an array of keys to an object
 *
 * @param {Array} arr - the array of keys to map
 * @param {Object|Function} source - either an object from which to
 *                                 draw the values from (in which case
 *                                 this is basically an object filter)
 *                                 or a function for determining the
 *                                 value to assign to each key
 *
 * @return {Object} - the new generated object
 */
export function mapToObject(arr, source) {
  var getValue = source.call ? source : function(k) {
    return source[k];
  }
  return arr.map(k => ({
    key : k, value : getValue(k)
  })).reduce((obj, v) => { obj[v.key] = v.value; return obj; }, {});
}


// https://github.com/jquery/jquery/blob/c869a1ef8a031342e817a2c063179a787ff57239/src/core.js#L214
export function isNumeric(n) {
  return !Array.isArray( n ) && (n - parseFloat( n ) + 1) >= 0;
}


/**
 * Parses an array of numeric data into numbers. Meant to run through
 * imported JSON/CSV data and make sure everything numeric is the
 * proper type.
 *
 * @param {*} d - a list whose items should be evaluated for numericity
 */
export function parseNumerics(d) {
  // var fn = d instanceof Array ? 'map' : 'mapValues';
  var fn = function(v) {
    return isNumeric(v) ? parseFloat(v) : v;
  }
  return d instanceof Array ? d.map(fn) : mapValues(d, fn);
}


// tagging function for generateTranslateString
function _translateCSS(strings, ...values) {
  var arr = [];

  for(let i in strings) {
    arr.push(strings[i]);
    if(values[i]) {
      arr.push(values[i] + 'px');
    }
  }

  return arr.join('');
}

/**
 * generates a translation string for transforms
 *
 * @param {Number}  x   x-coordinate to translate to
 * @param {Number}  y   y-coordinate to translate to
 * @param {Boolean} css is it a CSS transform? (adds 'px')
 *
 * @return {String}     the translate string to add to a transform
 */
export function generateTranslateString(x, y, css) {
  let translateString = `translate(${x}, ${y})`;
  let tagged = _translateCSS`translate(${x}, ${y})`;
  return css ? tagged : translateString;
}

/**
 * generates a polygon points string for a rectangle
 * we use a polygon rather than a rect here because it makes it much
 * easier to animate across an axis (i.e. from positive to negative)
 *
 * @param {Number} x - origin x
 * @param {Number} y - origin y
 * @param {Number} dx - width in pixels
 * @param {Number} dy - height in pixels
 * @param {Boolean} pointMode - determines if dx and dy are deltas or
 *                            second x and y coordinates for the rect
 *
 * @return {String}   the polygon string for its `points` attr
 */
export function generateRectPolygonString(x, y, dx, dy, pointMode=false) {
  var startX = x, finalX = dx + (pointMode ? 0 : x);
  var startY = y, finalY = dy + (pointMode ? 0 : y);
  var points = [
    [startX, startY], [finalX, startY],
    [finalX, finalY], [startX, finalY]
  ];
  return points.map(p => p.join(',')).join(' ');
}

/**
 * Reads in an array that's like a CSS margin declaration: it should
 *   be given in [top right bottom left] order, but will handle
 *   omitted values as CSS does
 *
 * @param  {Array|Number}  marginArray - margin values as array, or
 *                                     simply as a single number
 *
 * @return {Object} margin values as an object
 */
export function parseMarginArray(marginArray) {
  if(isNumeric(marginArray)) {
    marginArray = [+marginArray];
  }
  if(!(marginArray instanceof Array)) {
    return marginArray;
  }
  var top, right, bottom, left;
  switch (marginArray.length) {
    case 1:
      top = right = bottom = left = marginArray[0];
      break;
    case 2:
      top = bottom = marginArray[0];
      right = left = marginArray[1];
      break;
    case 3:
      top = marginArray[0];
      bottom = marginArray[2];
      right = left = marginArray[1];
      break;
    default:
      top = marginArray[0];
      right = marginArray[1];
      bottom = marginArray[2];
      left = marginArray[3];
      break;
  }
  return { top : top, right : right, bottom: bottom, left : left };
}

/**
 * restricts a value to within a set minimum and maximum
 *
 * @param  {number} value - the value to be bound
 * @param  {number|Array} min - the minimum bound or an array
 *   containing both values
 * @param  {number} max - the maximum bound
 *
 * @return {number} - the value, or the min/max as appropriate
 */
export function bindValueToRange(value, min, max) {
  // array overload
  var rg = min.length === 2 ? min : [min, max];

  // if the 'min' is larger than the 'max', this will be false,
  // and the values will be reversed in the return statement
  var order = rg[1] > rg[0];
  return Math.max(rg[+!order], Math.min(rg[+order], value));
}

/**
 * adds a DOM property to React's list of recognized properties
 *
 * @param  {string} propertyKey - the key recognized by React
 * @param  {string} propertyName - the property name in the DOM
 */
export function addDOMProperty(propertyKey, propertyName) {
  const MUST_USE_ATTRIBUTE = DOMProperty.injection.MUST_USE_ATTRIBUTE;

  var newProperty = { Properties : {}, DOMAttributeNames : {} };

  newProperty.Properties[propertyKey] = MUST_USE_ATTRIBUTE;
  newProperty.DOMAttributeNames[propertyKey] = propertyName;

  ReactInjection.DOMProperty.injectDOMPropertyConfig(newProperty);
}


// these are some weird side utilities for working with immutable-ish
// objects

/**
 * extends a copy of an object
 *
 * @param  {object} obj - the object to copy
 * @param  {...object} objects - the
 */
function extend(obj, ...objects) {
  var ret = _.clone(obj);
  _.extend(ret, ...objects);
  return ret;
}

function set(obj, key, value) {
  var ret = _.clone(obj);
  ret[key] = value;
  return ret;
}

function filter(obj, fn, thisVal) {
  return _.filter(obj, fn, thisVal);
}

export var Im = {
  extend, set, filter
};


/////////////////////
// REDUX UTILITIES //
/////////////////////

/**
 * a utility function for connect
 *
 * @param  {object} map - a map of props for a component to locations
 *                        on the store. Can use dot notation.
 *
 * @return {function} - the connection function for this map (to apply
 *                      to the component)
 */
export function connectMap(map) {
  return connect(function(state, ownProps) {
    var r = _.mapValues(map, (v,k) => {
      var keys = v.split('.'), s = state;
      while(k=keys.shift()) {
        if(!s) { break; }
        s = s[k];
      }
      return s;
    });
    return Im.extend(ownProps, r);
  });
}

/**
 * a utility function for creating generic reducers
 *
 * @param {*} defaultState - the initial state of the property; this
 *                           will generally be a reference to
 *                           `initialState.foo`
 * @param {String} actionName - the name of the action associated with
 *                              this reducer
 *
 * @return {*} - the new value of the action (pulled from the action's
 *               data attribute)
 */
export function generateReducer(defaultState, actionName) {
  return function(state = defaultState, action) {
    if(action.type !== actionName) { return state; }
    return action.data;
  }
}



//////////////////////////////////
// STRING AND NUMBER FORMATTERS //
//////////////////////////////////

// regex for toTitleCase
const smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;
/**
 * converts a string to title case
 * http://individed.com/code/to-title-case/
 *
 * @param  {string} str - the string to convert
 *
 * @return {string} - the converted string
 */
export function toTitleCase(str){
  str = str.toLowerCase();

  return str.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, function(match, index, title){
    if (index > 0 && index + match.length !== title.length &&
      match.search(smallWords) > -1 && title.charAt(index - 2) !== ":" &&
      (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
      title.charAt(index - 1).search(/[^\s-]/) < 0) {
      return match.toLowerCase();
    }

    if (match.substr(1).search(/[A-Z]|\../) > -1) {
      return match;
    }

    return match.charAt(0).toUpperCase() + match.substr(1);
  });
};

/**
 * a function for comma-delimiting numbers
 * appropriated from Macromedia about a decade ago and ported from AS2
 *
 * @param  {number} amount - the value to delimit
 *
 * @return {string} - the comma-delimited number
 */
export function commaNumber(amount) {
  // return a 0 dollar value if amount is not valid
  // (you may optionally want to return an empty string)
  if(isNaN(amount)) {
    return "0";
  }

  var negative = amount < 0;

  amount = Math.abs(amount);

  var amount_str = amount.toString(10);

  // split the string by the decimal point, separating the
  // whole dollar value from the cents. Dollars are in
  // amount_array[0], cents in amount_array[1]
  var amount_array = amount_str.split('.');

  // add the dollars portion of the amount to an
  // array in sections of 3 to separate with commas
  var dollar_array = [];
  var start, end = amount_array[0].length;
  while(end > 0) {
    start = Math.max(end - 3, 0);
    dollar_array.unshift(amount_array[0].slice(start, end));
    end = start;
  }

  // assign dollar value back in amount_array with
  // the a comma delimited value from dollar_array
  amount_array[0] = dollar_array.join(",");

  // finally construct the return string joining
  // dollars with cents in amount_array
  var amount_string = amount_array.join(".");
  return (negative ? '-' : '') + amount_string;
}



//////////////////
// D3 FUNCTIONS //
//////////////////

/**
 * a function for creating or selecting a single element with d3
 *
 * @param {node} parent - the containing node
 * @param {string} classSelector - the class this element should have
 * @param {string} type - the type of element to create if it does not
 *                        already exist
 *
 * @return {d3-selection} - the element, either found or appended
 */
export function guarantee(parent, classSelector, type) {
  var sel = d3.select(parent)
  var out = sel.select(`.${classSelector}`);
  // why it's [0][0] I have no idea
  return out[0][0] ? out : sel.append(type)
    .classed(classSelector, true);
}
