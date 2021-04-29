import * as React from 'react';
import { ConfirmationPanel } from '../confirmationPanel';
import './settingsPanel.css';
// [EditByRan] device-specific rendering
import {isMobile} from '../../views/room';

/**
 * Contains per-player game settings.
 */
export class SettingsPanel extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isConfirmingForfeit: false,
            isConfirmingLeave: false,
        }
    }

    // [EditByRan] Implement the ban-take-back feature.
    render() {
        const {
            myPlayerId,
            soundVolume,
            playerIds,
            status,
            currentTrick,
            banTB,
            forfeit, // () => void
            leaveRoom, // () => void
            setSoundVolume, // soundVolume => void
            toggleEditPlayers, // () => void
            takeBack, // () => void
        } = this.props;
        if (isMobile) {
          return (
              <div className='settings_panel'>
                  {this.maybeRenderConfirm(forfeit, leaveRoom)}
                  {this.renderLeaveRoomOrForfeitButton(myPlayerId, playerIds, status)}
                  <div
                      className={`button sound_mobile sound${soundVolume}`}
                      onClick={() => setSoundVolume((soundVolume + 1) % 4)}
                      title={"Sound volume"}
                  />
                  {this.maybeRenderEditPlayersButton(status, toggleEditPlayers)}
                  {this.maybeRenderTakeBackButton(currentTrick, myPlayerId, banTB, takeBack)}
              </div>
          );
        }
        return (
            <div className='settings_panel'>
                {this.maybeRenderConfirm(forfeit, leaveRoom)}
                {this.renderLeaveRoomOrForfeitButton(myPlayerId, playerIds, status)}
                <div
                    className={`button sound sound${soundVolume}`}
                    onClick={() => setSoundVolume((soundVolume + 1) % 4)}
                    title={"Sound volume"}
                />
                {this.maybeRenderEditPlayersButton(status, toggleEditPlayers)}
                {this.maybeRenderTakeBackButton(currentTrick, myPlayerId, banTB, takeBack)}
            </div>
        );
    }

    maybeRenderConfirm(forfeit, leaveRoom) {
        const { isConfirmingForfeit, isConfirmingLeave } = this.state;
        if (isConfirmingForfeit) {
            return <ConfirmationPanel
                message='Are you sure you want to forfeit?'
                is_tall_panel={false}
                confirm={() => {
                    forfeit();
                    this.setState({ isConfirmingForfeit: false });
                }}
                cancel={() => this.setState({ isConfirmingForfeit: false })}
            />
        } else if (isConfirmingLeave) {
            return <ConfirmationPanel
                message='Are you sure you want to leave?'
                is_tall_panel={false}
                confirm={() => {
                    leaveRoom();
                    this.setState({ isConfirmingLeave: false });
                }}
                cancel={() => this.setState({ isConfirmingLeave: false })}
            />
        }
    }

    renderLeaveRoomOrForfeitButton(myPlayerId, playerIds, status) {
        const { isConfirmingForfeit, isConfirmingLeave } = this.state;
        if (isMobile) {
          if (status === 'START_ROUND' || playerIds.indexOf(myPlayerId) === -1) {
              return <div
                  className='button leave_room_mobile'
                  onClick={() => this.setState({ isConfirmingLeave: !isConfirmingLeave })}
                  title={"Sound volume"}
              />;
          } else {
              return <div
                  className='button forfeit_mobile'
                  onClick={() => this.setState({ isConfirmingForfeit: !isConfirmingForfeit })}
                  title={"Forfeit"}
              />;
          }
        }
        if (status === 'START_ROUND' || playerIds.indexOf(myPlayerId) === -1) {
            return <div
                className='button leave_room'
                onClick={() => this.setState({ isConfirmingLeave: !isConfirmingLeave })}
                title={"Sound volume"}
            />;
        } else {
            return <div
                className='button forfeit'
                onClick={() => this.setState({ isConfirmingForfeit: !isConfirmingForfeit })}
                title={"Forfeit"}
            />;
        }
    }

    maybeRenderEditPlayersButton(status, toggleEditPlayers) {
        if (status !== 'START_ROUND') {
            return;
        }
        if (isMobile) {
          return <div
              className='button edit_players_mobile'
              onClick={toggleEditPlayers}
              title={"Edit players"}
          />;
        }
        return <div
            className='button edit_players'
            onClick={toggleEditPlayers}
            title={"Edit players"}
        />;
    }

    maybeRenderTakeBackButton(currentTrick, myPlayerId, banTB, takeBack) {
        if (status === 'START_ROUND' || !currentTrick || banTB) {
            return;
        }
        const { plays } = currentTrick;
        if (isMobile) {
          if (plays.length > 0 && plays[plays.length - 1].playerId === myPlayerId) {
              return <div
                  className='button undo_mobile'
                  onClick={takeBack}
                  title={"Undo"}
              />;
          }
        }
        if (plays.length > 0 && plays[plays.length - 1].playerId === myPlayerId) {
            return <div
                className='button undo'
                onClick={takeBack}
                title={"Undo"}
            />;
        }
    }
}
