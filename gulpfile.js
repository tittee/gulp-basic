const { src, dest, parallel, series, watch } = require('gulp');

// Load plugins
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const clean = require('gulp-clean');
const imagemin = require('gulp-imagemin');
const changed = require('gulp-changed');
const browserSync = require('browser-sync').create();
const sourcemaps = require('gulp-sourcemaps');
const pug = require('gulp-pug');

let baseDir = './app/';
let distDir = './dist/';

const clear = () => {
  return src(distDir + '*', {
    read: false,
  }).pipe(clean());
};

// JS function

const js = () => {
  const source = baseDir + '/js/*.js';

  return src(source)
    .pipe(changed(source))
    .pipe(concat('bundle.js'))
    .pipe(uglify())
    .pipe(
      rename({
        extname: '.min.js',
      }),
    )
    .pipe(dest(distDir + '/js/'))
    .pipe(browserSync.stream());
};

// SCSS function
const scss = () => {
  const source = baseDir + '/scss/*.scss';

  return src(source)
    .pipe(sourcemaps.init())
    .pipe(
      sass
        .sync({
          includePaths: ['app/scss'],
          errLogToConsole: true,
          outputStyle: 'compressed',
          onError: browserSync.notify,
        })
        .on('error', sass.logError),
    )
    .pipe(autoprefixer())
    .pipe(concat('style.min.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(distDir + '/css/'))
    .pipe(browserSync.stream());
};
// Optimize image
const img = () => {
  const source = baseDir + '/img/*';
  return src(source)
    .pipe(imagemin())
    .pipe(dest(distDir + '/img/'));
};

// custom pathbuilder function
const pathbuilder = path => {
  if ('index' !== path.basename) {
    path.dirname = path.basename.split('_').join('/');
    path.basename = 'index';
  }
};

const html = () => {
  const source = baseDir + '/templates/*.pug';
  return src(source)
    .pipe(
      pug({
        pretty: true,
        doctype: 'html',
      }),
    )
    .pipe(
      rename(path => {
        pathbuilder(path);
      }),
    )
    .pipe(dest(distDir));
};

// Watch files
// browserSync

const browserSyncWatch = () => {
  browserSync.init({
    server: 'dist',
    port: 3333,
  });

  watch(baseDir + 'scss/*.scss', scss);
  watch(baseDir + 'js/*.js', js);
  watch(baseDir + 'templates/*.pug', html);
  watch('dist/*.html').on('change', browserSync.reload);
};

// Tasks to define the execution of the functions simultaneously or in series
exports.html = html;
exports.styles = scss;
exports.watch = browserSyncWatch;
exports.default = series(clear, html, img, js, scss);
