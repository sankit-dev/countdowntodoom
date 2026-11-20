// The whole site is driven by this file. Add a title here and it appears on
// the map, in the detail drawer and in the planner.
//
// `min`  – total runtime in minutes (series = whole season, approximate).
// `imp`  – 1-10, how much the title matters for Avengers: Doomsday.
// `to`   – ids of the titles this one feeds directly into.

export type LaneId =
  | "avengers"
  | "cap"
  | "cosmic"
  | "multiverse"
  | "wakanda"
  | "street"
  | "legacy";

export type Kind = "film" | "series" | "special";

export interface Title {
  id: string;
  title: string;
  year: number;
  kind: Kind;
  phase: number; // 0 = pre-MCU legacy universe
  lane: LaneId;
  min: number;
  imp: number;
  to: string[];
  why: string;
  /** Optional image URL for the map tile. Without one the tile shows the year. */
  poster?: string;
}

export const LANES: { id: LaneId; name: string; color: string }[] = [
  { id: "avengers", name: "Avengers", color: "#ff4d4d" },
  { id: "cap", name: "Shield & Shadows", color: "#5b9dff" },
  { id: "cosmic", name: "Asgard & Cosmos", color: "#a78bfa" },
  { id: "multiverse", name: "Multiverse", color: "#2dd4bf" },
  { id: "wakanda", name: "Wakanda & Legends", color: "#e879f9" },
  { id: "street", name: "Street Level", color: "#ff9040" },
  { id: "legacy", name: "Mutant Legacy", color: "#ffd84d" },
];

export const PHASES: Record<number, { name: string; saga: string }> = {
  1: { name: "Phase One", saga: "The Infinity Saga" },
  2: { name: "Phase Two", saga: "The Infinity Saga" },
  3: { name: "Phase Three", saga: "The Infinity Saga" },
  4: { name: "Phase Four", saga: "The Multiverse Saga" },
  5: { name: "Phase Five", saga: "The Multiverse Saga" },
  6: { name: "Phase Six", saga: "The Multiverse Saga" },
};

export const DOOM_ID = "doomsday";
export const DOOM_DATE = new Date(2026, 11, 18); // 18 December 2026

const t = (
  id: string,
  title: string,
  year: number,
  kind: Kind,
  phase: number,
  lane: LaneId,
  min: number,
  imp: number,
  to: string[],
  why: string
): Title => ({ id, title, year, kind, phase, lane, min, imp, to, why });

