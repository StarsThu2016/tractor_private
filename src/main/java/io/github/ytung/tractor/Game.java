package io.github.ytung.tractor;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import com.google.common.collect.Iterables;
import com.google.common.collect.Maps;
import com.google.common.collect.Streams;
import com.google.common.collect.TreeMultiset;

import io.github.ytung.tractor.Cards.Grouping;
import io.github.ytung.tractor.api.Card;
import io.github.ytung.tractor.api.Card.Suit;
import io.github.ytung.tractor.api.Card.Value;
import io.github.ytung.tractor.api.FindAFriendDeclaration;
import io.github.ytung.tractor.api.FindAFriendDeclaration.Declaration;
import io.github.ytung.tractor.api.GameStatus;
import io.github.ytung.tractor.api.Play;
import io.github.ytung.tractor.api.Trick;
import lombok.Data;

@Data
public class Game {

    private List<String> playerIds = new ArrayList<>();

    // game configuration
    // [EditByRan] Implement must-play-rank feature.
    // [EditByRan] Implement the "Chao-Di-Pi" feature.
    private int numDecks = 2;
    private boolean findAFriend = false;
    private boolean mustPlay5 = false;
    private boolean mustPlay10 = false;
    private boolean mustPlayK = false;
    private boolean chaoDiPi = false;
    private int kittyOwnerIndex;

    // constant over each round
    private int roundNumber = 0;
    private int starterPlayerIndex = 0;
    // [EditByRan] Remember the number of cycles
    private Map<String, Card.Value> playerRankScores = new HashMap<>();
    private Map<String, Integer> playerRankCycles = new HashMap<>();
    private Set<String> winningPlayerIds = new HashSet<>();

    // round state
    private GameStatus status = GameStatus.START_ROUND;
    private int currentPlayerIndex;
    private Map<String, Boolean> isDeclaringTeam;
    private Queue<Integer> deck;
    private Map<Integer, Card> cardsById;
    private Map<String, List<Integer>> playerHands;
    private List<Play> declaredCards;
    private List<Integer> exposedBottomCards = new ArrayList<>();
    private List<Integer> kitty;
    private FindAFriendDeclaration findAFriendDeclaration;
    private List<Trick> pastTricks;
    private Trick currentTrick;
    private Map<String, Integer> currentRoundScores = new HashMap<>();
    private Map<String, Integer> currentRoundPenalties = new HashMap<>();

    public synchronized void addPlayer(String playerId) {
        if (status != GameStatus.START_ROUND)
            return;
        if (playerIds.contains(playerId))
            return;

        playerIds.add(playerId);
        // [EditByRan] Remember the number of cycles
        playerRankScores.put(playerId, Card.Value.TWO);
        playerRankCycles.put(playerId, 0);
    }

    public synchronized void removePlayer(String playerId) {
        if (!playerIds.contains(playerId))
            return;

        playerIds.remove(playerId);
        // [EditByRan] Remember the number of cycles
        playerRankScores.remove(playerId);
        playerRankCycles.remove(playerId);

        if (playerIds.size() < 4)
            findAFriend = false;
    }

    public synchronized void setPlayerOrder(List<String> newPlayerIds) {
        if (status != GameStatus.START_ROUND)
            throw new IllegalStateException();
        if (!new HashSet<>(playerIds).equals(new HashSet<>(newPlayerIds)))
            throw new IllegalStateException();

        String currentPlayerId = playerIds.get(currentPlayerIndex);
        String starterPlayerId = playerIds.get(starterPlayerIndex);
        playerIds = newPlayerIds;
        currentPlayerIndex = playerIds.indexOf(currentPlayerId);
        starterPlayerIndex = playerIds.indexOf(starterPlayerId);
    }

    public synchronized void updatePlayerScore(String playerId, boolean increment) {
        if (status != GameStatus.START_ROUND)
            throw new IllegalStateException();

        // [EditByRan] the admin edits come with the default "declare win"
        updatePlayerScore(playerId, increment ? 1 : -1, true);
    }

    public synchronized void setNumDecks(int numDecks) {
        if (status != GameStatus.START_ROUND)
            throw new IllegalStateException();
        if (numDecks <= 0 || numDecks > 10)
            throw new IllegalStateException();

        this.numDecks = numDecks;
    }

    public synchronized void setFindAFriend(boolean findAFriend) {
        if (status != GameStatus.START_ROUND)
            throw new IllegalStateException();
        if (findAFriend && playerIds.size() < 4)
            throw new IllegalStateException();

        this.findAFriend = findAFriend;
    }

    // [EditByRan] Implement must-play-rank feature.
    public synchronized void setMustPlay5(boolean mustPlay5) {
        this.mustPlay5 = mustPlay5;
    }

    public synchronized void setMustPlay10(boolean mustPlay10) {
        this.mustPlay10 = mustPlay10;
    }

    public synchronized void setMustPlayK(boolean mustPlayK) {
        this.mustPlayK = mustPlayK;
    }

    // [EditByRan] Implement the "Chao-Di-Pi" feature.
    public synchronized void setChaoDiPi(boolean chaoDiPi) {
        this.chaoDiPi = chaoDiPi;
    }

    public synchronized void startRound() {
        if (status != GameStatus.START_ROUND)
            throw new IllegalStateException();

        status = GameStatus.DRAW;
        currentPlayerIndex = starterPlayerIndex;
        setIsDeclaringTeam();
        cardsById = Decks.getCardsById(numDecks);
        deck = Decks.shuffle(cardsById);
        playerHands = new HashMap<>();
        declaredCards = new ArrayList<>();
        exposedBottomCards = new ArrayList<>();
        kitty = new ArrayList<>();
        findAFriendDeclaration = null;
        pastTricks = new ArrayList<>();
        currentTrick = null;
        currentRoundScores = new HashMap<>(Maps.toMap(playerIds, playerId -> 0));
        currentRoundPenalties = new HashMap<>(Maps.toMap(playerIds, playerId -> 0));

        for (String playerId : playerIds)
            playerHands.put(playerId, new ArrayList<>());
    }

