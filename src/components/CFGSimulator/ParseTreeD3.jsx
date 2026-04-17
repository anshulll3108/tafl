import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export function ParseTreeD3({ parseTree, animated = true }) {
  const svgRef = useRef(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!parseTree || !svgRef.current) return;

    const width = 1000;
    const height = 600;

    // Create SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', 'translate(50,50)');

    // Color scale based on depth
    const colorScale = d3.scaleOrdinal()
      .domain([0, 1, 2, 3, 4, 5])
      .range([
        '#8B5CF6', // Purple - root
        '#3B82F6', // Blue
        '#06B6D4', // Cyan
        '#10B981', // Green
        '#F59E0B', // Amber
        '#EF4444'  // Red
      ]);

    // Tree layout
    const tree = d3.tree().size([width - 100, height - 100]);
    const root = d3.hierarchy(parseTree);
    const links = tree(root).links();
    const nodes = root.descendants();

    // Draw links
    g.selectAll('.link')
      .data(links)
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y))
      .attr('stroke', '#ccc')
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr('stroke-dasharray', function() {
        const length = this.getTotalLength();
        return length;
      })
      .attr('stroke-dashoffset', function() {
        return this.getTotalLength();
      });

    // Animate links
    if (animated) {
      g.selectAll('.link')
        .transition()
        .duration(300)
        .attr('stroke-dashoffset', 0);
    }

    // Draw nodes
    const nodeElements = g.selectAll('.node')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => d.data.type === 'terminal' ? 20 : 25)
      .attr('fill', d => {
        if (d.data.type === 'terminal') return '#F59E0B';
        if (d.data.type === 'epsilon') return '#10B981';
        return colorScale(d.depth);
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('opacity', animated ? 0 : 1);

    // Animate nodes
    if (animated) {
      nodeElements
        .transition()
        .delay(d => d.depth * 150)
        .duration(300)
        .attr('opacity', 1);
    }

    // Add labels
    g.selectAll('.label')
      .data(nodes)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', '#fff')
      .attr('pointer-events', 'none')
      .text(d => d.data.symbol)
      .attr('opacity', animated ? 0 : 1)
      .transition()
      .delay(d => d.depth * 150 + 200)
      .duration(300)
      .attr('opacity', 1);

    // Add zoom behavior
    const zoomBehavior = d3.zoom()
      .on('zoom', (e) => {
        g.attr('transform', e.transform);
      });

    svg.call(zoomBehavior);

  }, [parseTree, animated]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-electric-blue"></div>
          <h2 className="text-xl font-semibold text-gray-900">Parse Tree</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (svgRef.current) {
                d3.select(svgRef.current).transition().duration(300).call(
                  d3.zoom().transform,
                  d3.zoomIdentity.translate(50, 50)
                );
              }
            }}
            className="px-3 py-1 text-xs bg-electric-blue/10 text-electric-blue font-medium rounded hover:bg-electric-blue/20"
          >
            Reset Zoom
          </button>
          <button
            className="px-3 py-1 text-xs bg-electric-blue/10 text-electric-blue font-medium rounded hover:bg-electric-blue/20"
            onClick={() => {
              // SVG export would go here
            }}
          >
            Export SVG
          </button>
        </div>
      </div>

      {/* SVG Container */}
      <div className="overflow-hidden border border-gray-200 rounded-lg bg-white">
        <svg
          ref={svgRef}
          className="w-full"
          style={{ minHeight: '400px' }}
        />
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-purple-nt"></div>
          <span className="text-gray-700">Non-terminal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-amber-token"></div>
          <span className="text-gray-700">Terminal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-emerald"></div>
          <span className="text-gray-700">Epsilon</span>
        </div>
      </div>
    </div>
  );
}

export default ParseTreeD3;
