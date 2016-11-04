module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		concat: {
			options: {
				sourceMap: true
			},
			dist: {
				src: 'js/src/*.js',
				dest: 'js/build/gameoflife-<%= pkg.version %>.js'
			}
		},

		uglify: {
			options: {
				mangle: false,
				sourceMap: true,
				sourceMapIn: 'js/build/gameoflife-<%= pkg.version %>.js.map'
			},
			build: {
				src: 'js/build/gameoflife-<%= pkg.version %>.js',
				dest: 'js/build/gameoflife-<%= pkg.version %>.min.js'
			}
		},
		
		svgstore: {
			options: {
				prefix: 'shape-',
			},
			default: {
				files: {
					'svg/sprite.svg': ['svg/src/*.svg'],
				}
			}
		},
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-svgstore');

	grunt.registerTask('js', ['concat', 'uglify']);
	grunt.registerTask('graphics', ['svgstore']);
	grunt.registerTask('default', ['js', 'graphics']);
};