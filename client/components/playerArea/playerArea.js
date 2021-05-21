import * as classNames from 'classnames';
import PropTypes from 'prop-types';
import * as React from 'react';
import './playerArea.css';

// dimensions of game area
export const WIDTH = 1200;
export const HEIGHT = 800;

// [EditByRan] device-specific rendering
import {isMobile} from '../../views/room';

/*
 * A higher order component that takes the given children and applies a rotation
 * to it so that the children appear in front of a particular player.
 * 
 * Specify a distance from the center, normalized from 0 (in the middle) to 1
 * (very close to the player).
 * 
 * If isText=true, then the text may be rotated an extra 180° so that it faces
 * the player.
 * 
 * The children can also be shifted left or right (from the player's
 * perspective) using shiftX.
 */
export class PlayerArea extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      textWidth: undefined,
    };
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillUpdate(prevProps) {
    if (prevProps.children !== this.props.children) {
      this.setState({textWidth: undefined});
    }
  }

  render() {
    const {
      myPlayerId,
      playerIds,
      playerId,
      distance,
      shiftX = 0,
      isText,
      children,
    } = this.props;
    const {textWidth} = this.state;
    const playerIndex = playerIds.indexOf(playerId);
    const myIndex = playerIds.indexOf(myPlayerId);

    var CARD_HEIGHT = 192;
    var CARD_WIDTH = 142;
    var CARD_HEIGHT_S = 143;
    var CARD_WIDTH_S = 106;
    var centerPoint = {x: 0, y: 0};
    var angle = (myIndex - playerIndex) * 360. / playerIds.length;
    var shiftX0 = 0;
    if (isMobile && playerIds.length >= 4 && playerIds.length <= 6) {
      // 4p: [-1, 0, 1, 2], 5p: [-1, 0, 1, 2, 3], 6p: [-1, 0, 1, 2, 3, 4]
      var diff_index = (playerIndex-myIndex >= -1) ? (playerIndex - myIndex) : (playerIndex + playerIds.length - myIndex);
      if (diff_index >= playerIds.length - 1 && playerIds.length > 1) {
        diff_index = diff_index - playerIds.length;
      }

      if (distance === 1.8 && diff_index === 0){
        // my name
        centerPoint = {x: WIDTH/2, y: HEIGHT - 40};
      } else if (distance === 1.1 && (diff_index === 1 || diff_index === -1)){
        // side names: do not place too wide
        centerPoint = {
          x: WIDTH/2 + diff_index * (WIDTH / 2 - 20 - 162),
          y: HEIGHT - (10 + CARD_HEIGHT_S + 20 + CARD_HEIGHT + 40),
        };
      } else if (distance === 1.1) {
        // opposite name
        centerPoint = {
          x: WIDTH/2,
          y: HEIGHT - (40 + CARD_HEIGHT_S + 20 + CARD_HEIGHT_S + 20 + CARD_HEIGHT + 40),
        };
      } else if (distance === 1){
        // my hands (others' hands won't be rendered)
        centerPoint = {
          x: WIDTH/2,
          y: HEIGHT - (CARD_HEIGHT + 40),
        };
      } else if (distance === 0.2 && diff_index === 0){
        // my trick/decalre/expose card
        centerPoint = {
          x: WIDTH/2,
          y: HEIGHT - (CARD_HEIGHT_S + 20 + CARD_HEIGHT + 40),
        };
      } else if (distance === 0.2 && (diff_index === 1 || diff_index === -1)){
        // side trick/decalre/expose card
        centerPoint = {
          x: WIDTH/2 + diff_index * (WIDTH / 2 - 40 - CARD_HEIGHT_S - 162),
          y: HEIGHT - (10 + CARD_HEIGHT_S + 20 + CARD_HEIGHT + 40),
        };
      } else if (distance === 0.2){
        // opposite trick/decalre/expose card
        centerPoint = {
          x: WIDTH/2,
          y: HEIGHT - (20 + CARD_HEIGHT_S + 20 + CARD_HEIGHT + 40),
        };
      }
      angle = (diff_index<=1) ? (-diff_index) * 360. / 4 : 180;
      if (playerIds.length === 5 && diff_index === 2) {
        shiftX0 = 112;
      } else if (playerIds.length === 5 && diff_index === 3) {
        shiftX0 = -112;
      } else if (playerIds.length === 6 && diff_index === 2) {
        shiftX0 = 168;
      }  else if (playerIds.length === 6 && diff_index === 4) {
        shiftX0 = -168;
      }
    } else {
      centerPoint = {
        x: WIDTH * (.5 + Math.sin((playerIndex - myIndex) * 2 *
          Math.PI / playerIds.length) * distance / 2 * 0.9),
        y: HEIGHT * (.5 + Math.cos((playerIndex - myIndex) * 2 *
          Math.PI / playerIds.length) * distance / 2),
      };
    }

    if (isText) {
    // ensure text is always facing the player by possibly rotating 180 degrees
      if (angle < 0) {
        angle += 360;
      }
      if (angle > 90 && angle < 270) {
        angle -= 180;
      }
    }
    let transform = `rotate(${angle}deg)`;
    let ref = undefined;
    if (isText) {
      // In the first loop, render the text anywhere and compute its width from
      // the ref. In subsequent renders, the transform will be correct, so we
      // can remove the ref (and avoid an infinite loop).
      if (textWidth) {
        transform = `translate(-${textWidth / 2}px) ` + transform;
      } else {
        ref = (el) => {
          if (el) {
            this.setState({textWidth: el.clientWidth});
          }
        };
      }
    }
    return (
      <div
        key={playerId}
        className={classNames('player_area', { 'my_area': playerId === myPlayerId })}
        style={{
          top: centerPoint.y,
          left: centerPoint.x + (isMobile? shiftX0 : shiftX),
          transform,
        }}
        ref={ref}
      >
        {children}
      </div>
    );
  }
}

PlayerArea.propTypes = {
  myPlayerId: PropTypes.string,
  playerIds: PropTypes.array,
  playerId: PropTypes.string,
  distance: PropTypes.number,
  isText: PropTypes.bool,
  children: PropTypes.any,
};
