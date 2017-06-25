'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _shallowCopy = require('shallow-copy');

var _shallowCopy2 = _interopRequireDefault(_shallowCopy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function toHyphenDelimited(string) {
	return string.replace(/([a-z][A-Z])/g, function (g) {
		return g[0] + '-' + g[1];
	}).toLowerCase();
}

function addPrefixToClassName(prefix, className) {
	return prefix + '_' + toHyphenDelimited(className);
}

function addClassPrefixToClassString(prefix, classString) {
	return classString.split(' ').map(function (className) {
		return addPrefixToClassName(prefix, className);
	}).join(' ');
}

function addClassPrefixToNode(node, displayName, _isChild) {
	if (!node || !node.props || !displayName) {
		return node;
	}

	node = (0, _shallowCopy2.default)(node);

	var props = node.props = (0, _shallowCopy2.default)(node.props),
	    prefix = 'app-' + toHyphenDelimited(displayName);

	if (props.classes) {
		// precompute class names
		props.classes = props.classes.split(' ').map(function (className) {
			// replace state shorthand
			className = className.replace(/^\:\:\:/, 'state-');
			return className;
		}).join(' ');
	}

	// modify class strings
	if (props.classes && !_isChild) {
		props.classes = ['app-component', prefix, addClassPrefixToClassString(prefix, props.classes)].join(' ');
	} else if (props.classes && _isChild) {
		props.classes = addClassPrefixToClassString(prefix, props.classes);
	} else if (!props.classes && !_isChild) {
		props.classes = 'app-component ' + prefix;
	}

	// add to className
	if (props.className && props.classes) {
		props.className += ' ' + props.classes;
	} else if (!props.className && props.classes) {
		props.className = props.classes;
	}

	delete props.classes;

	// continue walking the node tree
	if (props.children && props.children !== 'string') {
		props.children = traverseDOMTree(displayName, props.children);
	}

	return node;
}

function traverseDOMTree(displayName, item) {
	if (Array.isArray(item)) {
		return item.map(function (item) {
			return traverseDOMTree(displayName, item);
		});
	} else if (item && item.props) {
		return addClassPrefixToNode(item, displayName, true);
	} else {
		return item;
	}
}

function addClassesToNode(node, classes) {
	if (!node || !node.props || !classes || !node.props.className) {
		return node;
	}

	node = (0, _shallowCopy2.default)(node);
	node.props = (0, _shallowCopy2.default)(node.props);

	var classArray = node.props.className.split(' ');

	classes.split(' ').forEach(function (item) {
		if (classArray.indexOf(item) === -1) {
			classArray.push(item);
		}
	});

	node.props.className = classArray.join(' ');

	return node;
}

exports.default = function (componentName) {
	return function (target) {
		var render = target.prototype.render;

		target.prototype.render = function () {
			var node = render.apply(this, arguments);
			node = addClassPrefixToNode(node, componentName);
			node = addClassesToNode(node, this.props.className);
			return node;
		};

		target.prototype.ccss = function (classList) {
			var classes = [];

			(0, _keys2.default)(classList).forEach(function (className) {
				if (classList[className]) {
					classes.push(className);
				}
			});

			return classes.join(' ');
		};
		return target;
	};
};

module.exports = exports['default'];