    /**
     * The next player draws a card from the deck.
     */
    public synchronized Play draw() {
        if (status == GameStatus.DRAW_KITTY)
            return null;
        if (status != GameStatus.DRAW)
            throw new IllegalStateException();

        String playerId = playerIds.get(currentPlayerIndex);
        int cardId = deck.poll();
        playerHands.get(playerId).add(cardId);
        sortCards(playerHands.get(playerId));
        currentPlayerIndex = (currentPlayerIndex + 1) % playerIds.size();
        if (deck.size() <= getKittySize())
            status = GameStatus.DRAW_KITTY;
        return new Play(playerId, Collections.singletonList(cardId));
    }

    public synchronized void declare(String playerId, List<Integer> cardIds) throws InvalidDeclareException {
        Play play = new Play(playerId, cardIds);
        verifyCanDeclare(play);
        declaredCards.add(play);
        playerHands.forEach((otherPlayerId, otherCardIds) -> sortCards(otherCardIds));

        // if this is the first round, then the person who declares is the starter
        // [EditByRan] only if in the first declare phase.
        if (roundNumber == 0 && (status == GameStatus.DRAW || status == GameStatus.DRAW_KITTY)) {
            starterPlayerIndex = playerIds.indexOf(playerId);
            setIsDeclaringTeam();
        }

        // [EditByRan] memorize who makes the kitty so that to prevent he/she to Chao-Di-Pi right away.
        if (status == GameStatus.SPECIAL_DRAW_KITTY)
            kittyOwnerIndex = playerIds.indexOf(playerId);
        else
            kittyOwnerIndex = starterPlayerIndex;
    }

    private void verifyCanDeclare(Play play) throws InvalidDeclareException {
        if (status != GameStatus.DRAW && status != GameStatus.DRAW_KITTY && status != GameStatus.SPECIAL_DRAW_KITTY)
            throw new InvalidDeclareException("You can no longer declare.");
        if (play.getCardIds().isEmpty())
            throw new InvalidDeclareException("You must declare at least one card.");
        if (!isPlayable(play))
            throw new InvalidDeclareException("You do not have that card.");
        if (play.getCardIds().stream().map(cardId -> cardsById.get(cardId).getValue()).distinct().count() != 1)
            throw new InvalidDeclareException("All declared cards must be the same.");
        if (play.getCardIds().stream().map(cardId -> cardsById.get(cardId).getSuit()).distinct().count() != 1)
            throw new InvalidDeclareException("All declared cards must be the same.");
        Card card = cardsById.get(play.getCardIds().get(0));
        if (card.getValue() != getCurrentTrump().getValue() && card.getSuit() != Card.Suit.JOKER)
            throw new InvalidDeclareException("You can only declare the current trump value.");
        if (card.getSuit() == Card.Suit.JOKER && play.getCardIds().size() == 1)
            throw new InvalidDeclareException("You cannot declare a single joker.");
        if (play.getCardIds().size() == 1 && status == GameStatus.SPECIAL_DRAW_KITTY)
            throw new InvalidDeclareException("In the Chao-Di-Pi phase, you cannot declare a single card.");

        if (declaredCards.isEmpty()){
            if (status == GameStatus.DRAW || status == GameStatus.DRAW_KITTY)
                return;
            else if (kittyOwnerIndex != playerIds.indexOf(play.getPlayerId())) // SPECIAL_DRAW_KITTY phase
                return;
            else
                throw new InvalidDeclareException("You are the starter and just made the kitty, so you are not allowed to Cook now.");
        }

        // Someone has already declared something.
        // [EditByRan] The new declare rules including "Chao-Di-Pi" features.
        Play lastDeclaredPlay = declaredCards.get(declaredCards.size() - 1);
        Suit lastDeclaredSuit = cardsById.get(lastDeclaredPlay.getCardIds().get(0)).getSuit();
        Value lastDeclaredValue = cardsById.get(lastDeclaredPlay.getCardIds().get(0)).getValue();
        if (lastDeclaredPlay.getPlayerId().equals(play.getPlayerId()) && (status == GameStatus.DRAW || status == GameStatus.DRAW_KITTY)) {
            // same player is only allowed to strengthen the declared suit
            if (card.getSuit() != lastDeclaredSuit)
                throw new InvalidDeclareException("You can only strengthen your declare.");
            if (play.getCardIds().size() <= lastDeclaredPlay.getCardIds().size())
                throw new InvalidDeclareException("You can only strengthen your declare.");
        } else if (lastDeclaredPlay.getPlayerId().equals(play.getPlayerId()))
            throw new InvalidDeclareException("You cannot strengthen your declare in the Chao-Di-Pi phase.");
        else {
            // In the Chao-Di-Pi phase, the Starter is not able to Chao firstly, since he/she just takes the kitty
            if (status == GameStatus.SPECIAL_DRAW_KITTY && kittyOwnerIndex == playerIds.indexOf(play.getPlayerId()))
                throw new InvalidDeclareException("You are the starter and just made the kitty, so you are not allowed to Cook now.");

            // other players can only override
            if (play.getCardIds().size() < lastDeclaredPlay.getCardIds().size())
                throw new InvalidDeclareException("You must declare more cards than the last declare.");
            else if (play.getCardIds().size() == lastDeclaredPlay.getCardIds().size()){
                if (card.getSuit() != Card.Suit.JOKER)
                    throw new InvalidDeclareException("You must declare more cards than the last declare.");
                else if (lastDeclaredSuit != Card.Suit.JOKER)
                    return;
                else { // Both joker
                    if (lastDeclaredValue == Card.Value.SMALL_JOKER && card.getValue() == Card.Value.BIG_JOKER)
                        return;
                    else
                        throw new InvalidDeclareException("You must declare more cards than the last declare.");
                }
            }
            else  // (play.getCardIds().size() > lastDeclaredPlay.getCardIds().size())
            {
                if (lastDeclaredSuit != Card.Suit.JOKER && card.getSuit() != Card.Suit.JOKER && lastDeclaredSuit == card.getSuit())
                    throw new InvalidDeclareException("You may not re-declare the current suit.");
                else
                    return;
            }

        }
    }

