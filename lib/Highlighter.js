'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends3 = require('babel-runtime/helpers/extends');

var _extends4 = _interopRequireDefault(_extends3);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _OptionalRadium = require('./OptionalRadium');

var _OptionalRadium2 = _interopRequireDefault(_OptionalRadium);

var _substyle2 = require('substyle');

var _isEqual = require('lodash/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _Mention = require('./Mention');

var _Mention2 = _interopRequireDefault(_Mention);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _generateComponentKey = function _generateComponentKey(usedKeys, id) {
  if (!usedKeys.hasOwnProperty(id)) {
    usedKeys[id] = 0;
  } else {
    usedKeys[id]++;
  }
  return id + "_" + usedKeys[id];
};

var Highlighter = function (_Component) {
  (0, _inherits3.default)(Highlighter, _Component);

  function Highlighter() {
    (0, _classCallCheck3.default)(this, Highlighter);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Highlighter).apply(this, arguments));

    _this.state = { lastPosition: {} };
    return _this;
  }

  (0, _createClass3.default)(Highlighter, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.notifyCaretPosition();
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this.notifyCaretPosition();
    }
  }, {
    key: 'notifyCaretPosition',
    value: function notifyCaretPosition() {
      var caret = this.refs.caret;


      if (!caret) {
        return;
      }

      var position = {
        left: caret.offsetLeft,
        top: caret.offsetTop
      };

      var lastPosition = this.state.lastPosition;


      if ((0, _isEqual2.default)(lastPosition, position)) {
        return;
      }

      this.setState({
        lastPosition: position
      });

      this.props.onCaretPositionChange(position);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props;
      var selection = _props.selection;
      var value = _props.value;
      var markup = _props.markup;
      var displayTransform = _props.displayTransform;
      var inputStyle = _props.inputStyle;

      // If there's a caret (i.e. no range selection), map the caret position into the marked up value

      var caretPositionInMarkup;
      if (selection.start === selection.end) {
        caretPositionInMarkup = _utils2.default.mapPlainTextIndex(value, markup, selection.start, 'START', displayTransform);
      }

      var resultComponents = [];
      var componentKeys = {};

      // start by appending directly to the resultComponents
      var components = resultComponents;

      var substringComponentKey = 0;

      var textIteratee = function textIteratee(substr, index, indexInPlainText) {
        // check whether the caret element has to be inserted inside the current plain substring
        if (_utils2.default.isNumber(caretPositionInMarkup) && caretPositionInMarkup >= index && caretPositionInMarkup <= index + substr.length) {
          // if yes, split substr at the caret position and insert the caret component
          var splitIndex = caretPositionInMarkup - index;
          components.push(_this2.renderSubstring(substr.substring(0, splitIndex), substringComponentKey));

          // add all following substrings and mention components as children of the caret component
          components = [_this2.renderSubstring(substr.substring(splitIndex), substringComponentKey)];
        } else {
          // otherwise just push the plain text substring
          components.push(_this2.renderSubstring(substr, substringComponentKey));
        }

        substringComponentKey++;
      };

      var mentionIteratee = function (markup, index, indexInPlainText, id, display, type, lastMentionEndIndex) {
        // generate a component key based on the id
        var key = _generateComponentKey(componentKeys, id);
        components.push(this.getMentionComponentForMatch(id, display, type, key));
      }.bind(this);
      _utils2.default.iterateMentionsMarkup(value, markup, textIteratee, mentionIteratee, displayTransform);

      // append a span containing a space, to ensure the last text line has the correct height
      components.push(" ");

      if (components !== resultComponents) {
        // if a caret component is to be rendered, add all components that followed as its children
        resultComponents.push(this.renderHighlighterCaret(components));
      }

      var _substyle = substyle(this.props, getModifiers(this.props));

      var style = _substyle.style;
      var className = _substyle.className;


      return _react2.default.createElement(
        'div',
        {
          className: className,
          style: (0, _extends4.default)({}, inputStyle, style) },
        resultComponents
      );
    }
  }, {
    key: 'renderSubstring',
    value: function renderSubstring(string, key) {
      // set substring span to hidden, so that Emojis are not shown double in Mobile Safari
      return _react2.default.createElement(
        'span',
        (0, _extends4.default)({}, substyle(this.props, "substring"), { key: key }),
        string
      );
    }

    // Returns a clone of the Mention child applicable for the specified type to be rendered inside the highlighter

  }, {
    key: 'getMentionComponentForMatch',
    value: function getMentionComponentForMatch(id, display, type, key) {
      var childrenCount = _react.Children.count(this.props.children);
      var props = { id: id, display: display, key: key };

      if (childrenCount > 1) {
        if (!type) {
          throw new Error("Since multiple Mention components have been passed as children, the markup has to define the __type__ placeholder");
        }

        // detect the Mention child to be cloned
        var foundChild = null;
        _react.Children.forEach(this.props.children, function (child) {
          if (!child) {
            return;
          }

          if (child.props.type === type) {
            foundChild = child;
          }
        });

        // clone the Mention child that is applicable for the given type
        return _react2.default.cloneElement(foundChild, props);
      }

      if (childrenCount === 1) {
        // clone single Mention child
        var child = this.props.children.length ? this.props.children[0] : _react.Children.only(this.props.children);
        return _react2.default.cloneElement(child, props);
      }

      // no children, use default configuration
      return (0, _Mention2.default)(props);
    }

    // Renders an component to be inserted in the highlighter at the current caret position

  }, {
    key: 'renderHighlighterCaret',
    value: function renderHighlighterCaret(children) {
      return _react2.default.createElement(
        'span',
        (0, _extends4.default)({}, substyle(this.props, "caret"), { ref: 'caret', key: 'caret' }),
        children
      );
    }
  }]);
  return Highlighter;
}(_react.Component);

Highlighter.propTypes = {
  selection: _react.PropTypes.shape({
    start: _react.PropTypes.number,
    end: _react.PropTypes.number
  }).isRequired,

  markup: _react.PropTypes.string.isRequired,
  value: _react.PropTypes.string.isRequired,

  displayTransform: _react.PropTypes.func.isRequired,
  onCaretPositionChange: _react.PropTypes.func.isRequired,
  inputStyle: _react.PropTypes.object
};
Highlighter.defaultProps = {
  value: "",
  inputStyle: {}
};
exports.default = (0, _OptionalRadium2.default)(Highlighter);


var getModifiers = function getModifiers(props) {
  for (var _len = arguments.length, modifiers = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    modifiers[_key - 1] = arguments[_key];
  }

  return (0, _extends4.default)({}, modifiers.reduce(function (result, modifier) {
    return (0, _extends4.default)({}, result, (0, _defineProperty3.default)({}, modifier, true));
  }, {}), {

    '&singleLine': props.singleLine
  });
};

var substyle = (0, _substyle2.defaultStyle)({
  position: 'relative',
  width: 'inherit',
  color: 'transparent',

  overflow: 'hidden',

  whiteSpace: 'pre-wrap',
  wordWrap: 'break-word',

  '&singleLine': {
    whiteSpace: 'pre',
    wordWrap: null
  },

  substring: {
    visibility: 'hidden'
  }
});