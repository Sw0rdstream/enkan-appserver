var request = require('request');
var fs = require('fs');

var AppUploader = {};
var publishURL = null;

AppUploader.queue = [];

AppUploader.startPublish = function(publishAddress, files){
    publishURL = publishAddress;
    AppUploader.queue = files;
    AppUploader.recheck_();
};

AppUploader.sendPost_ = function(filepath, postURL, publishFormData){
    var filename = filepath.substring(filepath.lastIndexOf("/"));
    var r = request.post({url:postURL},  function(err, response, body) {
        if(err){
            console.log(err);
            throw err;
        }
        if(response.statusCode == 200){
            console.log('Deploy '+ filepath +' successfully');
        }
        else{
            throw 'Error of return code [ipa]: ' + response.statusCode;
        }
        AppUploader.recheck_();
    });
    var form = r.form();
    for(var i in publishFormData){
            form.append(i, publishFormData[i]);
    };
};

AppUploader.doUpload_ = function(filepath){
        console.log("Start to publish "+ filepath +" to server :" + publishURL);
        var publishFormData = {
            file: fs.createReadStream(filepath)
        };
        AppUploader.sendPost_(filepath, publishURL, publishFormData);
};

AppUploader.recheck_ = function(){
    if(AppUploader.queue.length>0){
        var file = AppUploader.queue.pop();
        AppUploader.doUpload_(file);
    }
};

module.exports = AppUploader;