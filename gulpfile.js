'use strict';

var gulp = require('gulp');
var fs = require('fs');

gulp.task('css', function () {
    var sass = require('gulp-sass')(require('sass'));
    var postcss = require('gulp-postcss');
    var autoprefixer = require('autoprefixer');

    return gulp.src('./asset/sass/*.scss')
        .pipe(sass({
            outputStyle: 'compressed',
            includePaths: ['node_modules/susy/sass']
        }).on('error', sass.logError))
        .pipe(postcss([
            autoprefixer()
        ]))
        .pipe(gulp.dest('./asset/css'));
});

gulp.task('bump-version', function (cb) {
    var iniPath = './config/theme.ini';
    if (!fs.existsSync(iniPath)) {
        return cb(new Error('theme.ini not found'));
    }

    var iniContent = fs.readFileSync(iniPath, 'utf8');

    iniContent = iniContent.replace(/(version\s*=\s*["'])([^"']+)(["'])/, function (match, prefix, version, suffix) {
        var parts = version.split('.');
        if (parts.length > 0) {
            parts[parts.length - 1] = parseInt(parts[parts.length - 1], 10) + 1;
        } else {
            parts = ['1', '0', '1'];
        }
        var newVersion = parts.join('.');
        console.log('Bumping theme.ini version from ' + version + ' to ' + newVersion);
        return prefix + newVersion + suffix;
    });

    fs.writeFileSync(iniPath, iniContent, 'utf8');
    cb();
});

gulp.task('css:watch', function () {
    gulp.watch('./asset/sass/*.scss', gulp.parallel('css'));
});

// For local dev (recompiles on save without touching theme.ini version)
gulp.task('default', gulp.series('css', 'css:watch'));

// For deployment (recompiles and increments theme.ini version once before git upload)
gulp.task('build', gulp.series('css', 'bump-version'));