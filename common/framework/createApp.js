var path = require('path');
var registerModules = requireFromRoot('/common/framework/registerModule.js');
var expressReact = require('express-react-views');
var express;
module.exports = function(cfg){
  var config = cfg;
  return {
    createApp: createApp
  };

  function createApp() {
    // Each Step should be abstracted to each file - minimum
    express = require('express');
    // Step 1: Setting express module
    var app = express();
    app
      .set('trust proxy', true)
      .set('view options', {layout:false})
      .set('views', path.join(process.cwd(), '/'))
      .set('view engine', config.template_engine);

    app.use(express.static(process.cwd() + '/www'));

    if(config.template_engine === 'jsx') app.engine('jsx', expressReact.createEngine());

    registerModules(app);

    app.listen(config.node_port);
    console.log('Listening to ' + config.node_port);
  }

};