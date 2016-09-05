import clone from 'clone';

function toHyphenDelimited (string) {
  return string.replace(/([a-z][A-Z])/g, g => {
    return g[0] + '-' + g[1];
  }).toLowerCase();
}

function addPrefixToClassName (prefix, className) {
	return prefix + '_' + toHyphenDelimited(className);
}

function addClassPrefixToClassString (prefix, classString) {
	return classString.split(' ').map(className => {
		return addPrefixToClassName(prefix, className);
	}).join(' ');
}

function addClassPrefixToNode (node, displayName, _isChild) {
	if (!node || !node.props || !displayName) {
		return node;
	}

	node = clone(node);

	let props = node.props = clone(node.props),
		prefix = 'app-' + toHyphenDelimited(displayName);

	if (props.classes) {
		// precompute class names
		props.classes = props.classes.split(' ').map(className => {
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

function traverseDOMTree (displayName, item) {
	if (Array.isArray(item)) {
		return item.map(item => {
			return traverseDOMTree(displayName, item);
		});
	} else if (item && item.props) {
		return addClassPrefixToNode(item, displayName, true);
	} else {
		return item;
	}
}

function addClassesToNode (node, classes) {
	if (!node || !node.props || !classes || !node.props.className) {
		return node;
	}

	node = clone(node);
	node.props = clone(node.props);

	let classArray = node.props.className.split(' ');

	classes.split(' ').forEach(item => {
		if (classArray.indexOf(item) === -1) {
			classArray.push(item);
		}
	});

	node.props.className = classArray.join(' ');

	return node;
}

export default target => {
	let render = target.prototype.render;

	target.prototype.render = function () {
		let node = render.apply(this, arguments);
		node = addClassPrefixToNode(node, this.constructor.name);
		node = addClassesToNode(node, this.props.className);
		return node;
	};

	target.prototype.ccss = classList => {
		let classes = [];

		Object.keys(classList).forEach(className => {
			if (classList[className]) {
				classes.push(className);
			}
		});

		return classes.join(' ');
    };
    return target;
};