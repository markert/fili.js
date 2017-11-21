/* global d3, $ */

$(document).ready(function () {
  'use strict'
  var d3draw = {
    linestrip: function (params) {
      (function draw () {
        d3.select(params.element).select('svg').remove()
        var margin = {
          top: 35,
          right: 20,
          bottom: 50,
          left: 90
        }

        var width = params.width - margin.left - margin.right
        var height = params.height - margin.top - margin.bottom

        var xMin = d3.min(params.values, function (d) {
          return d[0]
        })

        var xMax = d3.max(params.values, function (d) {
          return d[0]
        })

        var yMin = d3.min(params.values, function (d) {
          return d[1]
        })

        var yMax = d3.max(params.values, function (d) {
          return d[1]
        })
        if (params.values1) {
          var xMin1 = d3.min(params.values1, function (d) {
            return d[0]
          })

          if (xMin > xMin1) {
            xMin = xMin1
          }

          var xMax1 = d3.max(params.values1, function (d) {
            return d[0]
          })
          if (xMax < xMax1) {
            xMax = xMax1
          }

          var yMin1 = d3.min(params.values1, function (d) {
            return d[1]
          })

          if (yMin > yMin1) {
            yMin = yMin1
          }

          var yMax1 = d3.max(params.values1, function (d) {
            return d[1]
          })

          if (yMax < yMax1) {
            yMax = yMax1
          }
        }

        var x = d3.scale.linear()
              .range([0, width])
              .domain([xMin, xMax])

        var y = d3.scale.linear()
              .range([height, 0])
              .domain([yMin, yMax * 1.1])

        var xAxis = d3.svg.axis()
              .scale(x)
              .orient('bottom')

        var yAxis = d3.svg.axis()
              .scale(y)
              .ticks(10)
              .tickFormat(function (d) {
                return params.yFormatter(d)
              })
              .orient('left')

        var line = d3.svg.line()
              .x(function (d) {
                return x(d[0])
              })
              .y(function (d) {
                return y(d[1])
              })

        var parent = d3.select(params.element)
              .append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom)

        var svg = parent.append('g')
              .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

            // horizontal grid
        svg.append('g')
              .selectAll('line.grid')
              .data(y.ticks(10))
              .enter()
              .append('line')
              .attr('class', 'grid')
              .attr('x1', 0)
              .attr('y1', function (d) { return y(d) })
              .attr('x2', width)
              .attr('y2', function (d) { return y(d) })

            // vertical grid
        svg.append('g')
              .selectAll('line.grid')
              .data(x.ticks(10))
              .enter()
              .append('line')
              .attr('class', 'grid')
              .attr('x1', function (d) { return x(d) })
              .attr('y1', 0)
              .attr('x2', function (d) { return x(d) })
              .attr('y2', height)

            // x axis
        svg.append('g')
             .attr('class', 'x axis')
             .attr('transform', 'translate(0,' + height + ')')
             .call(xAxis)

            // y axis
        svg.append('g')
              .attr('class', 'y axis')
              .call(yAxis)

            // line
        svg.append('path')
              .datum(params.values)
              .attr('class', 'line')
              .attr('d', line)

            // x axis label
        svg.append('text')
              .attr('text-anchor', 'middle')
              .attr('transform', 'translate(' + (width / 2) + ',' + (height + margin.bottom - 5) + ')')
              .text(params.xLabel)

            // y axis label
        svg.append('text')
              .attr('text-anchor', 'middle')
              .attr('transform', 'translate(' + (-margin.left / 1.5) + ',' + (height / 2) + ') rotate(-90)')
              .text(params.yLabel)

            // add label for current value when hovering
        var value = parent.append('text')
              .attr('text-anchor', 'end')
              .attr('transform', 'translate(' + (width + margin.left) + ',' + (20) + ')')
              .text('')

            // area below line
        var area = d3.svg.area()
              .x(function (d) { return x(d[0]) })
              .y0(height)
              .y1(function (d) { return y(d[1]) })

        svg.append('path')
              .datum(params.values)
              .attr('class', 'area')
              .attr('d', area)

        if (params.values1) {
          svg.append('path')
                .datum(params.values1)
                .attr('class', 'areasig')
                .attr('d', area)
        }
            // add mouse interaction - we need to have a transparent overlay to catch mouse events
        var bisect = d3.bisector(function (d) {
          return d[0]
        }).left

            // add vertical line
        var hover = svg.append('line')
              .attr('class', 'hover')
              .attr('x1', 0)
              .attr('y1', 0)
              .attr('x2', 0)
              .attr('y2', height)

            // add circle
        var circle = svg.append('circle')
              .attr('class', 'circle')
              .attr('cx', 0)
              .attr('cy', 0)
              .attr('r', 4)

        function over () {
          circle
                .style('opacity', 1)
          hover
                .style('opacity', 1)
        }

        function move () {
          var mouseX = d3.mouse(this)[0]
          var x0 = x.invert(mouseX)
          var i = bisect(params.values, x0)
          var y0 = params.values[i][1]

              // update hover line position
          hover
                .attr('x1', mouseX)
                .attr('x2', mouseX)

              // update circle position
          circle
                .attr('cx', mouseX)
                .attr('cy', y(y0))

              // update current value
          value.text(params.xFormatter(x0) + ' ' + params.yFormatter(y0))
        }

        function out () {
          circle
                .style('opacity', 0)
          hover
                .style('opacity', 0)
        }

        svg.append('rect')
              .attr('width', width)
              .attr('height', height)
              .attr('class', 'overlay')
              .on('mouseover', over)
              .on('touchstart', over)
              .on('mousemove', move)
              .on('touchmove', move)
              .on('mouseout', out)
              .on('touchend', out)
      })()
    },
    polar: function (params) {
      (function circle () {
        d3.select(params.element).select('svg').remove()
        var margin = {
          top: 40,
          right: 40,
          bottom: 40,
          left: 40
        }

        var width = params.width - margin.left - margin.right
        var height = params.height - margin.top - margin.bottom

        var r = d3.scale.linear()
        .domain([-1, 1])
        .range([0, width])

        var test = d3.scale.linear()
        .domain([0, 1])
        .range([0, width / 2])

        var y = d3.scale.linear()
        .domain([-1, 1])
        .range([height, 0])

        var parent = d3.select(params.element).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)

        var svg = parent.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

        var gr = svg.append('g')
        .attr('class', 'r axis')
        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
        .selectAll('g')
        .data(test.ticks(5).slice(1))
        .enter().append('g')

        gr.append('circle')
        .attr('r', test)

        var xAxis = d3.svg.axis()
        .scale(r)
        .tickFormat(function (d) {
          if (d === 0) { return '' }
          return d3.format()(d)
        })
        .orient('bottom')

      // x axis
        svg.append('g')
       .attr('class', 'x axis')
       .attr('transform', 'translate(0,' + height / 2 + ')')
       .call(xAxis)

        var yAxis = d3.svg.axis()
        .scale(y)
        .tickFormat(function (d) {
          if (d === 0) { return '' }
          return d3.format()(d)
        })
        .orient('left')

      // x axis
        svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(' + width / 2 + ',' + 0 + ')')
        .call(yAxis)

      // label for current value
        var value = parent.append('text')
        .attr('text-anchor', 'end')
        .attr('transform', 'translate(' + (width + margin.left) + ',' + (20) + ')')
        .text('')

        var zeroes = function (data, index) {
          data = []
          for (var cnt = 0; cnt < params.values.length; cnt++) {
            data.push(params.values[cnt].z)
          }
          return data
        }

        var poles = function (data, index) {
          data = []
          for (var cnt = 0; cnt < params.values.length; cnt++) {
            data.push(params.values[cnt].p)
          }
          return data
        }

      // draw cross for imaginary numbers
        var size = 4 * Math.sqrt(Math.PI) / 2

        function radiansToDegrees (rad) {
          return rad * (180 / Math.PI)
        }

        var drawCross = function (num) {
          svg.append('g')
          .selectAll('line.cross')
          .data(poles)
          .enter()
          .append('g')
          .attr('transform', function (d) {
            // use group around circle for setting position via transform
            // so we can use path's transform for scaling on mouse interactions
            return 'translate(' + r(d[num].re) + ',' + y(d[num].im) + ')'
          })
          .append('path')
          .attr('class', 'cross')
          .style('stroke', function (d) {
            return d.color
          })
          .attr('d', function () {
            // draw cross, i.e. x
            return (
              'M' + (-size) + ',' + (-size) +
              'L' + (size) + ',' + (size) +
              'M' + (-size) + ',' + (size) +
              'L' + (size) + ',' + (-size)
            )
          })
          .on('mouseover', function (d) {
            // update current value
            var x = d[num].re
            var y = d[num].im
            var angle = radiansToDegrees(Math.atan2(y, x))
            var length = Math.sqrt(x * x + y * y)
            value.text('real ' + x.toFixed(2) + ', imaginary ' + y.toFixed(2) + ', angle ' + angle.toFixed(2) + '°, length ' + length.toFixed(2))
            d3.select(this).style('stroke', 'steelblue')
            d3.select(this).style('transform', 'scale(1.5)')
          })
          .on('mouseout', function (d) {
            d3.select(this).style('stroke', d.color)
            d3.select(this).style('transform', 'scale(1)')
          })
        }

        var drawCircle = function (num) {
          svg.append('g')
          .selectAll('circle.zero')
          .data(zeroes)
          .enter()
          .append('circle')
          .attr('class', 'zero')
          .style('stroke', function (d) {
            return d.color
          })
          .attr('cx', function (d) {
            return r(d[num].re)
          })
          .attr('cy', function (d) {
            return r(d[num].im)
          })
          .attr('r', 4)

          svg.append('g')
          .selectAll('circle.zero')
          .data(zeroes)
          .enter()
          .append('g')
          .attr('transform', function (d) {
            // use group around circle for setting position via transform
            // so we can use path's transform for scaling on mouse interactions
            return 'translate(' + r(d[num].re) + ',' + y(d[num].im) + ')'
          })
          .append('circle')
          .attr('class', 'zero')
          .style('stroke', function (d) {
            return d.color
          })
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('r', 4)
          .on('mouseover', function (d) {
            var x = d[num].re
            var y = d[num].im
            var angle = radiansToDegrees(Math.atan2(y, x))
            var length = Math.sqrt(x * x + y * y)
            value.text('real ' + x.toFixed(2) + ', imaginary ' + y.toFixed(2) + ', angle ' + angle.toFixed(2) + '°, length ' + length.toFixed(2))
            d3.select(this).style('stroke', 'steelblue')
            d3.select(this).style('transform', 'scale(1.5)')
          })
          .on('mouseout', function (d) {
            d3.select(this).style('stroke', d.color)
            d3.select(this).style('transform', 'scale(1)')
          })
        }

        drawCross(0)
        drawCross(1)

        drawCircle(0)
        drawCircle(1)
      })()
    }
  }
  window.d3draw = d3draw
})
