/**
 * Famous starting line-ups for Guess the XI. Rows run from the goalkeeper forward, left to right
 * as seen from behind the goal. Each player lists the names a guess may match (lower case is fine,
 * accents are ignored): the full name, the surname, and any common nickname. A surname that two
 * players in the same XI share is left out, so it can never match the wrong one.
 */
export interface XiPlayer {
  name: string;
  accept: string[];
}

export interface Lineup {
  id: string;
  team: string;
  match: string;
  year: number;
  formation: string;
  /** A player from the XI who is in the main database (used for stats and history). */
  starId: string;
  rows: XiPlayer[][];
}

const p = (name: string, ...accept: string[]): XiPlayer => ({ name, accept: [name, ...accept] });

export const LINEUPS: Lineup[] = [
  {
    id: 'barcelona-2011',
    starId: 'xavi',
    team: 'Barcelona',
    match: 'Champions League final vs Manchester United',
    year: 2011,
    formation: '4-3-3',
    rows: [
      [p('Víctor Valdés', 'Valdes')],
      [p('Éric Abidal', 'Abidal'), p('Javier Mascherano', 'Mascherano'), p('Gerard Piqué', 'Pique'), p('Dani Alves', 'Alves')],
      [p('Andrés Iniesta', 'Iniesta'), p('Sergio Busquets', 'Busquets'), p('Xavi', 'Xavi Hernandez', 'Xavi Hernández')],
      [p('David Villa', 'Villa'), p('Lionel Messi', 'Messi', 'Leo Messi'), p('Pedro', 'Pedro Rodriguez', 'Pedro Rodríguez')],
    ],
  },
  {
    id: 'spain-2010',
    starId: 'andres-iniesta',
    team: 'Spain',
    match: 'World Cup final vs Netherlands',
    year: 2010,
    formation: '4-2-3-1',
    rows: [
      [p('Iker Casillas', 'Casillas')],
      [p('Joan Capdevila', 'Capdevila'), p('Carles Puyol', 'Puyol'), p('Gerard Piqué', 'Pique'), p('Sergio Ramos', 'Ramos')],
      [p('Xabi Alonso', 'Alonso'), p('Sergio Busquets', 'Busquets')],
      [p('Andrés Iniesta', 'Iniesta'), p('Xavi', 'Xavi Hernandez', 'Xavi Hernández'), p('Pedro', 'Pedro Rodriguez', 'Pedro Rodríguez')],
      [p('David Villa', 'Villa')],
    ],
  },
  {
    id: 'liverpool-2005',
    starId: 'steven-gerrard',
    team: 'Liverpool',
    match: 'Champions League final vs AC Milan, Istanbul',
    year: 2005,
    formation: '4-4-1-1',
    rows: [
      [p('Jerzy Dudek', 'Dudek')],
      [p('Djimi Traoré', 'Traore', 'Traoré'), p('Sami Hyypiä', 'Hyypia', 'Hyypiä'), p('Jamie Carragher', 'Carragher'), p('Steve Finnan', 'Finnan')],
      [p('John Arne Riise', 'Riise'), p('Xabi Alonso', 'Alonso'), p('Steven Gerrard', 'Gerrard'), p('Luis García', 'Luis Garcia', 'Garcia', 'García')],
      [p('Harry Kewell', 'Kewell')],
      [p('Milan Baroš', 'Baros', 'Baroš', 'Milan Baros')],
    ],
  },
  {
    id: 'man-utd-1999',
    starId: 'david-beckham',
    team: 'Manchester United',
    match: 'Champions League final vs Bayern Munich, Camp Nou',
    year: 1999,
    formation: '4-4-2',
    rows: [
      [p('Peter Schmeichel', 'Schmeichel')],
      [p('Denis Irwin', 'Irwin'), p('Jaap Stam', 'Stam'), p('Ronny Johnsen', 'Johnsen'), p('Gary Neville', 'Neville')],
      [p('Jesper Blomqvist', 'Blomqvist'), p('Nicky Butt', 'Butt'), p('David Beckham', 'Beckham'), p('Ryan Giggs', 'Giggs')],
      [p('Andy Cole', 'Cole', 'Andrew Cole'), p('Dwight Yorke', 'Yorke')],
    ],
  },
  {
    id: 'argentina-2022',
    starId: 'lionel-messi',
    team: 'Argentina',
    match: 'World Cup final vs France',
    year: 2022,
    formation: '4-3-3',
    rows: [
      [p('Emiliano Martínez', 'Emiliano Martinez', 'Dibu', 'Dibu Martinez', 'Emi Martinez', 'Martinez')],
      [p('Nicolás Tagliafico', 'Tagliafico'), p('Nicolás Otamendi', 'Otamendi'), p('Cristian Romero', 'Romero', 'Cuti Romero'), p('Nahuel Molina', 'Molina')],
      [p('Alexis Mac Allister', 'Mac Allister', 'MacAllister'), p('Enzo Fernández', 'Enzo Fernandez', 'Enzo', 'Fernandez'), p('Rodrigo De Paul', 'De Paul')],
      [p('Ángel Di María', 'Angel Di Maria', 'Di Maria', 'Di María'), p('Julián Álvarez', 'Julian Alvarez', 'Alvarez', 'Álvarez'), p('Lionel Messi', 'Messi', 'Leo Messi')],
    ],
  },
  {
    id: 'france-2018',
    starId: 'kylian-mbappe',
    team: 'France',
    match: 'World Cup final vs Croatia',
    year: 2018,
    formation: '4-2-3-1',
    rows: [
      [p('Hugo Lloris', 'Lloris')],
      [p('Lucas Hernández', 'Lucas Hernandez', 'Hernandez', 'Hernández'), p('Samuel Umtiti', 'Umtiti'), p('Raphaël Varane', 'Raphael Varane', 'Varane'), p('Benjamin Pavard', 'Pavard')],
      [p('Paul Pogba', 'Pogba'), p("N'Golo Kanté", 'Ngolo Kante', "N'Golo Kante", 'Kante', 'Kanté')],
      [p('Blaise Matuidi', 'Matuidi'), p('Antoine Griezmann', 'Griezmann'), p('Kylian Mbappé', 'Kylian Mbappe', 'Mbappe', 'Mbappé')],
      [p('Olivier Giroud', 'Giroud')],
    ],
  },
  {
    id: 'germany-2014',
    starId: 'thomas-muller',
    team: 'Germany',
    match: 'World Cup final vs Argentina',
    year: 2014,
    formation: '4-3-3',
    rows: [
      [p('Manuel Neuer', 'Neuer')],
      [p('Benedikt Höwedes', 'Howedes', 'Höwedes', 'Hoewedes'), p('Mats Hummels', 'Hummels'), p('Jérôme Boateng', 'Jerome Boateng', 'Boateng'), p('Philipp Lahm', 'Lahm')],
      [p('Toni Kroos', 'Kroos'), p('Bastian Schweinsteiger', 'Schweinsteiger'), p('Christoph Kramer', 'Kramer')],
      [p('Mesut Özil', 'Mesut Ozil', 'Ozil', 'Özil'), p('Miroslav Klose', 'Klose'), p('Thomas Müller', 'Thomas Muller', 'Muller', 'Müller', 'Mueller')],
    ],
  },
  {
    id: 'real-madrid-2017',
    starId: 'cristiano-ronaldo',
    team: 'Real Madrid',
    match: 'Champions League final vs Juventus, Cardiff',
    year: 2017,
    formation: '4-3-1-2',
    rows: [
      [p('Keylor Navas', 'Navas')],
      [p('Marcelo'), p('Sergio Ramos', 'Ramos'), p('Raphaël Varane', 'Raphael Varane', 'Varane'), p('Dani Carvajal', 'Carvajal')],
      [p('Toni Kroos', 'Kroos'), p('Casemiro'), p('Luka Modrić', 'Luka Modric', 'Modric', 'Modrić')],
      [p('Isco')],
      [p('Cristiano Ronaldo', 'Ronaldo', 'CR7'), p('Karim Benzema', 'Benzema')],
    ],
  },
  {
    id: 'man-city-2023',
    starId: 'erling-haaland',
    team: 'Manchester City',
    match: 'Champions League final vs Inter, Istanbul',
    year: 2023,
    formation: '3-2-4-1',
    rows: [
      [p('Ederson')],
      [p('Nathan Aké', 'Nathan Ake', 'Ake', 'Aké'), p('Rúben Dias', 'Ruben Dias', 'Dias'), p('Manuel Akanji', 'Akanji')],
      [p('Rodri'), p('John Stones', 'Stones')],
      [p('Jack Grealish', 'Grealish'), p('İlkay Gündoğan', 'Ilkay Gundogan', 'Gundogan', 'Gündoğan'), p('Kevin De Bruyne', 'De Bruyne', 'KDB'), p('Bernardo Silva', 'Bernardo', 'Silva')],
      [p('Erling Haaland', 'Haaland')],
    ],
  },
  {
    id: 'chelsea-2012',
    starId: 'didier-drogba',
    team: 'Chelsea',
    match: 'Champions League final vs Bayern Munich, Munich',
    year: 2012,
    formation: '4-2-3-1',
    rows: [
      [p('Petr Čech', 'Petr Cech', 'Cech', 'Čech')],
      [p('Ashley Cole', 'Cole'), p('David Luiz', 'Luiz'), p('Gary Cahill', 'Cahill'), p('José Bosingwa', 'Jose Bosingwa', 'Bosingwa')],
      [p('Frank Lampard', 'Lampard'), p('John Obi Mikel', 'Mikel', 'Obi Mikel')],
      [p('Ryan Bertrand', 'Bertrand'), p('Juan Mata', 'Mata'), p('Salomon Kalou', 'Kalou')],
      [p('Didier Drogba', 'Drogba')],
    ],
  },
  {
    id: 'brazil-2002',
    starId: 'ronaldo-nazario',
    team: 'Brazil',
    match: 'World Cup final vs Germany',
    year: 2002,
    formation: '3-4-2-1',
    rows: [
      [p('Marcos')],
      [p('Roque Júnior', 'Roque Junior'), p('Edmílson', 'Edmilson'), p('Lúcio', 'Lucio')],
      [p('Roberto Carlos'), p('Kléberson', 'Kleberson'), p('Gilberto Silva', 'Gilberto'), p('Cafu')],
      [p('Rivaldo'), p('Ronaldinho')],
      [p('Ronaldo', 'Ronaldo Nazario', 'Ronaldo Nazário', 'R9')],
    ],
  },
  {
    id: 'italy-2006',
    starId: 'andrea-pirlo',
    team: 'Italy',
    match: 'World Cup final vs France',
    year: 2006,
    formation: '4-2-3-1',
    rows: [
      [p('Gianluigi Buffon', 'Buffon', 'Gigi Buffon')],
      [p('Fabio Grosso', 'Grosso'), p('Marco Materazzi', 'Materazzi'), p('Fabio Cannavaro', 'Cannavaro'), p('Gianluca Zambrotta', 'Zambrotta')],
      [p('Andrea Pirlo', 'Pirlo'), p('Gennaro Gattuso', 'Gattuso')],
      [p('Simone Perrotta', 'Perrotta'), p('Francesco Totti', 'Totti'), p('Mauro Camoranesi', 'Camoranesi')],
      [p('Luca Toni', 'Toni')],
    ],
  },
];

/** Lower case, no accents, no punctuation: "N'Golo Kanté" → "ngolo kante". */
export function normName(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ı/g, 'i')
    .replace(/ø/g, 'o')
    .toLowerCase()
    .replace(/['’.]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
