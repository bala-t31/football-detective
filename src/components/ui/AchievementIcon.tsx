import { ArrowUpDown, Banknote, Shirt, Brain, Calendar, Crown, EyeOff, Flame, Route, Search, Skull, Target, Trophy, Users, Waypoints, Zap, type LucideProps } from 'lucide-react';

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
  waypoints: Waypoints,
  users: Users,
  crown: Crown,
  shirt: Shirt,
  banknote: Banknote,
  'arrow-up-down': ArrowUpDown,
} as const;

export function AchievementIcon({ icon, ...props }: { icon: string } & LucideProps) {
  const Icon = ICONS[icon as keyof typeof ICONS] ?? Trophy;
  return <Icon {...props} />;
}
