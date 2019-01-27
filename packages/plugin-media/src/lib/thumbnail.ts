import sharp from 'sharp';

export const thumbnail = (width: number, height?: number) => {
  return sharp()
    .resize(width, height);
};
