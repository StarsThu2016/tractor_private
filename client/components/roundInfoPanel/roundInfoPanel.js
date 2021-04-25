import * as classNames from 'classnames';
import * as React from 'react';
import { ORDINALS, SUITS, VALUES, SUITS_SHORT} from '../../lib/cards';
import './roundInfoPanel.css';

// [EditByRan]: device-specific rendering
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
var isTablet = (isIPad || (isMobile && !isSmallScreen));
isMobile = isMobile || isTablet;

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

        // [EditByRan]: device-specific rendering: merge GameInfo into RoundInfo
        if (isMobile) {
          var trumpSuit = (currentTrump.suit === 'JOKER') ? 'NO TRUMP' : SUITS_SHORT[currentTrump.suit];
          return (
              <div className='round_info_panel_mobile'>
                <div>
                  {`${numDecks}${numDecks > 1 ? 'd' : 'd'}`}
                  {findAFriend ? '·FAF' : undefined}
                  {chaoDiPi ? '·CDP' : undefined}
                  {mustPlay5 || mustPlay10 || mustPlayK ? '·MP' : undefined}
                  {mustPlay5 ? ' 5' : undefined}
                  {mustPlay10 ? ' 10' : undefined}
                  {mustPlayK ? ' K' : undefined}
                </div>
                <div>Trump: {VALUES[currentTrump.value]} {trumpSuit}</div>
                <div>Starter: {this.renderPlayerId(playerIds[starterPlayerIndex])}</div>
                <div>Points: {opponentsPoints}</div>
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
                  <div>Opponent&apos;s points: {opponentsPoints}</div>
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
        return playerId === myPlayerId ? <span className='me'>{'You'}</span> : playerNames[playerId];
    }
}
