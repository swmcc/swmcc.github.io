var gulp = require('gulp-param')(require('gulp'), process.argv);
var imageResize = require('gulp-image-resize');
var taskListing = require('gulp-task-listing');

gulp.task('help', taskListing)

gulp.task('blog_list_image', function (filename) {
  gulp.src(filename)
    .pipe(imageResize({ 
      width : 340,
      height : 680,
      crop : false,
      upscale : false
    }))
    .pipe(gulp.dest('img/blog/'));
    console.log(filename);
});


gulp.task('blog_header_image', function (filename) {
  gulp.src(filename)
    .pipe(imageResize({ 
      width : 1440,
      height : 720,
      crop : false,
      upscale : false
    }))
    .pipe(gulp.dest('img/blog/header/'));
    console.log(filename);
});
