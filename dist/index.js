'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function unfreezeObjectByShallowCopy(object) {
	if (object.__UNFROZEN_BY_CCSS__) {
		return object;
	}

	var copy = {};

	Object.defineProperty(copy, '__UNFROZEN_BY_CCSS__', { enumerable: false, value: true, writable: false });

	for (var property in object) {
		copy[property] = object[property];
	}

	return copy;
}

function toHyphenDelimited(string) {
	return string.replace(/([a-z][A-Z])/g, function (g) {
		return g[0] + '-' + g[1];
	}).toLowerCase();
}

function addPrefixToClassName(prefix, className) {
	return prefix + '_' + toHyphenDelimited(className);
}

var addClassPrefixToClassStringCache = {};
function addClassPrefixToClassString(prefix, classString) {
	var cacheKey = prefix + ':' + classString;

	if (addClassPrefixToClassStringCache[prefix + classString]) {
		return addClassPrefixToClassStringCache[cacheKey];
	} else {
		return addClassPrefixToClassStringCache[cacheKey] = classString.split(' ').map(function (className) {
			return addPrefixToClassName(prefix, className);
		}).join(' ');
	}
}

var precomputeClassesCache = {};
function precomputeClasses(classes) {
	if (precomputeClassesCache[classes]) {
		return precomputeClassesCache[classes];
	} else {
		return precomputeClassesCache[classes] = classes.split(' ').map(function (className) {
			// replace state shorthand
			className = className.replace(/^\:\:\:/, 'state-');
			return className;
		}).join(' ');
	}
}

function addClassPrefixToNode(node, displayName, _isChild) {
	if (!node || !node.props || !displayName) {
		return node;
	}

	node = unfreezeObjectByShallowCopy(node);

	var props = node.props = unfreezeObjectByShallowCopy(node.props),
	    prefix = 'app-' + toHyphenDelimited(displayName);

	if (props.classes) {
		// precompute class names
		props.classes = precomputeClasses(props.classes);
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

	node = unfreezeObjectByShallowCopy(node);
	node.props = unfreezeObjectByShallowCopy(node.props);

	var classArray = node.props.className.split(' ');

	classes.split(' ').forEach(function (item) {
		if (classArray.indexOf(item) === -1) {
			classArray.push(item);
		}
	});

	node.props.className = classArray.join(' ');

	return node;
}

exports.default = function (displayName) {
	return function (target) {
		var render = target.prototype.render;

		target.prototype.render = function () {
			var node = render.apply(this, arguments);
			node = addClassPrefixToNode(node, displayName);
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