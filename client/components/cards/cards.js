import * as React from 'react';
import {getCardImageSrc, getFaceDownCardImageSrc} from '../../lib/cardImages';
// [EditByRan] device-specific rendering
import {isMobile} from '../../views/room';

/**
 * Renders one or more cards.
 */
export class Cards extends React.Component {

    render() {
        const {
            cardIds,
            selectedCardIds,
            cardsById,
            faceUp, // boolean
            selectCards, // cardId -> void
            adaptive = false,
            ...otherProps
        } = this.props;

        // [EditByRan] device-specific rendering
        var WIDTH = 1200;
        var CARD_WIDTH = isMobile? 142 : 71;
        var interCardDistance = isMobile ? (faceUp ? 29 : 18) : (faceUp ? 15 : 9);
        if (isMobile && adaptive){
          if (cardIds.length - 1 > 25) {  // Allow overlapping to button if too many cards
            interCardDistance = Math.floor((WIDTH-30-CARD_WIDTH)/(cardIds.length - 1));
            interCardDistance = Math.min(interCardDistance, 70);
          } else { // Disallow overlapping to button within 25 cards
            interCardDistance = Math.floor((WIDTH-250-CARD_WIDTH)/(cardIds.length - 1));
            interCardDistance = Math.min(interCardDistance, 70);
          }
        }
        const totalWidth = CARD_WIDTH + interCardDistance * (cardIds.length - 1);
        const cardImgs = cardIds
            .map((cardId, index) => {
                const x = -totalWidth / 2 + interCardDistance * index;
                const y = selectedCardIds && selectedCardIds[cardId] ? -20 : 0;
                const src = faceUp ?
                    getCardImageSrc(cardsById[cardId]) : getFaceDownCardImageSrc();
                const onClick = selectCards ? () => selectCards(cardId) : undefined;
                return (
                    <img
                        key={cardId}
                        style={
                            {
                                position: 'absolute',
                                top: `${y}px`,
                                left: `${x}px`,
                            }
                        }
                        src={src}
                        onClick={onClick}
                    />
                );
            });
        return <div {...otherProps}>{cardImgs}</div>;
    }
}
