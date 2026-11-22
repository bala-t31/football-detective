/** Emoji Clue: a player's career told only in emojis. */
import type { Player } from '@/types';
import { PLAYERS } from '@/data';
import { nationInfo } from '@/data/nations';
import { HONOURS } from '@/data/honours';

export const EMOJI_TRIES = 3;
export const EMOJI_POINTS = [150, 100, 60];

/** Country flag for each league (lower leagues share their country's flag). */
const LEAGUE_FLAG: Record<string, string> = {
  'Premier League': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'EFL Championship': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'EFL League One': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'EFL League Two': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'National League': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Non-league': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'La Liga': '🇪🇸', 'Segunda División': '🇪🇸',
  'Serie A': '🇮🇹', 'Serie B': '🇮🇹', 'Serie C': '🇮🇹',
  Bundesliga: '🇩🇪', '2. Bundesliga': '🇩🇪',
  'Ligue 1': '🇫🇷', 'Ligue 2': '🇫🇷',
  Eredivisie: '🇳🇱',
  MLS: '🇺🇸', NASL: '🇺🇸', 'USL Championship': '🇺🇸', NPSL: '🇺🇸',
  'Brasileirão': '🇧🇷', 'Brazilian lower leagues': '🇧🇷',
  'Primeira Liga': '🇵🇹', 'Portuguese lower leagues': '🇵🇹', 'Liga Portugal 2': '🇵🇹',
  'Argentine Primera': '🇦🇷', 'Primera Nacional': '🇦🇷',
  'Süper Lig': '🇹🇷',
  'Saudi Pro League': '🇸🇦',
  'Qatar Stars League': '🇶🇦',
  'Belgian Pro League': '🇧🇪',
  'J1 League': '🇯🇵',
  'Indian Super League': '🇮🇳', 'I-League': '🇮🇳',
  'Scottish Premiership': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'Scottish League Two': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'A-League': '🇦🇺',
  'Croatian First League': '🇭🇷',
  'Uruguayan Primera': '🇺🇾',
  'Liga MX': '🇲🇽',
  'Swiss Super League': '🇨🇭',
  'Austrian Bundesliga': '🇦🇹', '2. Liga (Austria)': '🇦🇹',
  'Chinese Super League': '🇨🇳', 'China League One': '🇨🇳',
  'Danish Superliga': '🇩🇰',
  'UAE Pro League': '🇦🇪',
  'Russian Premier League': '🇷🇺',
  Allsvenskan: '🇸🇪',
  'Categoría Primera A': '🇨🇴', 'Categoría Primera B': '🇨🇴',
  'Super League Greece': '🇬🇷', 'Greek Super League': '🇬🇷',
  'Czech First League': '🇨🇿',
  Eliteserien: '🇳🇴', 'Norwegian First Division': '🇳🇴', 'Norwegian lower leagues': '🇳🇴',
  'Egyptian Premier League': '🇪🇬',
  'Chilean Primera': '🇨🇱',
  'Ukrainian Premier League': '🇺🇦',
  'Bulgarian First League': '🇧🇬',
  'Serbian SuperLiga': '🇷🇸',
  'League of Ireland': '🇮🇪',
  'Liga 1 (Indonesia)': '🇮🇩',
  'Persian Gulf Pro League': '🇮🇷',
  'Hong Kong Premier League': '🇭🇰',
  'Bosnian Premier League': '🇧🇦',
  'Paraguayan Primera': '🇵🇾',
  'Hungarian NB I': '🇭🇺',
  'Liga I': '🇷🇴',
  'Slovenian PrvaLiga': '🇸🇮',
  'Erovnuli Liga': '🇬🇪',
  'K League 1': '🇰🇷',
  'Ivorian Ligue 1': '🇨🇮',
  'Azerbaijan Premier League': '🇦🇿',
  'Ecuadorian Serie A': '🇪🇨',
  'Uzbekistan Super League': '🇺🇿',
  'Angolan Girabola': '🇦🇴',
  'Thai League 1': '🇹🇭',
  'I liga (Poland)': '🇵🇱', Ekstraklasa: '🇵🇱',
  'Cameroonian Elite One': '🇨🇲',
  'Botola Pro': '🇲🇦',
  'Mozambican league': '🇲🇿',
};

const POSITION_EMOJI: Record<string, string> = { GK: '🧤', CB: '🧱', FB: '↔️', DM: '🛡️', CM: '⚙️', AM: '🪄', W: '💨', ST: '🎯' };

export interface EmojiTile {
  emoji: string;
  meaning: string;
}

function allText(p: Player): string {
  return [...p.clues.map((c) => c.text), ...(HONOURS[p.id] ?? [])].join(' ');
}

export function emojiTiles(p: Player): EmojiTile[] {
  const tiles: EmojiTile[] = [];
  tiles.push({ emoji: nationInfo(p.nationality).flag, meaning: 'Nationality' });
  tiles.push({ emoji: POSITION_EMOJI[p.position] ?? '⚽', meaning: 'Position' });
  const path: string[] = [];
  // Countries he played in, in career order.
  const seen = new Set<string>();
  for (const league of p.leagues) {
    const flag = LEAGUE_FLAG[league];
    if (flag && !seen.has(flag)) {
      seen.add(flag);
      path.push(flag);
    }
  }
  path.slice(0, 5).forEach((f, i) => tiles.push({ emoji: f, meaning: i === 0 ? 'First country he played in' : 'Then played in' }));
  const text = allText(p);
  if (p.worldCupWinner) tiles.push({ emoji: '🏆', meaning: 'World Cup winner' });
  if (/Champions League|European Cup/.test(text)) tiles.push({ emoji: '⭐', meaning: 'Won the Champions League / European Cup' });
  if (p.ballonDorAwards > 0) tiles.push({ emoji: p.ballonDorAwards > 1 ? `🥇×${p.ballonDorAwards}` : '🥇', meaning: "Ballon d'Or" });
  if (p.retired) tiles.push({ emoji: '🏁', meaning: 'Retired' });
  return tiles;
}

/** Extra hints after a wrong guess. */
export function emojiHints(p: Player): string[] {
  const decade = `${Math.floor(p.from / 10) * 10}s`;
  const shirt = p.shirtNumbers.length ? `Wore No. ${p.shirtNumbers[p.shirtNumbers.length - 1]}` : null;
  return [`Started his career in the ${decade}`, shirt ?? `Played for ${new Set(p.careerClubs).size} clubs`];
}

/** Well-known players whose emoji line says enough: at least 4 tiles. */
export const EMOJI_POOL: Player[] = PLAYERS.filter((p) => p.difficulty !== 'hard' && emojiTiles(p).length >= 4);

export function nextEmojiPlayer(exclude: string[]): Player {
  const fresh = EMOJI_POOL.filter((p) => !exclude.includes(p.id));
  const list = fresh.length ? fresh : EMOJI_POOL;
  return list[Math.floor(Math.random() * list.length)];
}

export const emojiPoints = (triesUsed: number): number => EMOJI_POINTS[Math.min(triesUsed, EMOJI_TRIES) - 1] ?? 0;
