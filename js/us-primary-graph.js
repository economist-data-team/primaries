import React from 'react';
import chroma from 'chroma-js';
import d3 from 'd3';
import RFD from 'react-faux-dom';
import BoundedSVG from './bounded-svg.js';
import { Im, bindValueToRange, generateTranslateString, guarantee } from './utilities.js';

// oh god, this is an absurd, but the only way of getting these widths right
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
ctx.font = 'bold 13px Officina, Calibri, Arial, sans-serif, Lucida Grande, Arial Unicode MS';

var primaryGraphPadding = 5;
export default class PrimaryGraph extends BoundedSVG {
  constructor(...args) {
    super(...args);
    this.el = RFD.createElement('g');
  }
  static get defaultProps() {
    return Im.extend(super.defaultProps, {
      candidates : [],
      luminanceThreshold : 0.5
    });
  }
  d3render() {
    // this is a postfix for the label widths
    var sel = this.selectRef('main');
    var padding = primaryGraphPadding;

    var labelContainers = sel.selectAll('.trace-label-container');
    labelContainers.each(function() {
      var sel = d3.select(this);
      var textWidth = sel.select('text').node().getBoundingClientRect().width;
      sel.select('rect').attr({
        width : textWidth + padding * 2
      })
    });
  }
  render() {
    const LUMINANCE_THRESHOLD = this.props.luminanceThreshold;

    var el = this.el;
    var sel = d3.select(el);
    sel.attr({ ref : 'main' });

    var lastEnteredElection = this.props.lastEnteredElection;
    var numPrimaries = this.props.numPrimaries;

    var xScale = this.props.xScale;
    var yScale = this.props.yScale.copy().range([
      this.bottomBound, this.topBound
    ]);

    var count = this.props.candidates.length;

    var primaryPathFn = d3.svg.line()
      .x((d,idx) => this.props.superdelegates && idx === 0 ?
        xScale(0.5) : xScale(idx))
      .y((d,idx) => yScale(d))
      .interpolate('step');

    var padding = primaryGraphPadding;

    // we'll aim to show the first six, because let's not go mad
    var cutoffCandidate = this.props.candidates.slice(0,6).pop();
    var countTarget = cutoffCandidate.delegates[numPrimaries - 1];
    // var labeledCandidates = this.props.candidates.slice(0,6);
    var labeledCandidates = this.props.candidates.filter(
      c => c.delegates[numPrimaries - 1] >= countTarget
    );
    if(labeledCandidates.length > 7) {
      labeledCandidates = labeledCandidates.filter(
        c => c.delegates[numPrimaries - 1] >= countTarget + 1
      );
    }

    if(this.props.superdelegates) {
      var space = xScale(1) - xScale(0) - 2;
      var barWidth = space / (count - 1);

      let xStart = (d, idx) => xScale(-0.5) + idx * space / count;
      let yPosition = d => yScale(d.delegates[0]);

      var superDelegateJoin = sel.selectAll('.superdelegate-bar')
        .data(this.props.candidates);
      superDelegateJoin.enter().append('svg:rect')
        .classed('superdelegate-bar', true);
      superDelegateJoin.exit().remove();
      superDelegateJoin.attr({
        x : xStart,
        y : yPosition,
        width : barWidth,
        height : d => yScale(0) - yScale(d.delegates[0]),
        fill : d => d.colour
      });
      var superDelegateLineJoin = sel.selectAll('.superdelegate-line')
        .data(this.props.candidates);
      superDelegateLineJoin.enter().append('svg:line')
        .classed('superdelegate-line trace', true);
      superDelegateLineJoin.exit().remove();
      superDelegateLineJoin.attr({
        stroke : d => d.colour,
        x1 : (d, idx) => xStart(d, idx) + 0.15, // to make antialiasing look a bit nicer
        x2 : xScale(0.51), // to overlap just slightly with the real trace
        y1 : yPosition,
        y2 : yPosition
      });
    } else {
      sel.selectAll('.superdelegate-bar').remove();
      sel.selectAll('.superdelegate-line').remove();
    }

    var labelX = xScale(lastEnteredElection === 0 ? 0.25 : lastEnteredElection) + 5;
    var nodes = labeledCandidates.map((d, idx) => ({
      anchor : true,
      candidate : d,
      startX : labelX,
      startY : yScale(d.delegates[numPrimaries - 1]),
      x : labelX,
      // the idx just gives them a little nudge
      y : yScale(d.delegates[numPrimaries - 1]) + idx
    }));
    var candidateCount = nodes.length;
    var links = nodes.map((d, idx) => ({
      source : idx,
      target : idx + candidateCount,
      value : 1
    }));
    nodes = nodes.concat(nodes.map(d => Im.extend(d, { anchor : false })));

    var force = d3.layout.force()
      .linkDistance(0)
      .linkStrength(1)
      .gravity(0)
      .chargeDistance(40)
      .charge(d => d.anchor ? 0 : -90)
      .friction(0.8);

    force.nodes(nodes).links(links).start();
    force.on('tick', d => {
      nodes.forEach(n => {
        n.x = n.startX,
        n.y = n.anchor ? n.startY : bindValueToRange(n.y, 10, 140)
      });
    });
    for(let i=0;i<500;++i) { force.tick(); }
    force.stop();

    var labelJoin = sel.selectAll('.trace-label-container')
      .data(nodes.filter(d => !d.anchor));

    labelJoin.enter().append('svg:g')
      .classed('trace-label-container', true);
    labelJoin.exit().remove();
    labelJoin
      .attr('transform', d => generateTranslateString(d.x, d.y))
      .each(function(d) {
        var label = `${d.candidate.displaySurname} ${d.candidate.delegates[lastEnteredElection]}`;
        var fillLuminance = chroma(d.candidate.colour).luminance();
        var rect = guarantee(this, 'trace-bg', 'svg:rect')
          .attr({
            fill : d.candidate.colour,
            width : ctx.measureText(label.toUpperCase()).width + padding * 2,
            height : 18,
            y : -9
          });
        var text = guarantee(this, 'trace-label', 'svg:text')
          .classed('ended', d.candidate.ended)
          .text(label)
          .attr({
            fill : fillLuminance > LUMINANCE_THRESHOLD ? 'black' : 'white',
            y : 4,
            x : padding
          });
      });

    var offset = lastEnteredElection === 0 ? 10 : 5;

    var linkJoin = sel.selectAll('.trace-label-links')
      // only draw the link if we actually moved the label
      .data(links.filter(l => Math.abs(l.source.y - l.target.y) > 0));
    linkJoin.enter().append('svg:path')
      .classed('trace-label-links', true);
    linkJoin.exit().remove();
    linkJoin.attr({
      fill : 'none',
      stroke : '#333',
      d : d => `M ${d.source.x-offset} ${d.source.y}
                C ${d.target.x} ${d.source.y} ${d.source.x-offset} ${d.target.y} ${d.target.x} ${d.target.y}`
    });
    if(lastEnteredElection === 0) {
      // only one election—special case, no line
      var dotJoin = sel.selectAll('.trace-dot')
        .data(this.props.candidates);

      dotJoin.enter().append('svg:circle')
        .classed('trace-dot', true);
      dotJoin.exit().remove();
      dotJoin.attr({
        fill : d => d.colour,
        cx : xScale(0),
        cy : d => yScale(+d.delegates[0]),
        r : 3,
        'data-name' : d => d.displaySurname
      });
      sel.selectAll('.trace-line').remove();
    } else {
      var traceJoin = sel.selectAll('.trace-line')
        .data(this.props.candidates);

      traceJoin.enter().append('svg:path')
        .classed('trace trace-line', true);
      traceJoin.exit().remove();
      traceJoin.attr({
        stroke : d => d.colour,
        d : d => primaryPathFn(
          d.delegates.slice(0, this.props.lastEnteredElection + 1)
        )
      });
      sel.selectAll('.trace-dot').remove();
    }

    return el.toReact();
  }
}
