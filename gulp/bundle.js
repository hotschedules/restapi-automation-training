const gulp = require('gulp');
const shell = require('gulp-shell');

gulp.task('bundleLibrary', shell.task([
  'npm pack ./dist'
]));