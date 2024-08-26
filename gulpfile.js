"use strict";

const tailwindcss = require("tailwindcss");
const jshint = require("gulp-jshint");
const fileinclude = require('gulp-file-include');
const wrapper = require("gulp-wrapper");
const comments = require("gulp-header-comment");
const template = require("gulp-template");

// const historyApiFallback = require('connect-history-api-fallback')

const theme = require("./src/theme.json");
const headerComments = `WEBSITE: https://themefisher.com
                        TWITTER: https://twitter.com/themefisher
                        FACEBOOK: https://facebook.com/themefisher
                        GITHUB: https://github.com/themefisher/`;

const { src, dest, watch, series, task } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
// const cssnano = require('cssnano');
// const terser = require('gulp-terser');
const browsersync = require('browser-sync').create();

// Sass Task
function scssTask() {
  return src('src/styles/*.scss')
    .pipe(
      sass({
        outputStyle: "expanded",
      }).on("error", sass.logError)
    )
    .pipe(
      postcss([tailwindcss("./tailwind.config.js"), require("autoprefixer")])
    )
    .pipe(comments(headerComments))
    .pipe(dest('dist' + "/styles/"))
}

// JavaScript Task
function jsTask() {
  return src('src/scripts/main.js', { sourcemaps: true })
    // .pipe(terser())
    .pipe(jshint("./.jshintrc"))
    .pipe(jshint.reporter("jshint-stylish"))
    .pipe(dest('dist' + '/scripts', { sourcemaps: '.' }));
}

// Plugins Task
function pluginsTask() {
  return src('src/plugins/**/*', { sourcemaps: true })
    .pipe(dest('dist' + '/plugins', { sourcemaps: '.' }))
}
// Files Task
function filesTask() {
  return src('src/public/**/*', { sourcemaps: true })
    .pipe(dest('dist', { sourcemaps: '.' }))
}

// JavaScript Task
function htmlTaks() {
  return src('src/pages/*.html')
    .pipe(
      wrapper({
        header:
          "<!DOCTYPE html>\n<html lang=\"zxx\">\n@@include('head.html')\n@@include('header.html')\n<body>",
        footer: "@@include('footer.html')\n</body>\n</html>",
      })
    )
    .pipe(
      fileinclude({
        basepath: "src/partials",
      })
    )
    .pipe(
      template({
        fontPrimary: theme.fonts.font_family.primary,
        fontSecondary: theme.fonts.font_family.secondary,
      })
    )
    .pipe(comments(headerComments))
    .pipe(dest('dist', { sourcemaps: '.' }));
}

// Browsersync Tasks
function browsersyncServe(cb) {
  browsersync.init({
    // files: ['./dist'],
    // server: 'dist',
    server: {
      baseDir: './dist'
    },
    // index: 'index.html'

  });
  cb();
}

function browsersyncReload(cb) {
  browsersync.reload();
  cb();
}

// Watch Task
function watchTask() {
  watch('src/**/*.html', browsersyncReload);
  watch(['src/styles/*.scss', 'src/scripts/*.js'], series(scssTask, jsTask, browsersyncReload));
}

task(
  "build",
  series(
    scssTask,
    jsTask,
    pluginsTask,
    filesTask,
    htmlTaks,
    browsersyncServe,
    watchTask
  )
);
