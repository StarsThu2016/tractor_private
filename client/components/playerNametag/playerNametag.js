import * as classNames from 'classnames';
import * as React from 'react';
import { VALUES, PLUS } from '../../lib/cards';
import './playerNametag.css';

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

/**
 * The "nametag" for a single player. Shown in the game area near the player's
 * location, and contains the player's name and other relevant info.
 */
export class PlayerNametag extends React.Component {

    // [EditByRan] Implement the "Chao-Di-Pi" feature.
    render() {
        const {
            playerId,
            playerNames,
            playerIds,
            findAFriend,
            chaoDiPi,
            status,
            currentPlayerIndex,
            isDeclaringTeam,
            currentRoundScores,
            playerRankScores,
            playerRankCycles,
        } = this.props;

        // [EditByRan] device-specific rendering: merge the level info into NameTag
        if (isMobile) {
          let rankInfo = `${VALUES[playerRankScores[playerId]]}${PLUS[playerRankCycles[playerId]]}`;
          let playerInfo = undefined;
          if (isDeclaringTeam[playerId]) {
              playerInfo = 'DT';
          } else if (findAFriend) {
              const numPoints = currentRoundScores[playerId];
              if (numPoints > 0) {
                  playerInfo = `${numPoints} pts`
              }
          }
          let final_name = playerInfo ? `${playerNames[playerId]} (${rankInfo}, ${playerInfo})` : `${playerNames[playerId]} (${rankInfo})`;
          return <div className='player_nametag'>
              <span className={classNames('name', { 'current': status !== 'DRAW' && playerIds[currentPlayerIndex] === playerId })}>
                  {final_name}
              </span>
          </div>;
        } else {
          let playerInfo = undefined;
          if (isDeclaringTeam[playerId]) {
              playerInfo = 'DECL. TEAM';
          } else if (findAFriend) {
              const numPoints = currentRoundScores[playerId];
              if (numPoints > 0) {
                  playerInfo = `${numPoints} pts.`
              }
          }
          return <div className='player_nametag'>
              <span className={classNames('name', { 'current': status !== 'DRAW' && playerIds[currentPlayerIndex] === playerId })}>
                  {playerNames[playerId]}
              </span>
              {playerInfo ? <span className='player_info'>{playerInfo}</span> : undefined}
          </div>;
        }
    }
}
