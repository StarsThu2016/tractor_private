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
var isMobile = (isIOS || isAndroid || isNewBlackBerry || isWebOS || isWindowsMobile || isUnknownMobile);
// isMobile = !isMobile;
var isTablet = (isIPad || (isMobile && !isSmallScreen));

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

function getImageSrc(name) {
  // [EditByRan] device-specific rendering
  var suffix = isMobile ? "_large" : ""
  return `./images/${name}${suffix}.gif`;
}

function getImageName(card) {
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
    }
  }
  {
    const img = new Image();
    img.src = getImageSrc(getImageName({ value: 'BIG_JOKER' }));
  }
  {
    const img = new Image();
    img.src = getImageSrc(getImageName({ value: 'SMALL_JOKER' }));
  }
}

export function getFaceDownCardImageSrc() {
  return getImageSrc('b1fv');
}

export function getCardImageSrc(card) {
  return getImageSrc(getImageName(card));
}
