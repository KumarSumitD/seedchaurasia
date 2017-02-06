var gulp = require('gulp');
var exec = require('child_process').exec;

gulp.task('default', ['serverStart', 'watch']);

gulp.task('serverStart', function () {
  exec('node app', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    console.log(err);
  });
});

gulp.task('watch', function(){
  gulp.watch('*.*', ['serverStart'])
});