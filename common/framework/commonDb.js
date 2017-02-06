
module.exports = function(){
  return {
    doCommonDb : doCommonDb
  };
};

function doCommonDb(req, res, callback) {
  console.log('Do Common Db Call');
  res.myModuleData.profile = {'name': 'anonymous'};
  callback();
}