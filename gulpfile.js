(function () {
  const gulp = require('gulp');
  const runSequence = require('run-sequence');
  const requireDir = require('require-dir');

  requireDir('./gulp');

  gulp.task('buildLibrary', function(done) {
    runSequence(
      'cleanDist',
      ['copyResFilesToDist', 'copyCoreFilesToDist', 'copyServicesFilesToDist', 'copyLoginFilesToDist', 'copyDataFilesToDist', 'copyUtilsFilesToDist', 'copyLibToDist', 'bundleLibrary'],
      done
    );
  });
}());