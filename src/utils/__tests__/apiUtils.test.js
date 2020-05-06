import { getRequestIPAddress } from 'utils/apiUtils';

describe('apiUtils: fn (getRequestIPAddress)', () => {
  const testCases = [
    { name: 'Empty request object', req: {}, expectation: '' },
    {
      name: 'Request object without the needed fields',
      req: { otherfield: true },
      expectation: '',
    },
    {
      name: 'Good request object with SourceIP',
      req: {
        apiGateway: { event: { requestContext: { identity: { sourceIp: '100.200.300.400' } } } },
      },
      expectation: '100.200.300.400',
    },
  ];
  testCases.forEach((testCase) => {
    it(`should return a valid IP from the express request object: ${testCase.name}`, () => {
      expect(getRequestIPAddress(testCase.req)).toEqual(testCase.expectation);
    });
  });
});
