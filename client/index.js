import * as React from 'react';
import * as ReactDOM from 'react-dom';
import GithubCorner from 'react-github-corner';
import { HashRouter, Route, Switch, useHistory } from 'react-router-dom';
import {Lobby} from './views/lobby';
import {Room} from './views/room';
import './index.css';

// [EditByRan] device-specific rendering
var agent = navigator.userAgent;
var isWebkit = (agent.indexOf("AppleWebKit") > 0);
var isIPad = (agent.indexOf("iPad") > 0);
var isIOS = (agent.indexOf("iPhone") > 0 || agent.indexOf("iPod") > 0);
var isAndroid = (agent.indexOf("Android")  > 0);
var isNewBlackBerry = (agent.indexOf("AppleWebKit") > 0 && agent.indexOf("BlackBerry") > 0);
var isWebOS = (agent.indexOf("webOS") > 0);
var isWindowsMobile = (agent.indexOf("IEMobile") > 0);
var isSmallScreen = (screen.width < 767 || (isAndroid && screen.width < 1000));
var isUnknownMobile = (isWebkit && isSmallScreen);
var isMobile = (isIOS || isAndroid || isNewBlackBerry || isWebOS || isWindowsMobile || isUnknownMobile);
// isMobile = !isMobile;
var isTablet = (isIPad || (isMobile && !isSmallScreen));

function App() {
  const history = useHistory();

  // [EditByRan] device-specific rendering
  if (isMobile) {
    return <div>
      <Switch>
        <Route
          exact
          path='/'
          render={() => <Lobby joinRoom={roomCode => history.push(`/${roomCode}`)} />}
        />
        <Route
          path='/:roomCode'
          render={({ match: { params: { roomCode } } }) => <Room roomCode={roomCode} leaveRoom={() => history.push('/')} />}
        />
      </Switch>
    </div>;
  } else {
    return <div>
      <Switch>
        <Route
          exact
          path='/'
          render={() => <Lobby joinRoom={roomCode => history.push(`/${roomCode}`)} />}
        />
        <Route
          path='/:roomCode'
          render={({ match: { params: { roomCode } } }) => <Room roomCode={roomCode} leaveRoom={() => history.push('/')} />}
        />
      </Switch>
      <GithubCorner href="https://github.com/StarsThu2016/tractor_private" />
    </div>;
  }
}

ReactDOM.render(<HashRouter><App /></HashRouter>, document.getElementById('app'));
