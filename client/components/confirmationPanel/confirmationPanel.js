import * as React from 'react';
import './confirmationPanel.css';
// [EditByRan] device-specific rendering
import {isMobile} from '../../views/room';

export class ConfirmationPanel extends React.Component {

    render() {
        const {
            message, // string
            confirm, // () -> void
            cancel, // () -> void
        } = this.props;

        // [EditByRan] device-specific rendering
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
