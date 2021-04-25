
export const VALUES = Object.freeze({
  'TWO': '2',
  'THREE': '3',
  'FOUR': '4',
  'FIVE': '5',
  'SIX': '6',
  'SEVEN': '7',
  'EIGHT': '8',
  'NINE': '9',
  'TEN': '10',
  'JACK': 'J',
  'QUEEN': 'Q',
  'KING': 'K',
  'ACE': 'A',
});

var PLUS0 = {0: ''};

for (let i = 1; i < 100; i++){
  PLUS0[i] = PLUS0[i-1] + '+';
}

export const PLUS = Object.freeze(PLUS0);

// [EditByRan] device-specific rendering
export const SUITS_SHORT = Object.freeze({
  'CLUB': '♣',
  'DIAMOND': '♢',
  'HEART': '♡',
  'SPADE': '♠',
});

export const SUITS = Object.freeze({
  'CLUB': 'CLUBS ♣',
  'DIAMOND': 'DIAMONDS ♢',
  'HEART': 'HEARTS ♡',
  'SPADE': 'SPADES ♠',
});

export const ORDINALS = [
  'OTHER',
  'FIRST',
  'SECOND',
  'THIRD',
  'FOURTH',
  'FIFTH',
  'SIXTH',
  'SEVENTH',
  'EIGHTH',
  'NINTH',
  'TENTH',
];
