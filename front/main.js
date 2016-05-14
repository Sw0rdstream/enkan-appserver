import React from 'react';

import Header from './components/Header';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import IconFileDownload from 'material-ui/svg-icons/file/file-download';
import CircularProgress from 'material-ui/CircularProgress';
import $ from 'jquery';

class Main extends React.Component {

  constructor(param){
  	super(param);
    this.state = {existedApps:null};
  }

  componentDidMount(){
    var platform = 'android';
    if(navigator.userAgent.indexOf('iPod')>0 || navigator.userAgent.indexOf('iPhone')>0 || navigator.userAgent.indexOf('iPad')>0){
      platform = 'ios';
    }
    var downloadUrlPrefix = location.protocol + '//' + location.host + '/api/apps/';
    $.get('/api/apps/list/'+platform, function(appList){
      var appVoList = [];
      for(var i in appList){
        appVoList.push({
          appName:appList[i].name,
          version:appList[i].version,
          build:appList[i].build,
          logoUrl:'NULL',
          bundleId:appList[i].bundleId,
          downloadUrl: downloadUrlPrefix + appList[i].bundleId+'/'+platform
        });
      }
      this.setState({
        existedApps: appVoList
      });
    }.bind(this));
  }

  getAppListDom(){
    if(!this.state.existedApps){
      return (<div style={{textAlign:'center'}}><CircularProgress /></div>);
    }
    else if(this.state.existedApps.length === 0){
      return (
        <Card>
          <CardHeader
            title="No Apps"
            titleColor="#333"
          />
          <CardText>
            No apps available now. Tell some one to upload.
          </CardText>
        </Card>
      );
    }
    else{
      return (
        <div>
          {this.state.existedApps.map(function(item){
              return (
                <Card>
                  <CardHeader
                    title={item.appName}
                    subtitle={'v' + item.version + ' (build: ' + item.build +')'}
                    avatar={item.logoUrl}
                    titleColor="#333"
                    subtitleColor="#999"
                  />
                  <CardActions>
                    <FlatButton label="Install" icon={<IconFileDownload />} primary={true} linkButton={true}  href={'itms-services://?action=download-manifest&amp;url=' + item.downloadUrl} />
                  </CardActions>
                </Card>
              );
          }.bind(this))}
	      </div>
      );
    }
  }

  render() {

    var AppList = this.getAppListDom();

    return (
      <div>
	      <Header />
	      {AppList}
      </div>
    );
  }
}

export default Main;
