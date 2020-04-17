import PropTypes from 'prop-types';
import * as React from 'react';
import {WIDTH, HEIGHT} from './views/room';

/*
 * Renders the given children in front of the given player (under the correct
 * orientation). The distance is a number from 0 (in the middle) to 1 (very
 * close to the player)
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
      playerIds,
      playerId,
      myId,
      distance,
      shiftX = 0,
      isText,
      children,
    } = this.props;
    const {textWidth} = this.state;
    const playerIndex = playerIds.indexOf(playerId);
    const myIndex = playerIds.indexOf(myId);
    const centerPoint = {
      x: WIDTH * (.5 + Math.sin((playerIndex - myIndex) * 2 *
        Math.PI / playerIds.length) * distance / 2 * 0.9),
      y: HEIGHT * (.5 + Math.cos((playerIndex - myIndex) * 2 *
        Math.PI / playerIds.length) * distance / 2),
    };
    let angle = (myIndex - playerIndex) * 360. / playerIds.length;
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
        className='player_container my_area'
        style={{
          top: centerPoint.y,
          left: centerPoint.x + shiftX,
          transform,
          zIndex: playerId === myId ? 1 : 0,
        }}
        ref={ref}
      >
        {children}
      </div>
    );
  }
}

PlayerArea.propTypes = {
  playerIds: PropTypes.array,
  playerId: PropTypes.string,
  myId: PropTypes.string,
  distance: PropTypes.number,
  isText: PropTypes.bool,
  children: PropTypes.any,
};