import { isValidCardData, isValidFormattedToken } from '../validators';

describe('validator: fn (isValidCardData)', () => {
  const testCases = [
    {
      text: 'No data passed',
      cardData: {},
      expectation: false,
    },
    {
      text: 'Some string passed',
      cardData: 'Some string',
      expectation: false,
    },
    {
      text: 'No PAN passed',
      cardData: { expiration: '122025', cvv: '246', cardHolder: 'John Doe' },
      expectation: false,
    },
    {
      text: 'No expiration passed',
      cardData: { pan: '4532054004053670', cvv: '246', cardHolder: 'John Doe' },
      expectation: false,
    },
    {
      text: 'No cvv passed',
      cardData: { pan: '4532054004053670', expiration: '122025', cardHolder: 'John Doe' },
      expectation: true,
    },
    {
      text: 'No cardHolder passed',
      cardData: { pan: '4532054004053670', expiration: '122025', cvv: '1225' },
      expectation: false,
    },
    {
      text: 'Invalid credit card passed',
      cardData: {
        pan: '0000000000000000',
        expiration: '122025',
        cvv: '1225',
        cardHolder: 'John Doe',
      },
      expectation: false,
    },
    {
      text: 'Card holder with numbers',
      cardData: {
        pan: '4532054004053670',
        expiration: '122025',
        cvv: '1225',
        cardHolder: 'John2 Doe',
      },
      expectation: true,
    },
    {
      text: 'Card holder with 3 chunks',
      cardData: {
        pan: '4532054004053670',
        expiration: '122025',
        cvv: '1225',
        cardHolder: 'Stormy Jony Forever',
      },
      expectation: true,
    },
    {
      text: 'Card holder with multiple chunks',
      cardData: {
        pan: '4532054004053670',
        expiration: '122025',
        cvv: '1225',
        cardHolder: 'Stormy Jony Forever Hello Man',
      },
      expectation: true,
    },
    {
      text: 'Card holder with special accepted chars',
      cardData: {
        pan: '4532054004053670',
        expiration: '122025',
        cvv: '1225',
        cardHolder: 'Mª Josefa Forever',
      },
      expectation: true,
    },
    {
      text: 'Card holder incomplete',
      cardData: { pan: '4532054004053670', expiration: '122025', cvv: '1225', cardHolder: 'Johny' },
      expectation: true,
    },
    {
      text: 'CVV not a number',
      cardData: {
        pan: '4532054004053670',
        expiration: '122025',
        cvv: 'HELLO!',
        cardHolder: 'Johny',
      },
      expectation: false,
    },
    {
      text: 'Expiration not a number',
      cardData: { pan: '4532054004053670', expiration: 'Hello!', cvv: '1225', cardHolder: 'Johny' },
      expectation: false,
    },
    {
      text: 'All Credit data OK and good formatted',
      cardData: {
        pan: '4532054004053670',
        expiration: '122025',
        cvv: '1225',
        cardHolder: 'John Doe',
      },
      expectation: true,
    },
  ];
  testCases.forEach((testCase) => {
    it(`should validate properly a card Data passed [${
      testCase.text
    }] [Result: ${testCase.expectation.toString()}]`, async () => {
      const validCreditCard = await isValidCardData(testCase.cardData);
      expect(validCreditCard).toEqual(testCase.expectation);
    });
  });
});

// #############################################################################

describe('validator: fn (isValidFormattedToken)', () => {
  const testCases = [
    { token: '', expectation: false },
    { token: {}, expectation: false },
    { token: undefined, expectation: false },
    { token: null, expectation: false },
    { token: '1', expectation: false },
    { token: 1, expectation: false },
    { token: '1234567890', expectation: false },
    { token: '123123-3123-123-123-123', expectation: false },
    { token: 'This-is-a-token-yay!', expectation: false },
    { token: 'C56A4180-65AA-111-A945-5FD21DEC0534', expectation: false },
    { token: 'C56A4180-65AA-42EC-A945-5FD21DEC053', expectation: false },
    { token: 'C56A4180-65AA-42EC-A945-5FD21DEC0538', expectation: true },
  ];
  testCases.forEach((testCase) => {
    it(`should validate properly a formatted UUID string passed [${
      testCase.token
    }] [Result: ${testCase.expectation.toString()}]`, async () => {
      const validFormattedToken = await isValidFormattedToken(testCase.token);
      expect(validFormattedToken).toEqual(testCase.expectation);
    });
  });
});
