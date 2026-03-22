import { normalize } from './utils';

describe('normalize', () => {
  it('should return normalized string', () => {
    const value = ' teSt ';
    const expected = 'test';
    const result = normalize(value);
    expect(result).toBe(expected);
  });
});
