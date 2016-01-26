import d3 from 'd3';
import _ from 'lodash';
import React from 'react';
import { Im, generateTranslateString, values } from './utilities.js';
import SVGComponent from './svg-component.js';

var space = 55.4256 - 17.3205;

var evenCols = d3.range(17.3205, 570, space);
var oddCols = d3.range(36.3731, 570, space);
var rows = d3.range(20, 400, 33);
var cols = [evenCols, oddCols];

var states = {
  AK : { col : 1 , row : 0, abbr : 'AK', key : 'AK', name : 'Alaska'        , demonym : 'Alaskan'}          ,
  ME : { col : 12, row : 0, abbr : 'ME', key : 'ME', name : 'Maine'         , demonym : 'Mainer'}           ,

  VT : { col : 10, row : 1, abbr : 'VT', key : 'VT', name : 'Vermont'       , demonym : 'Vermonter' }       ,
  NH : { col : 11, row : 1, abbr : 'NH', key : 'NH', name : 'New Hampshire' , demonym : 'New Hampshirite' } ,
  MA : { col : 12, row : 1, abbr : 'MA', key : 'MA', name : 'Massachusetts' , demonym : 'Massachusite' }    ,

  WA : { col : 2 , row : 2, abbr : 'WA', key : 'WA', name : 'Washington'    , demonym : 'Washingtonian' }   ,
  MT : { col : 3 , row : 2, abbr : 'MT', key : 'MT', name : 'Montana'       , demonym : 'Montanan' }        ,
  ND : { col : 4 , row : 2, abbr : 'ND', key : 'ND', name : 'North Dakota'  , demonym : 'North Dakotan' }   ,
  MN : { col : 5 , row : 2, abbr : 'MN', key : 'MN', name : 'Minnesota'     , demonym : 'Minnesotan' }      ,
  WI : { col : 6 , row : 2, abbr : 'WI', key : 'WI', name : 'Wisconsin'     , demonym : 'Wisconsinite' }    ,
  MI : { col : 8 , row : 2, abbr : 'MI', key : 'MI', name : 'Michigan'      , demonym : 'Michigander' }     ,
  NY : { col : 10, row : 2, abbr : 'NY', key : 'NY', name : 'New York'      , demonym : 'New Yorker ' }     ,
  CT : { col : 11, row : 2, abbr : 'CT', key : 'CT', name : 'Connecticut'   , demonym : 'Connecticuter' }   ,
  RI : { col : 12, row : 2, abbr : 'RI', key : 'RI', name : 'Rhode Island'  , demonym : 'Rhode Islander' }  ,

  ID : { col : 2 , row : 3, abbr : 'ID', key : 'ID', name : 'Idaho'         , demonym : 'Idahoan' }         ,
  WY : { col : 3 , row : 3, abbr : 'WY', key : 'WY', name : 'Wyoming'       , demonym : 'Wyomingite' }      ,
  SD : { col : 4 , row : 3, abbr : 'SD', key : 'SD', name : 'South Dakota'  , demonym : 'South Dakotan' }   ,
  IA : { col : 5 , row : 3, abbr : 'IA', key : 'IA', name : 'Iowa'          , demonym : 'Iowan' }           ,
  IL : { col : 6 , row : 3, abbr : 'IL', key : 'IL', name : 'Illinois'      , demonym : 'Illinoisan' }      ,
  IN : { col : 7 , row : 3, abbr : 'IN', key : 'IN', name : 'Indiana'       , demonym : 'Indianian' }       ,
  OH : { col : 8 , row : 3, abbr : 'OH', key : 'OH', name : 'Ohio'          , demonym : 'Ohioan' }          ,
  PA : { col : 9 , row : 3, abbr : 'PA', key : 'PA', name : 'Pennsylvania'  , demonym : 'Pennsylvanian' }   ,
  DE : { col : 10, row : 3, abbr : 'DE', key : 'DE', name : 'Delaware'      , demonym : 'Delawarean' }      ,
  NJ : { col : 11, row : 3, abbr : 'NJ', key : 'NJ', name : 'New Jersey'    , demonym : 'New Jerseyan' }    ,

  OR : { col : 2 , row : 4, abbr : 'OR', key : 'OR', name : 'Oregon'        , demonym : 'Oregonian' }       ,
  NV : { col : 3 , row : 4, abbr : 'NV', key : 'NV', name : 'Nevada'        , demonym : 'Nevadan' }         ,
  CO : { col : 4 , row : 4, abbr : 'CO', key : 'CO', name : 'Colorado'      , demonym : 'Coloradan' }       ,
  NE : { col : 5 , row : 4, abbr : 'NE', key : 'NE', name : 'Nebraska'      , demonym : 'Nebraskan' }       ,
  MO : { col : 6 , row : 4, abbr : 'MO', key : 'MO', name : 'Missouri'      , demonym : 'Missourian' }      ,
  KY : { col : 7 , row : 4, abbr : 'KY', key : 'KY', name : 'Kentucky'      , demonym : 'Kentuckian' }      ,
  WV : { col : 8 , row : 4, abbr : 'WV', key : 'WV', name : 'West Virginia' , demonym : 'West Virginian' }  ,
  VA : { col : 9 , row : 4, abbr : 'VA', key : 'VA', name : 'Virginia'      , demonym : 'Virginian' }       ,
  DC : { col : 10, row : 4, abbr : 'DC', key : 'DC', name : 'Washington, DC', demonym : 'Washingtonian' }   ,
  MD : { col : 11, row : 4, abbr : 'MD', key : 'MD', name : 'Maryland'      , demonym : 'Marylander' }      ,

  CA : { col : 2 , row : 5, abbr : 'CA', key : 'CA', name : 'California'    , demonym : 'Californian' }     ,
  UT : { col : 3 , row : 5, abbr : 'UT', key : 'UT', name : 'Utah'          , demonym : 'Utahn' }           ,
  NM : { col : 4 , row : 5, abbr : 'NM', key : 'NM', name : 'New Mexico'    , demonym : 'New Mexican' }     ,
  KS : { col : 5 , row : 5, abbr : 'KS', key : 'KS', name : 'Kansas'        , demonym : 'Kansan' }          ,
  AR : { col : 6 , row : 5, abbr : 'AR', key : 'AR', name : 'Arkansas'      , demonym : 'Arkansan' }        ,
  TN : { col : 7 , row : 5, abbr : 'TN', key : 'TN', name : 'Tennessee'     , demonym : 'Tennessean' }      ,
  NC : { col : 8 , row : 5, abbr : 'NC', key : 'NC', name : 'North Carolina', demonym : 'North Carolinian' },
  SC : { col : 9 , row : 5, abbr : 'SC', key : 'SC', name : 'South Carolina', demonym : 'South Carolinian' },

  AZ : { col : 4 , row : 6, abbr : 'AZ', key : 'AZ', name : 'Arizona'       , demonym : 'Arizonian' }       ,
  OK : { col : 5 , row : 6, abbr : 'OK', key : 'OK', name : 'Oklahoma'      , demonym : 'Oklahoman' }       ,
  LA : { col : 6 , row : 6, abbr : 'LA', key : 'LA', name : 'Louisiana'     , demonym : 'Louisianan' }      ,
  MS : { col : 7 , row : 6, abbr : 'MS', key : 'MS', name : 'Mississippi'   , demonym : 'Mississippian' }   ,
  AL : { col : 8 , row : 6, abbr : 'AL', key : 'AL', name : 'Alabama'       , demonym : 'Alabaman' }        ,
  GA : { col : 9 , row : 6, abbr : 'GA', key : 'GA', name : 'Georgia'       , demonym : 'Georgian' }        ,

  TX : { col : 5 , row : 7, abbr : 'TX', key : 'TX', name : 'Texas'         , demonym : 'Texan' }           ,
  FL : { col : 9 , row : 7, abbr : 'FL', key : 'FL', name : 'Florida'       , demonym : 'Floridian' }       ,

  HI : { col : 0 , row : 6, abbr : 'HI', key : 'HI', name : 'Hawaii'        , demonym : 'Hawaiian' }        ,

  PR : { col : 12, row : 7, abbr : 'PR', key : 'PR', name : 'Puerto Rico'   , demonym : 'Puerto Rican' }    ,
};

