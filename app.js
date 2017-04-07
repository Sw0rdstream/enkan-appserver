var restify = require('restify');
const http         = require('http'),
      fs           = require('fs'),
      fsExtra      = require('fs-extra'),
      path         = require('path'),
      contentTypes = require('./utils/content-types'),
      sysInfo      = require('./utils/sys-info'),
      env          = process.env;
var ipaMetadata    = require('ipa-metadata');
var Resources      = require('./resources.js');
var apkParser = require('node-apk-parser');
Resources.init();

function writeAppRecord(bundleId, name, platform, uploadTime, version, build, size){
  var records = Resources.db[platform].find({bundleId:bundleId});
  if(records.length){
    Resources.db[platform].update({bundleId:bundleId}, {uploadTime:uploadTime, version:version, build:build, name:name, size:size});
  }
  else{
    Resources.db[platform].save({bundleId:bundleId, uploadTime:uploadTime, version:version,build:build, name:name, size:size});
  }
  return {
    bundleId: bundleId,
    platform: platform,
    uploadTime: uploadTime,
    version: version,
    build:build,
    name:name,
    size:size
  }
}

function respondAppListing(req, res, next) {
  if(req.params.platform === 'ios'){
    res.send(Resources.db.ios.find());
  }
  else if(req.params.platform === 'android'){
    res.send(Resources.db.android.find());
  }
  else{
    var err = new restify.errors.InternalServerError('Error Platform');
    return next(err);
  }
  next();
}

function respondAppUpload(req, res, next) {
  console.log("Start Upload");
  var appFile = req.files.file;
  if(appFile){

    if(appFile.name.endsWith('.ipa')){
      ipaMetadata(appFile.path, function(err, data){
        var metadata = data.metadata;
        fsExtra.move(appFile.path, Resources.APP_FOLDER+'/'+metadata.CFBundleIdentifier+'.ipa', {clobber:true}, function (err) {
            if (err) {
              console.log(err);
              err = new restify.errors.InternalServerError('Error in processing ipa file');
              return next(err);
            }
            else{
              writeAppRecord(metadata.CFBundleIdentifier, metadata.CFBundleName, 'ios', new Date().getTime(), metadata.CFBundleShortVersionString, metadata.CFBundleVersion, appFile.size);
              res.send({success:true});
              return next();
            }
            
        });
      });
    }
    else if(appFile.name.endsWith('.apk')){
      var reader = apkParser.readFile(appFile.path);
      var manifest = reader.readManifestSync();
      fsExtra.move(appFile.path, Resources.APP_FOLDER+'/'+manifest.package+'.apk', {clobber:true}, function (err) {
        if (err) {
          console.log(err);
          err = new restify.errors.InternalServerError('Error in processing apk file');
          return next(err);
        }
        else{
          writeAppRecord(manifest.package, manifest.package/*fixme*/, 'android', new Date().getTime(), manifest.versionName, manifest.versionCode, appFile.size);
          res.send({success:true});
          return next();
        }
      });
      res.send('This is used to upload apps');
      return next();
    }
    else{
      var err = new restify.errors.InternalServerError('Error File Extension, expect ipa or apk');
      return next(err);
    }
  } 
  else{
    var err = new restify.errors.InternalServerError('No file uploaded');
      return next(err);
  } 
}

function respondAppRemove(req, res, next) {
  if(req.params.platform === 'ios' || req.params.platform === 'android'){
    Resources.db[req.params.platform].remove({bundleId:req.params.appId});
    res.send({success:true});
  }
  else{
    var err = new restify.errors.InternalServerError('Error Platform');
    return next(err);
  }
  next();
}

function respondAppDownload(req, res, next) {
  var err = undefined;
  if(req.params.platform === 'ios'){
    var results = Resources.db.ios.find({bundleId:req.params.appId});
    if(results.length < 1){
      err = new restify.errors.InternalServerError('BundleID doesn\'t exist');
    }
    else{
      var body = Resources.plistTemp.replace(/{bundleId}/g, results[0].bundleId)
                      .replace(/{server_address}/g, 'https://' + req.headers.host)
                      .replace(/{name}/g, results[0].name)
                      .replace(/{build}/g, results[0].build);
      res.writeHead(200, {
        'Content-Type': 'application/x-plist',
        'Content-Disposition':'attachment; filename=\"app.plist\"',
        'Content-Description': 'File Transfer',
        'Content-Length': Buffer.byteLength(body)
      });
      res.end(body);
    }
  }
  else if(req.params.platform === 'android'){
    if(results.length){
      err = new restify.errors.InternalServerError('BundleID doesn\'t exist');
    }
    else{
      fs.readFile(Resources.APP_FOLDER+'/'+results[0].bundleId+'.apk', function(err,data){
        if (err) {
          res.writeHead(404);
          res.end();
        } else {
          res.writeHead(200, {
            'Content-Type': 'application/octect-stream',
            'Content-Disposition':'attachment; filename=\"app.apk\"',
            'Content-Description': 'File Transfer',
            'Content-Length': data.length
          });
          res.end(data);
        }
      });
    }
  }
  else{
    err = new restify.errors.InternalServerError('Unspported Platform '+req.params.platform); 
  }
  return next(err);
}

function respondStaticResources(req, res, next) {
  var relativePath = req.url == '/front/' ? '/front/index.html' : req.url;
  console.log('Load static resources for: ' + relativePath);
  fs.readFile('.'+relativePath, function (err, data) {
    if (err) {
      res.writeHead(404);
      res.end();
    } else {
      var ext = path.extname(relativePath).slice(1);
      res.setHeader('Content-Type', contentTypes[ext]);
      if (ext === 'html') {
        res.setHeader('Cache-Control', 'no-cache, no-store');
      }
      res.end(data);
    }
  });
  next();
}

function respondIpaDownload(req, res, next){
  fs.readFile(Resources.APP_FOLDER+'/'+req.params.appId+'.ipa', function(err,data){
      if (err) {
        res.writeHead(404);
        res.end();
      } else {
        res.writeHead(200, {
          'Content-Type': 'application/octect-stream',
          'Content-Disposition':'attachment; filename=\"app.ipa\"',
          'Content-Description': 'File Transfer',
          'Content-Length': data.length
        });
        res.end(data);
      }
  });
  next();
}

function respondHello(req, res, next){
  res.send()
  next();
}


var server = restify.createServer();
server.use(restify.bodyParser());
server.get('/api/apps/list/:platform', respondAppListing);
server.post('/api/apps/upload', respondAppUpload);
server.del('/api/apps/:appId/:platform', respondAppRemove);
server.get('/api/apps/:appId/:platform', respondAppDownload); //for ios, only provide plist
server.get('/api/ipa/:appId', respondIpaDownload);
server.get('/api/hello', respondHello);
server.get(/front\//, respondStaticResources);
server.get('/front', function(req, res, next){
  res.redirect('/front/index.html', next);
});

server.listen(env.NODE_PORT || 3000, env.NODE_IP || '0.0.0.0', function() {
  console.log('%s listening at %s', server.name, server.url);
  console.log(`Application worker ${process.pid} started...`);
});
