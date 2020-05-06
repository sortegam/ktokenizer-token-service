import {
  normalizeCardData,
  getBINFromPAN,
  getLast4FromPAN,
  getExpYearFromString,
  getExpMonthFromString,
} from '../helpers';

/**
 * Given a validated and accepted creditcardData it should normalize it properly
 */
describe('normalizeCardData', () => {
  const testCases = [
    {
      text: 'Standard case',
      cardData: {
        pan: '4916608679662150',
        expiration: '122025',
        cardHolder: 'John Doe',
      },
      expectation: {
        pan: '4916608679662150',
        expiration: '122025',
        cardHolder: 'John Doe',
      },
    },
    {
      text: 'PAN with dashes',
      cardData: {
        pan: '4916-6086-7966-2150',
        expiration: '122025',
        cardHolder: 'John Doe',
      },
      expectation: {
        pan: '4916608679662150',
        expiration: '122025',
        cardHolder: 'John Doe',
      },
    },
    {
      text: 'PAN with spaces',
      cardData: {
        pan: '4916 6086 7966 2150',
        expiration: '122025',
        cardHolder: 'John Doe',
      },
      expectation: {
        pan: '4916608679662150',
        expiration: '122025',
        cardHolder: 'John Doe',
      },
    },
  ];
  testCases.forEach((testCase) => {
    it('should normalizeCardData properly', () => {
      expect(normalizeCardData(testCase.cardData)).toEqual(testCase.expectation);
    });
  });
});

describe('getBINFromPAN', () => {
  const testCases = [
    { pan: '4123123412341234', expectation: '412312' },
    { pan: '', expectation: '' },
    { pan: '1234', expectation: '1234' },
    { pan: '0987120387', expectation: '098712' },
  ];
  testCases.forEach((testCase) => {
    it(`should get BIN from PAN properly for PAN: ${testCase.pan}`, () => {
      expect(getBINFromPAN(testCase.pan)).toEqual(testCase.expectation);
    });
  });
});

describe('getLast4FromPAN', () => {
  const testCases = [
    { pan: '4123123412341234', expectation: '1234' },
    { pan: '', expectation: '' },
    { pan: '4321', expectation: '4321' },
    { pan: '0987120387', expectation: '0387' },
  ];
  testCases.forEach((testCase) => {
    it(`should get Last4 from PAN properly for PAN: ${testCase.pan}`, () => {
      expect(getLast4FromPAN(testCase.pan)).toEqual(testCase.expectation);
    });
  });
});

describe('getExpYearFromString', () => {
  const testCases = [
    { strDate: '122015', expectation: '2015' },
    { strDate: '032017', expectation: '2017' },
    { strDate: '012018', expectation: '2018' },
    { strDate: '', expectation: '' },
  ];
  testCases.forEach((testCase) => {
    it(`should get Expiration Year from Passed String properly for str: ${
      testCase.strDate
    }`, () => {
      expect(getExpYearFromString(testCase.strDate)).toEqual(testCase.expectation);
    });
  });
});

describe('getExpMonthFromString', () => {
  const testCases = [
    { strDate: '122015', expectation: '12' },
    { strDate: '032017', expectation: '03' },
    { strDate: '012018', expectation: '01' },
    { strDate: '', expectation: '' },
  ];
  testCases.forEach((testCase) => {
    it(`should get Expiration Month from Passed String properly for str: ${
      testCase.strDate
    }`, () => {
      expect(getExpMonthFromString(testCase.strDate)).toEqual(testCase.expectation);
    });
  });
});
