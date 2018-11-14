var gulp = require('gulp'),
  clean = require('gulp-clean');

gulp.task('cleanDist', function () {
  return gulp.src('dist')
    .pipe(clean());
});