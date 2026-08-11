import Image from 'next/image';
import { cn } from '@/lib/utils';

type BrandLogoProps = {
  variant?: 'dark' | 'light';
  className?: string;
  priority?: boolean;
};

const LOGOS = {
  dark: {
    src: '/brand/frilo-logo-black.png',
    width: 1821,
    height: 545,
  },
  light: {
    src: '/brand/frilo-logo-white.png',
    width: 1776,
    height: 560,
  },
} as const;

export function BrandLogo({ variant = 'dark', className, priority = false }: BrandLogoProps) {
  const logo = LOGOS[variant];

  return (
    <span className={cn('inline-flex w-full items-center', className)}>
      <Image
        src={logo.src}
        alt="FRILO"
        width={logo.width}
        height={logo.height}
        priority={priority}
        unoptimized
        sizes="(max-width: 768px) 112px, 128px"
        className="h-auto w-full object-contain"
      />
    </span>
  );
}
