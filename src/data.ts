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
  { id: "avengers", name: "Avengers movies", color: "#8b978f" },
  { id: "cap", name: "Cap, Bucky and Sam", color: "#8b978f" },
  { id: "cosmic", name: "Thor and space", color: "#8b978f" },
  { id: "multiverse", name: "Multiverse", color: "#8b978f" },
  { id: "wakanda", name: "Wakanda and Shang-Chi", color: "#8b978f" },
  { id: "street", name: "Street level", color: "#8b978f" },
  { id: "legacy", name: "Old X-Men movies", color: "#8b978f" },
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
    "This is where it all started. Doctor Doom now has Tony Stark's face, so it hits harder if you remember the original Tony."),
  t("incredible-hulk", "The Incredible Hulk", 2008, "film", 1, "avengers", 112, 2, ["avengers", "brave-new-world"],
    "Not a great movie, but Thaddeus Ross and Samuel Sterns start here and both of them come back in Brave New World."),
  t("iron-man-2", "Iron Man 2", 2010, "film", 1, "avengers", 124, 2, ["avengers"],
    "Black Widow shows up for the first time and Fury starts talking about the Avengers Initiative. You can skip it if you're short on time."),
  t("thor", "Thor", 2011, "film", 1, "cosmic", 115, 5, ["avengers", "dark-world"],
    "Thor and Loki's first movie. Both of them are in Doomsday, so it's nice to see where they started."),
  t("first-avenger", "Captain America: The First Avenger", 2011, "film", 1, "cap", 124, 6, ["avengers", "winter-soldier"],
    "You see Steve and Bucky before the ice. Watch it, because Steve's story is not as finished as Endgame made it look."),
  t("avengers", "The Avengers", 2012, "film", 1, "avengers", 143, 8, ["iron-man-3", "dark-world", "winter-soldier", "age-of-ultron"],
    "The team gets together for the first time here. Every Avengers movie after this, Doomsday included, gets compared to this one."),

  // ── Phase Two ────────────────────────────────────────────────────────────
  t("iron-man-3", "Iron Man 3", 2013, "film", 2, "avengers", 130, 2, ["age-of-ultron"],
    "This is Tony dealing with what happened in New York. It also starts the Ten Rings stuff that Shang-Chi finishes later."),
  t("dark-world", "Thor: The Dark World", 2013, "film", 2, "cosmic", 112, 2, ["ragnarok"],
    "One of the weaker ones, but you get more Thor and Loki and your first proper look at an Infinity Stone."),
  t("winter-soldier", "Captain America: The Winter Soldier", 2014, "film", 2, "cap", 136, 7, ["age-of-ultron", "civil-war"],
    "Bucky comes back and you meet Sam Wilson. Both of them are a big part of the Doomsday cast, and it's one of the best MCU movies anyway."),
  t("guardians", "Guardians of the Galaxy", 2014, "film", 2, "cosmic", 121, 3, ["guardians-2"],
    "This opens up the space side of the MCU and the hunt for the Infinity Stones. Also just a really fun movie."),
  t("age-of-ultron", "Avengers: Age of Ultron", 2015, "film", 2, "avengers", 141, 5, ["civil-war", "ragnarok", "ant-man"],
    "Wanda and Vision come in, Sokovia falls, and you can see the team starting to crack."),
  t("ant-man", "Ant-Man", 2015, "film", 2, "multiverse", 117, 4, ["civil-war", "ant-man-wasp"],
    "You meet Scott Lang and the Quantum Realm here, and Scott is confirmed for Doomsday."),

  // ── Phase Three ──────────────────────────────────────────────────────────
  t("civil-war", "Captain America: Civil War", 2016, "film", 3, "cap", 147, 8, ["homecoming", "black-panther", "infinity-war", "black-widow"],
    "This is where the Avengers break up. You also get your first look at Wakanda and Spider-Man, and it sets up Bucky and Sam for everything after."),
  t("doctor-strange", "Doctor Strange", 2016, "film", 3, "multiverse", 115, 5, ["infinity-war", "multiverse-of-madness"],
    "You get magic, the Time Stone and the first hint that reality has more than one layer."),
  t("guardians-2", "Guardians of the Galaxy Vol. 2", 2017, "film", 3, "cosmic", 136, 2, ["infinity-war"],
    "The Guardians become a proper family right before Thanos tears it apart. Nice to watch, but you can skip it."),
  t("homecoming", "Spider-Man: Homecoming", 2017, "film", 3, "street", 133, 4, ["infinity-war", "far-from-home"],
    "It's Peter Parker trying to impress Tony Stark. Fun, but not a must."),
  t("ragnarok", "Thor: Ragnarok", 2017, "film", 3, "cosmic", 130, 6, ["infinity-war"],
    "Asgard gets destroyed and Thor becomes a very different guy. That's the Thor you'll see in Doomsday, so watch this one."),
  t("black-panther", "Black Panther", 2018, "film", 3, "wakanda", 134, 6, ["infinity-war", "wakanda-forever"],
    "You meet Wakanda, Shuri and M'Baku, and both Shuri and M'Baku are confirmed for Doomsday."),
  t("infinity-war", "Avengers: Infinity War", 2018, "film", 3, "avengers", 149, 9, ["endgame"],
    "The last time the whole universe teamed up against one villain, and they lost. You have to watch this one."),
  t("ant-man-wasp", "Ant-Man and the Wasp", 2018, "film", 3, "multiverse", 118, 3, ["endgame"],
    "The Quantum Realm turns into a way to travel through time. You also meet Ghost, who comes back in Thunderbolts*."),
  t("captain-marvel", "Captain Marvel", 2019, "film", 3, "cosmic", 124, 3, ["endgame", "the-marvels", "secret-invasion"],
    "It's Carol Danvers' origin story, with Nick Fury and the Skrulls. Okay to skip if you're in a hurry."),
  t("endgame", "Avengers: Endgame", 2019, "film", 3, "avengers", 181, 10, ["far-from-home", "wandavision", "falcon-winter-soldier", "loki-1", "love-and-thunder", "hawkeye"],
    "Tony dies, Steve goes back and Loki escapes with the Tesseract. Pretty much everything Doomsday builds on starts here, so don't skip it."),
  t("far-from-home", "Spider-Man: Far From Home", 2019, "film", 3, "street", 129, 4, ["no-way-home"],
    "Shows the world after Tony Stark, and it ends with everyone finding out Peter is Spider-Man."),

  // ── Phase Four ───────────────────────────────────────────────────────────
  t("wandavision", "WandaVision", 2021, "series", 4, "multiverse", 350, 4, ["multiverse-of-madness", "agatha", "the-marvels"],
    "Wanda becomes the Scarlet Witch and Monica Rambeau gets her powers in this show."),
  t("falcon-winter-soldier", "The Falcon and the Winter Soldier", 2021, "series", 4, "cap", 310, 7, ["brave-new-world", "thunderbolts"],
    "Sam Wilson takes the shield. It also brings in John Walker and Valentina, and that's where the New Avengers stuff starts."),
  t("loki-1", "Loki Season 1", 2021, "series", 4, "multiverse", 280, 9, ["loki-2", "quantumania", "no-way-home"],
    "The TVA, variants and the Sacred Timeline all come in here. If you watch only one show before Doomsday, make it this one."),
  t("black-widow", "Black Widow", 2021, "film", 4, "cap", 134, 5, ["hawkeye", "thunderbolts"],
    "You meet Yelena Belova and Red Guardian, and both of them are in Doomsday."),
  t("shang-chi", "Shang-Chi and the Legend of the Ten Rings", 2021, "film", 4, "wakanda", 132, 5, [DOOM_ID],
    "It's Shang-Chi's only movie so far, and he's confirmed for Doomsday. The fight scenes are great too."),
  t("eternals", "Eternals", 2021, "film", 4, "cosmic", 156, 2, ["brave-new-world"],
    "It leaves a giant Celestial in the Indian Ocean, and the fight in Brave New World is over what it's made of. Long movie, so skip it if you need to."),
  t("hawkeye", "Hawkeye", 2021, "series", 4, "street", 290, 2, ["echo", "born-again-1"],
    "It has Yelena grieving, Kate Bishop, and the Kingpin coming back. Good Christmas watch but not needed."),
  t("no-way-home", "Spider-Man: No Way Home", 2021, "film", 4, "street", 148, 7, ["multiverse-of-madness", "brand-new-day"],
    "This is where the multiverse properly opens up on screen, and by the end the whole world forgets Peter Parker."),
  t("moon-knight", "Moon Knight", 2022, "series", 4, "multiverse", 290, 1, [],
    "It's completely separate from everything else, so watch it because it's good, not because Doomsday needs it."),
  t("multiverse-of-madness", "Doctor Strange in the Multiverse of Madness", 2022, "film", 4, "multiverse", 126, 8, [DOOM_ID],
    "This is where you learn about incursions, which is when universes crash into each other and get destroyed. Doomsday's story runs on this, so it's very important."),
  t("ms-marvel", "Ms. Marvel", 2022, "series", 4, "cosmic", 270, 2, ["the-marvels"],
    "You meet Kamala Khan, and it's the first time the MCU says the word 'mutation'."),
  t("love-and-thunder", "Thor: Love and Thunder", 2022, "film", 4, "cosmic", 119, 5, [DOOM_ID],
    "This is the last time we saw Thor, and he's a dad now. Not the best Thor movie, but it's where he is going into Doomsday."),
  t("she-hulk", "She-Hulk: Attorney at Law", 2022, "series", 4, "street", 300, 1, ["born-again-1"],
    "It's a light comedy that breaks the fourth wall, and Daredevil makes his first proper MCU appearance here. You can skip it."),
  t("werewolf", "Werewolf by Night", 2022, "special", 4, "multiverse", 53, 1, [],
    "It's a one-off monster special. Short and fun, but it's just a bonus."),
  t("wakanda-forever", "Black Panther: Wakanda Forever", 2022, "film", 4, "wakanda", 161, 7, [DOOM_ID, "ironheart"],
    "Shuri becomes the Black Panther and you meet Namor from Talokan. Shuri, M'Baku and Namor are all in Doomsday."),
  t("holiday-special", "The Guardians of the Galaxy Holiday Special", 2022, "special", 4, "cosmic", 44, 1, ["guardians-3"],
    "It's a short and sweet one that leads into Vol. 3. Good to watch around Christmas."),

  // ── Phase Five ───────────────────────────────────────────────────────────
  t("quantumania", "Ant-Man and the Wasp: Quantumania", 2023, "film", 5, "multiverse", 124, 6, [DOOM_ID, "loki-2"],
    "It's Scott Lang's last movie before Doomsday and it explains the multiverse war. You can skip Quantumania if you're short on time though, Kang got dropped anyway."),
  t("guardians-3", "Guardians of the Galaxy Vol. 3", 2023, "film", 5, "cosmic", 150, 2, [],
    "This wraps up the Guardians' story. You don't need it for Doomsday, but it's one of the best movies in this whole saga."),
  t("secret-invasion", "Secret Invasion", 2023, "series", 5, "cosmic", 270, 1, ["the-marvels"],
    "It's Nick Fury against the Skrulls. Skip it if you're short on time, you won't miss anything for Doomsday."),
  t("loki-2", "Loki Season 2", 2023, "series", 5, "multiverse", 300, 9, ["deadpool-wolverine", DOOM_ID],
    "Loki ends up holding every timeline together by hand. He's in Doomsday, so you need to know how he got there."),
  t("the-marvels", "The Marvels", 2023, "film", 5, "cosmic", 105, 5, [DOOM_ID],
    "The ending drops Monica Rambeau in a universe with the X-Men's Beast, and Beast is in Doomsday."),
  t("echo", "Echo", 2024, "series", 5, "street", 200, 1, ["born-again-1"],
    "It's about Maya Lopez and the Kingpin and it leads into Born Again. You can skip it."),
  t("x-men", "X-Men", 2000, "film", 0, "legacy", 104, 4, ["x2"],
    "This is a completely different universe, but its Professor X, Magneto, Cyclops and Mystique are all in Doomsday, so it's worth a rewatch."),
  t("x2", "X2: X-Men United", 2003, "film", 0, "legacy", 134, 4, ["days-of-future-past"],
    "Nightcrawler shows up here and he's back for Doomsday too. Best of the old X-Men trilogy if you ask me."),
  t("days-of-future-past", "X-Men: Days of Future Past", 2014, "film", 0, "legacy", 132, 5, ["deadpool-wolverine", DOOM_ID],
    "The last time the original cast were all together, and it's a story about rewriting the timeline, so it fits right in."),
  t("deadpool-wolverine", "Deadpool & Wolverine", 2024, "film", 5, "legacy", 128, 8, [DOOM_ID],
    "The TVA meets the mutant universe. It explains how timelines die and brings Gambit in, and it's very fun."),
  t("agatha", "Agatha All Along", 2024, "series", 5, "multiverse", 330, 1, [],
    "It's a WandaVision spin-off that does its own witchy thing. Skip it if you're short on time."),
  t("brave-new-world", "Captain America: Brave New World", 2025, "film", 5, "cap", 118, 7, [DOOM_ID],
    "This is Sam Wilson's first movie as Captain America, and he leads an Avengers team into Doomsday."),
  t("born-again-1", "Daredevil: Born Again Season 1", 2025, "series", 5, "street", 450, 3, ["born-again-2"],
    "It's Matt Murdock against Mayor Fisk. Street level stuff, but it sets the mood for New York."),
  t("thunderbolts", "Thunderbolts*", 2025, "film", 5, "cap", 127, 9, ["first-steps", DOOM_ID],
    "Yelena, Bucky, Red Guardian, Ghost, U.S. Agent and Sentry become the New Avengers, and the last scene points straight at the Fantastic Four. Don't skip this one."),
  t("ironheart", "Ironheart", 2025, "series", 5, "wakanda", 280, 2, [],
    "It follows Riri Williams after Wakanda Forever and mixes tech with magic. You can skip it."),

  // ── Phase Six ────────────────────────────────────────────────────────────
  t("first-steps", "The Fantastic Four: First Steps", 2025, "film", 6, "multiverse", 115, 10, [DOOM_ID],
    "You meet Marvel's first family in their own universe, and the mid-credits scene is the first time we see Doctor Doom. Very important, watch it."),
  t("wonder-man", "Wonder Man", 2026, "series", 6, "street", 270, 1, [],
    "It's a Hollywood satire off to the side of the main story. Watch it if you like, Doomsday doesn't need it."),
  t("born-again-2", "Daredevil: Born Again Season 2", 2026, "series", 6, "street", 400, 2, ["brand-new-day"],
    "It's more of the fight for New York. Good if you liked season 1, but optional."),
  t("brand-new-day", "Spider-Man: Brand New Day", 2026, "film", 6, "street", 135, 8, [DOOM_ID],
    "This is the last movie before Doomsday, with Peter Parker on his own in a world that has forgotten him."),

  t(DOOM_ID, "Avengers: Doomsday", 2026, "film", 6, "avengers", 0, 10, [],
    "This is the one we're all waiting for. It's in cinemas on 18 December 2026."),
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

// ── The tree ───────────────────────────────────────────────────────────────
// The map draws a tree, so every title gets exactly one "next step" towards
// Doomsday. By default that is the first entry in `to` that can reach it;
// these overrides pick a better one where the first entry is not the main line.
const NEXT_OVERRIDE: Record<string, string> = {
  "first-avenger": "winter-soldier",
  "avengers": "age-of-ultron",
  "winter-soldier": "civil-war",
  "ant-man": "ant-man-wasp",
  "civil-war": "infinity-war",
  "homecoming": "far-from-home",
  "black-panther": "wakanda-forever",
  "endgame": "loki-1",
  "black-widow": "thunderbolts",
  "hawkeye": "born-again-1",
  "no-way-home": "brand-new-day",
};

/** The single next step from a title towards Doomsday, or null for a side story. */
export const NEXT: Record<string, string | null> = Object.fromEntries(
  TITLES.map((x) => [
    x.id,
    x.id === DOOM_ID ? null : NEXT_OVERRIDE[x.id] ?? x.to.find((n) => roadToDoom(n)) ?? null,
  ])
);

/** URL-friendly name for a title's own page, e.g. "loki-season-1". */
export const slugOf = (x: Title) =>
  x.title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
