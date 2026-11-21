export type Confederation = 'UEFA' | 'CONMEBOL' | 'CAF' | 'AFC' | 'CONCACAF' | 'OFC';

interface NationInfo {
  confederation: Confederation;
  flag: string;
  code: string;
}

export const NATIONS: Record<string, NationInfo> = {
  Algeria: { confederation: 'CAF', flag: '🇩🇿', code: 'ALG' },
  Argentina: { confederation: 'CONMEBOL', flag: '🇦🇷', code: 'ARG' },
  Belgium: { confederation: 'UEFA', flag: '🇧🇪', code: 'BEL' },
  Brazil: { confederation: 'CONMEBOL', flag: '🇧🇷', code: 'BRA' },
  Bulgaria: { confederation: 'UEFA', flag: '🇧🇬', code: 'BUL' },
  Cameroon: { confederation: 'CAF', flag: '🇨🇲', code: 'CMR' },
  Canada: { confederation: 'CONCACAF', flag: '🇨🇦', code: 'CAN' },
  Croatia: { confederation: 'UEFA', flag: '🇭🇷', code: 'CRO' },
  'Czech Republic': { confederation: 'UEFA', flag: '🇨🇿', code: 'CZE' },
  Denmark: { confederation: 'UEFA', flag: '🇩🇰', code: 'DEN' },
  Ecuador: { confederation: 'CONMEBOL', flag: '🇪🇨', code: 'ECU' },
  Egypt: { confederation: 'CAF', flag: '🇪🇬', code: 'EGY' },
  England: { confederation: 'UEFA', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', code: 'ENG' },
  France: { confederation: 'UEFA', flag: '🇫🇷', code: 'FRA' },
  Georgia: { confederation: 'UEFA', flag: '🇬🇪', code: 'GEO' },
  Germany: { confederation: 'UEFA', flag: '🇩🇪', code: 'GER' },
  India: { confederation: 'AFC', flag: '🇮🇳', code: 'IND' },
  Italy: { confederation: 'UEFA', flag: '🇮🇹', code: 'ITA' },
  'Ivory Coast': { confederation: 'CAF', flag: '🇨🇮', code: 'CIV' },
  Japan: { confederation: 'AFC', flag: '🇯🇵', code: 'JPN' },
  Liberia: { confederation: 'CAF', flag: '🇱🇷', code: 'LBR' },
  Mexico: { confederation: 'CONCACAF', flag: '🇲🇽', code: 'MEX' },
  Netherlands: { confederation: 'UEFA', flag: '🇳🇱', code: 'NED' },
  Norway: { confederation: 'UEFA', flag: '🇳🇴', code: 'NOR' },
  Poland: { confederation: 'UEFA', flag: '🇵🇱', code: 'POL' },
  Portugal: { confederation: 'UEFA', flag: '🇵🇹', code: 'POR' },
  'Republic of Ireland': { confederation: 'UEFA', flag: '🇮🇪', code: 'IRL' },
  Senegal: { confederation: 'CAF', flag: '🇸🇳', code: 'SEN' },
  Slovenia: { confederation: 'UEFA', flag: '🇸🇮', code: 'SVN' },
  'South Korea': { confederation: 'AFC', flag: '🇰🇷', code: 'KOR' },
  Spain: { confederation: 'UEFA', flag: '🇪🇸', code: 'ESP' },
  Sweden: { confederation: 'UEFA', flag: '🇸🇪', code: 'SWE' },
  Ukraine: { confederation: 'UEFA', flag: '🇺🇦', code: 'UKR' },
  Uruguay: { confederation: 'CONMEBOL', flag: '🇺🇾', code: 'URU' },
  USA: { confederation: 'CONCACAF', flag: '🇺🇸', code: 'USA' },
  Wales: { confederation: 'UEFA', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', code: 'WAL' },
};

export function nationInfo(nation: string): NationInfo {
  return NATIONS[nation] ?? { confederation: 'UEFA', flag: '🏳️', code: nation.slice(0, 3).toUpperCase() };
}
