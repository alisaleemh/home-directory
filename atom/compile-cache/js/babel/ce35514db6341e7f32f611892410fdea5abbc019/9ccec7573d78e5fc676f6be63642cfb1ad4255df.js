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

var _helpers = require('../helpers');

var NEWLINE = /\r\n|\n/;
var MESSAGE_NUMBER = 0;

var Message = (function (_React$Component) {
  _inherits(Message, _React$Component);

  function Message() {
    _classCallCheck(this, Message);

    _get(Object.getPrototypeOf(Message.prototype), 'constructor', this).apply(this, arguments);

    this.state = {
      multiLineShow: false
    };
  }

  _createClass(Message, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      this.props.delegate.onShouldUpdate(function () {
        _this.setState({});
      });
      this.props.delegate.onShouldExpand(function () {
        _this.setState({ multiLineShow: true });
      });
      this.props.delegate.onShouldCollapse(function () {
        _this.setState({ multiLineShow: false });
      });
    }
  }, {
    key: 'render',
    value: function render() {
      return NEWLINE.test(this.props.message.text || '') ? this.renderMultiLine() : this.renderSingleLine();
    }
  }, {
    key: 'renderSingleLine',
    value: function renderSingleLine() {
      var _props = this.props;
      var message = _props.message;
      var delegate = _props.delegate;

      var number = ++MESSAGE_NUMBER;
      var elementID = 'linter-message-' + number;
      var isElement = message.html && typeof message.html === 'object';
      if (isElement) {
        setImmediate(function () {
          var element = document.getElementById(elementID);
          if (element) {
            // $FlowIgnore: This is an HTML Element :\
            element.appendChild(message.html.cloneNode(true));
          } else {
            console.warn('[Linter] Unable to get element for mounted message', number, message);
          }
        });
      }

      return _react2['default'].createElement(
        'linter-message',
        { 'class': message.severity },
        delegate.showProviderName ? message.linterName + ': ' : '',
        _react2['default'].createElement(
          'span',
          { id: elementID, dangerouslySetInnerHTML: !isElement && message.html ? { __html: message.html } : null },
          message.text
        ),
        ' ',
        _react2['default'].createElement(
          'a',
          { href: '#', onClick: function () {
              return (0, _helpers.openExternally)(message);
            } },
          _react2['default'].createElement('span', { className: 'icon icon-link linter-icon' })
        )
      );
    }
  }, {
    key: 'renderMultiLine',
    value: function renderMultiLine() {
      var _this2 = this;

      var _props2 = this.props;
      var message = _props2.message;
      var delegate = _props2.delegate;

      var text = message.text ? message.text.split(NEWLINE) : [];
      var chunks = text.map(function (entry) {
        return entry.trim();
      }).map(function (entry, index) {
        return entry.length && _react2['default'].createElement(
          'span',
          { className: index !== 0 && 'linter-line' },
          entry
        );
      }).filter(function (e) {
        return e;
      });

      return _react2['default'].createElement(
        'linter-message',
        { 'class': message.severity },
        _react2['default'].createElement(
          'a',
          { href: '#', onClick: function () {
              return _this2.setState({ multiLineShow: !_this2.state.multiLineShow });
            } },
          _react2['default'].createElement('span', { className: 'icon linter-icon icon-' + (this.state.multiLineShow ? 'chevron-down' : 'chevron-right') })
        ),
        delegate.showProviderName ? message.linterName + ': ' : '',
        chunks[0],
        ' ',
        _react2['default'].createElement(
          'a',
          { href: '#', onClick: function () {
              return (0, _helpers.openExternally)(message);
            } },
          _react2['default'].createElement('span', { className: 'icon icon-link linter-icon' })
        ),
        this.state.multiLineShow && chunks.slice(1)
      );
    }
  }]);

  return Message;
})(_react2['default'].Component);

