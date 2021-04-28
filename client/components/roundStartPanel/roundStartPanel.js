import * as React from 'react';
import { VALUES, PLUS } from '../../lib/cards';
import './roundStartPanel.css';
import {isMobile0} from '../../views/room';

/**
 * The panel shown right before the first round starts, and between rounds.
 *
 * Shows the list of players, and game properties (e.g. number of decks).
 *
 * Allows the players to change the player order, and game properties, then
 * start the game.
 */
export class RoundStartPanel extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            inputMyName: '',
            isMyNameEditable: false,
        }
    }

    // [EditByRan] Implement must-play-rank feature.
    // [EditByRan] Implement the "Chao-Di-Pi" feature.
    // [EditByRan] Implement the ban-take-back feature.
    // [EditByRan] Allow PC users to use mobile UI.
    render() {
        const {
            aiControllers,
            humanControllers,
            playerNames,
            playerReadyForPlay,
            myPlayerId,
            isEditingPlayers,
            localName,
            playerIds,
            numDecks,
            findAFriend,
            mustPlay5,
            mustPlay10,
            mustPlayK,
            chaoDiPi,
            banTB,
            mobileUI,
            playerRankScores,
            playerRankCycles,
            winningPlayerIds,
            setPlayerOrder, // PlayerId[] => void
            setPlayerScore, // (PlayerId, boolean) => void
            removePlayer, // playerId => void
            setGameConfiguration, // { numDecks, findAFriend } => void
            setMobileUI,
            addAi,
            setReadyForPlay, // boolean => void
        } = this.props;
        const { isMyNameEditable } = this.state;

        if (playerIds.length === 0) {
            return null;
        }
        if (!localName) {
            return (
                <div className='round_start_panel_small'>
                    <span>Enter your name: </span>
                    {this.renderNameInput()}
                </div>
            );
        }

        const iAmReadyForPlay = playerReadyForPlay[myPlayerId];
        const numPlayersReadyForPlay = Object.values(playerReadyForPlay).filter(ready => ready).length;
        const playersNotReadyForPlay = Object.entries(playerReadyForPlay)
            .filter(([_playerId, ready]) => !ready)
            .map(([playerId, _ready]) => playerNames[playerId]);
        return (
            <div className='round_start_panel'>
                <div className='title'>{'Tractor'}</div>
                <ul>
                    {playerIds.map((playerId) => {
                        const children = [];
                        if (isEditingPlayers) {
                            if (playerIds.indexOf(playerId) !== 0) {
                                children.push(<span
                                    key="player_arrow_up"
                                    className='arrow up'
                                    onClick={() => {
                                        const index = playerIds.indexOf(playerId);
                                        [playerIds[index], playerIds[index - 1]] =
                                            [playerIds[index - 1], playerIds[index]];
                                        setPlayerOrder(playerIds);
                                    }} />);
                            }
                            if (playerIds.indexOf(playerId) !== playerIds.length - 1) {
                                children.push(<span
                                    key="player_arrow_down"
                                    className='arrow down'
                                    onClick={() => {
                                        const index = playerIds.indexOf(playerId);
                                        [playerIds[index], playerIds[index + 1]] =
                                            [playerIds[index + 1], playerIds[index]];
                                        setPlayerOrder(playerIds);
                                    }} />);
                            }
                        }
                        if (playerId === myPlayerId && isMyNameEditable) {
                            children.push(this.renderNameInput());
                        } else {
                            children.push(playerNames[playerId]);
                        }
                        if (playerId === myPlayerId && !isMyNameEditable) {
                            children.push(<a
                                key="edit_name"
                                className='edit_name'
                                onClick={() => {
                                    this.setState({ isMyNameEditable: true, inputMyName: playerNames[myPlayerId] });
                                }}
                            />);
                        }

                        children.push(` (rank ${VALUES[playerRankScores[playerId]]}${PLUS[playerRankCycles[playerId]]})`);
                        if (isEditingPlayers) {
                            children.push(<span key='spacing' className='spacing' />);
                            if (playerRankScores[playerId] !== 'ACE') {
                                children.push(<span
                                    key='score_arrow_up'
                                    className='arrow up'
                                    onClick={() => setPlayerScore(playerId, true)}
                                />);
                            }
                            if (playerRankScores[playerId] !== 'TWO') {
                                children.push(<span
                                    key='score_arrow_down'
                                    className='arrow down'
                                    onClick={() => setPlayerScore(playerId, false)}
                                />);
                            }
                        }

                        if (playerId === myPlayerId) {
                            children.push(<span key="me" className='me'> (YOU)</span>);
                        }
                        if (aiControllers.indexOf(playerId) >= 0) {
                            children.push(<span key={`ai${playerId}`}> (AI)</span>);
                        }
                        if (winningPlayerIds.indexOf(playerId) >= 0) {
                            children.push(<span key={`crown${playerId}`} className='crown' />);
                        }
                        if (humanControllers.indexOf(playerId) === -1) {
                            children.push(<span
                                key={`remove${playerId}`}
                                className='remove'
                                onClick={() => removePlayer(playerId)}
                            />);
                        }
                        return <li key={playerId}>{children}</li>;
                    })}
                    <div className='add_ai_button' onClick={addAi}>{"+ Add AI player"}</div>
                </ul>
                <div className='game_properties'>
                    <div>
                        <i
                            className={numDecks < 10 ? 'arrow up' : 'hidden'}
                            onClick={() => setGameConfiguration({ numDecks: numDecks + 1, findAFriend, mustPlay5, mustPlay10, mustPlayK, chaoDiPi, banTB })}
                        />
                        <i
                            className={numDecks > 1 ? 'arrow down' : 'hidden'}
                            onClick={() => setGameConfiguration({ numDecks: numDecks - 1, findAFriend, mustPlay5, mustPlay10, mustPlayK, chaoDiPi, banTB })}
                        />
                        {`${numDecks} ${numDecks > 1 ? 'decks' : 'deck'}`}
                    </div>
                    <div className={playerIds.length >= 4 ? '' : 'hidden'}>
                        <input
                            type="checkbox"
                            checked={findAFriend}
                            onChange={() => setGameConfiguration({ numDecks, findAFriend: !findAFriend, mustPlay5, mustPlay10, mustPlayK, chaoDiPi, banTB })}
                        />
                        {"Find-a-friend"}
                        <input
                            type="checkbox"
                            checked={chaoDiPi}
                            onChange={() => setGameConfiguration({ numDecks, findAFriend, mustPlay5, mustPlay10, mustPlayK, chaoDiPi: !chaoDiPi, banTB })}
                        />
                        {"Chao-Di-Pi"}
                        <input
                            type="checkbox"
                            checked={banTB}
                            onChange={() => setGameConfiguration({ numDecks, findAFriend, mustPlay5, mustPlay10, mustPlayK, chaoDiPi, banTB: !banTB })}
                        />
                        {"Ban take-back"}
                    </div>
                    <div>
                        <input
                            type="checkbox"
                            checked={mustPlay5}
                            onChange={() => setGameConfiguration({ numDecks, findAFriend, mustPlay5: !mustPlay5, mustPlay10, mustPlayK, chaoDiPi, banTB })}
                        />
                        {"Must play rank 5 "}
                        <input
                            type="checkbox"
                            checked={mustPlay10}
                            onChange={() => setGameConfiguration({ numDecks, findAFriend, mustPlay5, mustPlay10: !mustPlay10, mustPlayK, chaoDiPi, banTB })}
                        />
                        {"rank 10 "}
                        <input
                            type="checkbox"
                            checked={mustPlayK}
                            onChange={() => setGameConfiguration({ numDecks, findAFriend, mustPlay5, mustPlay10, mustPlayK: !mustPlayK, chaoDiPi, banTB })}
                        />
                        {" rank K"}
                    </div>
                    <div className={!isMobile0 ? '' : 'hidden'}>
                        <input
                            type="checkbox"
                            checked={mobileUI}
                            onChange={() => setMobileUI(!mobileUI)}
                        />
                        {"Mobile UI"}
                    </div>
                </div>
                <div
                    className={iAmReadyForPlay ?
                        'button primary clicked start_game_button' :
                        'button primary start_game_button'}
                    onClick={() => setReadyForPlay(!iAmReadyForPlay)}
                    title={`Waiting on ${playersNotReadyForPlay.join(', ')}`}
                >
                    {`${iAmReadyForPlay ? 'Ready' : 'Start round'} (${numPlayersReadyForPlay}/${humanControllers.length})`}
                </div>
            </div>
        );
    }

    renderNameInput() {
        const { setName } = this.props;
        const { inputMyName } = this.state;
        const setNameFunc = () => {
            this.setState({ isMyNameEditable: false });
            setName(inputMyName.slice(0, 20));
        }
        return <input
            ref={e => e && e.focus()}
            key="edit_name_input"
            type='text'
            value={inputMyName}
            onChange={e => this.setState({ inputMyName: e.target.value })}
            onKeyDown={e => e.which === 13 /* enter key */ && setNameFunc()}
            onBlur={setNameFunc}
        />;
    }
}
