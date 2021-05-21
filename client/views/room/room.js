import PropTypes from 'prop-types';
import * as React from 'react';
import { getAudio } from '../../lib/audio';
import { preloadCardImages } from '../../lib/cardImages';
import {setUpConnection} from '../../lib/connection';
import './room.css';

import {
  ActionButton,
  Cards,
  ConfirmationPanel,
  FindAFriendPanel,
  GameInfoPanel,
  HoverButton,
  Kitty,
  PlayerArea,
  PlayerNametag,
  RejoinPanel,
  RoundInfoPanel,
  RoundStartPanel,
  SettingsPanel,
  Trick,
} from '../../components';
import { SUITS } from '../../lib/cards';

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
export var isMobile0 = (isIPad || isIOS || isAndroid || isNewBlackBerry || isWebOS || isWindowsMobile || isUnknownMobile);
export var isMobile = isMobile0;
// var isTablet = (isIPad || (isMobile && !isSmallScreen));

export class Room extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // room state (same as server)
      humanControllers: [], // PlayerId[]
      aiControllers: [], // PlayerId[]
      playerNames: {}, // {playerId: playerName}
      playerReadyForPlay: {}, // {playerId: boolean}
      myPlayerId: undefined, // PlayerId

      // local state
      selectedCardIds: {}, // {cardId: boolean}
      notifications: {},
      showPreviousTrick: false,
      confirmSpecialPlayCards: undefined, // CardId[]?
      soundVolume: 0, // 0, 1, 2, or 3
      isEditingPlayers: false, // boolean
      localName: undefined, // string
      // [EditByRan] Allow PC users to use mobile UI.
      mobileUI: false,

      // game state (same as server)
      playerIds: [], // PlayerId[]
      numDecks: 2, // integer
      findAFriend: false, // boolean
      // [EditByRan] Implement the must-play-rank feature.
      // [EditByRan] Implement the "Chao-Di-Pi" feature.
      // [EditByRan] Implement the ban-take-back feature.
      mustPlay5: false, // boolean
      mustPlay10: false, // boolean
      mustPlayK: false, // boolean
      chaoDiPi: false,  // boolean
      banTB: false,  // boolean
      kittyOwnerIndex: undefined, // integer
      kittySize: 8, // integer
      roundNumber: undefined, // integer
      starterPlayerIndex: undefined, // integer
      playerRankScores: {}, // {playerId: cardValue}
      playerRankCycles: {}, // {playerId: integer}
      winningPlayerIds: [], // PlayerId[]
      status: 'START_ROUND', // GameStatus
      currentPlayerIndex: undefined, // integer
      isDeclaringTeam: undefined, // {playerId: boolean}
      deck: undefined, // cardId[]
      cardsById: undefined, // {cardId: Card}
      playerHands: undefined, // {playerId: cardId[]}
      declaredCards: undefined, // Play[]
      exposedBottomCards: undefined, // cardId[]
      kitty: undefined, // cardId[]
      findAFriendDeclaration: undefined, // FindAFriendDeclaration
      pastTricks: undefined, // Trick[]
      currentTrick: undefined, // Trick
      currentRoundScores: undefined, // {playerId: integer}
      currentRoundPenalties: undefined, // {playerId: integer}
      currentTrump: undefined, // Card
    };
  }

  componentDidMount() {
    this.audio = getAudio();
    preloadCardImages();
    this.joinRoomWebsocket();
    this.setState({ localName: window.localStorage.getItem('tractor_name') });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.roomCode !== prevProps.roomCode) {
      this.connection.disconnect();
      this.joinRoomWebsocket();
    }
    const {
      aiControllers,
      humanControllers,
      playerNames,
      myPlayerId,
      localName,
      playerIds,
    } = this.state;
    if (!myPlayerId) {
      const unmappedPlayerIds = playerIds
        .filter(playerId => aiControllers.indexOf(playerId) === -1 && humanControllers.indexOf(playerId) === -1);
      if (localName && unmappedPlayerIds.length > 0) {
        this.setState({ myPlayerId: "pending" });
        this.connection.send({
          REJOIN: { playerId: unmappedPlayerIds.filter(playerId => playerNames[playerId] === localName)[0] }
        });
      }
    } else if (myPlayerId !== prevState.myPlayerId || playerNames[myPlayerId] != prevState.playerNames[myPlayerId]) {
      if (localName && playerNames[myPlayerId] !== localName) {
        this.connection.send({ SET_NAME: { name: localName } });
      }
    }
  }

  componentWillUnmount() {
    this.connection.disconnect();
  }

  joinRoomWebsocket() {
    const { roomCode, leaveRoom } = this.props;
    this.setState({ status: 'START_ROUND' });
    this.connection = setUpConnection(
        '/' + roomCode,
        json => {
          const {playerNames, myPlayerId, playerIds, status, cardsById} = this.state;

          if (json.LEAVE_ROOM) {
            leaveRoom();
          } else if (json.ROOM_STATE) {
            this.setState(json.ROOM_STATE);
          } else if (json.REJOIN) {
            this.setState(json.REJOIN);
          } else if (json.UPDATE_PLAYERS) {
            this.setState(json.UPDATE_PLAYERS);
          } else if (json.UPDATE_AIS) {
            this.setState(json.UPDATE_AIS);
          } else if (json.GAME_CONFIGURATION) {
            this.setState(json.GAME_CONFIGURATION);
          } else if (json.START_ROUND) {
            this.setState(json.START_ROUND);
            this.audio.playBackground();
          } else if (json.CARD_INFO) {
            this.setState({cardsById: {
              ...cardsById,
              ...json.CARD_INFO.cardsById,
            }});
          } else if (json.DRAW) {
            this.setState(json.DRAW);
          } else if (json.DECLARE) {
            const { playerId, ...other } = json.DECLARE;
            if (playerId === myPlayerId) {
              this.connection.send({ READY_FOR_PLAY: { ready: true } })
            }
            this.setState(other);
          } else if (json.READY_FOR_PLAY) {
            this.setState(json.READY_FOR_PLAY);
          } else if (json.EXPOSE_BOTTOM_CARDS) {
            this.setNotification(`The trump suit is ${SUITS[json.EXPOSE_BOTTOM_CARDS.currentTrump.suit]}`)
            this.setState(json.EXPOSE_BOTTOM_CARDS);
          } else if (json.TAKE_KITTY) {
            this.setState(json.TAKE_KITTY);
          } else if (json.FRIEND_DECLARE) {
            this.setState(json.FRIEND_DECLARE);
            this.audio.slowlyStopBackground();
          } else if (json.MAKE_KITTY) {
            this.setState(json.MAKE_KITTY);
            if (json.MAKE_KITTY.status === 'PLAY') {
              this.audio.slowlyStopBackground();
            }
          } else if (json.START_PLAY) { // [EditByRan] Implement the "Chao-Di-Pi" feature.
            this.setState(json.START_PLAY);
          } else if (json.PLAY) {
            this.setState(json.PLAY);
            if (status === 'PLAY' && playerIds[json.PLAY.currentPlayerIndex] === myPlayerId) {
              this.audio.playYourTurn();
            }
          } else if (json.FINISH_TRICK) {
            this.setState(json.FINISH_TRICK);
            if (playerIds[json.FINISH_TRICK.currentPlayerIndex] === myPlayerId) {
              this.audio.playYourTurn();
            }
          } else if (json.CONFIRM_SPECIAL_PLAY) {
            const {cardIds} = json.CONFIRM_SPECIAL_PLAY;
            this.setState({confirmSpecialPlayCards: cardIds})
          } else if (json.INVALID_SPECIAL_PLAY) {
            const {playerId, ...other} = json.INVALID_SPECIAL_PLAY;
            this.setNotification(`${playerNames[playerId]} made an invalid special play.`);
            this.setState(other);
          } else if (json.FRIEND_JOINED) {
            const {playerId, ...other} = json.FRIEND_JOINED;
            this.setNotification(`${playerNames[playerId]} has joined the declaring team!`);
            this.setState(other);
          } else if (json.TAKE_BACK) {
            const {playerId, ...other} = json.TAKE_BACK;
            this.setNotification(`${playerNames[playerId]} took back their cards`);
            this.setState(other);
          } else if (json.FORFEIT) {
            const {playerId, message, ...other} = json.FORFEIT;
            this.setNotification(`${playerNames[playerId]} forfeited.`);
            this.setState(other);
          } else if (json.FINISH_ROUND) {
            const isWin = json.FINISH_ROUND.winningPlayerIds.includes(myPlayerId);
            if (isWin) {
              this.setNotification('You win!');
              this.audio.playVictory();
            } else {
              this.setNotification('You lose.');
              this.audio.playDefeat();
            }
            this.setState(json.FINISH_ROUND);
          } else if (json.RECONNECT) {
            const { playerId } = json.RECONNECT;
            this.setNotification(`${playerNames[playerId]} reconnected.`);
          } else if (json.DISCONNECT) {
            const { playerId } = json.DISCONNECT;
            this.setNotification(`${playerNames[playerId]} disconnected.`);
          } else if (json.INVALID_ACTION) {
            this.setNotification(json.INVALID_ACTION.message);
          } else {
            console.error('Unhandled message: ' + JSON.stringify(json));
          }
        });
  }

  setNotification(message) {
    const id = new Date().getTime();
    this.setState({
      notifications: {
        ...this.state.notifications,
        [id]: message,
      },
    });
    // After a brief period, remove this notification (and all notifications
    // before it just in case)
    setTimeout(() => {
      const {notifications} = this.state;
      this.setState({
        notifications: Object.keys(notifications)
            .filter((otherId) => otherId > id)
            .reduce((obj, key) => {
              obj[key] = notifications[key];
              return obj;
            }, {}),
      });
    }, 2000);
  }

  render() {
    const {roomCode} = this.props;

    // [EditByRan] device-specific rendering
    if (isMobile) {
      return (
        <div>
          {this.renderGameArea()}
        </div>
      );
    } else {
      return (
        <div>
          <div>
            <h3>Room Code: {roomCode}</h3>
          </div>
          {this.renderGameArea()}
        </div>
      );
    }
  }

  renderGameArea() {
    var url = "";
    if (this.state.status === 'START_ROUND') {
      return (
        <div className='game_area'>
          {this.renderRoundStartPanel()}
          {this.renderRoundInfo()}
          {this.renderGameInfo()}
          {this.renderPlayerNames()}
          {this.renderNotifications()}
          {this.renderFindAFriendPanel()}
          {this.renderPlayerHands()}
          {this.renderDeclaredCards()}
          {this.renderBottomCards()}
          {this.renderCurrentTrick()}
          {this.renderSettings()}
          {this.renderActionButton()}
          {this.renderKitty()}
          {this.renderLastTrickButton()}
        </div>
      );
    }
    else {
      return (
        <div className='game_area' style={{'background-image': `url(${url})`}}>
          {this.renderRoundStartPanel()}
          {this.renderRoundInfo()}
          {this.renderGameInfo()}
          {this.renderPlayerNames()}
          {this.renderNotifications()}
          {this.renderFindAFriendPanel()}
          {this.renderPlayerHands()}
          {this.renderDeclaredCards()}
          {this.renderBottomCards()}
          {this.renderCurrentTrick()}
          {this.renderSettings()}
          {this.renderActionButton()}
          {this.renderKitty()}
          {this.renderLastTrickButton()}
        </div>
      );
    }
  }

  // [EditByRan] Implement the must-play-rank feature.
  // [EditByRan] Implement the "Chao-Di-Pi" feature.
  renderRoundStartPanel() {
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
      status,
    } = this.state;
    if (status === 'START_ROUND') {
      // [EditByRan] Implement the must-play-rank feature.
      // [EditByRan] Implement the "Chao-Di-Pi" feature.
      // [EditByRan] Implement the ban-take-back feature.
      // [EditByRan] Allow PC users to use mobile UI.
      return <RoundStartPanel
        aiControllers={aiControllers}
        humanControllers={humanControllers}
        playerNames={playerNames}
        playerReadyForPlay={playerReadyForPlay}
        myPlayerId={myPlayerId}
        isEditingPlayers={isEditingPlayers}
        localName={localName}
        playerIds={playerIds}
        numDecks={numDecks}
        findAFriend={findAFriend}
        mustPlay5={mustPlay5}
        mustPlay10={mustPlay10}
        mustPlayK={mustPlayK}
        chaoDiPi={chaoDiPi}
        banTB={banTB}
        mobileUI={mobileUI}
        playerRankScores={playerRankScores}
        playerRankCycles={playerRankCycles}
        winningPlayerIds={winningPlayerIds}
        setPlayerOrder={playerIds => this.connection.send({ PLAYER_ORDER: { playerIds }})}
        setName={this.setName}
        setMobileUI={this.setMobileUI}
        setPlayerScore={(playerId, increment) => this.connection.send({ PLAYER_SCORE: { playerId, increment }})}
        removePlayer={playerId => this.connection.send({ REMOVE_PLAYER: { playerId } })}
        setGameConfiguration={gameConfiguration => this.connection.send({ GAME_CONFIGURATION: gameConfiguration })}
        addAi={() => this.connection.send({ ADD_AI: {} })}
        setReadyForPlay={ready => {
          this.audio.prepare();
          this.connection.send({ READY_FOR_PLAY: { ready }});
        }}
      />;
    }
  }

  renderRoundInfo() {
    const {
      playerNames,
      myPlayerId,
      playerIds,
      starterPlayerIndex,
      isDeclaringTeam,
      findAFriendDeclaration,
      currentRoundScores,
      currentRoundPenalties,
      currentTrump,
      numDecks,
      findAFriend,
      mustPlay5,
      mustPlay10,
      mustPlayK,
      chaoDiPi,
    } = this.state;
    return <RoundInfoPanel
      playerNames={playerNames}
      myPlayerId={myPlayerId}
      playerIds={playerIds}
      starterPlayerIndex={starterPlayerIndex}
      isDeclaringTeam={isDeclaringTeam}
      findAFriendDeclaration={findAFriendDeclaration}
      currentRoundScores={currentRoundScores}
      currentRoundPenalties={currentRoundPenalties}
      currentTrump={currentTrump}
      numDecks={numDecks}
      findAFriend={findAFriend}
      mustPlay5={mustPlay5}
      mustPlay10={mustPlay10}
      mustPlayK={mustPlayK}
      chaoDiPi={chaoDiPi}
    />;
  }

  // [EditByRan] Implement the must-play-rank feature.
  // [EditByRan] Implement the "Chao-Di-Pi" feature.
  renderGameInfo() {
    const {playerNames, myPlayerId, playerIds, numDecks, findAFriend, mustPlay5, mustPlay10, mustPlayK, chaoDiPi, playerRankScores, playerRankCycles, status} = this.state;
    if (status === 'START_ROUND') {
      return; // all info is already shown in the round start panel
    }
    // [EditByRan] Implement the must-play-rank feature.
    // [EditByRan] Implement the "Chao-Di-Pi" feature.
    // [EditByRan] device-specific rendering: eliminate GameInfo
    if (isMobile)
      return;
    return <GameInfoPanel
      playerNames={playerNames}
      myPlayerId={myPlayerId}
      playerIds={playerIds}
      numDecks={numDecks}
      findAFriend={findAFriend}
      mustPlay5={mustPlay5}
      mustPlay10={mustPlay10}
      mustPlayK={mustPlayK}
      chaoDiPi={chaoDiPi}
      playerRankScores={playerRankScores}
      playerRankCycles={playerRankCycles}
    />;
  }

  // [EditByRan] Implement the "Chao-Di-Pi" feature.
  renderPlayerNames() {
    const {
      playerNames,
      myPlayerId,
      playerIds,
      findAFriend,
      chaoDiPi,
      status,
      currentPlayerIndex,
      isDeclaringTeam,
      currentRoundScores,
      playerRankScores,
      playerRankCycles,
    } = this.state;
    if (status === 'START_ROUND') {
      return;
    }
    // [EditByRan] Implement the "Chao-Di-Pi" feature.
    // [EditByRan] device-specific rendering
    return playerIds.map(playerId => {
      return <PlayerArea
        key={`playerName${playerId}`}
        myPlayerId={myPlayerId}
        playerIds={playerIds}
        playerId={playerId}
        distance={isMobile ? (playerId === myPlayerId ? 1.8 : 1.1) : 0.91}
        shiftX={isMobile ? 0 : (playerId === myPlayerId ? 240 : 0)}
        isText={true}
      >
        <PlayerNametag
          playerId={playerId}
          playerNames={playerNames}
          playerIds={playerIds}
          findAFriend={findAFriend}
          chaoDiPi={chaoDiPi}
          status={status}
          currentPlayerIndex={currentPlayerIndex}
          isDeclaringTeam={isDeclaringTeam}
          currentRoundScores={currentRoundScores}
          playerRankScores={playerRankScores}
          playerRankCycles={playerRankCycles}
        />
      </PlayerArea>;
    });
  }

  // [EditByRan] Add kittyOwnerIndex, declaredCards
  renderNotifications() {
    const {
      aiControllers,
      humanControllers,
      playerNames,
      playerReadyForPlay,
      myPlayerId,
      notifications,
      confirmSpecialPlayCards,
      playerIds,
      kittySize,
      status,
      kittyOwnerIndex,
      currentPlayerIndex,
      declaredCards,
    } = this.state;
    if (!myPlayerId) {
      return <RejoinPanel
        aiControllers={aiControllers}
        humanControllers={humanControllers}
        playerNames={playerNames}
        playerIds={playerIds}
        rejoin={playerId => this.connection.send({ REJOIN: { playerId }})}
      />;
    }
    if (confirmSpecialPlayCards !== undefined) {
      return <ConfirmationPanel
        message={'That is a multiple-component play. If any component can be beaten, you will pay a 10 point penalty.'}
        is_tall_panel={true}
        confirm={() => {
          this.connection.send({ PLAY: { cardIds: confirmSpecialPlayCards, confirmSpecialPlay: true } });
          this.setState({ confirmSpecialPlayCards: undefined });
        }}
        cancel={() => this.setState({ confirmSpecialPlayCards: undefined })}
      />;
    }
    // [EditByRan] device-specific rendering, eliminate most notifications.
    if (isMobile)
      return;
    if (Object.entries(notifications).length > 0) {
      return isMobile ? Object.entries(notifications).map(([id, message]) =>
        <div key={id} className='notification_mobile warn'>{message}</div>,
      ) : Object.entries(notifications).map(([id, message]) =>
        <div key={id} className='notification warn'>{message}</div>,
      );
    }
    if (status === 'DRAW') {
      return isMobile ? <div className='notification_mobile'>{"Select one or more cards to declare"}</div> :
        <div className='notification'>{"Select one or more cards to declare"}</div>
    }
    if (!playerReadyForPlay[myPlayerId] && status === 'DRAW_KITTY') {
      return isMobile ? <div className='notification_mobile'>{"Select card(s) to declare, or click Pass"}</div> :
        <div className='notification'>{"Select card(s) to declare, or click Pass"}</div>
    }

    // [EditByRan] Chao-Di-Pi phase
    if (!playerReadyForPlay[myPlayerId] && status === 'SPECIAL_DRAW_KITTY'){
      // Two types of players are not allowed to declare: the KittyOwner, DeclaredCardsOwner
      if ((declaredCards.length > 0 && declaredCards[declaredCards.length - 1].playerId === myPlayerId) ||
          kittyOwnerIndex === myPlayerId) {
        return isMobile ? <div className='notification_mobile'>{"You are not allowed to declare, please click Pass"}</div> :
          <div className='notification'>{"You are not allowed to declare, please click Pass"}</div>
      } else { // The player is allowed to declare
        return isMobile ? <div className='notification_mobile'>{"Chao-Di-Pi phase: select 2+ card(s) to declare, or click Pass"}</div> :
          <div className='notification'>{"Chao-Di-Pi phase: select 2+ card(s) to declare, or click Pass"}</div>
      }
    }

    // [EditByRan] Implement the Chao-Di-Pi feature.
    const playerId = playerIds[currentPlayerIndex];
    if (status === 'MAKE_KITTY' || status === 'SPECIAL_MAKE_KITTY') {
      if (playerId === myPlayerId) {
        return isMobile ? <div className='notification_mobile'>{`Select ${kittySize} cards to put in the kitty`}</div> :
          <div className='notification'>{`Select ${kittySize} cards to put in the kitty`}</div>
      } else {
        return isMobile ? <div className='notification_mobile'>{`${playerNames[playerId]} is selecting cards for the kitty`}</div> :
          <div className='notification'>{`${playerNames[playerId]} is selecting cards for the kitty`}</div>
      }
    }
    if (status === 'PLAY' && playerId === myPlayerId) {
      return isMobile ? <div className='notification_mobile short'>{'Your turn'}</div> :
        <div className='notification short'>{'Your turn'}</div>
    }
  }

  renderFindAFriendPanel() {
    const { myPlayerId, playerIds, numDecks, starterPlayerIndex, status } = this.state;
    if (status === 'DECLARE_FRIEND' && playerIds[starterPlayerIndex] === myPlayerId) {
      return (
        <FindAFriendPanel
          playerIds={playerIds}
          numDecks={numDecks}
          setFindAFriendDeclaration={declarations => this.connection.send({ FRIEND_DECLARE: { declaration: { declarations } } })}
        />
      );
    }
  }

  renderPlayerHands() {
    const {myPlayerId, selectedCardIds, status, playerIds, cardsById, playerHands, declaredCards} = this.state;
    if (status === 'START_ROUND') {
      return;
    }
    return playerIds.map((playerId) => {

      const nonDeclaredCards = playerHands[playerId]
      // If not playing tricks, declared cards should be shown in front,
      // not in hand
          .filter((cardId) => status === 'PLAY' ||
          declaredCards.length === 0 ||
          declaredCards[declaredCards.length - 1].
              cardIds.every((declaredCardId) => cardId !== declaredCardId));

      // [EditByRan] device-specific rendering: do not render others' cards in hand
      if (isMobile && myPlayerId !== playerId){
        return;
      }
      // [EditByRan] device-specific rendering: render my hand
      return (
        <PlayerArea
          key={`playerArea${playerId}`}
          myPlayerId={myPlayerId}
          playerIds={playerIds}
          playerId={playerId}
          distance={isMobile ? 1 : 0.6}
        >
          <Cards
            cardIds={nonDeclaredCards}
            selectedCardIds={selectedCardIds}
            cardsById={cardsById}
            faceUp={playerId === myPlayerId}
            selectCards={playerId === myPlayerId ? cardId => this.setState({
              selectedCardIds: {
                ...selectedCardIds,
                [cardId]: !selectedCardIds[cardId],
              },
            }) : undefined}
            adaptive={isMobile}
            large={playerId === myPlayerId}
          />
        </PlayerArea>
      );
    });
  }

  renderDeclaredCards() {
    const {myPlayerId, playerIds, status, cardsById, declaredCards} = this.state;
    if (status === 'START_ROUND' ||
      status === 'PLAY' ||
      declaredCards.length === 0) {
      return;
    }
    const latestDeclaredCards = declaredCards[declaredCards.length - 1];
    // [EditByRan] device-specific rendering
    return <div>
      <PlayerArea
        myPlayerId={myPlayerId}
        playerIds={playerIds}
        playerId={latestDeclaredCards.playerId}
        distance={isMobile ? 0.2 : 0.3}
      >
        <Cards
          cardIds={latestDeclaredCards.cardIds}
          cardsById={cardsById}
          faceUp={true}
          adaptive={isMobile}
          large={false}
        />
      </PlayerArea>
    </div>;
  }

  renderBottomCards() {
    const { myPlayerId, playerIds, starterPlayerIndex, status, cardsById, exposedBottomCards } = this.state;
    if (status !== 'EXPOSE_BOTTOM_CARDS') {
      return;
    }
    // [EditByRan] device-specific rendering
    return <div>
      <PlayerArea
        myPlayerId={myPlayerId}
        playerIds={playerIds}
        playerId={playerIds[starterPlayerIndex]}
        distance={isMobile ? 0.2 : 0.3}
      >
        <Cards
          cardIds={exposedBottomCards}
          cardsById={cardsById}
          faceUp={true}
          adaptive={isMobile}
          large={false}
        />
      </PlayerArea>
    </div>;
  }

  renderCurrentTrick() {
    const {myPlayerId, showPreviousTrick, playerIds, status, cardsById, pastTricks, currentTrick} = this.state;
    if (!currentTrick) {
      return;
    }
    if (showPreviousTrick && pastTricks.length > 0) {
      return <Trick
        trick={pastTricks[pastTricks.length - 1]}
        myPlayerId={myPlayerId}
        playerIds={playerIds}
        cardsById={cardsById}
      />
    }
    if (status === 'START_ROUND') {
      return;
    }
    return <Trick
      trick={currentTrick}
      myPlayerId={myPlayerId}
      playerIds={playerIds}
      cardsById={cardsById}
    />
  }

  renderSettings() {
    const { myPlayerId, soundVolume, isEditingPlayers, playerIds, status, currentTrick, banTB } = this.state;
    return <SettingsPanel
      myPlayerId={myPlayerId}
      soundVolume={soundVolume}
      playerIds={playerIds}
      status={status}
      currentTrick={currentTrick}
      banTB={banTB}
      forfeit={() => this.connection.send({ FORFEIT: {} })}
      leaveRoom={() => this.connection.send({ REMOVE_PLAYER: { playerId: myPlayerId } })}
      setSoundVolume={soundVolume => {
        this.audio.setVolume(soundVolume);
        this.setState({ soundVolume });
      }}
      toggleEditPlayers={() => this.setState({ isEditingPlayers: !isEditingPlayers })}
      takeBack={() => this.connection.send({ TAKE_BACK: {} })}
    />;
  }

  // [EditByRan] Add kittyOwnerIndex, declaredCards
  renderActionButton() {
    const {
      humanControllers,
      playerNames,
      myPlayerId,
      selectedCardIds,
      playerIds,
      kittySize,
      kittyOwnerIndex,
      currentPlayerIndex,
      status,
      declaredCards,
      kitty,
      playerReadyForPlay,
    } = this.state;

    if (playerIds.indexOf(myPlayerId) === -1) {
      return;
    }

    const selectedCardIdsList = Object.entries(selectedCardIds)
        .filter(([_cardId, selected]) => selected)
        .map(([cardId, _selected]) => cardId);
    const iAmReadyForPlay = playerReadyForPlay[myPlayerId];
    const numPlayersReadyForPlay = Object.values(playerReadyForPlay).filter(ready => ready).length;
    const playersNotReadyForPlay = Object.entries(playerReadyForPlay)
      .filter(([_playerId, ready]) => !ready)
      .map(([playerId, _ready]) => playerNames[playerId]);

    if (status === 'DRAW_KITTY' && (selectedCardIdsList.length === 0 || iAmReadyForPlay)) {
      return <ActionButton
        text={`${iAmReadyForPlay ? 'Ready' : 'Pass'} (${numPlayersReadyForPlay}/${humanControllers.length})`}
        clicked={iAmReadyForPlay}
        onClick={() => this.connection.send({ READY_FOR_PLAY: { ready: !iAmReadyForPlay } })}
        title={`Waiting on ${playersNotReadyForPlay.join(', ')}`}
      />;
    }
    if (status === 'DRAW' || (status === 'DRAW_KITTY' && !iAmReadyForPlay)) {
      return <ActionButton
        text='Declare'
        onClick={selectedCardIdsList.length > 0 ? () => {
          const cardIds = [...selectedCardIdsList];

          // if you currently declared cards already, add them as well
          if (declaredCards.length > 0 &&
            declaredCards[declaredCards.length - 1].playerId === myPlayerId) {
            cardIds.push(...declaredCards[declaredCards.length - 1].cardIds);
          }

          this.connection.send({ DECLARE: { cardIds } });
          this.setState({selectedCardIds: {}});
        } : undefined}
      />;
    }

    // [EditByRan] Chao-Di-Pi phase
    if (status === 'SPECIAL_DRAW_KITTY'){
      if ((declaredCards.length > 0 && declaredCards[declaredCards.length - 1].playerId === myPlayerId) ||
          kittyOwnerIndex === myPlayerId) {
        // Two types of players are not allowed to declare: the KittyOwner, DeclaredCardsOwner
        return <ActionButton
          text={`${iAmReadyForPlay ? 'Ready' : 'Pass'} (${numPlayersReadyForPlay}/${humanControllers.length})`}
          clicked={iAmReadyForPlay}
          onClick={() => this.connection.send({ READY_FOR_PLAY: { ready: !iAmReadyForPlay } })}
          title={`Waiting on ${playersNotReadyForPlay.join(', ')}`}
        />;
      } else { // The player is allowed to declare
        if (selectedCardIdsList.length === 0 || iAmReadyForPlay){
          // the player has already clicked the 'Pass' button OR nothing has been selected.
          return <ActionButton
            text={`${iAmReadyForPlay ? 'Ready' : 'Pass'} (${numPlayersReadyForPlay}/${humanControllers.length})`}
            clicked={iAmReadyForPlay}
            onClick={() => this.connection.send({ READY_FOR_PLAY: { ready: !iAmReadyForPlay } })}
            title={`Waiting on ${playersNotReadyForPlay.join(', ')}`}
          />;
        }
        else { // selectedCardIdsList.length !== 0 || !iAmReadyForPlay
          // the player has NOT clicked the 'Pass' button yet and selected something
          return <ActionButton
            text='Cook'
            onClick={() => {
              const cardIds = [...selectedCardIdsList];
              this.connection.send({ DECLARE: { cardIds } });
              this.setState({selectedCardIds: {}});
              }
            }
          />;
        }
      }
    }

    if (playerIds[currentPlayerIndex] !== myPlayerId) {
      return;
    }

    if (status === 'MAKE_KITTY' && kitty.length === 0) {
      return <ActionButton
        text='Make kitty'
        onClick={selectedCardIdsList.length === kittySize ? () => {
          this.connection.send({ MAKE_KITTY: { cardIds: selectedCardIdsList } });
          this.setState({selectedCardIds: {}});
        } : undefined}
      />;
    }
    if (status === 'SPECIAL_MAKE_KITTY') {
      return <ActionButton
        text='Make kitty'
        onClick={selectedCardIdsList.length === kittySize ? () => {
          this.connection.send({ MAKE_KITTY: { cardIds: selectedCardIdsList } });
          this.setState({selectedCardIds: {}});
        } : undefined}
      />;
    }
    if (status === 'PLAY') {
      return <ActionButton
        text='Play'
        onClick={selectedCardIdsList.length > 0 ? () => {
          this.connection.send({ PLAY: { cardIds: selectedCardIdsList } });
          this.setState({selectedCardIds: {}});
        } : undefined}
      />;
    }
  }

  // [EditByRan] Only the kittyOwnerIndex can view the kitty
  renderKitty() {
    const { myPlayerId, playerIds, kittyOwnerIndex, status, cardsById, kitty } = this.state;
    return <Kitty
      myPlayerId={myPlayerId}
      playerIds={playerIds}
      kittyOwnerIndex={kittyOwnerIndex}
      status={status}
      cardsById={cardsById}
      kitty={kitty}
    />;
  }

  renderLastTrickButton() {
    const {pastTricks} = this.state;
    if (!pastTricks || pastTricks.length === 0) {
      return;
    }
    // [EditByRan] device-specific rendering
    if (isMobile) {
      return <HoverButton
        className='last_trick_button_mobile'
        onHoverStart={() => this.setState({showPreviousTrick: true})}
        onHoverEnd={() => this.setState({showPreviousTrick: false})}
      />;
    } else {
      return <HoverButton
        className='last_trick_button'
        onHoverStart={() => this.setState({showPreviousTrick: true})}
        onHoverEnd={() => this.setState({showPreviousTrick: false})}
      />;
    }
  }

  setName = name => {
    this.setState({ localName: name });
    this.connection.send({ SET_NAME: { name } });
    window.localStorage.setItem('tractor_name', name);
  }
  // [EditByRan] Allow PC users to use mobile UI.
  setMobileUI = mobi => {
    this.setState({ mobileUI: mobi });
    isMobile = isMobile0 || mobi;
  }
}

Room.propTypes = {
  roomCode: PropTypes.string,
};
