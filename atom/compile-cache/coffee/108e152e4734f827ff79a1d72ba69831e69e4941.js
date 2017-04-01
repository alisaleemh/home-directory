(function() {
  var Disposable, Point, Range, SelectionWrapper, assertWithException, getBufferRangeForRowRange, getEndOfLineForBufferRow, getRangeByTranslatePointAndClip, isLinewiseRange, limitNumber, propertyStore, ref, ref1, swrap, translatePointAndClip,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Range = ref.Range, Point = ref.Point, Disposable = ref.Disposable;

  ref1 = require('./utils'), translatePointAndClip = ref1.translatePointAndClip, getRangeByTranslatePointAndClip = ref1.getRangeByTranslatePointAndClip, getEndOfLineForBufferRow = ref1.getEndOfLineForBufferRow, getBufferRangeForRowRange = ref1.getBufferRangeForRowRange, limitNumber = ref1.limitNumber, isLinewiseRange = ref1.isLinewiseRange, assertWithException = ref1.assertWithException;

  propertyStore = new Map;

  SelectionWrapper = (function() {
    function SelectionWrapper(selection1) {
      this.selection = selection1;
    }

    SelectionWrapper.prototype.hasProperties = function() {
      return propertyStore.has(this.selection);
    };

    SelectionWrapper.prototype.getProperties = function() {
      return propertyStore.get(this.selection);
    };

    SelectionWrapper.prototype.setProperties = function(prop) {
      return propertyStore.set(this.selection, prop);
    };

    SelectionWrapper.prototype.clearProperties = function() {
      return propertyStore["delete"](this.selection);
    };

    SelectionWrapper.prototype.setWiseProperty = function(value) {
      return this.getProperties().wise = value;
    };

    SelectionWrapper.prototype.setBufferRangeSafely = function(range, options) {
      if (range) {
        return this.setBufferRange(range, options);
      }
    };

    SelectionWrapper.prototype.getBufferRange = function() {
      return this.selection.getBufferRange();
    };

    SelectionWrapper.prototype.getBufferPositionFor = function(which, arg) {
      var end, from, getPosition, head, ref2, ref3, ref4, ref5, start, tail;
      from = (arg != null ? arg : {}).from;
      if (from == null) {
        from = ['selection'];
      }
      getPosition = function(which) {
        switch (which) {
          case 'start':
            return start;
          case 'end':
            return end;
          case 'head':
            return head;
          case 'tail':
            return tail;
        }
      };
      if ((indexOf.call(from, 'property') >= 0) && this.hasProperties()) {
        ref2 = this.getProperties(), head = ref2.head, tail = ref2.tail;
        if (head.isGreaterThanOrEqual(tail)) {
          ref3 = [tail, head], start = ref3[0], end = ref3[1];
        } else {
          ref4 = [head, tail], start = ref4[0], end = ref4[1];
        }
        return getPosition(which);
      }
      if (indexOf.call(from, 'selection') >= 0) {
        ref5 = this.selection.getBufferRange(), start = ref5.start, end = ref5.end;
        head = this.selection.getHeadBufferPosition();
        tail = this.selection.getTailBufferPosition();
        return getPosition(which);
      }
    };

    SelectionWrapper.prototype.setBufferPositionTo = function(which, options) {
      var point;
      point = this.getBufferPositionFor(which, options);
      return this.selection.cursor.setBufferPosition(point);
    };

    SelectionWrapper.prototype.setReversedState = function(isReversed) {
      var head, ref2, tail, wise;
      if (this.selection.isReversed() === isReversed) {
        return;
      }
      if (this.hasProperties()) {
        ref2 = this.getProperties(), head = ref2.head, tail = ref2.tail, wise = ref2.wise;
        this.setProperties({
          head: tail,
          tail: head,
          wise: wise
        });
      }
      return this.setBufferRange(this.getBufferRange(), {
        autoscroll: true,
        reversed: isReversed,
        keepGoalColumn: false
      });
    };

    SelectionWrapper.prototype.getRows = function() {
      var endRow, i, ref2, results, startRow;
      ref2 = this.selection.getBufferRowRange(), startRow = ref2[0], endRow = ref2[1];
      return (function() {
        results = [];
        for (var i = startRow; startRow <= endRow ? i <= endRow : i >= endRow; startRow <= endRow ? i++ : i--){ results.push(i); }
        return results;
      }).apply(this);
    };

    SelectionWrapper.prototype.getRowCount = function() {
      return this.getRows().length;
    };

    SelectionWrapper.prototype.expandOverLine = function() {
      var range, rowRange;
      rowRange = this.selection.getBufferRowRange();
      range = getBufferRangeForRowRange(this.selection.editor, rowRange);
      return this.setBufferRange(range);
    };

    SelectionWrapper.prototype.getRowFor = function(where) {
      var endRow, headRow, ref2, ref3, ref4, startRow, tailRow;
      ref2 = this.selection.getBufferRowRange(), startRow = ref2[0], endRow = ref2[1];
      if (this.selection.isReversed()) {
        ref3 = [startRow, endRow], headRow = ref3[0], tailRow = ref3[1];
      } else {
        ref4 = [endRow, startRow], headRow = ref4[0], tailRow = ref4[1];
      }
      switch (where) {
        case 'start':
          return startRow;
        case 'end':
          return endRow;
        case 'head':
          return headRow;
        case 'tail':
          return tailRow;
      }
    };

    SelectionWrapper.prototype.getHeadRow = function() {
      return this.getRowFor('head');
    };

    SelectionWrapper.prototype.getTailRow = function() {
      return this.getRowFor('tail');
    };

    SelectionWrapper.prototype.getStartRow = function() {
      return this.getRowFor('start');
    };

    SelectionWrapper.prototype.getEndRow = function() {
      return this.getRowFor('end');
    };

    SelectionWrapper.prototype.getTailBufferRange = function() {
      var editor, point, tailPoint;
      editor = this.selection.editor;
      tailPoint = this.selection.getTailBufferPosition();
      if (this.selection.isReversed()) {
        point = translatePointAndClip(editor, tailPoint, 'backward');
        return new Range(point, tailPoint);
      } else {
        point = translatePointAndClip(editor, tailPoint, 'forward');
        return new Range(tailPoint, point);
      }
    };

    SelectionWrapper.prototype.saveProperties = function() {
      var endPoint, properties;
      properties = this.captureProperties();
      if (!this.selection.isEmpty()) {
        endPoint = this.getBufferRange().end.translate([0, -1]);
        endPoint = this.selection.editor.clipBufferPosition(endPoint);
        if (this.selection.isReversed()) {
          properties.tail = endPoint;
        } else {
          properties.head = endPoint;
        }
      }
      return this.setProperties(properties);
    };

    SelectionWrapper.prototype.fixPropertiesForLinewise = function() {
      var end, head, ref2, ref3, ref4, ref5, start, tail;
      assertWithException(this.hasProperties(), "trying to fixPropertiesForLinewise on properties-less selection");
      ref2 = this.getProperties(), head = ref2.head, tail = ref2.tail;
      if (this.selection.isReversed()) {
        ref3 = [head, tail], start = ref3[0], end = ref3[1];
      } else {
        ref4 = [tail, head], start = ref4[0], end = ref4[1];
      }
      return ref5 = this.selection.getBufferRowRange(), start.row = ref5[0], end.row = ref5[1], ref5;
    };

    SelectionWrapper.prototype.applyWise = function(newWise) {
      switch (newWise) {
        case 'characterwise':
          this.translateSelectionEndAndClip('forward');
          this.saveProperties();
          return this.setWiseProperty(newWise);
        case 'linewise':
          this.complementGoalColumn();
          this.expandOverLine();
          if (!this.hasProperties()) {
            this.saveProperties();
          }
          this.setWiseProperty(newWise);
          return this.fixPropertiesForLinewise();
      }
    };

    SelectionWrapper.prototype.complementGoalColumn = function() {
      var column;
      if (this.selection.cursor.goalColumn == null) {
        column = this.getBufferPositionFor('head', {
          from: ['property', 'selection']
        }).column;
        return this.selection.cursor.goalColumn = column;
      }
    };

    SelectionWrapper.prototype.clipPropertiesTillEndOfLine = function() {
      var editor, headMaxColumn, headRowEOL, properties, tailMaxColumn, tailRowEOL;
      if (!this.hasProperties()) {
        return;
      }
      editor = this.selection.editor;
      headRowEOL = getEndOfLineForBufferRow(editor, this.getHeadRow());
      tailRowEOL = getEndOfLineForBufferRow(editor, this.getTailRow());
      headMaxColumn = limitNumber(headRowEOL.column - 1, {
        min: 0
      });
      tailMaxColumn = limitNumber(tailRowEOL.column - 1, {
        min: 0
      });
      properties = this.getProperties();
      if (properties.head.column > headMaxColumn) {
        properties.head.column = headMaxColumn;
      }
      if (properties.tail.column > tailMaxColumn) {
        return properties.tail.column = tailMaxColumn;
      }
    };

    SelectionWrapper.prototype.captureProperties = function() {
      var head, tail;
      head = this.selection.getHeadBufferPosition();
      tail = this.selection.getTailBufferPosition();
      return {
        head: head,
        tail: tail
      };
    };

    SelectionWrapper.prototype.selectByProperties = function(arg, options) {
      var head, tail;
      head = arg.head, tail = arg.tail;
      this.setBufferRange([tail, head], options);
      return this.setReversedState(head.isLessThan(tail));
    };

    SelectionWrapper.prototype.applyColumnFromProperties = function() {
      var end, head, ref2, ref3, ref4, selectionProperties, start, tail;
      selectionProperties = this.getProperties();
      if (selectionProperties == null) {
        return;
      }
      head = selectionProperties.head, tail = selectionProperties.tail;
      if (this.selection.isReversed()) {
        ref2 = [head, tail], start = ref2[0], end = ref2[1];
      } else {
        ref3 = [tail, head], start = ref3[0], end = ref3[1];
      }
      ref4 = this.selection.getBufferRowRange(), start.row = ref4[0], end.row = ref4[1];
      this.setBufferRange([start, end]);
      return this.translateSelectionEndAndClip('backward', {
        translate: false
      });
    };

    SelectionWrapper.prototype.setBufferRange = function(range, options) {
      var goalColumn, ref2;
      if (options == null) {
        options = {};
      }
      if ((ref2 = options.keepGoalColumn) != null ? ref2 : true) {
        goalColumn = this.selection.cursor.goalColumn;
      }
      delete options.keepGoalColumn;
      if (options.autoscroll == null) {
        options.autoscroll = false;
      }
      if (options.preserveFolds == null) {
        options.preserveFolds = true;
      }
      this.selection.setBufferRange(range, options);
      if (goalColumn != null) {
        return this.selection.cursor.goalColumn = goalColumn;
      }
    };

    SelectionWrapper.prototype.isSingleRow = function() {
      var endRow, ref2, startRow;
      ref2 = this.selection.getBufferRowRange(), startRow = ref2[0], endRow = ref2[1];
      return startRow === endRow;
    };

    SelectionWrapper.prototype.detectWise = function() {
      if (isLinewiseRange(this.getBufferRange())) {
        return 'linewise';
      } else {
        return 'characterwise';
      }
    };

    SelectionWrapper.prototype.translateSelectionEndAndClip = function(direction, options) {
      var editor, newRange, range;
      editor = this.selection.editor;
      range = this.getBufferRange();
      newRange = getRangeByTranslatePointAndClip(editor, range, "end", direction, options);
      return this.setBufferRange(newRange);
    };

    SelectionWrapper.prototype.translateSelectionHeadAndClip = function(direction, options) {
      var editor, newRange, range, which;
      editor = this.selection.editor;
      which = this.selection.isReversed() ? 'start' : 'end';
      range = this.getBufferRange();
      newRange = getRangeByTranslatePointAndClip(editor, range, which, direction, options);
      return this.setBufferRange(newRange);
    };

    SelectionWrapper.prototype.getBlockwiseSelectionExtent = function() {
      var head, tail;
      head = this.selection.getHeadBufferPosition();
      tail = this.selection.getTailBufferPosition();
      return new Point(head.row - tail.row, head.column - tail.column);
    };

    SelectionWrapper.prototype.normalize = function() {
      if (!this.selection.isEmpty()) {
        if (this.hasProperties() && this.getProperties().wise === 'linewise') {
          this.applyColumnFromProperties();
        } else {
          this.translateSelectionEndAndClip('backward');
        }
      }
      return this.clearProperties();
    };

    return SelectionWrapper;

  })();

  swrap = function(selection) {
    return new SelectionWrapper(selection);
  };

  swrap.setReversedState = function(editor, reversed) {
    var i, len, ref2, results, selection;
    ref2 = editor.getSelections();
    results = [];
    for (i = 0, len = ref2.length; i < len; i++) {
      selection = ref2[i];
      results.push(swrap(selection).setReversedState(reversed));
    }
    return results;
  };

  swrap.detectWise = function(editor) {
    var selectionWiseIsLinewise;
    selectionWiseIsLinewise = function(selection) {
      return swrap(selection).detectWise() === 'linewise';
    };
    if (editor.getSelections().every(selectionWiseIsLinewise)) {
      return 'linewise';
    } else {
      return 'characterwise';
    }
  };

  swrap.saveProperties = function(editor) {
    var i, len, ref2, results, selection;
    ref2 = editor.getSelections();
    results = [];
    for (i = 0, len = ref2.length; i < len; i++) {
      selection = ref2[i];
      results.push(swrap(selection).saveProperties());
    }
    return results;
  };

  swrap.clearProperties = function(editor) {
    var i, len, ref2, results, selection;
    ref2 = editor.getSelections();
    results = [];
    for (i = 0, len = ref2.length; i < len; i++) {
      selection = ref2[i];
      results.push(swrap(selection).clearProperties());
    }
    return results;
  };

  swrap.normalize = function(editor) {
    var i, len, ref2, results, selection;
    ref2 = editor.getSelections();
    results = [];
    for (i = 0, len = ref2.length; i < len; i++) {
      selection = ref2[i];
      results.push(swrap(selection).normalize());
    }
    return results;
  };

  swrap.applyWise = function(editor, value) {
    var i, len, ref2, results, selection;
    ref2 = editor.getSelections();
    results = [];
    for (i = 0, len = ref2.length; i < len; i++) {
      selection = ref2[i];
      results.push(swrap(selection).applyWise(value));
    }
    return results;
  };

  swrap.fixPropertiesForLinewise = function(editor) {
    var i, len, ref2, results, selection;
    ref2 = editor.getSelections();
    results = [];
    for (i = 0, len = ref2.length; i < len; i++) {
      selection = ref2[i];
      results.push(swrap(selection).fixPropertiesForLinewise());
    }
    return results;
  };

  swrap.switchToLinewise = function(editor) {
    swrap.saveProperties(editor);
    swrap.applyWise(editor, 'linewise');
    return new Disposable(function() {
      swrap.normalize(editor);
      return swrap.applyWise(editor, 'characterwise');
    });
  };

  module.exports = swrap;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9zZWxlY3Rpb24td3JhcHBlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDJPQUFBO0lBQUE7O0VBQUEsTUFBNkIsT0FBQSxDQUFRLE1BQVIsQ0FBN0IsRUFBQyxpQkFBRCxFQUFRLGlCQUFSLEVBQWU7O0VBQ2YsT0FRSSxPQUFBLENBQVEsU0FBUixDQVJKLEVBQ0Usa0RBREYsRUFFRSxzRUFGRixFQUdFLHdEQUhGLEVBSUUsMERBSkYsRUFLRSw4QkFMRixFQU1FLHNDQU5GLEVBT0U7O0VBR0YsYUFBQSxHQUFnQixJQUFJOztFQUVkO0lBQ1MsMEJBQUMsVUFBRDtNQUFDLElBQUMsQ0FBQSxZQUFEO0lBQUQ7OytCQUViLGFBQUEsR0FBZSxTQUFBO2FBQUcsYUFBYSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLFNBQW5CO0lBQUg7OytCQUNmLGFBQUEsR0FBZSxTQUFBO2FBQUcsYUFBYSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLFNBQW5CO0lBQUg7OytCQUNmLGFBQUEsR0FBZSxTQUFDLElBQUQ7YUFBVSxhQUFhLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsU0FBbkIsRUFBOEIsSUFBOUI7SUFBVjs7K0JBQ2YsZUFBQSxHQUFpQixTQUFBO2FBQUcsYUFBYSxFQUFDLE1BQUQsRUFBYixDQUFxQixJQUFDLENBQUEsU0FBdEI7SUFBSDs7K0JBQ2pCLGVBQUEsR0FBaUIsU0FBQyxLQUFEO2FBQVcsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQUFnQixDQUFDLElBQWpCLEdBQXdCO0lBQW5DOzsrQkFFakIsb0JBQUEsR0FBc0IsU0FBQyxLQUFELEVBQVEsT0FBUjtNQUNwQixJQUFHLEtBQUg7ZUFDRSxJQUFDLENBQUEsY0FBRCxDQUFnQixLQUFoQixFQUF1QixPQUF2QixFQURGOztJQURv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QSxzQ0FBQTs7bUJBQ0UsS0FBQSxDQUFNLFNBQU4sQ0FBZ0IsQ0FBQyxTQUFqQixDQUFBO0FBREY7O0VBRGdCOztFQUlsQixLQUFLLENBQUMsU0FBTixHQUFrQixTQUFDLE1BQUQsRUFBUyxLQUFUO0FBQ2hCLFFBQUE7QUFBQTtBQUFBO1NBQUEsc0NBQUE7O21CQUNFLEtBQUEsQ0FBTSxTQUFOLENBQWdCLENBQUMsU0FBakIsQ0FBMkIsS0FBM0I7QUFERjs7RUFEZ0I7O0VBSWxCLEtBQUssQ0FBQyx3QkFBTixHQUFpQyxTQUFDLE1BQUQ7QUFDL0IsUUFBQTtBQUFBO0FBQUE7U0FBQSxzQ0FBQTs7bUJBQ0UsS0FBQSxDQUFNLFNBQU4sQ0FBZ0IsQ0FBQyx3QkFBakIsQ0FBQTtBQURGOztFQUQrQjs7RUFNakMsS0FBSyxDQUFDLGdCQUFOLEdBQXlCLFNBQUMsTUFBRDtJQUN2QixLQUFLLENBQUMsY0FBTixDQUFxQixNQUFyQjtJQUNBLEtBQUssQ0FBQyxTQUFOLENBQWdCLE1BQWhCLEVBQXdCLFVBQXhCO1dBQ0ksSUFBQSxVQUFBLENBQVcsU0FBQTtNQUNiLEtBQUssQ0FBQyxTQUFOLENBQWdCLE1BQWhCO2FBQ0EsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsTUFBaEIsRUFBd0IsZUFBeEI7SUFGYSxDQUFYO0VBSG1COztFQU96QixNQUFNLENBQUMsT0FBUCxHQUFpQjtBQXRTakIiLCJzb3VyY2VzQ29udGVudCI6WyJ7UmFuZ2UsIFBvaW50LCBEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG57XG4gIHRyYW5zbGF0ZVBvaW50QW5kQ2xpcFxuICBnZXRSYW5nZUJ5VHJhbnNsYXRlUG9pbnRBbmRDbGlwXG4gIGdldEVuZE9mTGluZUZvckJ1ZmZlclJvd1xuICBnZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlXG4gIGxpbWl0TnVtYmVyXG4gIGlzTGluZXdpc2VSYW5nZVxuICBhc3NlcnRXaXRoRXhjZXB0aW9uXG59ID0gcmVxdWlyZSAnLi91dGlscydcblxucHJvcGVydHlTdG9yZSA9IG5ldyBNYXBcblxuY2xhc3MgU2VsZWN0aW9uV3JhcHBlclxuICBjb25zdHJ1Y3RvcjogKEBzZWxlY3Rpb24pIC0+XG5cbiAgaGFzUHJvcGVydGllczogLT4gcHJvcGVydHlTdG9yZS5oYXMoQHNlbGVjdGlvbilcbiAgZ2V0UHJvcGVydGllczogLT4gcHJvcGVydHlTdG9yZS5nZXQoQHNlbGVjdGlvbilcbiAgc2V0UHJvcGVydGllczogKHByb3ApIC0+IHByb3BlcnR5U3RvcmUuc2V0KEBzZWxlY3Rpb24sIHByb3ApXG4gIGNsZWFyUHJvcGVydGllczogLT4gcHJvcGVydHlTdG9yZS5kZWxldGUoQHNlbGVjdGlvbilcbiAgc2V0V2lzZVByb3BlcnR5OiAodmFsdWUpIC0+IEBnZXRQcm9wZXJ0aWVzKCkud2lzZSA9IHZhbHVlXG5cbiAgc2V0QnVmZmVyUmFuZ2VTYWZlbHk6IChyYW5nZSwgb3B0aW9ucykgLT5cbiAgICBpZiByYW5nZVxuICAgICAgQHNldEJ1ZmZlclJhbmdlKHJhbmdlLCBvcHRpb25zKVxuXG4gIGdldEJ1ZmZlclJhbmdlOiAtPlxuICAgIEBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuXG4gIGdldEJ1ZmZlclBvc2l0aW9uRm9yOiAod2hpY2gsIHtmcm9tfT17fSkgLT5cbiAgICBmcm9tID89IFsnc2VsZWN0aW9uJ11cblxuICAgIGdldFBvc2l0aW9uID0gKHdoaWNoKSAtPlxuICAgICAgc3dpdGNoIHdoaWNoXG4gICAgICAgIHdoZW4gJ3N0YXJ0JyB0aGVuIHN0YXJ0XG4gICAgICAgIHdoZW4gJ2VuZCcgdGhlbiBlbmRcbiAgICAgICAgd2hlbiAnaGVhZCcgdGhlbiBoZWFkXG4gICAgICAgIHdoZW4gJ3RhaWwnIHRoZW4gdGFpbFxuXG4gICAgaWYgKCdwcm9wZXJ0eScgaW4gZnJvbSkgYW5kIEBoYXNQcm9wZXJ0aWVzKClcbiAgICAgIHtoZWFkLCB0YWlsfSA9IEBnZXRQcm9wZXJ0aWVzKClcbiAgICAgIGlmIGhlYWQuaXNHcmVhdGVyVGhhbk9yRXF1YWwodGFpbClcbiAgICAgICAgW3N0YXJ0LCBlbmRdID0gW3RhaWwsIGhlYWRdXG4gICAgICBlbHNlXG4gICAgICAgIFtzdGFydCwgZW5kXSA9IFtoZWFkLCB0YWlsXVxuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uKHdoaWNoKVxuXG4gICAgaWYgJ3NlbGVjdGlvbicgaW4gZnJvbVxuICAgICAge3N0YXJ0LCBlbmR9ID0gQHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICBoZWFkID0gQHNlbGVjdGlvbi5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKVxuICAgICAgdGFpbCA9IEBzZWxlY3Rpb24uZ2V0VGFpbEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbih3aGljaClcblxuICBzZXRCdWZmZXJQb3NpdGlvblRvOiAod2hpY2gsIG9wdGlvbnMpIC0+XG4gICAgcG9pbnQgPSBAZ2V0QnVmZmVyUG9zaXRpb25Gb3Iod2hpY2gsIG9wdGlvbnMpXG4gICAgQHNlbGVjdGlvbi5jdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiAgc2V0UmV2ZXJzZWRTdGF0ZTogKGlzUmV2ZXJzZWQpIC0+XG4gICAgcmV0dXJuIGlmIEBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpIGlzIGlzUmV2ZXJzZWRcblxuICAgIGlmIEBoYXNQcm9wZXJ0aWVzKClcbiAgICAgIHtoZWFkLCB0YWlsLCB3aXNlfSA9IEBnZXRQcm9wZXJ0aWVzKClcbiAgICAgIEBzZXRQcm9wZXJ0aWVzKGhlYWQ6IHRhaWwsIHRhaWw6IGhlYWQsIHdpc2U6IHdpc2UpXG5cbiAgICBAc2V0QnVmZmVyUmFuZ2UgQGdldEJ1ZmZlclJhbmdlKCksXG4gICAgICBhdXRvc2Nyb2xsOiB0cnVlXG4gICAgICByZXZlcnNlZDogaXNSZXZlcnNlZFxuICAgICAga2VlcEdvYWxDb2x1bW46IGZhbHNlXG5cbiAgZ2V0Um93czogLT5cbiAgICBbc3RhcnRSb3csIGVuZFJvd10gPSBAc2VsZWN0aW9uLmdldEJ1ZmZlclJvd1JhbmdlKClcbiAgICBbc3RhcnRSb3cuLmVuZFJvd11cblxuICBnZXRSb3dDb3VudDogLT5cbiAgICBAZ2V0Um93cygpLmxlbmd0aFxuXG4gICMgTmF0aXZlIHNlbGVjdGlvbi5leHBhbmRPdmVyTGluZSBpcyBub3QgYXdhcmUgb2YgYWN0dWFsIHJvd1JhbmdlIG9mIHNlbGVjdGlvbi5cbiAgZXhwYW5kT3ZlckxpbmU6IC0+XG4gICAgcm93UmFuZ2UgPSBAc2VsZWN0aW9uLmdldEJ1ZmZlclJvd1JhbmdlKClcbiAgICByYW5nZSA9IGdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2UoQHNlbGVjdGlvbi5lZGl0b3IsIHJvd1JhbmdlKVxuICAgIEBzZXRCdWZmZXJSYW5nZShyYW5nZSlcblxuICBnZXRSb3dGb3I6ICh3aGVyZSkgLT5cbiAgICBbc3RhcnRSb3csIGVuZFJvd10gPSBAc2VsZWN0aW9uLmdldEJ1ZmZlclJvd1JhbmdlKClcbiAgICBpZiBAc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKVxuICAgICAgW2hlYWRSb3csIHRhaWxSb3ddID0gW3N0YXJ0Um93LCBlbmRSb3ddXG4gICAgZWxzZVxuICAgICAgW2hlYWRSb3csIHRhaWxSb3ddID0gW2VuZFJvdywgc3RhcnRSb3ddXG5cbiAgICBzd2l0Y2ggd2hlcmVcbiAgICAgIHdoZW4gJ3N0YXJ0JyB0aGVuIHN0YXJ0Um93XG4gICAgICB3aGVuICdlbmQnIHRoZW4gZW5kUm93XG4gICAgICB3aGVuICdoZWFkJyB0aGVuIGhlYWRSb3dcbiAgICAgIHdoZW4gJ3RhaWwnIHRoZW4gdGFpbFJvd1xuXG4gIGdldEhlYWRSb3c6IC0+IEBnZXRSb3dGb3IoJ2hlYWQnKVxuICBnZXRUYWlsUm93OiAtPiBAZ2V0Um93Rm9yKCd0YWlsJylcbiAgZ2V0U3RhcnRSb3c6IC0+IEBnZXRSb3dGb3IoJ3N0YXJ0JylcbiAgZ2V0RW5kUm93OiAtPiBAZ2V0Um93Rm9yKCdlbmQnKVxuXG4gIGdldFRhaWxCdWZmZXJSYW5nZTogLT5cbiAgICB7ZWRpdG9yfSA9IEBzZWxlY3Rpb25cbiAgICB0YWlsUG9pbnQgPSBAc2VsZWN0aW9uLmdldFRhaWxCdWZmZXJQb3NpdGlvbigpXG4gICAgaWYgQHNlbGVjdGlvbi5pc1JldmVyc2VkKClcbiAgICAgIHBvaW50ID0gdHJhbnNsYXRlUG9pbnRBbmRDbGlwKGVkaXRvciwgdGFpbFBvaW50LCAnYmFja3dhcmQnKVxuICAgICAgbmV3IFJhbmdlKHBvaW50LCB0YWlsUG9pbnQpXG4gICAgZWxzZVxuICAgICAgcG9pbnQgPSB0cmFuc2xhdGVQb2ludEFuZENsaXAoZWRpdG9yLCB0YWlsUG9pbnQsICdmb3J3YXJkJylcbiAgICAgIG5ldyBSYW5nZSh0YWlsUG9pbnQsIHBvaW50KVxuXG4gIHNhdmVQcm9wZXJ0aWVzOiAtPlxuICAgIHByb3BlcnRpZXMgPSBAY2FwdHVyZVByb3BlcnRpZXMoKVxuICAgIHVubGVzcyBAc2VsZWN0aW9uLmlzRW1wdHkoKVxuICAgICAgIyBXZSBzZWxlY3RSaWdodC1lZCBpbiB2aXN1YWwtbW9kZSwgdGhpcyB0cmFuc2xhdGlvbiBkZS1lZmZlY3Qgc2VsZWN0LXJpZ2h0LWVmZmVjdFxuICAgICAgIyBTbyB0aGF0IHdlIGNhbiBhY3RpdmF0ZS12aXN1YWwtbW9kZSB3aXRob3V0IHNwZWNpYWwgdHJhbnNsYXRpb24gYWZ0ZXIgcmVzdG9yZWluZyBwcm9wZXJ0aWVzLlxuICAgICAgZW5kUG9pbnQgPSBAZ2V0QnVmZmVyUmFuZ2UoKS5lbmQudHJhbnNsYXRlKFswLCAtMV0pXG4gICAgICBlbmRQb2ludCA9IEBzZWxlY3Rpb24uZWRpdG9yLmNsaXBCdWZmZXJQb3NpdGlvbihlbmRQb2ludClcbiAgICAgIGlmIEBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpXG4gICAgICAgIHByb3BlcnRpZXMudGFpbCA9IGVuZFBvaW50XG4gICAgICBlbHNlXG4gICAgICAgIHByb3BlcnRpZXMuaGVhZCA9IGVuZFBvaW50XG4gICAgQHNldFByb3BlcnRpZXMocHJvcGVydGllcylcblxuICBmaXhQcm9wZXJ0aWVzRm9yTGluZXdpc2U6IC0+XG4gICAgYXNzZXJ0V2l0aEV4Y2VwdGlvbihAaGFzUHJvcGVydGllcygpLCBcInRyeWluZyB0byBmaXhQcm9wZXJ0aWVzRm9yTGluZXdpc2Ugb24gcHJvcGVydGllcy1sZXNzIHNlbGVjdGlvblwiKVxuXG4gICAge2hlYWQsIHRhaWx9ID0gQGdldFByb3BlcnRpZXMoKVxuICAgIGlmIEBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpXG4gICAgICBbc3RhcnQsIGVuZF0gPSBbaGVhZCwgdGFpbF1cbiAgICBlbHNlXG4gICAgICBbc3RhcnQsIGVuZF0gPSBbdGFpbCwgaGVhZF1cbiAgICBbc3RhcnQucm93LCBlbmQucm93XSA9IEBzZWxlY3Rpb24uZ2V0QnVmZmVyUm93UmFuZ2UoKVxuXG4gIGFwcGx5V2lzZTogKG5ld1dpc2UpIC0+XG4gICAgIyBOT1RFOlxuICAgICMgTXVzdCBjYWxsIGFnYWluc3Qgbm9ybWFsaXplZCBzZWxlY3Rpb25cbiAgICAjIERvbid0IGNhbGwgbm9uLW5vcm1hbGl6ZWQgc2VsZWN0aW9uXG4gICAgc3dpdGNoIG5ld1dpc2VcbiAgICAgIHdoZW4gJ2NoYXJhY3Rlcndpc2UnXG4gICAgICAgIEB0cmFuc2xhdGVTZWxlY3Rpb25FbmRBbmRDbGlwKCdmb3J3YXJkJylcbiAgICAgICAgQHNhdmVQcm9wZXJ0aWVzKClcbiAgICAgICAgQHNldFdpc2VQcm9wZXJ0eShuZXdXaXNlKVxuICAgICAgd2hlbiAnbGluZXdpc2UnXG4gICAgICAgIEBjb21wbGVtZW50R29hbENvbHVtbigpXG4gICAgICAgIEBleHBhbmRPdmVyTGluZSgpXG4gICAgICAgIEBzYXZlUHJvcGVydGllcygpIHVubGVzcyBAaGFzUHJvcGVydGllcygpXG4gICAgICAgIEBzZXRXaXNlUHJvcGVydHkobmV3V2lzZSlcbiAgICAgICAgQGZpeFByb3BlcnRpZXNGb3JMaW5ld2lzZSgpXG5cbiAgY29tcGxlbWVudEdvYWxDb2x1bW46IC0+XG4gICAgdW5sZXNzIEBzZWxlY3Rpb24uY3Vyc29yLmdvYWxDb2x1bW4/XG4gICAgICBjb2x1bW4gPSBAZ2V0QnVmZmVyUG9zaXRpb25Gb3IoJ2hlYWQnLCBmcm9tOiBbJ3Byb3BlcnR5JywgJ3NlbGVjdGlvbiddKS5jb2x1bW5cbiAgICAgIEBzZWxlY3Rpb24uY3Vyc29yLmdvYWxDb2x1bW4gPSBjb2x1bW5cblxuICAjIFtGSVhNRV1cbiAgIyBXaGVuIGBrZWVwQ29sdW1uT25TZWxlY3RUZXh0T2JqZWN0YCB3YXMgdHJ1ZSxcbiAgIyAgY3Vyc29yIG1hcmtlciBpbiB2TC1tb2RlIGV4Y2VlZCBFT0wgaWYgaW5pdGlhbCByb3cgaXMgbG9uZ2VyIHRoYW4gZW5kUm93IG9mXG4gICMgIHNlbGVjdGVkIHRleHQtb2JqZWN0LlxuICAjIFRvIGF2b2lkIHRoaXMgd2lyZWQgY3Vyc29yIHBvc2l0aW9uIHJlcHJlc2VudGF0aW9uLCB0aGlzIGZ1Y250aW9uIGNsaXBcbiAgIyAgc2VsZWN0aW9uIHByb3BlcnRpZXMgbm90IGV4Y2VlZHMgRU9MLlxuICAjIEJ1dCB0aGlzIHNob3VsZCBiZSB0ZW1wb3JhbCB3b3JrYXJvdW5kLCBkZXBlbmRpbmcgdGhpcyBraW5kIG9mIGFkLWhvYyBhZGp1c3RtZW50IGlzXG4gICMgYmFzaWNhbGx5IGJhZCBpbiB0aGUgbG9uZyBydW4uXG4gIGNsaXBQcm9wZXJ0aWVzVGlsbEVuZE9mTGluZTogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBoYXNQcm9wZXJ0aWVzKClcblxuICAgIGVkaXRvciA9IEBzZWxlY3Rpb24uZWRpdG9yXG4gICAgaGVhZFJvd0VPTCA9IGdldEVuZE9mTGluZUZvckJ1ZmZlclJvdyhlZGl0b3IsIEBnZXRIZWFkUm93KCkpXG4gICAgdGFpbFJvd0VPTCA9IGdldEVuZE9mTGluZUZvckJ1ZmZlclJvdyhlZGl0b3IsIEBnZXRUYWlsUm93KCkpXG4gICAgaGVhZE1heENvbHVtbiA9IGxpbWl0TnVtYmVyKGhlYWRSb3dFT0wuY29sdW1uIC0gMSwgbWluOiAwKVxuICAgIHRhaWxNYXhDb2x1bW4gPSBsaW1pdE51bWJlcih0YWlsUm93RU9MLmNvbHVtbiAtIDEsIG1pbjogMClcblxuICAgIHByb3BlcnRpZXMgPSBAZ2V0UHJvcGVydGllcygpXG4gICAgaWYgcHJvcGVydGllcy5oZWFkLmNvbHVtbiA+IGhlYWRNYXhDb2x1bW5cbiAgICAgIHByb3BlcnRpZXMuaGVhZC5jb2x1bW4gPSBoZWFkTWF4Q29sdW1uXG5cbiAgICBpZiBwcm9wZXJ0aWVzLnRhaWwuY29sdW1uID4gdGFpbE1heENvbHVtblxuICAgICAgcHJvcGVydGllcy50YWlsLmNvbHVtbiA9IHRhaWxNYXhDb2x1bW5cblxuICBjYXB0dXJlUHJvcGVydGllczogLT5cbiAgICBoZWFkID0gQHNlbGVjdGlvbi5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKVxuICAgIHRhaWwgPSBAc2VsZWN0aW9uLmdldFRhaWxCdWZmZXJQb3NpdGlvbigpXG4gICAge2hlYWQsIHRhaWx9XG5cbiAgc2VsZWN0QnlQcm9wZXJ0aWVzOiAoe2hlYWQsIHRhaWx9LCBvcHRpb25zKSAtPlxuICAgICMgTm8gcHJvYmxlbSBpZiBoZWFkIGlzIGdyZWF0ZXIgdGhhbiB0YWlsLCBSYW5nZSBjb25zdHJ1Y3RvciBzd2FwIHN0YXJ0L2VuZC5cbiAgICBAc2V0QnVmZmVyUmFuZ2UoW3RhaWwsIGhlYWRdLCBvcHRpb25zKVxuICAgIEBzZXRSZXZlcnNlZFN0YXRlKGhlYWQuaXNMZXNzVGhhbih0YWlsKSlcblxuICBhcHBseUNvbHVtbkZyb21Qcm9wZXJ0aWVzOiAtPlxuICAgIHNlbGVjdGlvblByb3BlcnRpZXMgPSBAZ2V0UHJvcGVydGllcygpXG4gICAgcmV0dXJuIHVubGVzcyBzZWxlY3Rpb25Qcm9wZXJ0aWVzP1xuICAgIHtoZWFkLCB0YWlsfSA9IHNlbGVjdGlvblByb3BlcnRpZXNcblxuICAgIGlmIEBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpXG4gICAgICBbc3RhcnQsIGVuZF0gPSBbaGVhZCwgdGFpbF1cbiAgICBlbHNlXG4gICAgICBbc3RhcnQsIGVuZF0gPSBbdGFpbCwgaGVhZF1cbiAgICBbc3RhcnQucm93LCBlbmQucm93XSA9IEBzZWxlY3Rpb24uZ2V0QnVmZmVyUm93UmFuZ2UoKVxuICAgIEBzZXRCdWZmZXJSYW5nZShbc3RhcnQsIGVuZF0pXG4gICAgQHRyYW5zbGF0ZVNlbGVjdGlvbkVuZEFuZENsaXAoJ2JhY2t3YXJkJywgdHJhbnNsYXRlOiBmYWxzZSlcblxuICAjIHNldCBzZWxlY3Rpb25zIGJ1ZmZlclJhbmdlIHdpdGggZGVmYXVsdCBvcHRpb24ge2F1dG9zY3JvbGw6IGZhbHNlLCBwcmVzZXJ2ZUZvbGRzOiB0cnVlfVxuICBzZXRCdWZmZXJSYW5nZTogKHJhbmdlLCBvcHRpb25zPXt9KSAtPlxuICAgIGlmIG9wdGlvbnMua2VlcEdvYWxDb2x1bW4gPyB0cnVlXG4gICAgICBnb2FsQ29sdW1uID0gQHNlbGVjdGlvbi5jdXJzb3IuZ29hbENvbHVtblxuICAgIGRlbGV0ZSBvcHRpb25zLmtlZXBHb2FsQ29sdW1uXG4gICAgb3B0aW9ucy5hdXRvc2Nyb2xsID89IGZhbHNlXG4gICAgb3B0aW9ucy5wcmVzZXJ2ZUZvbGRzID89IHRydWVcbiAgICBAc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKHJhbmdlLCBvcHRpb25zKVxuICAgIEBzZWxlY3Rpb24uY3Vyc29yLmdvYWxDb2x1bW4gPSBnb2FsQ29sdW1uIGlmIGdvYWxDb2x1bW4/XG5cbiAgaXNTaW5nbGVSb3c6IC0+XG4gICAgW3N0YXJ0Um93LCBlbmRSb3ddID0gQHNlbGVjdGlvbi5nZXRCdWZmZXJSb3dSYW5nZSgpXG4gICAgc3RhcnRSb3cgaXMgZW5kUm93XG5cbiAgZGV0ZWN0V2lzZTogLT5cbiAgICBpZiBpc0xpbmV3aXNlUmFuZ2UoQGdldEJ1ZmZlclJhbmdlKCkpXG4gICAgICAnbGluZXdpc2UnXG4gICAgZWxzZVxuICAgICAgJ2NoYXJhY3Rlcndpc2UnXG5cbiAgIyBkaXJlY3Rpb24gbXVzdCBiZSBvbmUgb2YgWydmb3J3YXJkJywgJ2JhY2t3YXJkJ11cbiAgIyBvcHRpb25zOiB7dHJhbnNsYXRlOiB0cnVlIG9yIGZhbHNlfSBkZWZhdWx0IHRydWVcbiAgdHJhbnNsYXRlU2VsZWN0aW9uRW5kQW5kQ2xpcDogKGRpcmVjdGlvbiwgb3B0aW9ucykgLT5cbiAgICBlZGl0b3IgPSBAc2VsZWN0aW9uLmVkaXRvclxuICAgIHJhbmdlID0gQGdldEJ1ZmZlclJhbmdlKClcbiAgICBuZXdSYW5nZSA9IGdldFJhbmdlQnlUcmFuc2xhdGVQb2ludEFuZENsaXAoZWRpdG9yLCByYW5nZSwgXCJlbmRcIiwgZGlyZWN0aW9uLCBvcHRpb25zKVxuICAgIEBzZXRCdWZmZXJSYW5nZShuZXdSYW5nZSlcblxuICB0cmFuc2xhdGVTZWxlY3Rpb25IZWFkQW5kQ2xpcDogKGRpcmVjdGlvbiwgb3B0aW9ucykgLT5cbiAgICBlZGl0b3IgPSBAc2VsZWN0aW9uLmVkaXRvclxuICAgIHdoaWNoID0gaWYgQHNlbGVjdGlvbi5pc1JldmVyc2VkKCkgdGhlbiAnc3RhcnQnIGVsc2UgJ2VuZCdcblxuICAgIHJhbmdlID0gQGdldEJ1ZmZlclJhbmdlKClcbiAgICBuZXdSYW5nZSA9IGdldFJhbmdlQnlUcmFuc2xhdGVQb2ludEFuZENsaXAoZWRpdG9yLCByYW5nZSwgd2hpY2gsIGRpcmVjdGlvbiwgb3B0aW9ucylcbiAgICBAc2V0QnVmZmVyUmFuZ2UobmV3UmFuZ2UpXG5cbiAgIyBSZXR1cm4gc2VsZWN0aW9uIGV4dGVudCB0byByZXBsYXkgYmxvY2t3aXNlIHNlbGVjdGlvbiBvbiBgLmAgcmVwZWF0aW5nLlxuICBnZXRCbG9ja3dpc2VTZWxlY3Rpb25FeHRlbnQ6IC0+XG4gICAgaGVhZCA9IEBzZWxlY3Rpb24uZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKClcbiAgICB0YWlsID0gQHNlbGVjdGlvbi5nZXRUYWlsQnVmZmVyUG9zaXRpb24oKVxuICAgIG5ldyBQb2ludChoZWFkLnJvdyAtIHRhaWwucm93LCBoZWFkLmNvbHVtbiAtIHRhaWwuY29sdW1uKVxuXG4gIG5vcm1hbGl6ZTogLT5cbiAgICB1bmxlc3MgQHNlbGVjdGlvbi5pc0VtcHR5KClcbiAgICAgIGlmIEBoYXNQcm9wZXJ0aWVzKCkgYW5kIEBnZXRQcm9wZXJ0aWVzKCkud2lzZSBpcyAnbGluZXdpc2UnXG4gICAgICAgIEBhcHBseUNvbHVtbkZyb21Qcm9wZXJ0aWVzKClcbiAgICAgIGVsc2VcbiAgICAgICAgQHRyYW5zbGF0ZVNlbGVjdGlvbkVuZEFuZENsaXAoJ2JhY2t3YXJkJylcbiAgICBAY2xlYXJQcm9wZXJ0aWVzKClcblxuc3dyYXAgPSAoc2VsZWN0aW9uKSAtPlxuICBuZXcgU2VsZWN0aW9uV3JhcHBlcihzZWxlY3Rpb24pXG5cbnN3cmFwLnNldFJldmVyc2VkU3RhdGUgPSAoZWRpdG9yLCByZXZlcnNlZCkgLT5cbiAgZm9yIHNlbGVjdGlvbiBpbiBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgc3dyYXAoc2VsZWN0aW9uKS5zZXRSZXZlcnNlZFN0YXRlKHJldmVyc2VkKVxuXG5zd3JhcC5kZXRlY3RXaXNlID0gKGVkaXRvcikgLT5cbiAgc2VsZWN0aW9uV2lzZUlzTGluZXdpc2UgPSAoc2VsZWN0aW9uKSAtPiBzd3JhcChzZWxlY3Rpb24pLmRldGVjdFdpc2UoKSBpcyAnbGluZXdpc2UnXG4gIGlmIGVkaXRvci5nZXRTZWxlY3Rpb25zKCkuZXZlcnkoc2VsZWN0aW9uV2lzZUlzTGluZXdpc2UpXG4gICAgJ2xpbmV3aXNlJ1xuICBlbHNlXG4gICAgJ2NoYXJhY3Rlcndpc2UnXG5cbnN3cmFwLnNhdmVQcm9wZXJ0aWVzID0gKGVkaXRvcikgLT5cbiAgZm9yIHNlbGVjdGlvbiBpbiBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgc3dyYXAoc2VsZWN0aW9uKS5zYXZlUHJvcGVydGllcygpXG5cbnN3cmFwLmNsZWFyUHJvcGVydGllcyA9IChlZGl0b3IpIC0+XG4gIGZvciBzZWxlY3Rpb24gaW4gZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgIHN3cmFwKHNlbGVjdGlvbikuY2xlYXJQcm9wZXJ0aWVzKClcblxuc3dyYXAubm9ybWFsaXplID0gKGVkaXRvcikgLT5cbiAgZm9yIHNlbGVjdGlvbiBpbiBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgc3dyYXAoc2VsZWN0aW9uKS5ub3JtYWxpemUoKVxuXG5zd3JhcC5hcHBseVdpc2UgPSAoZWRpdG9yLCB2YWx1ZSkgLT5cbiAgZm9yIHNlbGVjdGlvbiBpbiBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgc3dyYXAoc2VsZWN0aW9uKS5hcHBseVdpc2UodmFsdWUpXG5cbnN3cmFwLmZpeFByb3BlcnRpZXNGb3JMaW5ld2lzZSA9IChlZGl0b3IpIC0+XG4gIGZvciBzZWxlY3Rpb24gaW4gZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgIHN3cmFwKHNlbGVjdGlvbikuZml4UHJvcGVydGllc0ZvckxpbmV3aXNlKClcblxuIyBSZXR1cm4gZnVuY3Rpb24gdG8gcmVzdG9yZVxuIyBVc2VkIGluIHZtcC1tb3ZlLXNlbGVjdGVkLXRleHRcbnN3cmFwLnN3aXRjaFRvTGluZXdpc2UgPSAoZWRpdG9yKSAtPlxuICBzd3JhcC5zYXZlUHJvcGVydGllcyhlZGl0b3IpXG4gIHN3cmFwLmFwcGx5V2lzZShlZGl0b3IsICdsaW5ld2lzZScpXG4gIG5ldyBEaXNwb3NhYmxlIC0+XG4gICAgc3dyYXAubm9ybWFsaXplKGVkaXRvcilcbiAgICBzd3JhcC5hcHBseVdpc2UoZWRpdG9yLCAnY2hhcmFjdGVyd2lzZScpXG5cbm1vZHVsZS5leHBvcnRzID0gc3dyYXBcbiJdfQ==
