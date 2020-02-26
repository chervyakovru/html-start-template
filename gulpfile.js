var gulp = require('gulp'),
  del = require('del'),
  browserSync = require('browser-sync'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  sass = require('gulp-sass'),
  notify = require('gulp-notify'),
  postcss = require('gulp-postcss'),
  cssvariables = require('postcss-css-variables'),
  atImport = require('postcss-import'),
  autoprefixer = require('autoprefixer'),
  customMedia = require('postcss-custom-media'),
  cssnano = require('cssnano');

//build
const buildMarkup = () => {
  return gulp.src(['app/*.html', 'app/*.php'])
    .pipe(gulp.dest('dist'));
}
const buildScript = () => {
  return gulp.src(['app/js/scripts.min.js']).pipe(gulp.dest('dist/js'));
}
const buildStyle = () => {
  return gulp.src(['app/css/main.min.css']).pipe(gulp.dest('dist/css'));
}
const buildFonts = () => {
  return gulp.src(['app/fonts/**/*']).pipe(gulp.dest('dist/fonts'));
}
const buildImage = () => {
  return gulp.src(['app/img/**/*']).pipe(gulp.dest('dist/img'));
}
const removeDist = () => {
  return del('dist');
}

const build = gulp.series(removeDist, gulp.parallel(buildMarkup, buildScript, buildStyle, buildFonts, buildImage))

//compile
const compileScript = () => {
  return gulp
    .src([
      // here add js libs 
      'app/js/common.js'
    ])
    .pipe(concat('scripts.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('app/js'))
    .pipe(
      browserSync.reload({
        stream: true
      })
    );
}
const compileStyle = () => {
  var plugins = [atImport(), cssvariables(), customMedia(), autoprefixer(), cssnano()];
  return gulp
    .src('app/sass/main.sass')
    .pipe(
      sass({
        outputStyle: 'expand'
      }).on('error', notify.onError())
    )
    .pipe(
      rename({
        suffix: '.min',
        prefix: ''
      })
    )
    .pipe(postcss(plugins))
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.stream());
}

const compile = gulp.parallel(compileScript, compileStyle)

//serve
const startServer = (done) => {
  browserSync.init({
    server: {
      baseDir: "app"
    },
    port: 3000
  });
  done();
}

const reload = (done) => {
  browserSync.reload();
  done();
}

const serve = gulp.series(compile, startServer)

//watch
const watchMarkup = (done) => {
  gulp.watch('app/*.html', gulp.series(reload));
  done();
}
const watchScript = (done) => {
  gulp.watch(['app/libs/**/*.js', 'app/js/common.js'], gulp.series(compileScript));
  done();

}
const watchStyle = (done) => {
  gulp.watch('app/sass/**/*.sass', gulp.series(compileStyle));
  done();

}

const watch = gulp.parallel(watchMarkup, watchScript, watchStyle)

const defaultTasks = gulp.parallel(serve, watch)

gulp.task('build', build);
gulp.task('default', defaultTasks);