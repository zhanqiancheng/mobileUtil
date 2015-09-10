var gulp = require('gulp');
var compass = require('gulp-compass');
gulp.task('compass', function() {
  gulp.src('./scss/**/*.scss')
    .pipe(compass({
      css: 'css',
      sass: 'scss',
      image: 'img',
      require: ['compass/import-once/activate']
    }))
    .pipe(gulp.dest('./css'))
});