exports['default'] = Message;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FsaXNhbGVlbWgvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvbGliL3Rvb2x0aXAvbWVzc2FnZS1sZWdhY3kuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7cUJBRWtCLE9BQU87Ozs7dUJBQ00sWUFBWTs7QUFJM0MsSUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFBO0FBQ3pCLElBQUksY0FBYyxHQUFHLENBQUMsQ0FBQTs7SUFFRCxPQUFPO1lBQVAsT0FBTzs7V0FBUCxPQUFPOzBCQUFQLE9BQU87OytCQUFQLE9BQU87O1NBSzFCLEtBQUssR0FFRDtBQUNGLG1CQUFhLEVBQUUsS0FBSztLQUNyQjs7O2VBVGtCLE9BQU87O1dBVVQsNkJBQUc7OztBQUNsQixVQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsWUFBTTtBQUN2QyxjQUFLLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQTtPQUNsQixDQUFDLENBQUE7QUFDRixVQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsWUFBTTtBQUN2QyxjQUFLLFFBQVEsQ0FBQyxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO09BQ3ZDLENBQUMsQ0FBQTtBQUNGLFVBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFlBQU07QUFDekMsY0FBSyxRQUFRLENBQUMsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQTtPQUN4QyxDQUFDLENBQUE7S0FDSDs7O1dBQ0ssa0JBQUc7QUFDUCxhQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQTtLQUN0Rzs7O1dBQ2UsNEJBQUc7bUJBQ2EsSUFBSSxDQUFDLEtB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S0FBSyxDQUFDLGFBQWEsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztPQUM5QixDQUFDO0tBQ25COzs7U0F4RWtCLE9BQU87R0FBUyxtQkFBTSxTQUFTOztxQkFBL0IsT0FBTyIsImZpbGUiOiIvaG9tZS9hbGlzYWxlZW1oLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi90b29sdGlwL21lc3NhZ2UtbGVnYWN5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgb3BlbkV4dGVybmFsbHkgfSBmcm9tICcuLi9oZWxwZXJzJ1xuaW1wb3J0IHR5cGUgVG9vbHRpcERlbGVnYXRlIGZyb20gJy4vZGVsZWdhdGUnXG5pbXBvcnQgdHlwZSB7IE1lc3NhZ2VMZWdhY3kgfSBmcm9tICcuLi90eXBlcydcblxuY29uc3QgTkVXTElORSA9IC9cXHJcXG58XFxuL1xubGV0IE1FU1NBR0VfTlVNQkVSID0gMFxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNZXNzYWdlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IHtcbiAgICBtZXNzYWdlOiBNZXNzYWdlTGVnYWN5LFxuICAgIGRlbGVnYXRlOiBUb29sdGlwRGVsZWdhdGUsXG4gIH07XG4gIHN0YXRlOiB7XG4gICAgbXVsdGlMaW5lU2hvdzogYm9vbGVhbixcbiAgfSA9IHtcbiAgICBtdWx0aUxpbmVTaG93OiBmYWxzZSxcbiAgfTtcbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdGhpcy5wcm9wcy5kZWxlZ2F0ZS5vblNob3VsZFVwZGF0ZSgoKSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHt9KVxuICAgIH0pXG4gICAgdGhpcy5wcm9wcy5kZWxlZ2F0ZS5vblNob3VsZEV4cGFuZCgoKSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgbXVsdGlMaW5lU2hvdzogdHJ1ZSB9KVxuICAgIH0pXG4gICAgdGhpcy5wcm9wcy5kZWxlZ2F0ZS5vblNob3VsZENvbGxhcHNlKCgpID0+IHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBtdWx0aUxpbmVTaG93OiBmYWxzZSB9KVxuICAgIH0pXG4gIH1cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiBORVdMSU5FLnRlc3QodGhpcy5wcm9wcy5tZXNzYWdlLnRleHQgfHwgJycpID8gdGhpcy5yZW5kZXJNdWx0aUxpbmUoKSA6IHRoaXMucmVuZGVyU2luZ2xlTGluZSgpXG4gIH1cbiAgcmVuZGVyU2luZ2xlTGluZSgpIHtcbiAgICBjb25zdCB7IG1lc3NhZ2UsIGRlbGVnYXRlIH0gPSB0aGlzLnByb3BzXG5cbiAgICBjb25zdCBudW1iZXIgPSArK01FU1NBR0VfTlVNQkVSXG4gICAgY29uc3QgZWxlbWVudElEID0gYGxpbnRlci1tZXNzYWdlLSR7bnVtYmVyfWBcbiAgICBjb25zdCBpc0VsZW1lbnQgPSBtZXNzYWdlLmh0bWwgJiYgdHlwZW9mIG1lc3NhZ2UuaHRtbCA9PT0gJ29iamVjdCdcbiAgICBpZiAoaXNFbGVtZW50KSB7XG4gICAgICBzZXRJbW1lZGlhdGUoZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChlbGVtZW50SUQpXG4gICAgICAgIGlmIChlbGVtZW50KSB7XG4gICAgICAgICAgLy8gJEZsb3dJZ25vcmU6IFRoaXMgaXMgYW4gSFRNTCBFbGVtZW50IDpcXFxuICAgICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQobWVzc2FnZS5odG1sLmNsb25lTm9kZSh0cnVlKSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oJ1tMaW50ZXJdIFVuYWJsZSB0byBnZXQgZWxlbWVudCBmb3IgbW91bnRlZCBtZXNzYWdlJywgbnVtYmVyLCBtZXNzYWdlKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cblxuICAgIHJldHVybiAoPGxpbnRlci1tZXNzYWdlIGNsYXNzPXttZXNzYWdlLnNldmVyaXR5fT5cbiAgICAgIHsgZGVsZWdhdGUuc2hvd1Byb3ZpZGVyTmFtZSA/IGAke21lc3NhZ2UubGludGVyTmFtZX06IGAgOiAnJyB9XG4gICAgICA8c3BhbiBpZD17ZWxlbWVudElEfSBkYW5nZXJvdXNseVNldElubmVySFRNTD17ICFpc0VsZW1lbnQgJiYgbWVzc2FnZS5odG1sID8geyBfX2h0bWw6IG1lc3NhZ2UuaHRtbCB9IDogbnVsbCB9PlxuICAgICAgICB7IG1lc3NhZ2UudGV4dCB9XG4gICAgICA8L3NwYW4+XG4gICAgICB7JyAnfVxuICAgICAgPGEgaHJlZj1cIiNcIiBvbkNsaWNrPXsoKSA9PiBvcGVuRXh0ZXJuYWxseShtZXNzYWdlKX0+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImljb24gaWNvbi1saW5rIGxpbnRlci1pY29uXCI+PC9zcGFuPlxuICAgICAgPC9hPlxuICAgIDwvbGludGVyLW1lc3NhZ2U+KVxuICB9XG5cbiAgcmVuZGVyTXVsdGlMaW5lKCkge1xuICAgIGNvbnN0IHsgbWVzc2FnZSwgZGVsZWdhdGUgfSA9IHRoaXMucHJvcHNcblxuICAgIGNvbnN0IHRleHQgPSBtZXNzYWdlLnRleHQgPyBtZXNzYWdlLnRleHQuc3BsaXQoTkVXTElORSkgOiBbXVxuICAgIGNvbnN0IGNodW5rcyA9IHRleHQubWFwKGVudHJ5ID0+IGVudHJ5LnRyaW0oKSkubWFwKChlbnRyeSwgaW5kZXgpID0+IGVudHJ5Lmxlbmd0aCAmJiA8c3BhbiBjbGFzc05hbWU9e2luZGV4ICE9PSAwICYmICdsaW50ZXItbGluZSd9PntlbnRyeX08L3NwYW4+KS5maWx0ZXIoZSA9PiBlKVxuXG4gICAgcmV0dXJuICg8bGludGVyLW1lc3NhZ2UgY2xhc3M9e21lc3NhZ2Uuc2V2ZXJpdHl9PlxuICAgICAgPGEgaHJlZj1cIiNcIiBvbkNsaWNrPXsoKSA9PiB0aGlzLnNldFN0YXRlKHsgbXVsdGlMaW5lU2hvdzogIXRoaXMuc3RhdGUubXVsdGlMaW5lU2hvdyB9KX0+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGljb24gbGludGVyLWljb24gaWNvbi0ke3RoaXMuc3RhdGUubXVsdGlMaW5lU2hvdyA/ICdjaGV2cm9uLWRvd24nIDogJ2NoZXZyb24tcmlnaHQnfWB9Pjwvc3Bhbj5cbiAgICAgIDwvYT5cbiAgICAgIHsgZGVsZWdhdGUuc2hvd1Byb3ZpZGVyTmFtZSA/IGAke21lc3NhZ2UubGludGVyTmFtZX06IGAgOiAnJyB9XG4gICAgICB7IGNodW5rc1swXSB9XG4gICAgICB7JyAnfVxuICAgICAgPGEgaHJlZj1cIiNcIiBvbkNsaWNrPXsoKSA9PiBvcGVuRXh0ZXJuYWxseShtZXNzYWdlKX0+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImljb24gaWNvbi1saW5rIGxpbnRlci1pY29uXCI+PC9zcGFuPlxuICAgICAgPC9hPlxuICAgICAgeyB0aGlzLnN0YXRlLm11bHRpTGluZVNob3cgJiYgY2h1bmtzLnNsaWNlKDEpIH1cbiAgICA8L2xpbnRlci1tZXNzYWdlPilcbiAgfVxufVxuIl19