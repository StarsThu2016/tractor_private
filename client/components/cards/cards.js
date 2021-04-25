import * as React from 'react';
import {getCardImageSrc, getFaceDownCardImageSrc} from '../../lib/cardImages';

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
const CARD_WIDTH = isMobile? 142 : 71;

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
            ...otherProps
        } = this.props;

        // [EditByRan] device-specific rendering
        var interCardDistance = isMobile ? (faceUp ? 29 : 18) : (faceUp ? 15 : 9);
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
