var DOM = require('./dom');

var wrappedCreateClass = function (createClass) {
	return function (spec) {
		var render = spec.render;

		if (render) {
			spec.render = function () {
				var node = render.apply(this, arguments);
				DOM.addClassPrefixToNode(node, spec.displayName);
				/* *
				 * handles the scenario where a component is directly 
				 * returning another component and we need to merge the classes
				 */
				DOM.addClassesToNode(node, this.props.className);
				return node;
			};
		}

		return createClass(spec);
	};
};

module.exports = wrappedCreateClass;