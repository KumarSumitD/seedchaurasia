//- Starting point
requireFromRoot = function(path) {
  return require(__dirname + path);
};

var config = requireFromRoot('/common/config/config');
var appMain = requireFromRoot('/common/framework/createApp')(config);

if (module === require.main) appMain.createApp();