import { forwardRef, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { haptic } from '@/utils/haptics';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  // Glossy turf-mint capsule with an inner highlight
  primary:
    'text-[#052016] bg-[linear-gradient(180deg,#7ff0bf_0%,#4be3a0_45%,#2fc785_100%)] shadow-[inset_0_1px_0_rgb(255_255_255/0.6),inset_0_-1px_0_rgb(0_0_0/0.15),0_10px_30px_-10px_rgb(75_227_160/0.7)] hover:brightness-110 disabled:bg-none disabled:bg-white/[0.08] disabled:text-ink-faint disabled:shadow-none',
  // Frosted glass capsule
  secondary:
    'text-ink bg-white/[0.08] border border-white/[0.12] backdrop-blur-xl shadow-[inset_0_1px_0_rgb(255_255_255/0.14)] hover:bg-white/[0.12] disabled:text-ink-faint disabled:hover:bg-white/[0.08]',
  ghost: 'text-ink-muted hover:text-ink hover:bg-white/[0.06] disabled:text-ink-faint',
  danger: 'text-bad bg-bad/10 border border-bad/25 hover:bg-bad/15',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13.5px] gap-1.5',
  md: 'h-12 px-5 text-[15px] gap-2',
  lg: 'h-14 px-6 text-[16px] gap-2.5',
};

export type ButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  children?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', icon, children, className = '', disabled, type = 'button', onTapStart, ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      onTapStart={(e, info) => {
        if (!disabled && variant !== 'ghost') void haptic('light');
        onTapStart?.(e, info);
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`relative inline-flex select-none items-center justify-center overflow-hidden rounded-full font-semibold tracking-[-0.01em] transition-[background,filter,color] duration-200 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {variant === 'primary' && !disabled && (
        <span
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 animate-sheen bg-gradient-to-r from-transparent via-white/40 to-transparent"
          aria-hidden
        />
      )}
      {icon}
      {children}
    </motion.button>
  );
});
