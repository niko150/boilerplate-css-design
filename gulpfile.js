'use strict';

var gulp = require("gulp"),
    gulpLoadPlugins = require('gulp-load-plugins'),
    plugins = gulpLoadPlugins(),
    del = require('del'),
    browserSync = require('browser-sync').create();

var dev = false;

gulp.task('clean', function (next) {
    del.sync('./dist');
    return next();
});

gulp.task('img', function () {
    return gulp.src("./src/img/**/*")
        .pipe(gulp.dest("./dist/img"))
        .pipe(browserSync.stream());
});

gulp.task('js', function () {
    return gulp.src("./src/js/**/*")
        .pipe(gulp.dest("./dist/js"))
        .pipe(browserSync.stream());
});

gulp.task('twig', function () {
    var data = require('./src/data/data.json');

    return gulp.src("./src/views/*.html")
        .pipe(plugins.twig({
            data: data
        }))
        .pipe(gulp.dest("./dist"))
        .pipe(browserSync.stream());
});

gulp.task('html', [ 'twig' ], function () {
    return gulp.src("./dist/*.html")
        .pipe(plugins.prettify({
            'indent_inner_html': false,
            'indent_size': 4,
            'indent_char': ' ',
            'wrap_line_length': 78,
            'brace_style': 'expand',
            'preserve_newlines': true,
            'max_preserve_newlines': 0,
            'indent_handlebars': false,
            'extra_liners': []
        }))
        .pipe(gulp.dest("./dist"))
        .pipe(browserSync.stream());
});

gulp.task('sass', function () {
    console.log('dev', dev);
    return gulp.src("./src/sass/*.{sass,scss}")
        .pipe(
            plugins.if(dev, plugins.sourcemaps.init())
        )
        .pipe(plugins.sass({
            outputStyle: 'expanded',
            indentWidth: 4
        }).on('error', plugins.sass.logError))
        .pipe(plugins.autoprefixer({
            browsers: [ 'last 10 versions' ],
        }))
        .pipe(
            plugins.if(dev, plugins.sourcemaps.write('.'))
        )
        .pipe(gulp.dest("./dist/css"))
        .pipe(browserSync.stream({ match: '**/*.css' }));
});

gulp.task('serve', [ 'build' ], function() {
    browserSync.init({
        notify: false,
        server: { baseDir: "./dist" }
    });
});

gulp.task('dobuild', [ 'img', 'js', 'sass', 'twig', 'html' ]);
gulp.task('build',   [ 'clean', 'dobuild' ]);
gulp.task('default', [ 'watch' ]);

gulp.task("watch", [ 'serve' ], function() {
    dev = true;
    gulp.watch('./src/sass/**/*.{sass,scss}',  [ 'sass' ]);
    gulp.watch('./src/views/**/*.html',        [ 'html' ]);
    gulp.watch('./src/js/**/*',                [ 'js' ]);
    gulp.watch('./src/img/**/*',               [ 'img' ]);
});