    private void setIsDeclaringTeam() {
        isDeclaringTeam = IntStream.range(0, playerIds.size())
            .boxed()
            .collect(
                Collectors.toMap(i -> playerIds.get(i), i -> findAFriend ? i == starterPlayerIndex : (i + starterPlayerIndex) % 2 == 0));
    }

    public synchronized void exposeBottomCards() {
        if (status != GameStatus.DRAW_KITTY)
            throw new IllegalStateException();
        if (!declaredCards.isEmpty())
            throw new IllegalStateException();

        // draw from deck until we find a trump, or take the suit of the highest value card
        status = GameStatus.EXPOSE_BOTTOM_CARDS;
        for (int cardId : deck) {
            exposedBottomCards.add(cardId);
            if (getCurrentTrump().getSuit() != Card.Suit.JOKER) {
                playerHands.forEach((otherPlayerId, otherCardIds) -> sortCards(otherCardIds));
                return;
            }
        }
    }

    public synchronized Play takeKitty() {
        // [EditByRan] Implement the "Chao-Di-Pi" feature.
        if (status != GameStatus.SPECIAL_DRAW_KITTY && status != GameStatus.DRAW_KITTY && status != GameStatus.EXPOSE_BOTTOM_CARDS)
            return null;
        GameStatus oldstatus = status;
        status = (oldstatus == GameStatus.DRAW_KITTY || oldstatus == GameStatus.EXPOSE_BOTTOM_CARDS) ?
                 GameStatus.MAKE_KITTY : GameStatus.SPECIAL_MAKE_KITTY;
        System.out.println("@takeKitty(): status = " + status + ", oldstatus = " + oldstatus);
        currentPlayerIndex = (oldstatus == GameStatus.DRAW_KITTY || oldstatus == GameStatus.EXPOSE_BOTTOM_CARDS) ?
                 starterPlayerIndex : playerIds.indexOf(declaredCards.get(declaredCards.size() - 1).getPlayerId());
        String playerId = playerIds.get(currentPlayerIndex);
        List<Integer> cardIds = (oldstatus == GameStatus.DRAW_KITTY || oldstatus == GameStatus.EXPOSE_BOTTOM_CARDS) ?
                 new ArrayList<>(deck) : new ArrayList<>(kitty);
        playerHands.get(playerIds.get(currentPlayerIndex)).addAll(cardIds);
        sortCards(playerHands.get(playerIds.get(currentPlayerIndex)));
        deck.clear();
        return new Play(playerId, cardIds);
    }

    public synchronized void makeKitty(String playerId, List<Integer> cardIds) throws InvalidKittyException {
        sortCards(cardIds);
        Play play = new Play(playerId, cardIds);
        // [EditByRan] Remove the check on the kitty
        if ((status != GameStatus.MAKE_KITTY && status != GameStatus.SPECIAL_MAKE_KITTY))
            throw new InvalidKittyException("You cannot make kitty now");
        if (!play.getPlayerId().equals(playerIds.get(currentPlayerIndex)))
            throw new InvalidKittyException("You cannot make kitty");
        if (play.getCardIds().size() != getKittySize())
            throw new InvalidKittyException("The kitty has to have " + getKittySize() + " cards");
        if (!isPlayable(play))
            throw new InvalidKittyException("Unknown error");

        // [EditByRan] Addition rule: you cannot insert the declarations into the ketty, if you are not the starter.
        if (status == GameStatus.SPECIAL_MAKE_KITTY && findAFriend && !playerId.equals(playerIds.get(starterPlayerIndex))){
            for (Declaration declaration : findAFriendDeclaration.getDeclarations()) {
                Card card1 = new Card(declaration.getValue(), declaration.getSuit());
                for (int cardId : play.getCardIds()){
                    Card card2 = cardsById.get(cardId);
                    if (card1.value == card2.value && card1.suit == card2.suit)
                        throw new InvalidKittyException("The kitty should not include what the starter declares for friends");
                }
            }
        }

        if (status == GameStatus.MAKE_KITTY && findAFriend)
            status = GameStatus.DECLARE_FRIEND;
        else if (status == GameStatus.MAKE_KITTY && chaoDiPi)
            status = GameStatus.SPECIAL_DRAW_KITTY;
        else if (status == GameStatus.MAKE_KITTY)
            status = GameStatus.PLAY;
        else if (status == GameStatus.SPECIAL_MAKE_KITTY)
            status = GameStatus.SPECIAL_DRAW_KITTY;

        kitty = play.getCardIds();
        playerHands.get(playerId).removeAll(cardIds);
        currentTrick = new Trick(play.getPlayerId());
    }

