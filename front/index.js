import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {cyan500} from 'material-ui/styles/colors';
import { Router, Route, browserHistory } from 'react-router';
import Main from './main';


import getMuiTheme from 'material-ui/styles/getMuiTheme';

// This replaces the textColor value on the palette
// and then update the keys for each component that depends on it.
// More on Colors: http://www.material-ui.com/#/customization/colors
const muiTheme = getMuiTheme({
  palette: {
    textColor: cyan500,
  },
  appBar: {
    height: 50,
  },
});

var app = document.getElementById('app');

class App extends React.Component {
  componentDidMount(){
    window['router'] = this.routerUI_.router;
  }
  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <Router history={browserHistory} ref={(r) => this.routerUI_ = r}>
           {/*for debug*/}
           <Route path="/index.html" component={Main}/>
           <Route path="/" component={Main}/>
           {/*for production*/}
           <Route path="/front/index.html" component={Main}/>
           <Route path="/front/" component={Main}/>
        </Router>
      </MuiThemeProvider>
    );
  }
}

ReactDOM.render((
  <App />
), app);
