var path = require('path');
var glob = require('glob');
var _ = require('lodash');
// DB Name and Port Configurable
var mongo = require('mongodb');
var monk = require('monk');
var config = requireFromRoot('/common/config/config');
var projectDb = monk(config.db_host + config.project_db);
var excludes = config.excludes;

module.exports = function(app) {
  var middleware = requireFromRoot('/common/framework/middleware.js')(app);
  var defaultConfig = {
    route: null,
    routeVerb: 'get',
    isJson: false,
    dbCall: {},
    apiCall: {},
    preProcessor: function() {
      console.log('default preProcessor');
    },
    postProcessor: function() {
      console.log('default postProcessor');
    }
  },
  modules = {};

  //- Looping through all apps
  iterateApps();

  //- Register All Route
  registerApps();

  function iterateApps() {
    //- Loop thorugh all js file inside and app and choose each mini app
    console.log('In iterateApps');
    glob.sync('./**/*.js', { cwd: process.cwd() + '/app'})
      .filter(filterExcludes)
      .forEach(function(file) { setupMiniApp(path.join(process.cwd() + '/app', file)); });
  }

  function filterExcludes(eachApp, index, appObject) {
    //- Exclude files which are mentioned in config file
    console.log('In Filter Exclude');
    var matches = !excludes.some(function(excludeEl) {
      return eachApp.indexOf(excludeEl) !== -1;
    });
    return matches;
  }

  function setupMiniApp(filepath) {
    //- Create an array which hold info about all miniapp
    console.log('In setupMiniApp');
    var appModule = require(filepath)(app);
    var moduleConfig = _.assign(_.cloneDeep(defaultConfig), appModule);
    var routeLookup = moduleConfig.routeVerb + ':' + moduleConfig.route;
    moduleConfig.templatePath = path.dirname(filepath);
    moduleConfig.templateName = path.basename(filepath, '.js');
    modules[routeLookup] = moduleConfig;
  }

  function registerApps() {
    //- Handle and all route
    console.log('In registerApps');
    _.each(modules,function(module){
      app[module.routeVerb](module.route, initFunction, middleware.preApiFunc, middleware.doDataFunc, middleware.postApiFunc);
    });
  }

  function initFunction(req, res, next) {
    req.currentModule = modules[req.method.toLowerCase() + ':' + req.route.path];
    req.projectDb = projectDb;
    next();
  }
};