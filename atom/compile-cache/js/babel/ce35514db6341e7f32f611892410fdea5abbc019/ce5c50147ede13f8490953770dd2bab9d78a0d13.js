Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _sbReactTable = require('sb-react-table');

var _sbReactTable2 = _interopRequireDefault(_sbReactTable);

var _reactResizableBox = require('react-resizable-box');

var _reactResizableBox2 = _interopRequireDefault(_reactResizableBox);

var _helpers = require('../helpers');

var PanelComponent = (function (_React$Component) {
  _inherits(PanelComponent, _React$Component);

  function PanelComponent() {
    var _this = this;

    _classCallCheck(this, PanelComponent);

    _get(Object.getPrototypeOf(PanelComponent.prototype), 'constructor', this).apply(this, arguments);

    this.state = {
      messages: [],
      visibility: false,
      tempHeight: null
    };

    this.onClick = function (e, row) {
      if (process.platform === 'darwin' ? e.metaKey : e.ctrlKey) {
        if (e.shiftKey) {
          (0, _helpers.openExternally)(row);
        } else {
          (0, _helpers.visitMessage)(row, true);
        }
      } else {
        (0, _helpers.visitMessage)(row);
      }
    };

    this.onResize = function (direction, size) {
      _this.setState({ tempHeight: size.height });
    };

    this.onResizeStop = function (direction, size) {
      _this.props.delegate.updatePanelHeight(size.height);
    };
  }

  _createClass(PanelComponent, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      this.props.delegate.onDidChangeMessages(function (messages) {
        _this2.setState({ messages: messages });
      });
      this.props.delegate.onDidChangeVisibility(function (visibility) {
        _this2.setState({ visibility: visibility });
      });
      this.props.delegate.onDidChangePanelConfig(function () {
        _this2.setState({ tempHeight: null });
      });
      this.setState({ messages: this.props.delegate.filteredMessages, visibility: this.props.delegate.visibility });
    }
  }, {
    key: 'render',
    value: function render() {
      var delegate = this.props.delegate;

      var columns = [{ key: 'severity', label: 'Severity', sortable: true }, { key: 'linterName', label: 'Provider', sortable: true }, { key: 'excerpt', label: 'Description' }, { key: 'line', label: 'Line', sortable: true, onClick: this.onClick }];
      if (delegate.panelRepresents === 'Entire Project') {
        columns.push({ key: 'file', label: 'File', sortable: true, onClick: this.onClick });
      }

      var height = undefined;
      var customStyle = { overflowY: 'scroll' };
      if (this.state.tempHeight) {
        height = this.state.tempHeight;
      } else if (delegate.panelTakesMinimumHeight) {
        height = 'auto';
        customStyle.maxHeight = delegate.panelHeight;
      } else {
        height = delegate.panelHeight;
      }
      delegate.setPanelVisibility(this.state.visibility && (!delegate.panelTakesMinimumHeight || !!this.state.messages.length));

      return _react2['default'].createElement(
        _reactResizableBox2['default'],
        { isResizable: { top: true }, onResize: this.onResize, onResizeStop: this.onResizeStop, height: height, width: 'auto', customStyle: customStyle },
        _react2['default'].createElement(
          'div',
          { id: 'linter-panel', tabIndex: '-1' },
          _react2['default'].createElement(_sbReactTable2['default'], {
            rows: this.state.messages,
            columns: columns,

            initialSort: [{ column: 'severity', type: 'desc' }, { column: 'file', type: 'asc' }, { column: 'line', type: 'asc' }],
            sort: _helpers.sortMessages,
            rowKey: function (i) {
              return i.key;
            },

            renderHeaderColumn: function (i) {
              return i.label;
            },
            renderBodyColumn: PanelComponent.renderRowColumn,

            style: { width: '100%' },
            className: 'linter'
          })
        )
      );
    }
  }], [{
    key: 'renderRowColumn',
    value: function renderRowColumn(row, column) {
      var range = (0, _helpers.$range)(row);

      switch (column) {
        case 'file':
          return (0, _helpers.getPathOfMessage)(row);
        case 'line':
          return range ? range.start.row + 1 + ':' + (range.start.column + 1) : '';
        case 'excerpt':
          if (row.version === 1) {
            if (row.html) {
              return _react2['default'].createElement('span', { dangerouslySetInnerHTML: { __html: row.html } });
            }
            return row.text || '';
          }
          return row.excerpt;
        case 'severity':
          return _helpers.severityNames[row.severity];
        default:
          return row[column];
      }
    }
  }]);

  return PanelComponent;
})(_react2['default'].Component);

