import * as React from 'react';
import { Cards } from '../cards';
import { HoverButton } from '../hoverButton/hoverButton';
import './kitty.css';

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
var isTablet = (isIPad || (isMobile && !isSmallScreen));
isMobile = isMobile || isTablet;

/**
 * Render a "view kitty button" (if you have access to it), and if hovering
 * over it, renders the kitty cards.
 */
export class Kitty extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showKitty: false,
        };
    }

    render() {
        const {
            myPlayerId,
            playerIds,
            kittyOwnerIndex,
            status,
            cardsById,
            kitty,
        } = this.props;

        if (status !== 'START_ROUND' && playerIds[kittyOwnerIndex] !== myPlayerId) {
            return null;
        }
        if (!kitty || kitty.length === 0) {
            return null;
        }
        return <div className='kitty'>
            {this.renderKittyCards(cardsById, kitty)}
            {this.renderViewKittyButton()}
        </div>
    }

    renderViewKittyButton() {
        // [EditByRan] device-specific rendering
        if (isMobile) {
          return <HoverButton
              className='view_kitty_button_mobile'
              onHoverStart={() => this.setState({ showKitty: true })}
              onHoverEnd={() => this.setState({ showKitty: false })}
          />;
        }
        return <HoverButton
            className='view_kitty_button'
            onHoverStart={() => this.setState({ showKitty: true })}
            onHoverEnd={() => this.setState({ showKitty: false })}
        />;
    }

    renderKittyCards(cardsById, kitty) {
        const { showKitty } = this.state;

        if (showKitty) {
          if (isMobile) {
            return <Cards
                className='kitty_cards_mobile'
                cardIds={kitty}
                cardsById={cardsById}
                faceUp={true}
            />;
          }
          return <Cards
              className='kitty_cards'
              cardIds={kitty}
              cardsById={cardsById}
              faceUp={true}
          />;
        }
    }
}
