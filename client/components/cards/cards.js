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
            large = false,
            ...otherProps
        } = this.props;

        // [EditByRan] device-specific rendering
        var WIDTH = 1200;
        var CARD_WIDTH = (isMobile && adaptive && large)? 142 : ((isMobile && adaptive) ? 106 : 71);
        var interCardDistance = (isMobile && adaptive) ? (faceUp ? 23 : 13) : (faceUp ? 15 : 9);
        if (isMobile && adaptive && large){
          interCardDistance = Math.floor((WIDTH-20-CARD_WIDTH)/(cardIds.length - 1));
          interCardDistance = Math.min(interCardDistance, 70);
        }
        var narrow = (cardIds.length >= 34);
        const totalWidth = CARD_WIDTH + interCardDistance * (cardIds.length - 1);
        const cardImgs = cardIds
            .map((cardId, index) => {
                const x = -totalWidth / 2 + interCardDistance * index;
                const y = selectedCardIds && selectedCardIds[cardId] ? -20 : 0;

                const src = faceUp ?
                    getCardImageSrc(cardsById[cardId], adaptive, large, narrow) : getFaceDownCardImageSrc(adaptive, large);
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
