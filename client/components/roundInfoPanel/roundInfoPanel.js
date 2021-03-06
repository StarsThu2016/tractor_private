import * as classNames from 'classnames';
import * as React from 'react';
import { ORDINALS, SUITS, VALUES, SUITS_SHORT} from '../../lib/cards';
import './roundInfoPanel.css';
// [EditByRan] device-specific rendering
import {isMobile} from '../../views/room';

/**
 * A panel that displays info relevant only to the current round: the current
 * round trump, the current starter, and the current number of card points.
 */
export class RoundInfoPanel extends React.Component {

    render() {
        const {
            playerIds,
            starterPlayerIndex,
            isDeclaringTeam,
            findAFriendDeclaration,
            currentRoundScores,
            currentRoundPenalties,
            currentTrump,
            numDecks,
            findAFriend,
            mustPlay5,
            mustPlay10,
            mustPlayK,
            standardSpeed,
            chaoDiPi,
        } = this.props;

        if (!isDeclaringTeam) {
            return null;
        }

        let opponentsPoints = 0;
        playerIds.forEach((playerId) => {
            if (!isDeclaringTeam[playerId]) {
                opponentsPoints += currentRoundScores[playerId];
            }
        });

        // [EditByRan] device-specific rendering: merge GameInfo into RoundInfo
        if (isMobile) {
          var trumpSuit = (currentTrump.suit === 'JOKER') ? 'NO TR.' : SUITS_SHORT[currentTrump.suit];
          return (
              <div className='round_info_panel_mobile'>
                <div>
                  {`${numDecks}${numDecks > 1 ? 'd' : 'd'}`}
                  {findAFriend ? '·FAF' : undefined}
                  {chaoDiPi ? '·CDP' : undefined}
                </div>
                <div>Trump: {VALUES[currentTrump.value]} {trumpSuit}</div>
                <div>Starter: {this.renderPlayerId(playerIds[starterPlayerIndex])}</div>
                <div>{standardSpeed ? 'Pts(std): ' : 'Points: '}{opponentsPoints}</div>
                {this.maybeRenderFindAFriendDeclaration(findAFriendDeclaration)}
                {this.maybeRenderPenalties(currentRoundPenalties)}
              </div>
          );
        } else {
          var trumpSuit = currentTrump.suit === 'JOKER' ? 'NO TRUMP' : SUITS[currentTrump.suit];
          return (
              <div className='round_info_panel'>
                  <div>Current trump: {VALUES[currentTrump.value]} of {trumpSuit}</div>
                  <div>Starter: {this.renderPlayerId(playerIds[starterPlayerIndex])}</div>
                  <div>{standardSpeed ? 'Points (standard speed): ' : 'Opponent\'s points: '}{opponentsPoints}</div>
                  {this.maybeRenderFindAFriendDeclaration(findAFriendDeclaration)}
                  {this.maybeRenderPenalties(currentRoundPenalties)}
              </div>
          );
        }
    }

    maybeRenderFindAFriendDeclaration(findAFriendDeclaration) {
        if (!findAFriendDeclaration) {
            return;
        }
        if (isMobile){
          return (
             <div>
                {findAFriendDeclaration.declarations.map((declaration, index) => {
                    return <div key={`declaration${index}`} className={classNames({ 'satisfied': declaration.satisfied })}>
                        {'F: ' + this.renderDeclaration(declaration)}
                    </div>;
                })}
            </div>
          );
        }
        return (
            <div className="section">
                <div>Friends:</div>
                {findAFriendDeclaration.declarations.map((declaration, index) => {
                    return <div key={`declaration${index}`} className={classNames({ 'satisfied': declaration.satisfied })}>
                        {this.renderDeclaration(declaration)}
                    </div>;
                })}
            </div>
        );
    }

    renderDeclaration({ ordinal, value, suit }) {
        if (value === 'BIG_JOKER') {
            return `${ORDINALS[ordinal]} big joker`;
        } else if (value === 'SMALL_JOKER') {
            return `${ORDINALS[ordinal]} small joker`;
        } else {
            return isMobile ? `${ORDINALS[ordinal]} ${VALUES[value]} ${SUITS_SHORT[suit]}` :
              `${ORDINALS[ordinal]} ${VALUES[value]} of ${SUITS[suit]}`;
        }
    }

    maybeRenderPenalties(currentRoundPenalties) {
        if (!currentRoundPenalties) {
            return;
        }
        const playerIdsWithPenalties = Object.keys(currentRoundPenalties)
            .filter(playerId => currentRoundPenalties[playerId] > 0);
        if (playerIdsWithPenalties.length === 0) {
            return;
        }
        if (isMobile){
          return (
              <div>
                  {playerIdsWithPenalties.map((playerId, index) => {
                      return <div key={`penalty${index}`}>
                          {'P: '}
                          {this.renderPlayerId(playerId)}
                          {` ${currentRoundPenalties[playerId]} points`}
                      </div>;
                  })}
              </div>
          );
        }
        return (
            <div className="section">
                <div>Penalties:</div>
                {playerIdsWithPenalties.map((playerId, index) => {
                    return <div key={`penalty${index}`}>
                        {this.renderPlayerId(playerId)}
                        {`: ${currentRoundPenalties[playerId]} points`}
                    </div>;
                })}
            </div>
        );
    }

    renderPlayerId(playerId) {
        const { playerNames, myPlayerId } = this.props;
        if (isMobile) {
            return playerId === myPlayerId ? <span className='me'>{'You'}</span> : playerNames[playerId].slice(0, 7);
        }
        return playerId === myPlayerId ? <span className='me'>{'You'}</span> : playerNames[playerId];
    }
}
