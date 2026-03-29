import { shuffle, toHintLang } from './utils';

describe('shuffle', () => {
  it('should return array with the same length', () => {
    const input = [1, 2, 3, 4];

    const result = shuffle(input);
    expect(result).toHaveLength(input.length);
  });

  it('should not mutate original array', () => {
    const input = [1, 2, 3, 4];
    const copy = [...input];

    shuffle(input);
    expect(input).toEqual(copy);
  });

  it('should return empty array for empty input', () => {
    expect(shuffle([])).toEqual([]);
  });
});

describe('toHintLang', () => {
  it('should return "ru" for "ru"', () => {
    expect(toHintLang('ru')).toBe('ru');
  });

  it('should return "en" for "en"', () => {
    expect(toHintLang('en')).toBe('en');
  });

  it('should return "en" for any unknown value', () => {
    expect(toHintLang('de')).toBe('en');
    expect(toHintLang('')).toBe('en');
    expect(toHintLang('random')).toBe('en');
  });
});
