import * as React from 'react';
import './confirmationPanel.css';

// [EditByRan]: device-specific rendering
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

export class ConfirmationPanel extends React.Component {

    render() {
        const {
            message, // string
            confirm, // () -> void
            cancel, // () -> void
        } = this.props;

        // [EditByRan]: device-specific rendering
        if (isMobile) {
          return (
              <div className='confirmation_panel_mobile'>
                  {message}
                  <div>
                      <button
                          onClick={confirm}
                      >
                          {'Confirm'}
                      </button>
                      <button
                          onClick={cancel}
                      >
                          {'Cancel'}
                      </button>
                  </div>
              </div>
          );
        }
        return (
            <div className='confirmation_panel'>
                {message}
                <div>
                    <button
                        onClick={confirm}
                    >
                        {'Confirm'}
                    </button>
                    <button
                        onClick={cancel}
                    >
                        {'Cancel'}
                    </button>
                </div>
            </div>
        );
    }
}