    // [EditByRan] "Chao-Di-Pi" feature: start play function after nobody choose to override.
    public synchronized void startPlay(){
        status = GameStatus.PLAY;
        currentPlayerIndex = starterPlayerIndex;
        currentTrick = new Trick(playerIds.get(starterPlayerIndex));
    }

    public synchronized void makeFindAFriendDeclaration(String playerId, FindAFriendDeclaration declarations)
            throws InvalidFindAFriendDeclarationException {
        if (status != GameStatus.DECLARE_FRIEND)
            throw new InvalidFindAFriendDeclarationException("You cannot declare a friend now.");
        if (!playerId.equals(playerIds.get(currentPlayerIndex)))
            throw new InvalidFindAFriendDeclarationException("Only the starter can declare a friend.");
        if (findAFriendDeclaration != null)
            throw new InvalidFindAFriendDeclarationException("You've already declared.");

        // check for valid declaration
        if (declarations.getDeclarations().size() != playerIds.size() / 2 - 1)
            throw new InvalidFindAFriendDeclarationException("Invalid number of declarations.");
        for (Declaration declaration : declarations.getDeclarations()) {
            Card card = new Card(declaration.getValue(), declaration.getSuit());
            if (declaration.isSatisfied())
                throw new InvalidFindAFriendDeclarationException("Unknown error");
            if (declaration.getOrdinal() > numDecks)
                throw new InvalidFindAFriendDeclarationException("Invalid ordinal.");
            if (declaration.getOrdinal() < 0)
                throw new InvalidFindAFriendDeclarationException("Invalid ordinal.");
            if (!cardsById.containsValue(card))
                throw new InvalidFindAFriendDeclarationException("Invalid card.");

            if (declaration.getOrdinal() == 0) {
                if (numDecks != 2)
                    throw new InvalidFindAFriendDeclarationException("You can only declare OTHER with 2 decks.");

                long numCards = playerHands.get(playerId).stream()
                        .filter(cardId -> cardsById.get(cardId).equals(card))
                        .count();
                if (numCards != 1)
                    throw new InvalidFindAFriendDeclarationException("You need the card to declare OTHER.");
            }
        }

        status = (!chaoDiPi) ? GameStatus.PLAY : GameStatus.SPECIAL_DRAW_KITTY;
        findAFriendDeclaration = declarations;
    }

    /**
     * The specified player makes the given play.
     *
     * If confirmSpecialPlay is true, then the penalty will be paid if the special play is invalid. If
     * false, then the play will always fail, regardless of whether the special play is valid or not.
     */
    public synchronized PlayResult play(String playerId, List<Integer> cardIds, boolean confirmSpecialPlay)
            throws InvalidPlayException, ConfirmSpecialPlayException {
        sortCards(cardIds);
        Play play = new Play(playerId, cardIds);
        verifyCanPlay(new Play(playerId, cardIds));

        // check to see if this is a special play, and if so, whether it is valid
        Component badComponent = null;

        // [EditByRan] bugfix, badComponent will be update at most once, then the failure player will deal his/her smallest badComponent
        if (currentTrick.getPlays().isEmpty()) {
            // [EditByRan]: the starting player has WidthCap = 10, meaning no limit
            List<Component> profile = getProfile(play.getCardIds(), 10);
            int startingWidthCap = profile.stream().mapToInt(component -> component.getShape().getWidth()).max().orElse(0);
            
            if (profile.size() > 1) {
                if (!confirmSpecialPlay)
                    throw new ConfirmSpecialPlayException();

                Card trump = getCurrentTrump();
                for (Component component : profile)
                    for (String otherPlayerId : playerIds)
                        if (!otherPlayerId.equals(play.getPlayerId())) {
                            List<Integer> sameSuitCardIds = playerHands.get(otherPlayerId).stream()
                                .filter(cardId -> Cards.grouping(cardsById.get(cardId), trump) == getGrouping(play.getCardIds()))
                                .collect(Collectors.toList());
                            // [EditByRan]: following players are limited by startingWidthCap 
                            for (Component otherComponent : getProfile(sameSuitCardIds, startingWidthCap))
                                if (otherComponent.getShape().getWidth() >= component.getShape().getWidth()
                                        && otherComponent.getShape().getHeight() >= component.getShape().getHeight()
                                        && otherComponent.getMinRank() > component.getMinRank()) {
                                    badComponent = (badComponent == null) ? component : badComponent;  // [EditByRan] bugfix
                                }
                        }
            }
        }
        if (badComponent != null) {
            currentRoundPenalties.compute(playerId, (key, penalty) -> penalty + 10);
            cardIds = new ArrayList<>(badComponent.getCardIds());
            sortCards(cardIds);
        }

        playerHands.get(playerId).removeAll(cardIds);
        currentTrick.getPlays().add(new Play(playerId, cardIds)); // might be different from the initial play
        currentTrick.setWinningPlayerId(winningPlayerId(currentTrick));

        boolean didFriendJoin = updateFindAFriendDeclaration();

        if (currentTrick.getPlays().size() == playerIds.size()) {
            currentPlayerIndex = -1;
            return new PlayResult(true, didFriendJoin, badComponent != null);
        } else {
            currentPlayerIndex = (currentPlayerIndex + 1) % playerIds.size();
            return new PlayResult(false, didFriendJoin, badComponent != null);
        }
    }