/**
 * State component
 *
 * an internal-use component that represents a single state
 */
class State extends SVGComponent {
  get x() {
    return cols[this.props.row % 2][this.props.col];
  }
  get y() {
    return rows[this.props.row];
  }
  get colour() {
    return this.props.colourFn(this.props.value);
  }
  render() {
    var stateElementProps = {
      transform : generateTranslateString(this.x, this.y)
    };

    for(let key in this.props.stateHandlers) {
      stateElementProps[key] = this.props.stateHandlers[key];
    }

    return (<g {...stateElementProps}>
      <polygon fill={this.colour} points="-10,-17.3 -20,0 -10,17.3 10,17.3 20,0 10,-17.3" transform="translate(20,20) rotate(90)"/>
      <text x='20' y='25.79' textAnchor='middle' fill='white'>{this.props.abbr}</text>
    </g>);
  }
}

/**
 * USStateMap component
 *
 * A map of US states with each state represented as an equally-sized
 * hexagon, and coloured according to a standard function
 *
 * @prop {function} colourFn - a function that takes a value and returns
 *       a hex colour. Technically optional, but this module is not very
 *       useful when it's omitted
 * @prop {object} data - the state data, keyed to postal code
 * @prop {string} [undefColour='#999'] - a default colour to use for
 *       states that have no data
 * @prop {number} [width=595] - width for the map
 * @prop {boolean} [includepr=false] - whether to show Puerto Rico
 */
export default class USStateMap extends SVGComponent {
  static get defaultProps() {
    return {
      colourFn : () => '#333',
      undefColour : '#999',
      width : 595,
      includepr : false,
      data : {},
      stateHandlers : {}
    };
  }
  render() {
    var data = this.props.data;
    var contents = _.values(_.mapValues(states, (stateProps) => {
      if(!this.props.includepr && stateProps.key === 'PR') {
        return false;
      }
      var props = Im.extend(stateProps, { colourFn : this.props.colourFn });
      var value = data && _.find(data, (v,k) => k === props.key );
      if(value) {
        // props = props.set('value', data.find((v,k) => { return k === props.get('key'); }));
        props.value = value;
      } else {
        props.colourFn = () => this.props.undefColour;
      }
      props.stateHandlers = this.props.stateHandlers;
      return (<State {...props} />)
    }));

    return(<svg height={this.props.height} width={this.props.width}>{contents}</svg>);
  }
}
