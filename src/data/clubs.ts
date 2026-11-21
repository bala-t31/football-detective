/**
 * Club → league mapping used by the feedback system.
 * Leagues are the division the club competed in during the relevant spells for players in this
 * database; where that varied, the top division of the country is used.
 */
export const CLUB_LEAGUE: Record<string, string> = {
  // England
  Arsenal: 'Premier League', 'Aston Villa': 'Premier League', 'Blackburn Rovers': 'Premier League',
  'Bolton Wanderers': 'Premier League', 'Brighton & Hove Albion': 'Premier League', Chelsea: 'Premier League',
  Everton: 'Premier League', Fulham: 'Premier League', 'Leeds United': 'Premier League',
  'Leicester City': 'Premier League', Liverpool: 'Premier League', 'Manchester City': 'Premier League',
  'Manchester United': 'Premier League', 'Newcastle United': 'Premier League', 'Nottingham Forest': 'Premier League',
  'Queens Park Rangers': 'Premier League', Southampton: 'Premier League', 'Stoke City': 'Premier League',
  'Tottenham Hotspur': 'Premier League', 'West Bromwich Albion': 'Premier League', 'West Ham United': 'Premier League',
  'Birmingham City': 'EFL Championship', 'Derby County': 'EFL Championship',
  // Spain
  'Atlético Madrid': 'La Liga', Barcelona: 'La Liga', 'Celta Vigo': 'La Liga', 'Deportivo La Coruña': 'La Liga',
  Eibar: 'La Liga', 'Las Palmas': 'La Liga', Mallorca: 'La Liga', 'Málaga': 'La Liga', 'Real Madrid': 'La Liga',
  'Real Sociedad': 'La Liga', 'Real Zaragoza': 'La Liga', Sevilla: 'La Liga', 'Sporting Gijón': 'La Liga',
  Valencia: 'La Liga', Villarreal: 'La Liga',
  // Italy
  'AC Milan': 'Serie A', Bologna: 'Serie A', Brescia: 'Serie A', Fiorentina: 'Serie A', 'Hellas Verona': 'Serie A',
  'Inter Milan': 'Serie A', Juventus: 'Serie A', Lazio: 'Serie A', Napoli: 'Serie A', Palermo: 'Serie A',
  Parma: 'Serie A', Perugia: 'Serie A', Roma: 'Serie A', Salernitana: 'Serie A', Sampdoria: 'Serie A',
  Udinese: 'Serie A', Como: 'Serie B', Livorno: 'Serie B', Novara: 'Serie B', Padova: 'Serie B', Vicenza: 'Serie C',
  // Germany
  'Bayer Leverkusen': 'Bundesliga', 'Bayern Munich': 'Bundesliga', 'Borussia Dortmund': 'Bundesliga',
  'Hamburger SV': 'Bundesliga', Kaiserslautern: 'Bundesliga', 'Karlsruher SC': 'Bundesliga', 'RB Leipzig': 'Bundesliga',
  'Schalke 04': 'Bundesliga', 'VfB Stuttgart': 'Bundesliga', 'Werder Bremen': 'Bundesliga', Wolfsburg: 'Bundesliga',
  // France
  Bordeaux: 'Ligue 1', Cannes: 'Ligue 1', Guingamp: 'Ligue 1', Lille: 'Ligue 1', Lyon: 'Ligue 1', Marseille: 'Ligue 1',
  Metz: 'Ligue 1', Monaco: 'Ligue 1', Nancy: 'Ligue 1', Nice: 'Ligue 1', 'Paris Saint-Germain': 'Ligue 1',
  Rennes: 'Ligue 1', 'Saint-Étienne': 'Ligue 1', 'Le Havre': 'Ligue 2', 'Le Mans': 'Ligue 2',
  // Netherlands
  Ajax: 'Eredivisie', Feyenoord: 'Eredivisie', Groningen: 'Eredivisie', Heerenveen: 'Eredivisie',
  'PSV Eindhoven': 'Eredivisie', Vitesse: 'Eredivisie',
  // Portugal
  Benfica: 'Primeira Liga', Porto: 'Primeira Liga', 'Sporting CP': 'Primeira Liga', 'Sporting CP B': 'Liga Portugal 2',
  // Belgium
  Anderlecht: 'Belgian Pro League', Beerschot: 'Belgian Pro League', Beveren: 'Belgian Pro League',
  Genk: 'Belgian Pro League', 'Union Saint-Gilloise': 'Belgian Pro League',
  // Turkey
  Antalyaspor: 'Süper Lig', 'Fenerbahçe': 'Süper Lig', Galatasaray: 'Süper Lig', Konyaspor: 'Süper Lig',
  'İstanbul Başakşehir': 'Süper Lig',
  // Scotland
  Celtic: 'Scottish Premiership',
  // Rest of Europe
  'Red Bull Salzburg': 'Austrian Bundesliga', Basel: 'Swiss Super League', 'Malmö FF': 'Allsvenskan',
  'Helsingborgs IF': 'Allsvenskan', Bryne: 'Norwegian First Division', Molde: 'Eliteserien', 'Strømsgodset': 'Eliteserien',
  Hvidovre: 'Danish Superliga', 'Brøndby': 'Danish Superliga', 'Dinamo Zagreb': 'Croatian First League',
  'Dynamo Kyiv': 'Ukrainian Premier League', 'Metalurh Donetsk': 'Ukrainian Premier League',
  'Olympiacos': 'Super League Greece', PAOK: 'Super League Greece', 'CSKA Sofia': 'Bulgarian First League',
  'Chmel Blšany': 'Czech First League', 'Sparta Prague': 'Czech First League', 'Dukla Prague': 'Czech First League',
  'Lech Poznań': 'Ekstraklasa', 'Znicz Pruszków': 'I liga (Poland)', 'Olimpija Ljubljana': 'Slovenian PrvaLiga',
  'Anzhi Makhachkala': 'Russian Premier League', 'Rubin Kazan': 'Russian Premier League',
  'Dinamo Tbilisi': 'Erovnuli Liga', 'Dinamo Batumi': 'Erovnuli Liga', 'Cobh Ramblers': 'League of Ireland',
  // South America
  Botafogo: 'Brasileirão', Corinthians: 'Brasileirão', Cruzeiro: 'Brasileirão', Flamengo: 'Brasileirão',
  Fluminense: 'Brasileirão', 'Grêmio': 'Brasileirão', Internacional: 'Brasileirão', Juventude: 'Brasileirão',
  Palmeiras: 'Brasileirão', Santos: 'Brasileirão', 'São Paulo': 'Brasileirão', 'Atlético Mineiro': 'Brasileirão',
  'Argentinos Juniors': 'Argentine Primera', Banfield: 'Argentine Primera', 'Boca Juniors': 'Argentine Primera',
  'Defensa y Justicia': 'Argentine Primera', Independiente: 'Argentine Primera', "Newell's Old Boys": 'Argentine Primera',
  'Racing Club': 'Argentine Primera', 'River Plate': 'Argentine Primera', 'Rosario Central': 'Argentine Primera',
  Danubio: 'Uruguayan Primera', Nacional: 'Uruguayan Primera', 'Peñarol': 'Uruguayan Primera',
  'Independiente del Valle': 'Ecuadorian Serie A',
  // North America
  'Chicago Fire': 'MLS', 'DC United': 'MLS', 'Inter Miami': 'MLS', 'Kansas City Wizards': 'MLS', 'LA Galaxy': 'MLS',
  'Los Angeles FC': 'MLS', 'Montreal Impact': 'MLS', 'New York City FC': 'MLS', 'New York Red Bulls': 'MLS',
  'Orlando City': 'MLS', 'Vancouver Whitecaps': 'MLS', 'Phoenix Rising': 'USL Championship', 'New York Cosmos': 'NASL',
  Atlas: 'Liga MX', 'León': 'Liga MX', 'Querétaro': 'Liga MX',
  // Asia & Middle East
  'Al Hilal': 'Saudi Pro League', 'Al Nassr': 'Saudi Pro League', 'Al-Ahli': 'Saudi Pro League',
  'Al Sadd': 'Qatar Stars League', 'Al-Arabi': 'Qatar Stars League', 'Al-Gharafa': 'Qatar Stars League',
  'Qatar SC': 'Qatar Stars League', 'Al Jazira': 'UAE Pro League', 'Al-Ahli Dubai': 'UAE Pro League',
  'Emirates Club': 'UAE Pro League', 'El Mokawloon': 'Egyptian Premier League',
  'Shanghai Shenhua': 'Chinese Super League', 'Qingdao Huanghai': 'China League One',
  'Bellmare Hiratsuka': 'J1 League', 'Kawasaki Frontale': 'J1 League', 'Kyoto Purple Sanga': 'J1 League',
  'Sagan Tosu': 'J1 League', 'Vissel Kobe': 'J1 League', 'Sydney FC': 'A-League',
  'Bengaluru FC': 'Indian Super League', 'Chennaiyin FC': 'Indian Super League', 'Delhi Dynamos': 'Indian Super League',
  'Kerala Blasters': 'Indian Super League', 'Mohun Bagan': 'I-League', 'East Bengal': 'I-League', Dempo: 'I-League',
  JCT: 'I-League',
};

export function leagueOf(club: string): string {
  return CLUB_LEAGUE[club] ?? 'Other';
}
