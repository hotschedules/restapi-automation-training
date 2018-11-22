let gulp = require('gulp');

gulp.task('copyResFilesToDist', function () {
  return gulp.src(['./package.json', './README.md', 'index.js'])
    .pipe(gulp.dest('./dist'));
});

gulp.task('copyCoreFilesToDist', function () {
  return gulp.src(['./core/*.js'])
    .pipe(gulp.dest('./dist/core'));
});

gulp.task('copyServicesFilesToDist', function () {
  return gulp.src(['./services/**/*.js'])
    .pipe(gulp.dest('./dist/services'));
});

gulp.task('copyLoginFilesToDist', function () {
  return gulp.src(['./scenarios/login.js'])
    .pipe(gulp.dest('./dist/scenarios'));
});

gulp.task('copyDataFilesToDist', function () {
  return gulp.src(['./data/**/*.json'])
    .pipe(gulp.dest('./dist/data'));
});

gulp.task('copyUtilsFilesToDist', function () {
  return gulp.src(['./utils/*.js'])
    .pipe(gulp.dest('./dist/utils/'));
});

gulp.task('copyLibToDist', function () {
    return gulp.src(['./lib/*.tgz'])
        .pipe(gulp.dest('./dist/lib/'));
});