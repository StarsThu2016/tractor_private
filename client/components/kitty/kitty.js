import * as React from 'react';
import { Cards } from '../cards';
import { HoverButton } from '../hoverButton/hoverButton';
import './kitty.css';
// [EditByRan] device-specific rendering
import {isMobile} from '../../views/room';

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
                adaptive={isMobile}
                large={false}
            />;
          }
          return <Cards
              className='kitty_cards'
              cardIds={kitty}
              cardsById={cardsById}
              faceUp={true}
              adaptive={isMobile}
              large={false}
          />;
        }
    }
}
