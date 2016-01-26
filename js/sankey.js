import d3 from 'd3';
import React from 'react';
import 'd3-plugins-sankey-fixed';
import SVGComponent from './svg-component.js';
import { Im, generateTranslateString } from './utilities.js';

import countries from './countries.js';

var refugeeFormat = function(v) {
  return d3.format(',.0f')(v);
}
var percentFormat = function(v) {
  return d3.format(',.1f')(v * 100);
}

function d3Guarantee(group, className, elementType) {
  var el = group.select(`.${className}`);

  return el[0][0] ? el : group.append(elementType).classed(className, true);
}

class AxisLabel extends SVGComponent {
  static get defaultProps() {
    return {
      height : 30,
      side : 'left'
    };
  }
  render() {
    var textX = this.props.side === 'right' ? -2 : 2;
    var textAnchor = this.props.side ==='right' ? 'end' : 'start';

    return (<g className='label' transform={generateTranslateString(this.props.offset, 0)}>
      <text className='label-name' x={textX} y='10' textAnchor={textAnchor}>{this.props.name}</text>
      <text className='label-unit' x={textX - 1} y='23' textAnchor={textAnchor}>{this.props.unit}</text>
      <line x1="0" y1="0" x2="0" y2={this.props.height} className="axis-line"></line>
    </g>);
  }
}

export default class Sankey extends SVGComponent {
  constructor(props) {
    super(...arguments);
    this.state = {
      axes : props.axes,
      focusedElement : null,
      lockedElement : null
    }
    this.release = this.release.bind(this);
  }
  static get defaultProps() {
    return {
      width : 575,
      nodeWidth : 10,
      nodePadding : 5,
      padding : 10
    };
  }
  render() {
    ///////////////////////////////
    // for another time, perhaps //
    ///////////////////////////////

    var axisCount = this.state.axes.length;
    var axisSpace = (this.props.width - this.props.nodeWidth) / (axisCount - 1)

    var axes = this.state.axes.map((axis, idx) => {
      axis.offset = this.props.padding + this.props.nodeWidth / 2 + axisSpace * idx;
      return (<AxisLabel {...axis} />)
    });

    return(<svg ref='container' height={this.props.height} width="100%" className="sankey-container">
      <rect className='backdrop' width='100%' height='100%' onClick={this.release} fill='transparent'></rect>
      <g ref='axis-labels' className='axis-labels'>
        {axes}
      </g>
      <g transform={generateTranslateString(this.props.padding, 30)}>
        <g ref='links'></g>
        <g ref='nodes'></g>
      </g>
    </svg>)
  }
  checkAxes(node) {
    let newAxes = this.props.axes;

    function updateUnit(idx, label) {
      return Im.set(newAxes, idx, Im.set(newAxes[idx], 'unit', label));
    }
    if(node.type === 'dc') {
      newAxes = updateUnit(0, `${node.name}`);
      newAxes = updateUnit(1, `${node.name}`);
      newAxes = updateUnit(3, `% ${node.name}`);
    } else if(node.type === 'o' || node.type === 'o-2') {
      let country = node.o ? countries[node.o.name] : countries[node.name];
      newAxes = updateUnit(1, `from ${country.name}`);
      newAxes = updateUnit(2, `from ${country.name}`);
    } else if(node.type === 'd') {
      let country = countries[node.name];
      newAxes = updateUnit(0, `to ${country.name}`);
      newAxes = updateUnit(2, `by ${country.name}`);
      newAxes = updateUnit(3, `% accepted by ${country.name}`);
    } else {
      return this.props.axes;
    }
    return newAxes;
  }
  release() {
    this.setState({
      lockedElement : null,
      axes : this.props.axes
    });
  }

