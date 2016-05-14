const fs           = require('fs'),
      fsExtra      = require('fs-extra');
const Resources = {};

Resources.DATA_FOLDER  = process.env.OPENSHIFT_DATA_DIR || '/tmp/enkan-data';
Resources.APP_FOLDER   = Resources.DATA_FOLDER + '/apps';
Resources.db = null;
Resources.plistTemp = fs.readFileSync('./plist-template.xml').toString();

Resources.init = function(){
  if(Resources.db != null) return;
  if(!fs.existsSync(Resources.DATA_FOLDER)){
    console.log('Create folder ' + Resources.DATA_FOLDER);
    fsExtra.mkdirpSync(Resources.DATA_FOLDER);
  }
  if(!fs.existsSync(Resources.APP_FOLDER)){
    console.log('Create folder ' + Resources.APP_FOLDER);
    fsExtra.mkdirpSync(Resources.APP_FOLDER);
  }
  Resources.db =  require('diskdb').connect(Resources.DATA_FOLDER, ['ios', 'android']);
}

module.exports = Resources;