import * as classNames from 'classnames';
import * as React from 'react';
import './actionButton.css';
// [EditByRan] device-specific rendering
import {isMobile} from '../../views/room';

/**
 * An opinionated button that takes game-related modes as props instead of generic classes.
 */
export class ActionButton extends React.Component {

    render() {
        const {
            text,
            clicked,
            onClick,
            title,
        } = this.props;

        // [EditByRan] device-specific rendering
        if (isMobile){
          return <div
              className={classNames('action_button', 'button', onClick ? 'primary' : 'disabled', { 'clicked': clicked })}
              style={
                {
                  width: '94px',
                  height: '40px',
                  right: '20px',
                  bottom: '232px',
                  'border-radius': '20px',
                }
              }
              onClick={onClick}
              title={title}
          >
              {text}
          </div>;
        } else {
          return <div
              className={classNames('action_button', 'button', onClick ? 'primary' : 'disabled', { 'clicked': clicked })}
              style={
                {
                  width: '120px',
                  left: '50%',
                  top: '745px',
                  'margin-left': '-73px',
                }
              }
              onClick={onClick}
              title={title}
          >
              {text}
          </div>;
        }

    }
}