// Listed in release order (the mutant legacy films are slotted in where their
// universe collides with the MCU). This order is the left-to-right order of
// the map.
export const TITLES: Title[] = [
  // ── Phase One ────────────────────────────────────────────────────────────
  t("iron-man", "Iron Man", 2008, "film", 1, "avengers", 126, 6, ["iron-man-2", "avengers"],
    "Where it all starts. Tony Stark's face is the one Doctor Doom now wears — knowing the original makes the return land harder."),
  t("incredible-hulk", "The Incredible Hulk", 2008, "film", 1, "avengers", 112, 2, ["avengers", "brave-new-world"],
    "Introduces Thaddeus Ross and Samuel Sterns, both of whom come back in Brave New World."),
  t("iron-man-2", "Iron Man 2", 2010, "film", 1, "avengers", 124, 2, ["avengers"],
    "Black Widow and the Avengers Initiative step out of the shadows."),
  t("thor", "Thor", 2011, "film", 1, "cosmic", 115, 5, ["avengers", "dark-world"],
    "Thor and Loki's first chapter. Both brothers are on the Doomsday roster."),
  t("first-avenger", "Captain America: The First Avenger", 2011, "film", 1, "cap", 124, 6, ["avengers", "winter-soldier"],
    "Steve Rogers and Bucky Barnes, before the ice. Steve's story is not as finished as Endgame made it look."),
  t("avengers", "The Avengers", 2012, "film", 1, "avengers", 143, 8, ["iron-man-3", "dark-world", "winter-soldier", "age-of-ultron"],
    "The team forms. Every later Avengers film — including Doomsday — is measured against this one."),

  // ── Phase Two ────────────────────────────────────────────────────────────
  t("iron-man-3", "Iron Man 3", 2013, "film", 2, "avengers", 130, 2, ["age-of-ultron"],
    "Tony after New York. Sets up the Ten Rings thread that Shang-Chi pays off."),
  t("dark-world", "Thor: The Dark World", 2013, "film", 2, "cosmic", 112, 2, ["ragnarok"],
    "More Thor and Loki, and the first proper look at an Infinity Stone."),
  t("winter-soldier", "Captain America: The Winter Soldier", 2014, "film", 2, "cap", 136, 7, ["age-of-ultron", "civil-war"],
    "Bucky returns and Sam Wilson arrives. The two of them are at the heart of the Doomsday line-up."),
  t("guardians", "Guardians of the Galaxy", 2014, "film", 2, "cosmic", 121, 3, ["guardians-2"],
    "Opens up the cosmic side of the universe and the hunt for the Infinity Stones."),
  t("age-of-ultron", "Avengers: Age of Ultron", 2015, "film", 2, "avengers", 141, 5, ["civil-war", "ragnarok", "ant-man"],
    "Wanda and Vision enter, Sokovia falls, and the cracks in the team start to show."),
  t("ant-man", "Ant-Man", 2015, "film", 2, "multiverse", 117, 4, ["civil-war", "ant-man-wasp"],
    "Scott Lang and the Quantum Realm. Scott is confirmed for Doomsday."),

  // ── Phase Three ──────────────────────────────────────────────────────────
  t("civil-war", "Captain America: Civil War", 2016, "film", 3, "cap", 147, 8, ["homecoming", "black-panther", "infinity-war", "black-widow"],
    "The Avengers break. Introduces Wakanda and Spider-Man, and defines Bucky and Sam for everything after."),
  t("doctor-strange", "Doctor Strange", 2016, "film", 3, "multiverse", 115, 5, ["infinity-war", "multiverse-of-madness"],
    "Magic, the Time Stone and the first hint that reality has more than one layer."),
  t("guardians-2", "Guardians of the Galaxy Vol. 2", 2017, "film", 3, "cosmic", 136, 2, ["infinity-war"],
    "The Guardians become a family before Thanos tears it apart."),
  t("homecoming", "Spider-Man: Homecoming", 2017, "film", 3, "street", 133, 4, ["infinity-war", "far-from-home"],
    "Peter Parker under Tony Stark's wing."),
  t("ragnarok", "Thor: Ragnarok", 2017, "film", 3, "cosmic", 130, 6, ["infinity-war"],
    "Asgard is destroyed and Thor is remade. This is the Thor who walks into Doomsday."),
  t("black-panther", "Black Panther", 2018, "film", 3, "wakanda", 134, 6, ["infinity-war", "wakanda-forever"],
    "Wakanda, Shuri and M'Baku. Both are confirmed for Doomsday."),
  t("infinity-war", "Avengers: Infinity War", 2018, "film", 3, "avengers", 149, 9, ["endgame"],
    "The last time the whole universe faced one villain — and lost."),
  t("ant-man-wasp", "Ant-Man and the Wasp", 2018, "film", 3, "multiverse", 118, 3, ["endgame"],
    "The Quantum Realm becomes a way through time. Also introduces Ghost, who returns in Thunderbolts*."),
  t("captain-marvel", "Captain Marvel", 2019, "film", 3, "cosmic", 124, 3, ["endgame", "the-marvels", "secret-invasion"],
    "Carol Danvers, Nick Fury and the Skrulls."),
  t("endgame", "Avengers: Endgame", 2019, "film", 3, "avengers", 181, 10, ["far-from-home", "wandavision", "falcon-winter-soldier", "loki-1", "love-and-thunder", "hawkeye"],
    "Tony dies, Steve goes back, Loki escapes with the Tesseract. Every thread Doomsday pulls on starts here."),
  t("far-from-home", "Spider-Man: Far From Home", 2019, "film", 3, "street", 129, 4, ["no-way-home"],
    "The world after Tony Stark, and Peter's identity blown open."),

  // ── Phase Four ───────────────────────────────────────────────────────────
  t("wandavision", "WandaVision", 2021, "series", 4, "multiverse", 350, 4, ["multiverse-of-madness", "agatha", "the-marvels"],
    "Wanda becomes the Scarlet Witch. Monica Rambeau gains her powers here."),
  t("falcon-winter-soldier", "The Falcon and the Winter Soldier", 2021, "series", 4, "cap", 310, 7, ["brave-new-world", "thunderbolts"],
    "Sam Wilson takes the shield. Introduces John Walker and Valentina — the seeds of the New Avengers."),
  t("loki-1", "Loki — Season 1", 2021, "series", 4, "multiverse", 280, 9, ["loki-2", "quantumania", "no-way-home"],
    "The TVA, variants and the Sacred Timeline. The single most important piece of multiverse set-up."),
  t("black-widow", "Black Widow", 2021, "film", 4, "cap", 134, 5, ["hawkeye", "thunderbolts"],
    "Yelena Belova and Red Guardian. Both are Doomsday cast."),
  t("shang-chi", "Shang-Chi and the Legend of the Ten Rings", 2021, "film", 4, "wakanda", 132, 5, [DOOM_ID],
    "Shang-Chi's only solo outing so far — and he is confirmed for Doomsday."),
  t("eternals", "Eternals", 2021, "film", 4, "cosmic", 156, 2, ["brave-new-world"],
    "Leaves a Celestial in the Indian Ocean. Brave New World is fought over what it is made of."),
  t("hawkeye", "Hawkeye", 2021, "series", 4, "street", 290, 2, ["echo", "born-again-1"],
    "Yelena's grief, Kate Bishop, and the return of the Kingpin."),
  t("no-way-home", "Spider-Man: No Way Home", 2021, "film", 4, "street", 148, 7, ["multiverse-of-madness", "brand-new-day"],
    "The multiverse cracks open on screen, and the world forgets Peter Parker."),
  t("moon-knight", "Moon Knight", 2022, "series", 4, "multiverse", 290, 1, [],
    "A self-contained story. Watch it because it is good, not because Doomsday needs it."),
  t("multiverse-of-madness", "Doctor Strange in the Multiverse of Madness", 2022, "film", 4, "multiverse", 126, 8, [DOOM_ID],
    "Introduces incursions — universes colliding and destroying each other. That is the engine of the Doomsday story."),
  t("ms-marvel", "Ms. Marvel", 2022, "series", 4, "cosmic", 270, 2, ["the-marvels"],
    "Kamala Khan — and the first time the MCU says the word 'mutation'."),
  t("love-and-thunder", "Thor: Love and Thunder", 2022, "film", 4, "cosmic", 119, 5, [DOOM_ID],
    "Where we last left Thor: a father now, with something to lose."),
  t("she-hulk", "She-Hulk: Attorney at Law", 2022, "series", 4, "street", 300, 1, ["born-again-1"],
    "Light, fourth-wall-breaking, and Daredevil's first proper MCU appearance."),
  t("werewolf", "Werewolf by Night", 2022, "special", 4, "multiverse", 53, 1, [],
    "A stand-alone monster special. Pure bonus."),
  t("wakanda-forever", "Black Panther: Wakanda Forever", 2022, "film", 4, "wakanda", 161, 7, [DOOM_ID, "ironheart"],
    "Shuri becomes the Black Panther and Namor rises from Talokan. Shuri, M'Baku and Namor are all in Doomsday."),
  t("holiday-special", "The Guardians of the Galaxy Holiday Special", 2022, "special", 4, "cosmic", 44, 1, ["guardians-3"],
    "A short, sweet bridge into Vol. 3."),

  // ── Phase Five ───────────────────────────────────────────────────────────
  t("quantumania", "Ant-Man and the Wasp: Quantumania", 2023, "film", 5, "multiverse", 124, 6, [DOOM_ID, "loki-2"],
    "Scott Lang's last adventure before Doomsday, and the multiverse war spelled out."),
  t("guardians-3", "Guardians of the Galaxy Vol. 3", 2023, "film", 5, "cosmic", 150, 2, [],
    "The end of the Guardians' story. Not required, but one of the best of the saga."),
  t("secret-invasion", "Secret Invasion", 2023, "series", 5, "cosmic", 270, 1, ["the-marvels"],
    "Nick Fury against the Skrulls. Safe to skip on a tight schedule."),
  t("loki-2", "Loki — Season 2", 2023, "series", 5, "multiverse", 300, 9, ["deadpool-wolverine", DOOM_ID],
    "Loki ends up holding every timeline together by hand. He is in Doomsday — this is why that matters."),
  t("the-marvels", "The Marvels", 2023, "film", 5, "cosmic", 105, 5, [DOOM_ID],
    "Its ending sends Monica Rambeau into a universe with the X-Men's Beast — who is in Doomsday."),
  t("echo", "Echo", 2024, "series", 5, "street", 200, 1, ["born-again-1"],
    "Maya Lopez and the Kingpin, leading into Born Again."),
  t("x-men", "X-Men", 2000, "film", 0, "legacy", 104, 4, ["x2"],
    "Another universe entirely — but its Professor X, Magneto, Cyclops and Mystique are all crossing into Doomsday."),
  t("x2", "X2: X-Men United", 2003, "film", 0, "legacy", 134, 4, ["days-of-future-past"],
    "Introduces Nightcrawler, also returning for Doomsday, and is the best of the original trilogy."),
  t("days-of-future-past", "X-Men: Days of Future Past", 2014, "film", 0, "legacy", 132, 5, ["deadpool-wolverine", DOOM_ID],
    "The original cast's last full outing together, and a timeline-rewriting story in its own right."),
  t("deadpool-wolverine", "Deadpool & Wolverine", 2024, "film", 5, "legacy", 128, 8, [DOOM_ID],
    "The TVA meets the mutant universe. Explains dying timelines, and brings Gambit into play."),
  t("agatha", "Agatha All Along", 2024, "series", 5, "multiverse", 330, 1, [],
    "A WandaVision follow-up on its own witchy road."),
  t("brave-new-world", "Captain America: Brave New World", 2025, "film", 5, "cap", 118, 7, [DOOM_ID],
    "Sam Wilson's first film as Captain America. He leads an Avengers team into Doomsday."),
  t("born-again-1", "Daredevil: Born Again — Season 1", 2025, "series", 5, "street", 450, 3, ["born-again-2"],
    "Matt Murdock against Mayor Fisk. Street level, but the tone-setter for New York."),
  t("thunderbolts", "Thunderbolts*", 2025, "film", 5, "cap", 127, 9, ["first-steps", DOOM_ID],
    "Yelena, Bucky, Red Guardian, Ghost, U.S. Agent and Sentry become the New Avengers. Its final scene points straight at the Fantastic Four."),
  t("ironheart", "Ironheart", 2025, "series", 5, "wakanda", 280, 2, [],
    "Riri Williams after Wakanda Forever. Technology meets magic."),

  // ── Phase Six ────────────────────────────────────────────────────────────
  t("first-steps", "The Fantastic Four: First Steps", 2025, "film", 6, "multiverse", 115, 10, [DOOM_ID],
    "Marvel's first family, in their own universe. The mid-credits scene is the first appearance of Doctor Doom."),
  t("wonder-man", "Wonder Man", 2026, "series", 6, "street", 270, 1, [],
    "A Hollywood satire off to the side of the main story."),
  t("born-again-2", "Daredevil: Born Again — Season 2", 2026, "series", 6, "street", 400, 2, ["brand-new-day"],
    "The fight for New York continues."),
  t("brand-new-day", "Spider-Man: Brand New Day", 2026, "film", 6, "street", 135, 8, [DOOM_ID],
    "The last film before Doomsday. Peter Parker alone, in a world that has forgotten him."),

  t(DOOM_ID, "Avengers: Doomsday", 2026, "film", 6, "avengers", 0, 10, [],
    "Every road ends here. 18 December 2026."),
];