    private void verifyCanPlay(Play play) throws InvalidPlayException {
        if (status != GameStatus.PLAY)
            throw new InvalidPlayException("You cannot make a play now.");
        if (!play.getPlayerId().equals(playerIds.get(currentPlayerIndex)))
            throw new InvalidPlayException("It is not your turn.");
        if (play.getCardIds().isEmpty())
            throw new InvalidPlayException("You must play at least one card.");
        if (!isPlayable(play))
            throw new InvalidPlayException("You do not have that card.");

        Card trump = getCurrentTrump();
        if (currentTrick.getPlays().isEmpty()) {
            // first play of trick
            // [EditByRan]: the starting player has WidthCap = 10, meaning no limit
            List<Component> profile = getProfile(play.getCardIds(), 10);
            if (profile.isEmpty())
                throw new InvalidPlayException("You must play cards in only one suit.");
        } else {
            Play startingPlay = currentTrick.getPlays().get(0);
            if (play.getCardIds().size() != startingPlay.getCardIds().size())
                throw new InvalidPlayException("You must play the same number of cards.");

            Grouping startingGrouping = getGrouping(startingPlay.getCardIds());
            List<Integer> sameSuitCards = playerHands.get(play.getPlayerId()).stream()
                .filter(cardId -> Cards.grouping(cardsById.get(cardId), trump) == startingGrouping)
                .collect(Collectors.toList());

            if (!sameSuitCards.isEmpty()
                    && sameSuitCards.stream().anyMatch(cardId -> !play.getCardIds().contains(cardId))
                    && play.getCardIds().stream().anyMatch(cardId -> Cards.grouping(cardsById.get(cardId), trump) != startingGrouping)) {
                throw new InvalidPlayException("You must follow suit.");
            }

            // [EditByRan]: the starting player has WidthCap = 10, meaning no limit
            int startingWidthCap = getProfile(startingPlay.getCardIds(), 10).stream().mapToInt(component -> component.getShape().getWidth()).max().orElse(0);
            
            // [EditByRan]: following players are limited by startingWidthCap 
            for (Component handComponent : getProfile(sameSuitCards, startingWidthCap)) {
                Shape handShape = handComponent.getShape();
                // [EditByRan]: the starting player has WidthCap = 10, meaning no limit
                // isCapturedByStartingPlay is always True, because all handShape.getWidth() should be <= startingWidthCap
                boolean isCapturedByStartingPlay = getProfile(startingPlay.getCardIds(), 10).stream()
                    .map(Component::getShape)
                    .anyMatch(shape -> shape.getWidth() >= handShape.getWidth());
                boolean inPlay = getProfile(play.getCardIds(), startingWidthCap).contains(handComponent);
                // Suppose the starting player played pairs. If you have any pairs (isCapturedByStartingPlay), but you didn't play it
                // (!inPlay), then look at how many cards you played are worse than it (numFreeCardsInPlay). If there are at least as many
                // worse cards (2), then those cards could have been replaced with the pair. This logic extends for any set of n cards.
                if (isCapturedByStartingPlay && !inPlay) {
                    // [EditByRan]: following players are limited by startingWidthCap 
                    int numFreeCardsInPlay = getProfile(play.getCardIds(), startingWidthCap).stream()
                        .map(Component::getShape)
                        .filter(shape -> shape.getWidth() < handShape.getWidth())
                        .mapToInt(shape -> shape.getWidth() * shape.getHeight())
                        .sum();
                    if (numFreeCardsInPlay >= handShape.getWidth())
                        throw new InvalidPlayException("You must play pairs before singles, etc.");
                }
            }
        }
    }

    /**
     * Returns whether a friend joined
     */
    private boolean updateFindAFriendDeclaration() {
        if (!findAFriend)
            return false;

        long numSatisfiedDeclarations = findAFriendDeclaration.getDeclarations().stream()
                .filter(Declaration::isSatisfied)
                .count();

        for (int i = 0; i < playerIds.size(); i++)
            if (i != starterPlayerIndex)
                isDeclaringTeam.put(playerIds.get(i), false);

        for (Declaration declaration : findAFriendDeclaration.getDeclarations())
            updateFindAFriendDeclaration(declaration);

        return findAFriendDeclaration.getDeclarations().stream()
                .filter(Declaration::isSatisfied)
                .count() != numSatisfiedDeclarations;
    }

    private void updateFindAFriendDeclaration(Declaration declaration) {
        declaration.setSatisfied(false);
        int numPlayed = 0;
        for (Trick trick : getAllTricks())
            for (Play play : trick.getPlays()) {
                for (int cardId : play.getCardIds()) {
                    Card card = cardsById.get(cardId);
                    if (declaration.getValue() == card.getValue() && declaration.getSuit() == card.getSuit()
                            && (declaration.getOrdinal() > 0 || !playerIds.get(starterPlayerIndex).equals(play.getPlayerId()))) {
                        numPlayed++;
                    }
                }
                if (numPlayed >= Math.max(declaration.getOrdinal(), 1)) {
                    isDeclaringTeam.put(play.getPlayerId(), true);
                    declaration.setSatisfied(true);
                    return;
                }
            }
    }

