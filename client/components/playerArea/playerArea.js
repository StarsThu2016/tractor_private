import * as classNames from 'classnames';
import PropTypes from 'prop-types';
import * as React from 'react';
import './playerArea.css';

// dimensions of game area
export const WIDTH = 1200;
export const HEIGHT = 800;

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

    var centerPoint = {x: 0, y: 0};
    var angle = (myIndex - playerIndex) * 360. / playerIds.length;
    var shiftX0 = shiftX;
    if (isMobile) {
      var distance0 = distance;
      // 4p: [-1, 0, 1, 2], 5p: [-1, 0, 1, 2, 3], 6p: [-1, 0, 1, 2, 3, 4]
      var diff_index = (playerIndex-myIndex >= -1) ? (playerIndex - myIndex) : (playerIndex + playerIds.length - myIndex);
      if (diff_index >= playerIds.length - 1 && playerIds.length > 1) {
        diff_index = diff_index - playerIds.length;
      }
      if (distance === 1.8 && diff_index === 0){
        // my name
        distance0 === 1.8;
      } else if (distance === 1.1 && (diff_index === 1 || diff_index === -1)){
        // side names: do not place too wide
        distance0 = 1.0;
      } else if (distance === 1.1) {
        // opposite name
        distance0 === 1.05;
      } else if (distance === 1){
        // my hands (others' hands won't be rendered)
        distance0 = 1;
      } else if (distance === 0.2 && diff_index === 0){
        // my trick/decalre/expose card
        distance0 = 0.22;
      } else if (distance === 0.2 && (diff_index === 1 || diff_index === -1)){
        // my trick/decalre/expose card
        distance0 = 0.64;
      } else if (distance === 0.2){
        // opposite trick/decalre/expose card
        distance0 = 0.22;
      }
      var playerIds_length = 4;
      if (diff_index === 0) {
        angle = 0;
      } else if (diff_index === 1 || diff_index === -1) {
        angle = (-diff_index) * 360. / playerIds_length;
      } else {
        angle = 2 * 360. / playerIds_length;
      }
      if (playerIds.length === 5 && diff_index === 2) {
        shiftX0 = 170;
        centerPoint = {
          x: 25 + (WIDTH - 50) * (0.5 + 0.5 * Math.sin((2) * 2 * Math.PI / playerIds_length) * distance0),
          y: 25 + (HEIGHT - 285) * (0.5 + 0.5 * Math.cos((2) * 2 * Math.PI / playerIds_length) * distance0),
        };
      } else if (playerIds.length === 5 && diff_index === 3) {
        shiftX0 = -170;
        centerPoint = {
          x: 25 + (WIDTH - 50) * (0.5 + 0.5 * Math.sin((2) * 2 * Math.PI / playerIds_length) * distance0),
          y: 25 + (HEIGHT - 285) * (0.5 + 0.5 * Math.cos((2) * 2 * Math.PI / playerIds_length) * distance0),
        };
      } else if (playerIds.length === 6 && diff_index === 2) {
        shiftX0 = 250;
        centerPoint = {
          x: 25 + (WIDTH - 50) * (0.5 + 0.5 * Math.sin((2) * 2 * Math.PI / playerIds_length) * distance0),
          y: 25 + (HEIGHT - 285) * (0.5 + 0.5 * Math.cos((2) * 2 * Math.PI / playerIds_length) * distance0),
        };
      } else if (playerIds.length === 6 && diff_index === 3) {
        shiftX0 = 0;
        centerPoint = {
          x: 25 + (WIDTH - 50) * (0.5 + 0.5 * Math.sin((2) * 2 * Math.PI / playerIds_length) * distance0),
          y: 25 + (HEIGHT - 285) * (0.5 + 0.5 * Math.cos((2) * 2 * Math.PI / playerIds_length) * distance0),
        };
      } else if (playerIds.length === 6 && diff_index === 4) {
        shiftX0 = -250;
        centerPoint = {
          x: 25 + (WIDTH - 50) * (0.5 + 0.5 * Math.sin((2) * 2 * Math.PI / playerIds_length) * distance0),
          y: 25 + (HEIGHT - 285) * (0.5 + 0.5 * Math.cos((2) * 2 * Math.PI / playerIds_length) * distance0),
        };
      } else {
        shiftX0 = 0;
        centerPoint = {
          x: 25 + (WIDTH - 50) * (0.5 + 0.5 * Math.sin(diff_index * 2 * Math.PI / playerIds_length) * distance0),
          y: 25 + (HEIGHT - 285) * (0.5 + 0.5 * Math.cos(diff_index * 2 * Math.PI / playerIds_length) * distance0),
        };
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
