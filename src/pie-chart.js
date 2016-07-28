var lerp = require('lerp')
var d3 = require('d3')
var template = require('lodash.template')

function PieChart(selector, cleanData) {
  var $scope = d3.select(selector)
  var width = 500
  var height = 500
  var radius = Math.min(width, height) / 2
  var colorScale = createColorScaler(cleanData)
  var data = addTransitionData(cleanData)
  var pieStart = createPie(radius, function (d) { return d.startValue })
  var pieEnd = createPie(radius, function (d) { return d.value })
  var svg = createSvg($scope, width, height)
  var pieces = createChartPieces(data, svg, pieStart, pieEnd, colorScale)

  // [ { value, display, label }, ... ]

  createChartLegend($scope, data, selector, colorScale)
  fadein($scope)

  var speed = 600
  var labels = createChartLabels(speed, data, svg, pieEnd)
  tooltips(data, $scope, svg, pieces, pieEnd)
  startOpeningTransition(speed, pieEnd, pieces, labels, colorScale)

  return function destroy() {
    document.querySelector(selector).querySelector('svg').remove()
    $scope.select('.chart-pie-legend').html('')
    $scope.style('opacity', '0')
  }
}

module.exports = PieChart

function createColorScaler (data) {
  var min = d3.min(data, function (d) {
    return +d.value
  })

  var max = d3.max(data, function (d) {
    return +d.value
  })

  return d3.scale.linear()
    .domain([
      min,
      lerp(min, max, 0.25),
      lerp(min, max, 0.75),
      max
    ])
    .range(['#46afe3', '#6b7abb', '#df80ff', '#eb5368'])
}

function createSvg ($scope, width, height) {
  return $scope.select('.chart-pie-svg').append('svg')
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('viewBox', [ 0, 0, width, height ].join(' '))
    .append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
}

function addTransitionData (data) {
  var firstRun = true

  var value = data.map(function (value) {
    var startValue = firstRun ? 1 : 0
    firstRun = false

    return Object.assign({
      startValue: startValue
    }, value)
  })

  return value
}
var origin = [0, 0];
function createChartLabels (speed, data, svg, pieEnd) {
  var minimumAngle = Math.PI * 0.03
  var labels = svg.datum(data).selectAll('text.chart-pie-text')
    .data(pieEnd.layout)
    .enter().append('text')
    .attr('class', 'chart-pie-text')
    .attr('dy', '.35em')
    .style('fill-opacity', 0)
    .style('pointer-events', 'none')
    .style('text-anchor', 'middle')
    .style('font-size', function (d) {
      const angleRatio = Math.min(1, (d.endAngle - d.startAngle) / (Math.PI / 2))
      return Math.floor(50 + 50 * angleRatio) + "%"
    })
    .attr('transform', function (d, i) {
      var pt = pieEnd.arc.centroid(d).map(p => p * (0.8 + 0.5 * i / data.length))
      return 'translate(' + pt + ')'
    })
    .text(function (d) {
      if (d.endAngle - d.startAngle > minimumAngle) {
        return d.data.display || d.data.value
      }
      return ""
    })

  return labels
}

function createChartLegend ($scope, data, selector, colorScale) {
  var labelTemplate = template(`
    <div class='chart-pie-legend-row'>
      <div class='chart-pie-legend-value'><%= display %></div>
      <div class='chart-pie-legend-color' style='background-color: <%- color %>'></div>
      <div class='chart-pie-legend-label'><%= label %></div>
    </div>
  `)
  var totalValue = data.reduce(function (memo, d) { return d.value + memo }, 0)

  var html = data.reduce(function (memo, d) {
    return memo + labelTemplate({
        color: colorScale(d.value),
        percentage: d.value / totalValue,
        label: d.label,
        display: d.display || d.value
      })
  }, '')

  $scope.select('.chart-pie-legend').html(html)
}

function tooltips (data, $scope, svg, chartPieces, pieEnd) {
  var totalValue = data.reduce(function (memo, d) { return d.value + memo }, 0)

  var tooltip = svg.append('div')
    .attr('class', 'chart-pie-tooltip')
    .attr('dy', '.35em')
    .style('text-anchor', 'middle')
    .style('pointer-events', 'none')

  function toggleLegendRowActive ($scope, el, active) {
    var index = Array.from(el.parentElement.childNodes).indexOf(el) + 1
    var row = $scope.select('.chart-pie-legend-row:nth-child(' + index + ')')
    row.classed('active', active)
  }

  chartPieces.on('mouseenter', function () {
    var $this = d3.select(this)
    var datum = $this.data()[0]

    tooltip
      .attr('transform', 'translate(' + pieEnd.arc.centroid(datum) + ')')
      .text(datum.data.label + ', ' + parseInt((datum.value / totalValue) * 100, 10) + '%')

    toggleLegendRowActive($scope, this, true)

    $this.classed('active', true)
  })

  chartPieces.on('mouseleave', function () {
    var $this = d3.select(this)
    datum = $this.data()[0]

    tooltip
      .attr('transform', 'translate(' + pieEnd.arc.centroid(datum) + ')')
      .text(datum.data.label + ', ' + parseInt((datum.value / totalValue) * 100, 10) + '%')

    toggleLegendRowActive($scope, this, false)

    $this.classed('active', false)
  })
}

function createChartPieces (data, svg, pieStart, pieEnd, colorScale) {
  var chartPieces = svg.datum(data).selectAll('.chart-pie-piece')
    .data(pieEnd.layout)
    .enter().append('path')
    .style('transform', 'scale(0.5)')
    .attr('class', 'chart-pie-piece')
    .attr('fill', function (d, i) {return colorScale(d.value) })
    .attr('stroke', function (d, i) {return d3.rgb(colorScale(d.value)).darker(0.1).toString() })
    .attr('stroke-width', 3)

  chartPieces.data(pieStart.layout)
    .attr('d', pieStart.arc)
    .each(function (d) { this._current = d }) // store the initial angles

  return chartPieces
}

function createPie (radius, valueFunction) {
  return {
    arc: (
    d3.svg.arc()
      .outerRadius(radius * 0.95)
      .innerRadius(radius * 0.3)
    ),
    layout: (
    d3.layout.pie()
      .value(valueFunction)
      .sort(null)
    )
  }
}

function fadein ($scope) {
  // $scope.style('display', 'table')
  setTimeout(() => {
    $scope.style('opacity', '1')
  }, 10)
}

function startOpeningTransition (speed, pieEnd, chartPieces, labels, colorScale) {
  chartPieces = chartPieces.data(pieEnd.layout) // compute the new angles

  var length = chartPieces.data().length

  chartPieces
    .transition()
    .duration(speed)
    .attrTween('d', arcTween(pieEnd.arc))

    .transition()
    .style('transform', null)
    .delay(function (d, i) {
      return speed + 50 + i * speed / length
    })

  labels.transition()
    .style('fill-opacity', function (d) { return 1 })
    .delay(function (d, i) {
      return ( speed ) * 1.5 + 50 + i * speed / length
    })
}

function arcTween (arc) {

  // Store the displayed angles in _current.
  // Then, interpolate from _current to the new angles.
  // During the transition, _current is updated in-place by d3.interpolate.

  return function (a) {
    var i = d3.interpolate(this._current, a)
    this._current = i(0)
    return function (t) {
      return arc(i(t))
    }
  }
}
