import * as React from 'react';
import './confirmationPanel.css';
// [EditByRan] device-specific rendering
import {isMobile} from '../../views/room';

export class ConfirmationPanel extends React.Component {

    render() {
        const {
            message, // string
            is_tall_panel = false,
            confirm, // () -> void
            cancel, // () -> void
        } = this.props;

        // [EditByRan] device-specific rendering
        // if is_tall_panel: subtract 96px from bottom 385px
        // else: subtract 60px from bottom 385px
        if (isMobile) {
          var bottom_value = is_tall_panel ? '289px' : '325px';
          console.log(bottom_value);
          return (
              <div className='confirmation_panel_mobile'
                   style={
                       {
                         bottom: `${bottom_value}`,
                       }
                   }
              >
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
