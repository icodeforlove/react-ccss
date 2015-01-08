'use strict';

var wrappedCreateClass = require('./lib/wrappedCreateClass');

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