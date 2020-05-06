import { isDataEmpty, getDataHash } from '../helpers';

describe('isDataEmpty', () => {
  const testCases = [
    { text: 'String of numbers', data: '122015', expectation: false },
    { text: 'One Number', data: 1, expectation: false },
    { text: 'One string of one number', data: '0', expectation: false },
    { text: 'Number zero', data: 0, expectation: false },
    { text: 'String', data: 'ThisisAnString', expectation: false },
    { text: 'Object with data', data: { objectWithData: 4 }, expectation: false },
    { text: 'Array of number one', data: [1], expectation: false },
    { text: 'Array of number zero', data: [0], expectation: false },
    { text: 'Array of strings', data: ['String'], expectation: false },
    { text: 'Empty string', data: '', expectation: true },
    { text: 'Empty object', data: {}, expectation: true },
    { text: 'Empty array', data: [], expectation: true },
    { text: 'null', data: null, expectation: true },
    { text: 'undefined', data: undefined, expectation: true },
    { text: 'false', data: false, expectation: true },
    { text: 'true', data: true, expectation: true },
  ];
  testCases.forEach((testCase) => {
    it(`should return whether data passed is considered empty or not [${testCase.text}]`, () => {
      expect(isDataEmpty(testCase.data)).toEqual(testCase.expectation);
    });
  });
});

describe('getDataHash', () => {
  const SALT = 'TEST';
  const testCases = [
    {
      text: 'String of numbers',
      data: '122015',
      expectation: '8c1e6c313e1e57e1ad6516f67e1ec009cc18da97147db227b9cad56c9839cbe8',
    },
    {
      text: 'One Number',
      data: 1,
      expectation: 'fe4fd3c2cc3894f3b19dd0c06a846815ae122ad69ec507b9ad3048a7b96a37f0',
    },
    {
      text: 'One string of one number',
      data: '0',
      expectation: 'fb68c74c2ef8e992baa32255b1e64b2ec92113bd9ed88304d62aacc24208c508',
    },
    {
      text: 'Number zero',
      data: 0,
      expectation: 'fb68c74c2ef8e992baa32255b1e64b2ec92113bd9ed88304d62aacc24208c508',
    },
    {
      text: 'String',
      data: 'ThisisAnString',
      expectation: '1fb0d186022d2edbe3c744b103d286fa34805c8b7cec0c8b6a54c2fd931d17e8',
    },
    {
      text: 'Object with data',
      data: { objectWithData: 4 },
      expectation: 'ec6996a092d47ee17b95fcb1ca5659bfdfcbe1f679bbf815e594ad8bad93f6a3',
    },
    {
      text: 'Array of number one',
      data: [1],
      expectation: '698ff76eb46b21c4437c183fbcd2588a193c724bd0d995e2164300f24feddf53',
    },
    {
      text: 'Array of number zero',
      data: [0],
      expectation: '590f55608d53ae82e36f6ae6bf7ac750f1b4427d81d12e84a9ad9fc310c89aad',
    },
    {
      text: 'Array of strings',
      data: ['String'],
      expectation: '6b480ce7edbcc24844373666bf23bc94dc64c80f782e4a4d92460dd6ad0f7b00',
    },
    { text: 'Empty string', data: '', expectation: null },
    { text: 'Empty object', data: {}, expectation: null },
    { text: 'Empty array', data: [], expectation: null },
    { text: 'null', data: null, expectation: null },
    { text: 'undefined', data: undefined, expectation: null },
    { text: 'false', data: false, expectation: null },
    { text: 'true', data: true, expectation: null },
  ];
  testCases.forEach((testCase) => {
    it(`should return the object hash [${testCase.text}]`, () => {
      expect(getDataHash(testCase.data, SALT)).toEqual(testCase.expectation);
    });
  });
});