  d3render() {
    if(!this.props.data || Object.keys(this.props.data).length === 0) { return; }

    var container = this.selectRef('container')[0];

    var sankey = d3.sankey()
      .nodeWidth(this.props.nodeWidth)
      .nodePadding(this.props.nodePadding)
      // -30 for top axis labels, -10 for padding
      .size([this.props.width, this.props.height - 30 - 10]);

    var path = sankey.link();

    function drawDecisionLabels(group, label, value) {
      var labelElement = d3Guarantee(group, 'node-label', 'svg:text');
      var valueElement = d3Guarantee(group, 'node-value', 'svg:text');
      labelElement
        .text(label)
        .attr({
          'text-anchor' : 'middle',
          y : -1
        });
      valueElement
        .text(value)
        .attr({
          'text-anchor' : 'middle',
          y : 12
        });
    }
    function drawLabels(group, label, value, bottomEdge, right) {
      var textPosition = Math.min(12, bottomEdge);
      var labelElement = d3Guarantee(group, 'node-label', 'svg:text');
      var valueElement = d3Guarantee(group, 'node-value', 'svg:text');

      labelElement.text(label);
      valueElement.text(value);

      var labelX = right ?
        -5 - valueElement.node().getBoundingClientRect().width :
        sankey.nodeWidth() + 2;
      var valueX = right ? -3 :
        labelElement.node().getBoundingClientRect().width + sankey.nodeWidth() + 4;

      labelElement
        .attr({
          x : labelX,
          y : textPosition
        });
      valueElement
        .attr({
          x : valueX,
          y : textPosition
        });
    }


    sankey
      .nodes(this.props.data.nodes)
      .links(this.props.data.links)
      // no rearranging for you!
      .layout(0);

    var links = this.selectRef('links');
    var linkJoin = links.selectAll('.link')
      .data(this.props.data.links);
    linkJoin.enter().append('svg:path')
      .classed('link', true)
      .on('click', this.release);
    linkJoin
      .attr({
        d : path,
        'data-type' : d => d.type,
        'data-source' : d => d.source.name,
        'data-target' : d => d.target.name,
        'data-value' : d => d.value
      })
      .style('stroke-width', d => Math.max(1, d.dy))
      .sort((a,b) => { return b.dy - a.dy });

    var nodes = this.selectRef('nodes');
    var nodeJoin = nodes.selectAll('.node')
      .data(this.props.data.nodes);
    nodeJoin.enter().append('svg:g')
      .classed('node', true)
      .attr({
        'transform' : d => generateTranslateString(d.x, d.y),
        'data-type' : d => d.type,
        'data-name' : d => d.name,
        'data-value' : d => d.value
      })
      .each(function(d) {
        var sel = d3.select(this);

        // first, the base rect(s)
        if(d.type === 'o-2') {
          var fullHeight = d.dy;
          var yesHeight = d.odcY.total / d.total * fullHeight;
          var noHeight = d.odcN.total / d.total * fullHeight;
          // yes
          sel.append('svg:rect')
            .attr({
              'data-decision' : 'accepted',
              height : yesHeight,
              width : sankey.nodeWidth()
            })
          // no
          sel.append('svg:rect')
            .attr({
              'data-decision' : 'rejected',
              y : yesHeight,
              height : noHeight,
              width : sankey.nodeWidth()
            })
        } else {
          sel.append('svg:rect')
            .attr({
              height : d => d.dy,
              width : sankey.nodeWidth()
            });
        }

        // now, the labels
        var labelGroup = sel.append('svg:g')
          .classed('label-group', true);
        switch(d.type) {
          case 'dc':
            var centralTransform = generateTranslateString(sankey.nodeWidth()/2, d.dy/2);
            labelGroup.attr({
              transform : centralTransform
            });
            d.labelText = d.name.toUpperCase();
            d.valueText = refugeeFormat(d.total);
            d.textFn = drawDecisionLabels;
            var labelRect = labelGroup.append('svg:rect')
              .attr({
                height : 36,
                width: 60,
                y : -18,
                x : -30
              });
            drawDecisionLabels(labelGroup, d.labelText, d.valueText);
            break;
          case 'o-2':
            var country = countries[d.name.substr(0,3)];
            var percentAccepted = d.odcY.total / d.total;
            d.labelText = country.name;
            d.valueText = percentFormat(percentAccepted);
            d.textFn = drawLabels;
            drawLabels(labelGroup, d.labelText, d.valueText, d.dy, true);
            break;
          case 'o':
          case 'd':
            var country = countries[d.name];
            d.labelText = country.name;
            d.valueText = refugeeFormat(d.total);
            d.textFn = drawLabels;
            drawLabels(labelGroup, d.labelText, d.valueText, d.dy);
            break;
        }
      })
      .on('mouseenter', (d) => {
        this.setState({
          focusedElement : d,
          axes : this.checkAxes(d)
        });
      })
      .on('mouseleave', (d) => {
        this.setState({
          focusedElement : null,
          axes : this.props.axes
        });
      })
      .on('click', (d) => {
        var lockedElement = this.state.lockedElement ? null : d;
        this.setState({
          lockedElement : lockedElement,
          axes : lockedElement ? this.checkAxes(lockedElement) : this.props.axes
        });
      });

      // now we're handling the state
      var d = this.state.focusedElement || this.state.lockedElement;

      // we want to clear everything if there's no focus
      if(!d) {
        linkJoin
          .attr('data-diminish', false);
        nodeJoin
          .attr('data-diminish', false)
          .each(function(n) {
            var sel = d3.select(this);
            var labelGroup = sel.select('.label-group');
            n.textFn(labelGroup, n.labelText, n.valueText, n.dy, n.type === 'o-2');
            sel.select('.node-value').attr('data-no', false);
          });
        return;
      }

      // if we have an `o` or `o-2` node, we want to show either
      var d_2;
      if(['o', 'o-2'].indexOf(d.type) > -1) {
        var alt = d.type === 'o' ? 'o_2' : 'o';
        d_2 = d[alt];
      }

      linkJoin
        .attr('data-diminish', function(l) {
          var diminish = (d.sourceLinks.indexOf(l) === -1 && d.targetLinks.indexOf(l) === -1);
          // if(d_2) {
          //   diminish = diminish ? (d_2.sourceLinks.indexOf(l) === -1 && d_2.targetLinks.indexOf(l) === -1) : false;
          // }
          if(!diminish) { links.node().appendChild(this); }
          return diminish;
        });

      nodeJoin
          .attr('data-diminish', function(n) {
            if(n === d || d.o === n || d.o_2 === n) { return false; }
            if(n.type === d.type) { return true; }
            // if(n.type === 'o-2' && d.type === 'd') { return true; }
            if(n.type === `${d.type}-2` || `${n.type}-2` === d.type) { return true; }
          })
          .each(function(n) {
            var sel = d3.select(this);
            var labelGroup = sel.select('.label-group');
            var value = 'ERROR';

            // I'm really sorry.
            if(n === d || d.o === n || d.o_2 === n) {
              value = n.valueText;
            } else if(n.type.substr(0,1) === 'o' && d.type.substr(0,1) === 'o') {
              value = n.valueText;
            } else if(n.type === d.type) {
              value = '—';
            } else if(n.type === 'o-2') {
              if(d.type === 'dc') {
                // maybe we should not do this?
                value = percentFormat(
                  (d.name === 'accepted' ? n.odcY.total : n.odcN.total) / n.total
                );
                sel.select('.node-value')
                  .attr('data-no', d.name === 'rejected');
              } else if(d.type === 'd') {
                // console.log('hi', n.o);
                for(let l of n.o.sourceLinks) {
                  if(l.target === d) {
                    // ok, so this is the o_2 from a destination, which means we want
                    let values = n.o.allValues.filter(v => v.from = n.o.name && v.to === d.name);

                    let accepted = +values.find(v => v.decision === 'accepted').values;
                    let rejected = +values.find(v => v.decision === 'rejected').values;
                    let total = accepted + rejected;
                    value = percentFormat(accepted / total);
                  }
                }
              }
            } else if(d.type === 'dc' && n.type === 'o') {
              let values = n.allValues.filter(v => v.decision === d.name);
              let total = values.reduce((memo, v) => { return +v.values + memo; }, 0);
              value = refugeeFormat(total);
            } else if(d.type === 'o' && n.type === 'dc') {
              for(let l of n.sourceLinks) {
                if(l.target === d.o_2) { value = refugeeFormat(l.value); }
              }
            } else if(d.type === 'o-2' && n.type === 'd') {
              for(let l of n.targetLinks) {
                if(l.source === d.o) { value = refugeeFormat(l.value); }
              }
            } else {
              for(let l of n.sourceLinks) {
                if(l.target === d) { value = refugeeFormat(l.value); }
              }
              for(let l of n.targetLinks) {
                if(l.source === d) { value = refugeeFormat(l.value); }
              }
            }

            n.textFn(labelGroup, n.labelText, value, n.dy, n.type === 'o-2');
          });
  }
}
