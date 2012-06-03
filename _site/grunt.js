module.exports = function( grunt ) {
	'use strict';

	grunt.initConfig({
		files: [
			'js/jquery.easing.min.js',
			'js/jquery.shuffle.js',
			'js/jquery-ajax-localstorage-cache.js',
			'js/bootstrap-transition.js',
			'js/bootstrap-collapse.js',
			'js/bootstrap-modal.js',
			'js/bootstrap-tooltip.js',
			'js/bootstrap-carousel.js',
			'js/gfx.js',
			'js/gfx.cube.js',
			'js/responsiveslides.js',
			'js/plugins.js',
			'js/script.js'
		],
		concat: {
			'dist/combined.js': ['<config:files>']
		},
		min: {
			'dist/combined.js': ['<config:files>']
		},
		less: {
			main: {
				src: 'less/main.less',
				dest: 'dist/combined.css',
				options: {
					compress: true
				}
			}
		},
		watch: {
			files: ['<config:files>', '<config:less.main.src'],
			tasks: 'default'
		},
		jshint: {
			options: {
				es5: true,
				esnext: true,
				bitwise: true,
				curly: true,
				eqeqeq: true,
				newcap: true,
				noarg: true,
				noempty: true,
				regexp: true,
				undef: true,
				strict: true,
				trailing: true,
				smarttabs: true,
				browser: true,
				node: true,
				nonstandard: true
			}
		}
	});

	grunt.loadNpmTasks('grunt-less');

	grunt.registerTask('default', 'concat less');
	grunt.registerTask('prod', 'min less');

};