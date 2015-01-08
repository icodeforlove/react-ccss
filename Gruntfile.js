'use strict';

module.exports = function(grunt) {
	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		webpack: {
			build: {
				devtool: 'source-map',
				entry: './index.js',
				output: {
					library: 'ReactCCSS',
					path: 'dist/',
					filename: 'react-ccss.js'
				}
			}
		},

		uglify: {
			build: {
				files: {
					'dist/react-ccss-min.js': ['dist/react-ccss.js']
				}
			}
		},

		banner: '/**\n * react-ccss.js v<%= pkg.version %>\n */',
		usebanner: {
			dist: {
				options: {
					position: 'top',
					banner: '<%= banner %>'
				},
				files: {
					'dist/react-ccss.js': ['dist/react-ccss.js'],
					'dist/react-ccss-min.js': ['dist/react-ccss-min.js']
				}
			}
		},

		jshint: {
			options: {
				jshintrc: true
			},
			all: ['./*.js', './browser/*.js', './test/*.js']
		},

		jasmine_node: {
			options: {
				forceExit: true,
				match: '.',
				matchall: false,
				extensions: 'js',
				specNameMatcher: 'test'
			},
			all: ['test/']
		},
		watch: {
			jasmine: {
				files: ['test/*.js'],
				tasks: ['test']
			}
		}
	});

	grunt.loadNpmTasks('grunt-webpack');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-banner');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-jasmine-node');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('build', ['jshint', 'webpack', 'uglify', 'usebanner']);
	grunt.registerTask('test', ['jshint', 'jasmine_node']);

};