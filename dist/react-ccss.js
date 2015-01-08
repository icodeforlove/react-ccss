/**
 * react-ccss.js v0.0.0
 */
var ReactCCSS =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var wrappedCreateClass = __webpack_require__(1);
	
	var wrap = function (React) {
		if (typeof React === 'undefined') {
			throw new Error('React must be loaded before react-ccss');
		}
	
		if (!React._createClass) {
			React.createClass = wrappedCreateClass(React._createClass = React.createClass);
		}
	
		return React;
	};
	
	if (typeof window !== 'undefined') {
		wrap(window.React);
	}
	
	module.exports = wrap;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var DOM = __webpack_require__(2);
	
	var wrappedCreateClass = function (createClass) {
		return function (spec) {
			var render = spec.render;
	
			if (render) {
				spec.render = function () {
					var node = render.apply(this, arguments);
					DOM.addClassPrefixToNode(node, spec.displayName);
					return node;
				};
			}
	
			return createClass(spec);
		};
	};
	
	module.exports = wrappedCreateClass;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var toHyphenDelimited = __webpack_require__(3);
	
	function addPrefixToClassName (prefix, className) {
		return prefix + '_' + toHyphenDelimited(className);
	}
	
	function addClassPrefixToClassString (prefix, classString) {
		return classString.split(' ').map(function (className) {
			return addPrefixToClassName(prefix, className);
		}).join(' ');
	}
	
	function addClassPrefixToNode (node, displayName, _isChild) {		
		if (!node || !node.props) {
			return;
		}
	
		var props = node.props,
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
			traverseDOMTree(displayName, props.children);
		}
	}
	
	function traverseDOMTree (displayName, item) {
		if (Array.isArray(item)) {
			item.forEach(function (item) {
				traverseDOMTree(displayName, item);
			});
		} else if (item && item.props) {
			addClassPrefixToNode(item, displayName, true);
		}
	}
	
	exports.addClassPrefixToNode = addClassPrefixToNode;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	/**
	 * Converts a CamelCase string to a hyphen-delimited string.
	 */
	function toHyphenDelimited (string) {
	  return string.replace(/([a-z][A-Z])/g, function (g) {
	    return g[0] + '-' + g[1];
	  }).toLowerCase();
	};
	
	module.exports = toHyphenDelimited;

/***/ }
/******/ ])
//# sourceMappingURL=react-ccss.js.map