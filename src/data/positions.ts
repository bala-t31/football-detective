import type { PositionCode, PositionGroup } from '@/types';

export const POSITION_LABEL: Record<PositionCode, string> = {
  GK: 'Goalkeeper',
  CB: 'Centre-Back',
  FB: 'Full-Back',
  DM: 'Defensive Mid',
  CM: 'Central Mid',
  AM: 'Attacking Mid',
  W: 'Winger',
  ST: 'Striker',
};

export const POSITION_SHORT: Record<PositionCode, string> = {
  GK: 'GK', CB: 'CB', FB: 'FB', DM: 'DM', CM: 'CM', AM: 'AM', W: 'WNG', ST: 'ST',
};

export const POSITION_GROUP: Record<PositionCode, PositionGroup> = {
  GK: 'GK',
  CB: 'DEF',
  FB: 'DEF',
  DM: 'MID',
  CM: 'MID',
  AM: 'MID',
  W: 'FWD',
  ST: 'FWD',
};

export const GROUP_LABEL: Record<PositionGroup, string> = {
  GK: 'Goalkeeper',
  DEF: 'Defender',
  MID: 'Midfielder',
  FWD: 'Forward',
};
