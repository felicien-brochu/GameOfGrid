module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		clean: {
			all: 'build/*',
			html: 'build/*.html',
			css: 'build/css',
			js: 'build/js',
			svg: 'build/svg',
			static: ['build/**/*', '!build/js/*', '!build/svg/*', 'build/index.html', 'build/css/*'],
		},

		copy: {
			html: {
				cwd: 'src',
				src: ['*.html'],
				dest: 'build',
				expand: true,
			},
			css: {
				cwd: 'src',
				src: ['css/*.css'],
				dest: 'build',
				expand: true,
			},
			static: {
				cwd: 'src',
				src: ['**/*', '!*.html', '!css/**', '!js/**', '!svg/**', '!**/*.db'],
				dest: 'build',
				expand: true,
			},
		},

		concat: {
			options: {
				sourceMap: true,
			},
			dist: {
				src: 'src/js/*.js',
				dest: 'build/js/gameofgrid-<%= pkg.version %>.js',
			},
		},

		uglify: {
			options: {
				mangle: false,
				sourceMap: true,
				sourceMapIn: 'build/js/gameofgrid-<%= pkg.version %>.js.map',
			},
			build: {
				src: 'build/js/gameofgrid-<%= pkg.version %>.js',
				dest: 'build/js/gameofgrid-<%= pkg.version %>.min.js',
			},
		},

		svgstore: {
			options: {
				prefix: 'shape-',
			},
			default: {
				files: {
					'build/svg/sprite.svg': ['src/svg/*.svg'],
				},
			},
		},
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-svgstore');

	grunt.registerTask('html', ['copy:html']);
	grunt.registerTask('css', ['clean:css', 'copy:css']);
	grunt.registerTask('static', ['clean:static', 'copy:static']);
	grunt.registerTask('js', ['concat', 'uglify']);
	grunt.registerTask('dev', ['js', 'html', 'css']);
	grunt.registerTask('default', ['clean:all', 'html', 'copy:css', 'copy:static', 'js', 'svgstore']);
};