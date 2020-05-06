export const normalizeCardData = cardData => ({
  ...cardData,
  pan: cardData && cardData.pan.replace(/-|\s/g, ''), // Remove dashes and spaces
});

// #############################################################################

export const getBINFromPAN = pan => pan && pan.toString().substr(0, 6);

// #############################################################################

export const getLast4FromPAN = pan => pan && pan.toString().substr(-4);

// #############################################################################

export const getExpYearFromString = str => str && str.toString().substr(-4);

// #############################################################################

export const getExpMonthFromString = str => str && str.toString().substr(0, 2);
