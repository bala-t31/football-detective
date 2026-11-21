import { forwardRef, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-lime text-pitch-950 hover:bg-[#c6ff5c] shadow-[0_0_0_1px_#b7ff35,0_10px_30px_-10px_#b7ff3588] disabled:bg-pitch-700 disabled:text-ink-faint disabled:shadow-none',
  secondary: 'bg-pitch-800 text-ink border border-pitch-700 hover:border-pitch-600 hover:bg-pitch-700/70 disabled:text-ink-faint disabled:hover:bg-pitch-800',
  ghost: 'text-ink-muted hover:text-ink hover:bg-pitch-800 disabled:text-ink-faint',
  danger: 'bg-bad/10 text-bad border border-bad/30 hover:bg-bad/20',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5 rounded-lg',
  md: 'h-11 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-14 px-6 text-[15px] gap-2.5 rounded-xl',
};

export type ButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  children?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', icon, children, className = '', disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={`inline-flex select-none items-center justify-center font-semibold tracking-tight transition-colors duration-150 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </motion.button>
  );
});