exports['default'] = PanelComponent;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FsaXNhbGVlbWgvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvbGliL3BhbmVsL2NvbXBvbmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztxQkFFa0IsT0FBTzs7Ozs0QkFDRixnQkFBZ0I7Ozs7aUNBQ2QscUJBQXFCOzs7O3VCQUNzRCxZQUFZOztJQUkzRixjQUFjO1lBQWQsY0FBYzs7V0FBZCxjQUFjOzs7MEJBQWQsY0FBYzs7K0JBQWQsY0FBYzs7U0FJakMsS0FBSyxHQUlEO0FBQ0YsY0FBUSxFQUFFLEVBQUU7QUFDWixnQkFBVSxFQUFFLEtBQUs7QUFDakIsZ0JBQVUsRUFBRSxJQUFJO0tBQ2pCOztTQWFELE9BQU8sR0FBRyxVQUFDLENBQUMsRUFBYyxHQUFHLEVBQW9CO0FBQy9DLFVBQUksT0FBTyxDQUFDLFFBQVEsS0FBSyxRQUFRLEdBQUcsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFO0FBQ3pELFlBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRTtBQUNkLHVDQUFlLEdBQUcsQ0FBQyxDQUFBO1NBQ3BCLE1BQU07QUFDTCxxQ0FBYSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUE7U0FDeEI7T0FDRixNQUFNO0FBQ0wsbUNBQWEsR0FBRyxDQUFDLENBQUE7T0FDbEI7S0FDRjs7U0FDRCxRQUFRLEdBQUcsVUFBQyxTQUFTLEVBQVMsSUFBSSxFQUF3QztBQUN4RSxZQUFLLFFBQVEsQ0FBQyxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQTtLQUMzQzs7U0FDRCxZQUFZLEdBQUcsVUFBQyxTQUFTLEVBQVMsSUFBSSxFQUF3QztBQUM1RSxZQUFLLEtBQUssQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0tBQ25EOzs7ZUF6Q2tCLGNBQWM7O1dBYWhCLDZCQUFHOzs7QUFDbEIsVUFBSSxDQUFDLEtBQUss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O0FBQ1oscUJBQU8sMkNBQU0sdUJBQXVCLEVBQUUsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxBQUFDLEdBQUcsQ0FBQTthQUMvRDtBQUNELG1CQUFPLEdBQUcsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFBO1dBQ3RCO0FBQ0QsaUJBQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQTtBQUFBLEFBQ3BCLGFBQUssVUFBVTtBQUNiLGlCQUFPLHVCQUFjLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUFBLEFBQ3BDO0FBQ0UsaUJBQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQUEsT0FDckI7S0FDRjs7O1NBNUdrQixjQUFjO0dBQVMsbUJBQU0sU0FBUzs7cUJBQXRDLGNBQWMiLCJmaWxlIjoiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9saW50ZXItdWktZGVmYXVsdC9saWIvcGFuZWwvY29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IFJlYWN0VGFibGUgZnJvbSAnc2ItcmVhY3QtdGFibGUnXG5pbXBvcnQgUmVzaXphYmxlQm94IGZyb20gJ3JlYWN0LXJlc2l6YWJsZS1ib3gnXG5pbXBvcnQgeyAkcmFuZ2UsIHNldmVyaXR5TmFtZXMsIHNvcnRNZXNzYWdlcywgdmlzaXRNZXNzYWdlLCBvcGVuRXh0ZXJuYWxseSwgZ2V0UGF0aE9mTWVzc2FnZSB9IGZyb20gJy4uL2hlbHBlcnMnXG5pbXBvcnQgdHlwZSBEZWxlZ2F0ZSBmcm9tICcuL2RlbGVnYXRlJ1xuaW1wb3J0IHR5cGUgeyBMaW50ZXJNZXNzYWdlIH0gZnJvbSAnLi4vdHlwZXMnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhbmVsQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IHtcbiAgICBkZWxlZ2F0ZTogRGVsZWdhdGUsXG4gIH07XG4gIHN0YXRlOiB7XG4gICAgbWVzc2FnZXM6IEFycmF5PExpbnRlck1lc3NhZ2U+LFxuICAgIHZpc2liaWxpdHk6IGJvb2xlYW4sXG4gICAgdGVtcEhlaWdodDogP251bWJlcixcbiAgfSA9IHtcbiAgICBtZXNzYWdlczogW10sXG4gICAgdmlzaWJpbGl0eTogZmFsc2UsXG4gICAgdGVtcEhlaWdodDogbnVsbCxcbiAgfTtcbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdGhpcy5wcm9wcy5kZWxlZ2F0ZS5vbkRpZENoYW5nZU1lc3NhZ2VzKChtZXNzYWdlcykgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1lc3NhZ2VzIH0pXG4gICAgfSlcbiAgICB0aGlzLnByb3BzLmRlbGVnYXRlLm9uRGlkQ2hhbmdlVmlzaWJpbGl0eSgodmlzaWJpbGl0eSkgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IHZpc2liaWxpdHkgfSlcbiAgICB9KVxuICAgIHRoaXMucHJvcHMuZGVsZWdhdGUub25EaWRDaGFuZ2VQYW5lbENvbmZpZygoKSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgdGVtcEhlaWdodDogbnVsbCB9KVxuICAgIH0pXG4gICAgdGhpcy5zZXRTdGF0ZSh7IG1lc3NhZ2VzOiB0aGlzLnByb3BzLmRlbGVnYXRlLmZpbHRlcmVkTWVzc2FnZXMsIHZpc2liaWxpdHk6IHRoaXMucHJvcHMuZGVsZWdhdGUudmlzaWJpbGl0eSB9KVxuICB9XG4gIG9uQ2xpY2sgPSAoZTogTW91c2VFdmVudCwgcm93OiBMaW50ZXJNZXNzYWdlKSA9PiB7XG4gICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICdkYXJ3aW4nID8gZS5tZXRhS2V5IDogZS5jdHJsS2V5KSB7XG4gICAgICBpZiAoZS5zaGlmdEtleSkge1xuICAgICAgICBvcGVuRXh0ZXJuYWxseShyb3cpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2aXNpdE1lc3NhZ2Uocm93LCB0cnVlKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2aXNpdE1lc3NhZ2Uocm93KVxuICAgIH1cbiAgfVxuICBvblJlc2l6ZSA9IChkaXJlY3Rpb246ICd0b3AnLCBzaXplOiB7IHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyIH0pID0+IHtcbiAgICB0aGlzLnNldFN0YXRlKHsgdGVtcEhlaWdodDogc2l6ZS5oZWlnaHQgfSlcbiAgfVxuICBvblJlc2l6ZVN0b3AgPSAoZGlyZWN0aW9uOiAndG9wJywgc2l6ZTogeyB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciB9KSA9PiB7XG4gICAgdGhpcy5wcm9wcy5kZWxlZ2F0ZS51cGRhdGVQYW5lbEhlaWdodChzaXplLmhlaWdodClcbiAgfVxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgeyBkZWxlZ2F0ZSB9ID0gdGhpcy5wcm9wc1xuICAgIGNvbnN0IGNvbHVtbnMgPSBbXG4gICAgICB7IGtleTogJ3NldmVyaXR5JywgbGFiZWw6ICdTZXZlcml0eScsIHNvcnRhYmxlOiB0cnVlIH0sXG4gICAgICB7IGtleTogJ2xpbnRlck5hbWUnLCBsYWJlbDogJ1Byb3ZpZGVyJywgc29ydGFibGU6IHRydWUgfSxcbiAgICAgIHsga2V5OiAnZXhjZXJwdCcsIGxhYmVsOiAnRGVzY3JpcHRpb24nIH0sXG4gICAgICB7IGtleTogJ2xpbmUnLCBsYWJlbDogJ0xpbmUnLCBzb3J0YWJsZTogdHJ1ZSwgb25DbGljazogdGhpcy5vbkNsaWNrIH0sXG4gICAgXVxuICAgIGlmIChkZWxlZ2F0ZS5wYW5lbFJlcHJlc2VudHMgPT09ICdFbnRpcmUgUHJvamVjdCcpIHtcbiAgICAgIGNvbHVtbnMucHVzaCh7IGtleTogJ2ZpbGUnLCBsYWJlbDogJ0ZpbGUnLCBzb3J0YWJsZTogdHJ1ZSwgb25DbGljazogdGhpcy5vbkNsaWNrIH0pXG4gICAgfVxuXG4gICAgbGV0IGhlaWdodFxuICAgIGNvbnN0IGN1c3RvbVN0eWxlOiBPYmplY3QgPSB7IG92ZXJmbG93WTogJ3Njcm9sbCcgfVxuICAgIGlmICh0aGlzLnN0YXRlLnRlbXBIZWlnaHQpIHtcbiAgICAgIGhlaWdodCA9IHRoaXMuc3RhdGUudGVtcEhlaWdodFxuICAgIH0gZWxzZSBpZiAoZGVsZWdhdGUucGFuZWxUYWtlc01pbmltdW1IZWlnaHQpIHtcbiAgICAgIGhlaWdodCA9ICdhdXRvJ1xuICAgICAgY3VzdG9tU3R5bGUubWF4SGVpZ2h0ID0gZGVsZWdhdGUucGFuZWxIZWlnaHRcbiAgICB9IGVsc2Uge1xuICAgICAgaGVpZ2h0ID0gZGVsZWdhdGUucGFuZWxIZWlnaHRcbiAgICB9XG4gICAgZGVsZWdhdGUuc2V0UGFuZWxWaXNpYmlsaXR5KHRoaXMuc3RhdGUudmlzaWJpbGl0eSAmJiAoIWRlbGVnYXRlLnBhbmVsVGFrZXNNaW5pbXVtSGVpZ2h0IHx8ICEhdGhpcy5zdGF0ZS5tZXNzYWdlcy5sZW5ndGgpKVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxSZXNpemFibGVCb3ggaXNSZXNpemFibGU9e3sgdG9wOiB0cnVlIH19IG9uUmVzaXplPXt0aGlzLm9uUmVzaXplfSBvblJlc2l6ZVN0b3A9e3RoaXMub25SZXNpemVTdG9wfSBoZWlnaHQ9e2hlaWdodH0gd2lkdGg9XCJhdXRvXCIgY3VzdG9tU3R5bGU9e2N1c3RvbVN0eWxlfT5cbiAgICAgICAgPGRpdiBpZD1cImxpbnRlci1wYW5lbFwiIHRhYkluZGV4PVwiLTFcIj5cbiAgICAgICAgICA8UmVhY3RUYWJsZVxuICAgICAgICAgICAgcm93cz17dGhpcy5zdGF0ZS5tZXNzYWdlc31cbiAgICAgICAgICAgIGNvbHVtbnM9e2NvbHVtbnN9XG5cbiAgICAgICAgICAgIGluaXRpYWxTb3J0PXtbeyBjb2x1bW46ICdzZXZlcml0eScsIHR5cGU6ICdkZXNjJyB9LCB7IGNvbHVtbjogJ2ZpbGUnLCB0eXBlOiAnYXNjJyB9LCB7IGNvbHVtbjogJ2xpbmUnLCB0eXBlOiAnYXNjJyB9XX1cbiAgICAgICAgICAgIHNvcnQ9e3NvcnRNZXNzYWdlc31cbiAgICAgICAgICAgIHJvd0tleT17aSA9PiBpLmtleX1cblxuICAgICAgICAgICAgcmVuZGVySGVhZGVyQ29sdW1uPXtpID0+IGkubGFiZWx9XG4gICAgICAgICAgICByZW5kZXJCb2R5Q29sdW1uPXtQYW5lbENvbXBvbmVudC5yZW5kZXJSb3dDb2x1bW59XG5cbiAgICAgICAgICAgIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScgfX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT0nbGludGVyJ1xuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9SZXNpemFibGVCb3g+XG4gICAgKVxuICB9XG4gIHN0YXRpYyByZW5kZXJSb3dDb2x1bW4ocm93OiBMaW50ZXJNZXNzYWdlLCBjb2x1bW46IHN0cmluZyk6IHN0cmluZyB8IE9iamVjdCB7XG4gICAgY29uc3QgcmFuZ2UgPSAkcmFuZ2Uocm93KVxuXG4gICAgc3dpdGNoIChjb2x1bW4pIHtcbiAgICAgIGNhc2UgJ2ZpbGUnOlxuICAgICAgICByZXR1cm4gZ2V0UGF0aE9mTWVzc2FnZShyb3cpXG4gICAgICBjYXNlICdsaW5lJzpcbiAgICAgICAgcmV0dXJuIHJhbmdlID8gYCR7cmFuZ2Uuc3RhcnQucm93ICsgMX06JHtyYW5nZS5zdGFydC5jb2x1bW4gKyAxfWAgOiAnJ1xuICAgICAgY2FzZSAnZXhjZXJwdCc6XG4gICAgICAgIGlmIChyb3cudmVyc2lvbiA9PT0gMSkge1xuICAgICAgICAgIGlmIChyb3cuaHRtbCkge1xuICAgICAgICAgICAgcmV0dXJuIDxzcGFuIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7IF9faHRtbDogcm93Lmh0bWwgfX0gLz5cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJvdy50ZXh0IHx8ICcnXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJvdy5leGNlcnB0XG4gICAgICBjYXNlICdzZXZlcml0eSc6XG4gICAgICAgIHJldHVybiBzZXZlcml0eU5hbWVzW3Jvdy5zZXZlcml0eV1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiByb3dbY29sdW1uXVxuICAgIH1cbiAgfVxufVxuIl19