    public synchronized void finishTrick() {
        if (currentTrick.getPlays().size() != playerIds.size())
            throw new IllegalStateException();

        // finish trick
        String winningPlayerId = currentTrick.getWinningPlayerId();
        for (Play play : currentTrick.getPlays())
            currentRoundScores.put(winningPlayerId, currentRoundScores.get(winningPlayerId) + totalCardScore(play.getCardIds()));

        pastTricks.add(currentTrick);
        currentPlayerIndex = playerIds.indexOf(winningPlayerId);
        currentTrick = new Trick(winningPlayerId);

        // check for end of round
        if (playerHands.values().stream().allMatch(List::isEmpty)) {
            if (!isDeclaringTeam.get(winningPlayerId)) {
                // [EditByRan]: modify the bonus of the non-declare team, get the starter's component and its size
                List<Component> profile = getProfile(pastTricks.get(pastTricks.size()-1).getPlays().get(0).getCardIds(), 10);
                int bonusSize = profile.stream().mapToInt(component -> component.getShape().getWidth()*component.getShape().getHeight()).max().orElse(0);
                int bonus = 1 << bonusSize; // 2 ^ bonusSize
                // int bonus = 2 * pastTricks.get(pastTricks.size() - 1).getPlays().get(0).getCardIds().size();
                currentRoundScores.put(winningPlayerId, currentRoundScores.get(winningPlayerId) + bonus * totalCardScore(kitty));
            }

            // [EditByRan] give a balance credit of 5 * numDecks to the non-declarer team in the findAFriend mode, wich was 0
            int roundScore = (playerIds.size() % 2 == 0 && findAFriend) ? (5 * numDecks) : 0;
            for (String playerId : playerIds) {
                if (isDeclaringTeam.get(playerId)) {
                    roundScore += currentRoundPenalties.get(playerId);
                } else {
                    roundScore += currentRoundScores.get(playerId);
                    roundScore -= currentRoundPenalties.get(playerId);
                }
            }
            roundScore = (roundScore < 0) ? 0 : roundScore; // [EditByRan] bug fix -- cap min of roundscore at 0
            boolean doDeclarersWin = roundScore < 40 * numDecks;
            //int scoreIncrease = doDeclarersWin
            //        ? (roundScore == 0 ? 3 : 2 - roundScore / (20 * numDecks))
            //        : roundScore / (20 * numDecks) - 2;

            // [EditByRan] speed up the game with 20/30 score for each level
            int scoreIncrease = doDeclarersWin
                    ? (roundScore == 0 ? 5 : 4 - roundScore / (10 * numDecks))
                    : roundScore / (10 * numDecks) - 4;

            finishRound(doDeclarersWin, scoreIncrease);

            currentPlayerIndex = -1;
        }
    }

    public synchronized void takeBack(String playerId) {
        List<Play> plays = currentTrick.getPlays();
        if (plays.isEmpty())
            throw new IllegalStateException();

        Play lastPlay = plays.get(plays.size() - 1);
        if (!lastPlay.getPlayerId().equals(playerId))
            throw new IllegalStateException();

        currentTrick.getPlays().remove(plays.size() - 1);
        currentTrick.setWinningPlayerId(winningPlayerId(currentTrick));
        playerHands.get(playerId).addAll(lastPlay.getCardIds());
        sortCards(playerHands.get(playerId));
        currentPlayerIndex = playerIds.indexOf(playerId);
        updateFindAFriendDeclaration();
    }

    public synchronized void forfeitRound(String playerId) {
        boolean doDeclarersWin = !isDeclaringTeam.get(playerId);
        finishRound(doDeclarersWin, doDeclarersWin ? 1 : 0);
    }

    private void finishRound(boolean doDeclarersWin, int scoreIncrease) {
        roundNumber++;
        int prevStarterPlayerIndex = starterPlayerIndex;
        do {
            // starter goes to next person on the winning team
            starterPlayerIndex = (starterPlayerIndex + 1) % playerIds.size();
            kittyOwnerIndex = starterPlayerIndex;
        } while (starterPlayerIndex != prevStarterPlayerIndex
                && isDeclaringTeam.get(playerIds.get(starterPlayerIndex)) != doDeclarersWin);
        winningPlayerIds.clear();
        for (String playerId : playerIds)
            if (isDeclaringTeam.get(playerId) == doDeclarersWin) {
                updatePlayerScore(playerId, scoreIncrease, doDeclarersWin);
                winningPlayerIds.add(playerId);
            }
        status = GameStatus.START_ROUND;
    }

    private void updatePlayerScore(String playerId, int scoreIncrease, boolean doDeclarersWin) {
        // [EditByRan] if mustPlayX is True, the player cannot pass X except that he/she belongs to the declarer team and stands on X.
        int oldScore = playerRankScores.get(playerId).ordinal();
        int oldCycle = playerRankCycles.get(playerId);
        int newScore = oldScore;
        int newCycle = oldCycle;
        if (scoreIncrease <= 0){
            newScore = playerRankScores.get(playerId).ordinal() + scoreIncrease;
            newScore = (newScore < Card.Value.TWO.ordinal())? Card.Value.TWO.ordinal() : newScore;
        }
        else {
            while (scoreIncrease > 0){
                // [EditByRan] check for non-declarers is before upgrade
                if (mustPlay5 && !doDeclarersWin && newScore == Card.Value.FIVE.ordinal())
                        break;
                if (mustPlay10 && !doDeclarersWin && newScore == Card.Value.TEN.ordinal())
                        break;
                if (mustPlayK && !doDeclarersWin && newScore == Card.Value.KING.ordinal())
                        break;

                // [EditByRan] if someone exceeds ACE, continue by connecting TWO after ACE
                if (newScore == Card.Value.ACE.ordinal()){
                    newScore = Card.Value.TWO.ordinal();
                    newCycle = newCycle + 1;
                } else
                    newScore = newScore + 1;

                // [EditByRan] check for declarers is after upgrade
                if (mustPlay5 && doDeclarersWin && newScore == Card.Value.FIVE.ordinal())
                        break;
                if (mustPlay10 && doDeclarersWin && newScore == Card.Value.TEN.ordinal())
                        break;
                if (mustPlayK && doDeclarersWin && newScore == Card.Value.KING.ordinal())
                        break;
                scoreIncrease -= 1;
            }
        }
        playerRankScores.put(playerId, Card.Value.values()[newScore]);
        playerRankCycles.put(playerId, newCycle);
        // if (newScore > Card.Value.ACE.ordinal())
        //    playerRankScores.put(playerId, Card.Value.ACE);
        // else if (newScore < Card.Value.TWO.ordinal())
        //     playerRankScores.put(playerId, Card.Value.TWO);
        // else
        //    playerRankScores.put(playerId, Card.Value.values()[newScore]);
    }

