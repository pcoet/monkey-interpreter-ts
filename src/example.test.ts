import { Album, Genre, isOldTimey } from './example';

describe('isOldTimey', () => {
  test('returns false when the album year is greater than or equal to 1950', () => {
    const album: Album = {
      artist: 'John Lee Hooker',
      title: 'Endless Boogie',
      genre: Genre.Blues,
      year: 1971,
    };
    expect(isOldTimey(album)).toEqual(false);
  });

  test('returns false when the album genre is jazz', () => {
    const album: Album = {
      artist: 'Benny Goodman',
      title: 'Swing into Spring',
      genre: Genre.Jazz,
      year: 1941,
    };
    expect(isOldTimey(album)).toEqual(false);
  });

  test('returns true when the album year is less than 1950 and the album genre is folk', () => {
    const album: Album = {
      artist: 'Woody Guthrie',
      title: 'Dust Bowl Ballads',
      genre: Genre.Folk,
      year: 1940,
    };
    expect(isOldTimey(album)).toEqual(true);
  });
});
