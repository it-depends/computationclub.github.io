/* jshint bitwise: false */
/* global window */

(function (exports) {
  'use strict';

  var Rule = (function () {
    var constructor = function (number) {
      this.number = number;
    };

    constructor.prototype.apply = function (p, q, r) {
      return !!(this.number & (1 << ((p << 2) | (q << 1) | (r << 0))));
    };

    return constructor;
  }());

  var CellularAutomaton = (function () {
    var constructor = function (options) {
      this.rule = options.rule;
      this.cells = options.cells;
      this.left = 0;
      this.right = this.cells.length - 1;
    };

    constructor.prototype.padCells = function () {
      this.cells.unshift(false);
      this.left--;
      this.cells.push(false);
      this.right++;
    };

    constructor.prototype.step = function () {
      this.padCells();

      this.cells = this.cells.map(function (middle, column) {
        return this.rule.apply(this.cells[column - 1], middle, this.cells[column + 1]);
      }, this);

    };

    constructor.prototype.cellAt = function (column) {
      return this.cells[column - this.left];
    };

    return constructor;
  }());

  var drawCells = function (cellularAutomaton, context, row, cellCount, cellSize) {
    for (var column = -cellCount + 1; column <= 0; ++column) {
      if (cellularAutomaton.cellAt(column)) {
        context.fillRect((column + cellCount - 1) * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
  };

  var scrollContext = function (context, cellCount, rowCount, cellSize) {
    var width = cellCount * cellSize, height = rowCount * cellSize;

    var imageData = context.getImageData(0, cellSize, width, height - cellSize);
    context.putImageData(imageData, 0, 0);
    context.clearRect(0, height - cellSize, width, cellSize);
  };

  exports.drawCellularAutomaton = function (options) {
    var canvas = options.canvas,
      cellSize = options.cellSize,
      rule = options.rule,
      rowsPerSecond = options.rowsPerSecond;

    var context = canvas.getContext('2d');

    var cellCount = Math.floor(canvas.width / cellSize);
    var cellularAutomaton = new CellularAutomaton({ rule: rule, cells: [true] });

    var rowCount = Math.floor(canvas.height / cellSize);
    var row = 0;

    window.setInterval(function () {
      drawCells(cellularAutomaton, context, row, cellCount, cellSize);
      cellularAutomaton.step();

      if (row < rowCount - 1) {
        ++row;
      } else {
        scrollContext(context, cellCount, rowCount, cellSize);
      }
    }, 1000 / rowsPerSecond);
  };

  exports.Rule = Rule;
}(this));
