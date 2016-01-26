'use strict';

var webpack = require('webpack');
var jsFiles = [
  './js/**/*.js'
];

module.exports = function(grunt) {
  var mainPort = 1776;
  var livereloadPort = 1775;

  var webpackBuildConfig = require('./webpack.config.js');

  grunt.initConfig({
    connect : {
      server : {
        options : {
          base : '.',
          port : mainPort,
          hostname : '*',
          livereload : livereloadPort
        }
      }
    },
    webpack : {
      options: webpackBuildConfig,
      'build-dev' : {
        devtool : 'sourcemap',
        debug : true
      }
    },
    'webpack-dev-server' : {
      options : {
        webpack : webpackBuildConfig,
        publicPath : '/'
      },
      start : {
        keepAlive : true,
        webpack : {
          devtool : 'sourcemap',
          debug : true
        }
      }
    },
    postcss : {
      options : {
        map : {
          inline : false,
          annotation : 'built/'
        },
        processors : [
          require('cssnext')(),
          require('postcss-nested')()
        ]
      },
      dist : {
        files : {
          'built/index.css' : 'css/index.css'
        }
      }
    },
    watch : {
      // this makes sure grunt restarts whenever the Gruntfile changes
      grunt : {
        files : ['Gruntfile.js']
      },
      css : {
        files : ['css/**/*.css'],
        tasks : ['postcss'],
        options : {
          livereload : livereloadPort
        }
      },
      data : {
        files : ['data/**/*.*'],
        options : {
          livereload : livereloadPort
        }
      },
      html : {
        files : ['index.html'],
        options : {
          livereload : livereloadPort
        }
      },
      js : {
        files : jsFiles,
        tasks : ['webpack:build-dev'],
        options : {
          spawn : false,
          livereload : livereloadPort
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-postcss');

  grunt.registerTask('default', ['webpack:build-dev', 'postcss', 'connect', 'watch']);
};
