/**
 * Famous transfers with their widely reported fees, in the currency they were reported in
 * (initial fee, add-ons left out). Fees differ between sources, so the game always labels them
 * "reported fee" and the answer options are far enough apart that the usual differences don't matter.
 */
export interface Transfer {
  playerId: string;
  from: string;
  to: string;
  year: number;
  /** Millions. */
  fee: number;
  cur: '€' | '£';
}

export const TRANSFERS: Transfer[] = [
  { playerId: 'neymar', from: 'Barcelona', to: 'Paris Saint-Germain', year: 2017, fee: 222, cur: '€' },
  { playerId: 'kylian-mbappe', from: 'Monaco', to: 'Paris Saint-Germain', year: 2018, fee: 180, cur: '€' },
  { playerId: 'joao-felix', from: 'Benfica', to: 'Atlético Madrid', year: 2019, fee: 126, cur: '€' },
  { playerId: 'antoine-griezmann', from: 'Atlético Madrid', to: 'Barcelona', year: 2019, fee: 120, cur: '€' },
  { playerId: 'ousmane-dembele', from: 'Borussia Dortmund', to: 'Barcelona', year: 2017, fee: 105, cur: '€' },
  { playerId: 'paul-pogba', from: 'Juventus', to: 'Manchester United', year: 2016, fee: 89, cur: '£' },
  { playerId: 'eden-hazard', from: 'Chelsea', to: 'Real Madrid', year: 2019, fee: 100, cur: '€' },
  { playerId: 'cristiano-ronaldo', from: 'Manchester United', to: 'Real Madrid', year: 2009, fee: 80, cur: '£' },
  { playerId: 'gareth-bale', from: 'Tottenham Hotspur', to: 'Real Madrid', year: 2013, fee: 100, cur: '€' },
  { playerId: 'kaka', from: 'AC Milan', to: 'Real Madrid', year: 2009, fee: 67, cur: '€' },
  { playerId: 'zinedine-zidane', from: 'Juventus', to: 'Real Madrid', year: 2001, fee: 75, cur: '€' },
  { playerId: 'luis-figo', from: 'Barcelona', to: 'Real Madrid', year: 2000, fee: 60, cur: '€' },
  { playerId: 'jack-grealish', from: 'Aston Villa', to: 'Manchester City', year: 2021, fee: 100, cur: '£' },
  { playerId: 'declan-rice', from: 'West Ham United', to: 'Arsenal', year: 2023, fee: 105, cur: '£' },
  { playerId: 'enzo-fernandez', from: 'Benfica', to: 'Chelsea', year: 2023, fee: 107, cur: '£' },
  { playerId: 'moises-caicedo', from: 'Brighton & Hove Albion', to: 'Chelsea', year: 2023, fee: 115, cur: '£' },
  { playerId: 'jude-bellingham', from: 'Borussia Dortmund', to: 'Real Madrid', year: 2023, fee: 103, cur: '€' },
  { playerId: 'romelu-lukaku', from: 'Inter Milan', to: 'Chelsea', year: 2021, fee: 97.5, cur: '£' },
  { playerId: 'alexander-isak', from: 'Newcastle United', to: 'Liverpool', year: 2025, fee: 125, cur: '£' },
  { playerId: 'florian-wirtz', from: 'Bayer Leverkusen', to: 'Liverpool', year: 2025, fee: 100, cur: '£' },
  { playerId: 'virgil-van-dijk', from: 'Southampton', to: 'Liverpool', year: 2018, fee: 75, cur: '£' },
  { playerId: 'harry-maguire', from: 'Leicester City', to: 'Manchester United', year: 2019, fee: 80, cur: '£' },
  { playerId: 'luis-suarez', from: 'Liverpool', to: 'Barcelona', year: 2014, fee: 75, cur: '£' },
  { playerId: 'angel-di-maria', from: 'Real Madrid', to: 'Manchester United', year: 2014, fee: 59.7, cur: '£' },
  { playerId: 'fernando-torres', from: 'Liverpool', to: 'Chelsea', year: 2011, fee: 50, cur: '£' },
  { playerId: 'erling-haaland', from: 'Borussia Dortmund', to: 'Manchester City', year: 2022, fee: 51.2, cur: '£' },
  { playerId: 'matthijs-de-ligt', from: 'Ajax', to: 'Juventus', year: 2019, fee: 75, cur: '€' },
  { playerId: 'kevin-de-bruyne', from: 'Wolfsburg', to: 'Manchester City', year: 2015, fee: 55, cur: '£' },
  { playerId: 'mesut-ozil', from: 'Real Madrid', to: 'Arsenal', year: 2013, fee: 42.5, cur: '£' },
  { playerId: 'thierry-henry', from: 'Juventus', to: 'Arsenal', year: 1999, fee: 11, cur: '£' },
  { playerId: 'rio-ferdinand', from: 'Leeds United', to: 'Manchester United', year: 2002, fee: 30, cur: '£' },
  { playerId: 'wayne-rooney', from: 'Everton', to: 'Manchester United', year: 2004, fee: 25.6, cur: '£' },
  { playerId: 'andriy-shevchenko', from: 'AC Milan', to: 'Chelsea', year: 2006, fee: 30.8, cur: '£' },
  { playerId: 'antony', from: 'Ajax', to: 'Manchester United', year: 2022, fee: 82, cur: '£' },
];
