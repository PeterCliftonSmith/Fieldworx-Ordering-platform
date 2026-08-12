type SupplierImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

export function SupplierImage({
  src,
  alt,
  className,
  priority = false,
}: SupplierImageProps) {
  return (
    // Native img so admins can paste any https image URL without Next image host config.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
