function unfreezeObjectByShallowCopy (object) {
	if (object.__UNFROZEN_BY_CCSS__) {
		return object;
	}

	let copy = {};

	Object.defineProperty(copy, '__UNFROZEN_BY_CCSS__', {enumerable: false, value: true, writable: false});

	for (let property in object) {
		copy[property] = object[property];
	}

	return copy;
}

function toHyphenDelimited (string) {
  return string.replace(/([a-z][A-Z])/g, g => {
	return g[0] + '-' + g[1];
  }).toLowerCase();
}

function addPrefixToClassName (prefix, className) {
	return prefix + '_' + toHyphenDelimited(className);
}

let addClassPrefixToClassStringCache = {};
function addClassPrefixToClassString (prefix, classString) {
	let cacheKey = prefix + ':' + classString;

	if (addClassPrefixToClassStringCache[prefix + classString]) {
		return addClassPrefixToClassStringCache[cacheKey];
	} else {
		return addClassPrefixToClassStringCache[cacheKey] = classString.split(' ').map(className => {
			return addPrefixToClassName(prefix, className);
		}).join(' ');
	}
}

let precomputeClassesCache = {};
function precomputeClasses(classes) {
	if (precomputeClassesCache[classes]) {
		return precomputeClassesCache[classes];
	} else {
		return precomputeClassesCache[classes] = classes.split(' ').map(className => {
			// replace state shorthand
			className = className.replace(/^\:\:\:/, 'state-');
			return className;
		}).join(' ');
	}
}

function addClassPrefixToNode (node, displayName, _isChild) {
	if (!node || !node.props || !displayName) {
		return node;
	}

	node = unfreezeObjectByShallowCopy(node);

	let props = node.props = unfreezeObjectByShallowCopy(node.props),
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

let addClassesToNodeCache = {};
function addClassesToNode (node, classes) {
	if (!node || !node.props || !classes || !node.props.className) {
		return node;
	}

	node = unfreezeObjectByShallowCopy(node);
	node.props = unfreezeObjectByShallowCopy(node.props);

	if (!addClassesToNodeCache[node.props.className]) {
		let classArray = node.props.className.split(' ');

		classes.split(' ').forEach(item => {
			if (classArray.indexOf(item) === -1) {
				classArray.push(item);
			}
		});

		node.props.className = addClassesToNodeCache[node.props.className] = classArray.join(' ');
	} else {
		node.props.className = addClassesToNodeCache[node.props.className];
	}

	return node;
}

export default displayName => {
	return target => {
		let render = target.prototype.render;

		target.prototype.render = function () {
			let node = render.apply(this, arguments);
			node = addClassPrefixToNode(node, displayName);
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
};