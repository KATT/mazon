var gulp = require('gulp');
var mocha = require('gulp-spawn-mocha');


// Include Our Plugins
var browserify = require('gulp-browserify');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

var refresh = require('gulp-livereload');
var lr = require('tiny-lr');
var server = lr();

// Lint Task
gulp.task('lint', function() {
    gulp.src(['src/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});


// Concatenate & Minify JS
gulp.task('scripts', function() {
    gulp.src(['src/**/*.js'])
        .pipe(browserify({
        	debug: !gulp.env.production
        }))
        .pipe(concat('all.js'))
        .pipe(gulp.dest('build'))
        .pipe(refresh(server))
})

function test() {
  return gulp.src(['test/*.test.js'], {read: false}).pipe(mocha({
    r: 'test/setup.js',
    R: 'spec'
  })).on('error', console.warn.bind(console));
}

gulp.task('test', function () {
  return test().on('error', function (e) {
    // throw e;
  });
});

// livereload server
gulp.task('lr-server', function() {
	server.listen(35721, function(err) {
		if(err) return console.log(err);
	});
});





// Rerun the task when a file changes
gulp.task('watch', function () {
  gulp.watch(['src/**/*.js'], ['scripts', test]);
  gulp.watch(['test/**/*.js'], ['scripts', test]);
});


gulp.task('default', ['lr-server', 'lint', 'test', 'scripts', 'watch']);
