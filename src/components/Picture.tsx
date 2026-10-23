import type { ImageAsset } from '../content/site'

export function Picture({ image, sizes, className }: { image: ImageAsset; sizes: string; className?: string }) {
  return (
    <figure className={`picture${className ? ` ${className}` : ''}`}>
      <img
        src={image.src}
        srcSet={`${image.srcSmall} 800w, ${image.src} 1600w`}
        sizes={sizes}
        width={image.width}
        height={image.height}
        alt={image.alt}
        loading="lazy"
        decoding="async"
      />
      {image.illustrative && <figcaption className="picture__flag">Imagen ilustrativa</figcaption>}
    </figure>
  )
}
