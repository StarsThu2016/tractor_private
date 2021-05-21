import * as classNames from 'classnames';
import * as React from 'react';
import { VALUES, PLUS } from '../../lib/cards';
import './playerNametag.css';
// [EditByRan] device-specific rendering
import {isMobile} from '../../views/room';

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
              <span className={classNames('name', { 'current': status !== 'DRAW' && playerIds[currentPlayerIndex] === playerId })}
                style={
                  {
                    'font-size': '32px',
                  }
                }
              >
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
