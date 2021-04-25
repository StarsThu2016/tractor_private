import * as classNames from 'classnames';
import * as React from 'react';
import './actionButton.css';

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