// In-universe story order, for people who prefer to watch chronologically.
export const CHRONO: string[] = [
  "first-avenger", "captain-marvel", "iron-man", "iron-man-2", "incredible-hulk", "thor",
  "avengers", "iron-man-3", "dark-world", "winter-soldier", "guardians", "guardians-2",
  "age-of-ultron", "ant-man", "civil-war", "black-widow", "black-panther", "homecoming",
  "doctor-strange", "ragnarok", "ant-man-wasp", "infinity-war", "endgame", "loki-1",
  "wandavision", "falcon-winter-soldier", "shang-chi", "far-from-home", "eternals",
  "no-way-home", "multiverse-of-madness", "hawkeye", "moon-knight", "she-hulk", "ms-marvel",
  "love-and-thunder", "werewolf", "wakanda-forever", "ironheart", "holiday-special",
  "quantumania", "guardians-3", "secret-invasion", "the-marvels", "loki-2", "echo",
  "x-men", "x2", "days-of-future-past", "deadpool-wolverine", "agatha", "born-again-1",
  "brave-new-world", "thunderbolts", "first-steps", "wonder-man", "born-again-2",
  "brand-new-day", DOOM_ID,
];

export const BY_ID: Record<string, Title> = Object.fromEntries(TITLES.map((x) => [x.id, x]));
export const LANE_BY_ID = Object.fromEntries(LANES.map((l) => [l.id, l])) as Record<
  LaneId,
  (typeof LANES)[number]
