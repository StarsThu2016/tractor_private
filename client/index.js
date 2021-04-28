import * as React from 'react';
import * as ReactDOM from 'react-dom';
import GithubCorner from 'react-github-corner';
import { HashRouter, Route, Switch, useHistory } from 'react-router-dom';
import {Lobby} from './views/lobby';
import {Room} from './views/room';
import './index.css';
// [EditByRan] device-specific rendering
import {isMobile} from './views/room';

function App() {
  const history = useHistory();

  // [EditByRan] device-specific rendering
  if (true) {
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
