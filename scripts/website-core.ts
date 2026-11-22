// Bundled into website/assets/fd-core.js so the website demo uses the real game data and rules.
import { PLAYERS, getPlayer } from '../src/data';
import { compareGuess } from '../src/game/feedback';
import { searchPlayers } from '../src/game/search';
import { nationInfo } from '../src/data/nations';
import { shortClub, shortLeague } from '../src/data/clubs';
import { POSITION_LABEL } from '../src/data/positions';
import { TEAMMATE_PUZZLES } from '../src/data/teammates';
import { decodeChallenge } from '../src/game/challenge';

(window as unknown as { FD: unknown }).FD = {
  PLAYERS, getPlayer, compareGuess, decodeChallenge, searchPlayers, nationInfo, shortClub, shortLeague, POSITION_LABEL,
  modes: 11,
  teammatePuzzles: TEAMMATE_PUZZLES.length,
};
