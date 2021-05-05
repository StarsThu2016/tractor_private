// [EditByRan] device-specific rendering
import {isMobile} from '../views/room';

const VALUES = Object.freeze({
  'ACE': '1',
  'TWO': '2',
  'THREE': '3',
  'FOUR': '4',
  'FIVE': '5',
  'SIX': '6',
  'SEVEN': '7',
  'EIGHT': '8',
  'NINE': '9',
  'TEN': '10',
  'JACK': 'j',
  'QUEEN': 'q',
  'KING': 'k',
});

const SUITS = Object.freeze({
  'CLUB': 'c',
  'DIAMOND': 'd',
  'HEART': 'h',
  'SPADE': 's',
});

function getImageSrc(name, adaptive = false, large = false, narrow = false) {
  // [EditByRan] device-specific rendering
  var suffix = (isMobile && adaptive && large) ? (narrow ? "_142w_28d" : "_142w_38d") : ((isMobile && adaptive) ? "_106w" : "");
  return (isMobile && adaptive) ? `./images/${name}${suffix}.png` : `./images/${name}${suffix}.gif`;
}

function getImageName(card, adaptive, large) {
  if (card.value == 'SMALL_JOKER') {
    return 'Milli3'; // return 'jb';
  } else if (card.value == 'BIG_JOKER') {
    return 'Andy3'; //return 'jr';
  } else {
    return `${SUITS[card.suit]}${VALUES[card.value]}`;
  }
}

export function preloadCardImages() {
  for (const value in VALUES) {
    for (const suit in SUITS) {
      const img = new Image();
      img.src = getImageSrc(getImageName({ value: value, suit: suit }));
      img.src = getImageSrc(getImageName({ value: value, suit: suit }), true, false, false);
      img.src = getImageSrc(getImageName({ value: value, suit: suit }), true, true, false);
      img.src = getImageSrc(getImageName({ value: value, suit: suit }), true, true, true);
    }
  }
  {
    const img = new Image();
    img.src = getImageSrc(getImageName({ value: 'BIG_JOKER' }));
    img.src = getImageSrc(getImageName({ value: 'BIG_JOKER' }), true, false, false);
    img.src = getImageSrc(getImageName({ value: 'BIG_JOKER' }), true, true, false);
    img.src = getImageSrc(getImageName({ value: 'BIG_JOKER' }), true, true, true);
  }
  {
    const img = new Image();
    img.src = getImageSrc(getImageName({ value: 'SMALL_JOKER' }));
    img.src = getImageSrc(getImageName({ value: 'SMALL_JOKER' }), true, false, false);
    img.src = getImageSrc(getImageName({ value: 'SMALL_JOKER' }), true, true, false);
    img.src = getImageSrc(getImageName({ value: 'SMALL_JOKER' }), true, true, true);
  }
}

export function getFaceDownCardImageSrc(adaptive = false, large = false, narrow = false) {
  return getImageSrc('b1fv', adaptive, large, narrow);
}

export function getCardImageSrc(card, adaptive = false, large = false, narrow = false) {
  return getImageSrc(getImageName(card), adaptive, large, narrow);
}