    public Card getCurrentTrump() {
        if (starterPlayerIndex >= playerIds.size())
            return null;

        Card.Value trumpValue = playerRankScores.get(playerIds.get(starterPlayerIndex));

        if (declaredCards != null && !declaredCards.isEmpty())
            return new Card(trumpValue, cardsById.get(declaredCards.get(declaredCards.size() - 1).getCardIds().get(0)).getSuit());

        for (int cardId : exposedBottomCards) {
            Card card = cardsById.get(cardId);
            if (card.getValue() == trumpValue)
                return new Card(trumpValue, card.getSuit());
        }

        if (exposedBottomCards.size() == getKittySize()) {
            Card highestCard = null;
            for (int cardId : exposedBottomCards) {
                Card card = cardsById.get(cardId);
                if (card.getSuit() == Card.Suit.JOKER)
                    continue;
                if (highestCard == null || card.getValue().ordinal() > highestCard.getValue().ordinal())
                    highestCard = card;
            }
            if (highestCard != null)
                return new Card(trumpValue, highestCard.getSuit());
        }

        return new Card(trumpValue, Card.Suit.JOKER);
    }

    public int getKittySize() {
        if (playerIds.isEmpty())
            return 0;
        int kittySize = numDecks * Decks.SIZE % playerIds.size();
        while (kittySize < 5)
            kittySize += playerIds.size();
        return kittySize;
    }

    public Map<Integer, Card> getPublicCards() {
        Map<Integer, Card> publicCards = new HashMap<>();
        if (declaredCards != null)
            for (Play play : declaredCards)
                for (int cardId : play.getCardIds())
                    publicCards.put(cardId, cardsById.get(cardId));
        for (Trick trick : getAllTricks())
            for (Play play : trick.getPlays())
                for (int cardId : play.getCardIds())
                    publicCards.put(cardId, cardsById.get(cardId));
        return publicCards;
    }

    public Map<Integer, Card> getPrivateCards(String playerId) {
        Map<Integer, Card> privateCards = new HashMap<>();
        if (playerHands != null && playerHands.containsKey(playerId))
            for (int cardId : playerHands.get(playerId))
                privateCards.put(cardId, cardsById.get(cardId));
        if (kitty != null)
            for (int cardId : kitty)
                privateCards.put(cardId, cardsById.get(cardId));
        return privateCards;
    }

    public List<Trick> getAllTricks() {
        List<Trick> allTricks = new ArrayList<>();
        if (pastTricks != null)
            allTricks.addAll(pastTricks);
        if (currentTrick != null)
            allTricks.add(currentTrick);
        return allTricks;
    }

    private void sortCards(List<Integer> hand) {
        Card trump = getCurrentTrump();
        Collections.sort(hand, Comparator.comparing(cardId -> {
            Card card = cardsById.get(cardId);
            Grouping grouping = Cards.grouping(card, trump);
            return grouping.ordinal() * 1000 + Cards.rank(card, trump) * 10 + card.getSuit().ordinal();
        }));
    }

    public int totalCardScore(Collection<Integer> cardIds) {
        int score = 0;
        for (int cardId : cardIds) {
            Card card = cardsById.get(cardId);
            if (card.getValue() == Card.Value.FIVE)
                score += 5;
            else if (card.getValue() == Card.Value.TEN || card.getValue() == Card.Value.KING)
                score += 10;
        }
        return score;
    }

    private boolean isPlayable(Play play) {
        List<Integer> hand = new ArrayList<>(playerHands.get(play.getPlayerId()));
        for (Integer card : play.getCardIds())
            if (!hand.remove(card))
                return false;
        return true;
    }

    public Grouping getGrouping(Collection<Integer> cardIds) {
        Set<Grouping> groupings = cardIds.stream()
            .map(cardsById::get)
            .map(card -> Cards.grouping(card, getCurrentTrump()))
            .collect(Collectors.toSet());
        return groupings.size() == 1 ? Iterables.getOnlyElement(groupings) : null;
    }

    // [EditByRan]
    public List<Component> getProfile(Collection<Integer> cardIds, int widthCap) {
        if (getGrouping(cardIds) == null)
            return new ArrayList<>();

        Card trump = getCurrentTrump();
        List<Card> cards = cardIds.stream()
                .map(cardsById::get)
                .collect(Collectors.toList());
        List<Component> profile = cards.stream()
            .distinct()
            .map(card -> {
                return new Component(
                    new Shape(Collections.frequency(cards, card), 1),
                    Cards.rank(card, trump),
                    Cards.rank(card, trump),
                    cardIds.stream().filter(cardId -> cardsById.get(cardId).equals(card)).collect(Collectors.toSet()));
            })
            .collect(Collectors.toList());
        
        // [EditByRan] New function that split Component based on the widthCap
        while (splitComponentsUnderWidthCap(profile, widthCap));
        
        while (combineConsecutiveComponents(profile));

        return profile;
    }
    
