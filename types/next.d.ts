declare module 'next/image' {
  import { ComponentProps } from 'react';
  
  interface ImageProps extends ComponentProps<'img'> {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    priority?: boolean;
    className?: string;
  }
  
  const Image: React.FC<ImageProps>;
  export default Image;
}
