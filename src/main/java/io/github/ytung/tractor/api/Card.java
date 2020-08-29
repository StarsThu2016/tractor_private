
package io.github.ytung.tractor.api;

import lombok.Data;

@Data
public class Card {

    public enum Value {
        TWO, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE, TEN, JACK, QUEEN, KING, ACE, SMALL_JOKER, BIG_JOKER
    };

    public enum Suit {
        SPADE, HEART, DIAMOND, CLUB, JOKER
    };

    // [EditByRan] change to public
    public final Value value;

    public final Suit suit;
}
