import * as React from 'react';
import { Cards } from '../cards';
import { PlayerArea } from '../playerArea';
import './trick.css';
// [EditByRan] device-specific rendering
import {isMobile} from '../../views/room';

/**
 * Renders one trick (a set of cards from each player, and a crown over the
 * winning player's cards).
 */
export class Trick extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { trick, myPlayerId, playerIds, cardsById } = this.props;
        if (isMobile) {
          return (
              <span className="trick">
                  {trick.plays.map(({ playerId, cardIds }) => {
                      return <PlayerArea
                          key={`playerArea${playerId}`}
                          myPlayerId={myPlayerId}
                          playerIds={playerIds}
                          playerId={playerId}
                          distance={0.2}
                      >
                          <Cards
                              cardIds={cardIds}
                              cardsById={cardsById}
                              faceUp={true}
                              adaptive={isMobile}
                              large={false}
                          />
                          {playerId === trick.winningPlayerId ? <span className="winner_mobile" /> : undefined}
                      </PlayerArea>
                  })}
              </span>
          );
        }
        return (
            <span className="trick">
                {trick.plays.map(({ playerId, cardIds }) => {
                    return <PlayerArea
                        key={`playerArea${playerId}`}
                        myPlayerId={myPlayerId}
                        playerIds={playerIds}
                        playerId={playerId}
                        distance={0.2}
                    >
                        <Cards
                            cardIds={cardIds}
                            cardsById={cardsById}
                            faceUp={true}
                            adaptive={isMobile}
                            large={false}
                        />
                        {playerId === trick.winningPlayerId ? <span className="winner" /> : undefined}
                    </PlayerArea>
                })}
            </span>
        );
    }
}
