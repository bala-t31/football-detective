import { Brain, Calendar, EyeOff, Flame, Route, Search, Skull, Target, Trophy, Zap, type LucideProps } from 'lucide-react';

const ICONS = {
  search: Search,
  target: Target,
  'eye-off': EyeOff,
  brain: Brain,
  flame: Flame,
  skull: Skull,
  route: Route,
  trophy: Trophy,
  calendar: Calendar,
  zap: Zap,
} as const;

export function AchievementIcon({ icon, ...props }: { icon: string } & LucideProps) {
  const Icon = ICONS[icon as keyof typeof ICONS] ?? Trophy;
  return <Icon {...props} />;
}
