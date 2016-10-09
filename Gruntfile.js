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
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('default', ['concat', 'uglify']);
};