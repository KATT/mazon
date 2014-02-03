var gulp = require('gulp');
var mocha = require('gulp-mocha');


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

gulp.task('test', function () {
    gulp.src('test/*.js')
        .pipe(mocha({reporter: 'nyan'}));
});

// livereload server
gulp.task('lr-server', function() {
	server.listen(35721, function(err) {
		if(err) return console.log(err);
	});
});




// Rerun the task when a file changes
gulp.task('watch', function () {
  gulp.watch(['src/**/*.js'], ['scripts']);
  gulp.watch(['test/**/*.js'], ['scripts']);
});


gulp.task('default', ['lr-server', 'lint', 'test', 'scripts', 'watch']);
