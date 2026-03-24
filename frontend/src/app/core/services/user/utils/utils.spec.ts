import { getUrl } from './utils';

describe('getUrl', () => {
  it('should concatenate base url and paths', () => {
    expect(getUrl('http://api.example.com/', 'users', '/123')).toBe(
      'http://api.example.com/users/123',
    );
  });
});
