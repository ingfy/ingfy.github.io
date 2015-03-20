var gulp = require('gulp'),
    rename = require('gulp-rename'),
    mainBowerFiles = require('main-bower-files'),
    inject = require('gulp-inject'),
    ghPages = require('gh-pages'),
    path = require('path');

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

gulp.task('build', ['js', 'index']);
gulp.task('default', ['build']);

gulp.task('deploy', ['build'], function (cb) {
    ghPages.publish(path.join(process.cwd(), 'dist'), {
        branch: 'master'
    }, cb);
});
