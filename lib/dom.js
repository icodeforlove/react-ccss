'use strict';

var toHyphenDelimited = require('./toHyphenDelimited');

function addPrefixToClassName (prefix, className) {
	return prefix + '_' + toHyphenDelimited(className);
}

function addClassPrefixToClassString (prefix, classString) {
	return classString.split(' ').map(function (className) {
		return addPrefixToClassName(prefix, className);
	}).join(' ');
}

function addClassPrefixToNode (node, displayName, _isChild) {		
	if (!node || !node.props || !displayName) {
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

function addClassesToNode (node, classes) {
	if (!node || !node.props || !classes || !node.props.className) {
		return;
	}

	var classArray = node.props.className.split(' ');

	classes.split(' ').forEach(function (item) {
		if (classArray.indexOf(item) === -1) {
			classArray.push(item);
		}
	});

	node.props.className = classArray.join(' ');
}

exports.addClassesToNode = addClassesToNode;
exports.addClassPrefixToNode = addClassPrefixToNode;