export enum Genre {
  Blues,
  Country,
  Folk,
  Jazz,
  Rock,
  Soul
}

export interface Album {
  artist: string;
  title: string;
  genre: Genre;
  year: number;
}

export const isOldTimey = (album: Album): boolean => {
  const { genre, year } = album;
  return year < 1950 && (genre === Genre.Blues || genre === Genre.Country || genre === Genre.Folk);
}

const dustBowlBallads: Album = {
  artist: 'Woody Guthrie',
  title: 'Dust Bowl Ballads',
  genre: Genre.Folk,
  year: 1940,
};

console.log(isOldTimey(dustBowlBallads)) // true
