'use strict';
module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("dd-mm-yyyy") %> */\n' +
          '/*! Author: <%= pkg.author %> */\n' +
          '/*! License: <%= pkg.license %> */\n',
        separator: ';'
      },
      dist: {
        src: ['src/**/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("dd-mm-yyyy") %> */\n' +
          '/*! Author: <%= pkg.author %> */\n' +
          '/*! License: <%= pkg.license %> */\n',
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    jsbeautifier: {
      files: ['app/scripts/*.js',
        'src/**/*.js',
        'test/**/*.js',
        'demo/**/*.js',
        'demo/**/*.html',
        'Gruntfile.js',
        'package.json'
      ],
      options: {
        config: '.jsbeautifyrc'
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        autoWatch: true
      }
    },
    jshint: {
      files: ['Gruntfile.js', 'demo/**/*.js', 'src/**/*.js'],
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('hint', ['jshint']);
  grunt.registerTask('beautifier', ['jsbeautifier']);
  grunt.registerTask('make', ['concat', 'uglify']);
  grunt.registerTask('test', ['karma']);

  grunt.registerTask('default', ['concat', 'uglify']);

};
