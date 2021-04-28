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
                  width: '90px',
                  right: '10px',
                  bottom: '10px',
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