    // [EditByRan] New function that split Component based on the widthCap
    private static boolean splitComponentsUnderWidthCap(List<Component> profile, int widthCap) {
        for (int i = 0; i < profile.size(); i++) {
            Component component = profile.get(i);
            if (component.shape.width > widthCap){
                List<Integer> cardIdsList = component.cardIds.stream().collect(Collectors.toList());
                List<Integer> cardIdsList1 = cardIdsList.subList(0, widthCap);
                List<Integer> cardIdsList2 = cardIdsList.subList(widthCap, component.shape.width);
                profile.add(
                    new Component(
                        new Shape(widthCap, component.shape.height),
                        component.minRank,
                        component.maxRank,
                        cardIdsList1.stream().collect(Collectors.toSet())
                    )
                );
                profile.set(i, 
                    new Component(
                        new Shape(component.shape.width - widthCap, component.shape.height),
                        component.minRank,
                        component.maxRank,
                        cardIdsList2.stream().collect(Collectors.toSet())
                    )
                );
                return true;
            }
        }
        return false;
    }

    private static boolean combineConsecutiveComponents(List<Component> profile) {
        for (int i = 0; i < profile.size(); i++)
            for (int j = 0; j < profile.size(); j++) {
                Component component1 = profile.get(i);
                Component component2 = profile.get(j);
                if (component1.shape.width == component2.shape.width
                        && component1.shape.width >= 2
                        && component1.minRank - component2.maxRank == 1) {
                    profile.set(i, new Component(
                        new Shape(component1.shape.width, component1.shape.height + component2.shape.height),
                        component2.minRank,
                        component1.maxRank,
                        Streams.concat(component1.cardIds.stream(), component2.cardIds.stream()).collect(Collectors.toSet())));
                    profile.remove(j);
                    return true;
                }
            }
        return false;
    }

    public String winningPlayerId(Trick trick) {
        String winningPlayerId = trick.getStartPlayerId();
        List<Play> plays = trick.getPlays();
        if (!plays.isEmpty()) {
            // [EditByRan]: the starting player has WidthCap = 10, meaning no limit
            List<Component> bestProfile = getProfile(plays.get(0).getCardIds(), 10);
            Grouping bestGrouping = getGrouping(plays.get(0).getCardIds());
             
            // [EditByRan]: the starting player has WidthCap = 10, meaning no limit
            List<Component> startingProfile = getProfile(plays.get(0).getCardIds(), 10);
            Grouping startingGrouping = getGrouping(plays.get(0).getCardIds());
            int startingWidthCap = startingProfile.stream().mapToInt(component -> component.getShape().getWidth()).max().orElse(0);

            for (int i = 1; i < plays.size(); i++) {
                Play play = plays.get(i);
                // [EditByRan]: following players are limited by startingWidthCap
                List<Component> profile = getProfile(play.getCardIds(), startingWidthCap);
                Grouping grouping = getGrouping(play.getCardIds());

                // [EditByRan] the previous version had else clause only.
                if (startingProfile.size() > 1 && startingGrouping == Grouping.TRUMP)  // Special play in TRUMP is the largest
                    continue;
                else if (startingProfile.size() > 1 && startingGrouping != Grouping.TRUMP && grouping != Grouping.TRUMP)  // Special play within non-TRUMP is the largest
                    continue;
                else { // Special play: non-trump vs trump, or normal play
                    if (hasCoveringShape(profile, bestProfile)) {
                        if ((grouping == Grouping.TRUMP && bestGrouping != Grouping.TRUMP)
                                || (grouping == bestGrouping && rank(profile) > rank(bestProfile))) {
                            winningPlayerId = play.getPlayerId();
                            bestProfile = profile;
                            bestGrouping = grouping;
                        }
                    }
                }
            }
        }
        return winningPlayerId;
    }

    /**
     * Returns whether my play "covers" the other play. For example, if myPlay is a single pair and
     * otherPlay is two singles, then the pair covers the singles. This method is used to check the
     * first requirement of beating a play in Tractor: whether your play has the same "shape".
     */
    // [EditByRan] bug notice -- if otherPlay.size() > 1, this is a special play, the length of myPlay and otherPlay can be different and leads to an error outcome, e.g. 99 > AK.
    private static boolean hasCoveringShape(List<Component> myPlay, List<Component> otherPlay) {
        TreeMultiset<Shape> myShapes = TreeMultiset.create(Comparator.comparing(shape -> shape.getWidth() * shape.getHeight()));
        for (Component component : myPlay)
            myShapes.add(component.getShape());
        List<Shape> otherShapes = otherPlay.stream()
            .map(Component::getShape)
            .sorted(Comparator.<Shape, Integer>comparing(shape -> shape.getWidth() * shape.getHeight()).reversed())
            .collect(Collectors.toList());
        for (Shape otherShape : otherShapes) {
            // For each shape in the other play, find a component of my play that "covers" it (has at least that width
            // and height), and then remove the relevant cards. This is a greedy algorithm that isn't guaranteed to be
            // correct, but works for all practical cases if we try to match our smallest components with the other
            // play's largest components.
            boolean found = false;
            for (Shape myShape : myShapes) {
                if (myShape.getWidth() >= otherShape.getWidth() && myShape.getHeight() >= otherShape.getHeight()) {
                    myShapes.remove(myShape);
                    if (myShape.getHeight() > otherShape.getHeight())
                        myShapes.add(new Shape(myShape.getWidth(), myShape.getHeight() - otherShape.getHeight()));
                    if (myShape.getWidth() > otherShape.getWidth())
                        myShapes.add(new Shape(myShape.getWidth() - otherShape.getHeight(), otherShape.getHeight()));
                    found = true;
                    break;
                }
            }
            if (!found)
                return false;
        }
        return myShapes.isEmpty();
    }

    private static int rank(List<Component> profile) {
        return profile.stream().mapToInt(component -> component.getCardIds().size() * 1000 + component.getMaxRank()).max().orElse(0);
    }
}
