import * as React from 'react';
import { VALUES } from '../../lib/cards';
import './gameInfoPanel.css';

/**
 * A panel that displays info relevant to the entire game (multiple rounds):
 * each player's overall score.
 */
export class GameInfoPanel extends React.Component {

    // [EditByRan] Implement must-play-rank feature.
    render() {
        const {
            playerNames,
            myPlayerId,
            playerIds,
            numDecks,
            findAFriend,
            mustPlay5,
            mustPlay10,
            mustPlayK,
            playerRankScores,
        } = this.props;

        return (
            <div className='game_info_panel'>
                <div>
                    {`${numDecks} ${numDecks > 1 ? 'decks' : 'deck'}`}
                    {findAFriend ? ' · find-a-friend' : undefined}
                </div>
                <div>
                    {mustPlay5 || mustPlay10 || mustPlayK ? 'Must play' : undefined}
                    {mustPlay5 ? ' 5' : undefined}
                    {mustPlay10 ? ' 10' : undefined}
                    {mustPlayK ? ' K' : undefined}
                </div>
                <ul>
                    {playerIds.map((playerId) => {
                        const name = playerId === myPlayerId ?
                            <span className='me'>{'You'}</span> : playerNames[playerId];
                        return <li
                            key={playerId}
                        >
                            {name}{`: ${VALUES[playerRankScores[playerId]]}`}
                        </li>;
                    })}
                </ul>
            </div>
        );
    }
}