>;

export const tierOf = (x: Title) => (x.imp >= 7 ? "essential" : x.imp >= 4 ? "recommended" : "deep");
export const TIER_LABEL = { essential: "Essential", recommended: "Recommended", deep: "Deep cut" } as const;

export const fmtMin = (m: number) => {
  const h = Math.floor(m / 60);
  const r = Math.round(m % 60);
  return h ? (r ? `${h}h ${r}m` : `${h}h`) : `${r}m`;
};

// ── Graph helpers ──────────────────────────────────────────────────────────
const PARENTS: Record<string, string[]> = {};
for (const x of TITLES) for (const c of x.to) (PARENTS[c] ||= []).push(x.id);
export const parentsOf = (id: string) => PARENTS[id] || [];

const walk = (id: string, next: (id: string) => string[], out = new Set<string>()) => {
  for (const n of next(id)) if (!out.has(n)) { out.add(n); walk(n, next, out); }
  return out;
};

/** Everything upstream and downstream of a title, including itself. */
export const bloodline = (id: string) => {
  const s = new Set<string>([id]);
  walk(id, parentsOf).forEach((x) => s.add(x));
  walk(id, (i) => BY_ID[i].to).forEach((x) => s.add(x));
  return s;
};

/** Shortest chain of titles from `id` to Doomsday, or null if it never gets there. */
export const roadToDoom = (id: string): string[] | null => {
  const prev: Record<string, string | null> = { [id]: null };
  const q = [id];
  while (q.length) {
    const cur = q.shift()!;
    if (cur === DOOM_ID) {
      const path: string[] = [];
      for (let c: string | null = cur; c; c = prev[c]) path.unshift(c);
      return path;
    }
    for (const n of BY_ID[cur].to) if (!(n in prev)) { prev[n] = cur; q.push(n); }
  }
  return null;
};
