var path = require('path');
var commonDb = requireFromRoot('/common/framework/commonDb')();
var sa = require('superagent');
var _ = require('lodash');

module.exports = function(app){

  return {
    preApiFunc: preApi(),
    doDataFunc: dataCall(),
    postApiFunc: postApi()
  };

  function preApi() {
    return function(req, res, next) {
      console.log('In common pre api');
      var module = req.currentModule;
      res.myModuleData = {};
      module.preProcessor(req, res);
      next();
    };
  }

  function dataCall() {
    return function(req, res, next) {
      console.log('In do api -- This is a place common db call like profile or something which has to be call in every page.--');
      var module = req.currentModule;

      commonDb.doCommonDb(req, res, moduleCall);

      function moduleCall() {
        if(!_.isEmpty(module.apiCall))
          moduleApiCall(req, res, next);
        else if (!_.isEmpty(module.dbCall))
          moduleDbCall(req, res, next);
        else next();
      }
    };
  }

  function postApi() {
    return function(req, res, next) {
      var module = req.currentModule;
      module.postProcessor(req, res);
      if(module.isJson)
        res.render(res.myModuleData);
      else
        res.render(path.join(module.templatePath, module.templateName), res.myModuleData);
    };
  }

  //- For connecting with mongo DB from app
  function moduleDbCall(req, res, next){
    console.log("DB Call");
    var module = req.currentModule;
    if(module.dbCall && module.dbCall.collectionName) {
      var collection = req.projectDb.get(module.dbCall.collectionName);
      var promise = module.dbCall.queryData ? collection[module.dbCall.dbQuery](module.dbCall.queryData) : collection[module.dbCall.dbQuery]();
      promise.on('success', function(doc){
        res.moduleData = doc;
        next();
      });
    }
  }

  //- For connecting with rest API
  function moduleApiCall(req, res, next){
    console.log("API Call");
    var defaultApiConfig = {
      path: '',
      verb: 'get',
      params: {},
    };
    var apiCallArg = _.assign(_.cloneDeep(defaultApiConfig), req.currentModule.apiCall);
    apiCallArg.paramMethod = apiCallArg.verb !== 'get' ? 'send' : 'query';
    console.log(apiCallArg);
    var saCall = sa[apiCallArg.verb](apiCallArg.path)[apiCallArg.paramMethod](apiCallArg.params).type('json');
    saCall.set('Accept', 'application/json');
    saCall.end(function(err, response){
      if (!err && response.body) {
        res.apiData = response.body;
        res.apiData.statusCode = response.statusCode;
        next();
      } else {
        console.log("There is an error in api call" +err);
        res.apiData = err;
        next();
      }
    });
  }

};