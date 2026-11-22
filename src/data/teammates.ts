/**
 * Name the Teammate puzzles. Each lists every player in this database who actually played
 * in the same squad as the star at that club (checked spell by spell, not just by career years).
 * Borderline cases (a few days' overlap, pre-season only, or a loan that never played) are left out.
 */
export interface TeammatePuzzle {
  id: string;
  starId: string;
  club: string;
  years: string;
  answers: string[];
}

export const TEAMMATE_PUZZLES: TeammatePuzzle[] = [
  {
    id: 'messi-barcelona', starId: 'lionel-messi', club: 'Barcelona', years: '2004–2021',
    answers: [
      'andres-iniesta', 'xavi', 'carles-puyol', 'gerard-pique', 'sergio-busquets', 'ronaldinho', 'samuel-etoo',
      'deco', 'henrik-larsson', 'rafael-marquez', 'lilian-thuram', 'thierry-henry', 'yaya-toure',
      'zlatan-ibrahimovic', 'david-villa', 'javier-mascherano', 'cesc-fabregas', 'neymar', 'luis-suarez',
      'ousmane-dembele', 'frenkie-de-jong', 'pedri', 'ronald-araujo', 'jordi-alba', 'ivan-rakitic', 'philippe-coutinho', 'antoine-griezmann', 'thiago-alcantara'
    ],
  },
  {
    id: 'ronaldo-real-madrid', starId: 'cristiano-ronaldo', club: 'Real Madrid', years: '2009–2018',
    answers: [
      'kaka', 'xabi-alonso', 'raul', 'iker-casillas', 'ruud-van-nistelrooy', 'gonzalo-higuain', 'marcelo',
      'pepe', 'angel-di-maria', 'mesut-ozil', 'raphael-varane', 'luka-modric', 'gareth-bale', 'casemiro',
      'toni-kroos', 'mateo-kovacic', 'martin-odegaard', 'theo-hernandez', 'achraf-hakimi', 'sergio-ramos', 'karim-benzema', 'dani-carvajal'
    ],
  },
  {
    id: 'ronaldo-man-utd', starId: 'cristiano-ronaldo', club: 'Manchester United', years: '2003–2009 and 2021–2022',
    answers: [
      'ryan-giggs', 'paul-scholes', 'roy-keane', 'ruud-van-nistelrooy', 'rio-ferdinand', 'wayne-rooney',
      'nemanja-vidic', 'edwin-van-der-sar', 'park-ji-sung', 'carlos-tevez', 'dimitar-berbatov',
      'ole-gunnar-solskjaer', 'diego-forlan', 'tim-howard', 'gerard-pique', 'henrik-larsson',
      'bruno-fernandes', 'marcus-rashford', 'harry-maguire', 'raphael-varane', 'scott-mctominay',
      'edinson-cavani', 'casemiro', 'michael-carrick', 'gary-neville', 'nani'
    ],
  },
  {
    id: 'gerrard-liverpool', starId: 'steven-gerrard', club: 'Liverpool', years: '1998–2015',
    answers: [
      'michael-owen', 'nicolas-anelka', 'harry-kewell', 'xabi-alonso', 'javier-mascherano', 'fernando-torres',
      'robbie-keane', 'luis-suarez', 'kolo-toure', 'jamie-carragher', 'robbie-fowler', 'peter-crouch', 'dirk-kuyt', 'jordan-henderson', 'philippe-coutinho'
    ],
  },
  {
    id: 'zidane-real-madrid', starId: 'zinedine-zidane', club: 'Real Madrid', years: '2001–2006',
    answers: [
      'luis-figo', 'raul', 'roberto-carlos', 'iker-casillas', 'fernando-hierro', 'claude-makelele',
      'ronaldo-nazario', 'david-beckham', 'michael-owen',
    ],
  },
  {
    id: 'henry-arsenal', starId: 'thierry-henry', club: 'Arsenal', years: '1999–2007 and 2012',
    answers: [
      'dennis-bergkamp', 'patrick-vieira', 'robert-pires', 'ashley-cole', 'kolo-toure', 'nwankwo-kanu',
      'davor-suker', 'cesc-fabregas', 'robin-van-persie', 'tomas-rosicky', 'tony-adams', 'sol-campbell', 'theo-walcott', 'emmanuel-adebayor'
    ],
  },
  {
    id: 'lampard-chelsea', starId: 'frank-lampard', club: 'Chelsea', years: '2001–2014',
    answers: [
      'john-terry', 'petr-cech', 'ashley-cole', 'didier-drogba', 'claude-makelele', 'marcel-desailly',
      'hernan-crespo', 'arjen-robben', 'andriy-shevchenko', 'michael-ballack', 'deco', 'nicolas-anelka',
      'fernando-torres', 'eden-hazard', 'romelu-lukaku', 'kevin-de-bruyne', 'mohamed-salah', 'samuel-etoo', 'michael-essien'
    ],
  },
  {
    id: 'buffon-juventus', starId: 'gianluigi-buffon', club: 'Juventus', years: '2001–2018 and 2019–2021',
    answers: [
      'alessandro-del-piero', 'pavel-nedved', 'lilian-thuram', 'fabio-cannavaro', 'zlatan-ibrahimovic',
      'patrick-vieira', 'giorgio-chiellini', 'andrea-pirlo', 'carlos-tevez', 'paulo-dybala',
      'gonzalo-higuain', 'cristiano-ronaldo', 'matthijs-de-ligt', 'federico-chiesa', 'weston-mckennie', 'paul-pogba', 'david-trezeguet', 'mario-mandzukic', 'edgar-davids', 'wojciech-szczesny', 'moise-kean', 'dejan-kulusevski'
    ],
  },
  {
    id: 'maldini-milan', starId: 'paolo-maldini', club: 'AC Milan', years: '1985–2009',
    answers: [
      'franco-baresi', 'ruud-gullit', 'marco-van-basten', 'frank-rijkaard', 'marcel-desailly', 'george-weah',
      'roberto-baggio', 'patrick-vieira', 'patrick-kluivert', 'andriy-shevchenko', 'rui-costa',
      'alessandro-nesta', 'andrea-pirlo', 'clarence-seedorf', 'gennaro-gattuso', 'filippo-inzaghi',
      'cafu', 'hernan-crespo', 'kaka', 'ronaldo-nazario', 'ronaldinho', 'david-beckham', 'christian-vieri', 'rivaldo', 'edgar-davids'
    ],
  },
  {
    id: 'lewandowski-bayern', starId: 'robert-lewandowski', club: 'Bayern Munich', years: '2014–2022',
    answers: [
      'manuel-neuer', 'thomas-muller', 'philipp-lahm', 'bastian-schweinsteiger', 'xabi-alonso', 'arjen-robben',
      'franck-ribery', 'david-alaba', 'mats-hummels', 'joshua-kimmich', 'alphonso-davies', 'leroy-sane',
      'jamal-musiala', 'thiago-alcantara', 'leon-goretzka', 'serge-gnabry', 'kingsley-coman', 'mario-gotze', 'philippe-coutinho'
    ],
  },
  {
    id: 'salah-liverpool', starId: 'mohamed-salah', club: 'Liverpool', years: 'since 2017',
    answers: [
      'virgil-van-dijk', 'alisson-becker', 'trent-alexander-arnold', 'andy-robertson', 'sadio-mane',
      'luis-diaz', 'darwin-nunez', 'cody-gakpo', 'alexis-mac-allister', 'dominik-szoboszlai', 'wataru-endo',
      'federico-chiesa', 'florian-wirtz', 'alexander-isak',
    ],
  },
  {
    id: 'haaland-city', starId: 'erling-haaland', club: 'Manchester City', years: 'since 2022',
    answers: [
      'kevin-de-bruyne', 'rodri', 'bernardo-silva', 'phil-foden', 'ruben-dias', 'ederson', 'jack-grealish',
      'ilkay-gundogan', 'riyad-mahrez', 'julian-alvarez', 'cole-palmer', 'mateo-kovacic', 'josko-gvardiol',
      'jeremy-doku', 'omar-marmoush', 'gianluigi-donnarumma', 'kyle-walker', 'john-stones'
    ],
  },
  {
    id: 'neymar-psg', starId: 'neymar', club: 'Paris Saint-Germain', years: '2017–2023',
    answers: [
      'kylian-mbappe', 'edinson-cavani', 'angel-di-maria', 'marquinhos', 'gianluigi-buffon', 'lionel-messi',
      'achraf-hakimi', 'gianluigi-donnarumma', 'nuno-mendes', 'vitinha', 'xavi-simons',
    ],
  },
  {
    id: 'kane-spurs', starId: 'harry-kane', club: 'Tottenham Hotspur', years: '2011–2023',
    answers: ['heung-min-son', 'hugo-lloris', 'gareth-bale', 'luka-modric', 'clint-dempsey', 'cristian-romero'],
  },
];
