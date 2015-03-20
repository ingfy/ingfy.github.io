var gulp = require('gulp'),
    rename = require('gulp-rename'),
    mainBowerFiles = require('main-bower-files'),
    inject = require('gulp-inject');

var deploy      = require('gulp-gh-pages');

gulp.task('js', function () {
    return gulp.src(mainBowerFiles()).pipe(gulp.dest('./dist'));
});

gulp.task('index', ['js'], function () {
    return gulp.src('src/app.html')
        .pipe(rename('index.html'))
        .pipe(inject(gulp.src(['./dist/**.js', './dist/**.css']), {ignorePath: '/dist'}))
        .pipe(gulp.dest('./dist'));
});

gulp.task('watch-index', function () {
    gulp.watch('src/app.html', ['index']);
});

gulp.task('deploy', ['js', 'index'], function () {
    return gulp.src('./dist/**/*').pipe(deploy({branch: 'master'}));
});
