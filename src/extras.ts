// Other Marvel movies that aren't part of the MCU story: none of them are needed
// for Doomsday, so they never count towards essentials, the doom-ready % or the
// planner. Each gets one honest line on how (or whether) it connects.

export interface Extra { id: string; title: string; year: number; note: string }
export interface ExtraGroup { name: string; items: Extra[] }

export const EXTRAS: ExtraGroup[] = [
  {
    name: "The older Spider-Man movies",
    items: [
      { id: "spider-man-2002", title: "Spider-Man", year: 2002, note: "Tobey Maguire's Peter and Willem Dafoe's Green Goblin, who both come back in No Way Home." },
      { id: "spider-man-2-2004", title: "Spider-Man 2", year: 2004, note: "Doc Ock's story, and Alfred Molina plays him again in No Way Home. Still one of the best." },
      { id: "spider-man-3", title: "Spider-Man 3", year: 2007, note: "Sandman and Venom. Sandman turns up again in No Way Home." },
      { id: "amazing-spider-man", title: "The Amazing Spider-Man", year: 2012, note: "Andrew Garfield's Peter, and the Lizard, who comes back in No Way Home." },
      { id: "amazing-spider-man-2", title: "The Amazing Spider-Man 2", year: 2014, note: "Electro returns in No Way Home, and what happens to Gwen here is why Garfield's scene there hits so hard." },
    ],
  },
  {
    name: "Sony's Spider-Man villain movies",
    items: [
      { id: "venom", title: "Venom", year: 2018, note: "Tom Hardy's Eddie Brock. Fun on its own." },
      { id: "venom-2", title: "Venom: Let There Be Carnage", year: 2021, note: "The mid-credits scene drops Eddie into the MCU for a moment, which pays off at the end of No Way Home." },
      { id: "venom-3", title: "Venom: The Last Dance", year: 2024, note: "Wraps up Tom Hardy's Venom. Nothing here carries into the MCU." },
      { id: "morbius", title: "Morbius", year: 2022, note: "Michael Keaton's Vulture shows up in the credits, and that's about it." },
      { id: "madame-web", title: "Madame Web", year: 2024, note: "Completely standalone. Skip it unless you're curious." },
      { id: "kraven", title: "Kraven the Hunter", year: 2024, note: "Standalone, no link to the MCU." },
    ],
  },
  {
    name: "The rest of Fox's X-Men",
    items: [
      { id: "first-class", title: "X-Men: First Class", year: 2011, note: "Young Xavier and Magneto. It leads straight into Days of Future Past." },
      { id: "last-stand", title: "X-Men: The Last Stand", year: 2006, note: "The end of the original trilogy. Days of Future Past later undoes most of it." },
      { id: "origins-wolverine", title: "X-Men Origins: Wolverine", year: 2009, note: "Logan's backstory, and the version of Deadpool that Deadpool & Wolverine makes fun of." },
      { id: "the-wolverine", title: "The Wolverine", year: 2013, note: "Logan in Japan. Its mid-credits scene sets up Days of Future Past." },
      { id: "apocalypse", title: "X-Men: Apocalypse", year: 2016, note: "The young cast against Apocalypse. Optional even for X-Men fans." },
      { id: "dark-phoenix", title: "Dark Phoenix", year: 2019, note: "The last of Fox's main X-Men movies." },
      { id: "logan", title: "Logan", year: 2017, note: "Hugh Jackman's farewell (until Deadpool & Wolverine), and Laura, who comes back there too." },
      { id: "deadpool", title: "Deadpool", year: 2016, note: "Ryan Reynolds' Deadpool before he joins the MCU." },
      { id: "deadpool-2", title: "Deadpool 2", year: 2018, note: "Cable and the X-Force joke. Lots of Deadpool & Wolverine's gags call back to these two." },
    ],
  },
  {
    name: "Legacy Marvel",
    items: [
      { id: "blade", title: "Blade", year: 1998, note: "Wesley Snipes' Blade, who comes back in Deadpool & Wolverine." },
      { id: "blade-2", title: "Blade II", year: 2002, note: "More Snipes. The best of the three." },
      { id: "blade-3", title: "Blade: Trinity", year: 2004, note: "The last of the old Blade movies." },
      { id: "ff-2005", title: "Fantastic Four", year: 2005, note: "Chris Evans as Johnny Storm, who has a big cameo in Deadpool & Wolverine." },
      { id: "ff-silver-surfer", title: "Fantastic Four: Rise of the Silver Surfer", year: 2007, note: "The Silver Surfer and a cloud version of Galactus. Fun to compare with First Steps." },
      { id: "daredevil-2003", title: "Daredevil", year: 2003, note: "Ben Affleck's Daredevil, and Jennifer Garner's Elektra, who returns in Deadpool & Wolverine." },
      { id: "elektra", title: "Elektra", year: 2005, note: "Jennifer Garner's spin-off, the same Elektra who shows up in Deadpool & Wolverine." },
      { id: "ghost-rider", title: "Ghost Rider", year: 2007, note: "Nicolas Cage on a flaming bike. No MCU link." },
      { id: "ghost-rider-2", title: "Ghost Rider: Spirit of Vengeance", year: 2011, note: "More Cage. No MCU link." },
      { id: "punisher-2004", title: "The Punisher", year: 2004, note: "Thomas Jane's Punisher. The MCU's Punisher is Jon Bernthal, in Born Again." },
    ],
  },
];

/** Wikipedia article for each extra, so the build can copy its poster like the rest. */
export const EXTRA_WIKI: Record<string, string> = {
  "spider-man-2002": "Spider-Man (2002 film)",
  "spider-man-2-2004": "Spider-Man 2",
  "spider-man-3": "Spider-Man 3",
  "amazing-spider-man": "The Amazing Spider-Man (film)",
  "amazing-spider-man-2": "The Amazing Spider-Man 2",
  "venom": "Venom (2018 film)",
  "venom-2": "Venom: Let There Be Carnage",
  "venom-3": "Venom: The Last Dance",
  "morbius": "Morbius (film)",
  "madame-web": "Madame Web (film)",
  "kraven": "Kraven the Hunter (film)",
  "first-class": "X-Men: First Class",
  "last-stand": "X-Men: The Last Stand",
  "origins-wolverine": "X-Men Origins: Wolverine",
  "the-wolverine": "The Wolverine (film)",
  "apocalypse": "X-Men: Apocalypse",
  "dark-phoenix": "Dark Phoenix (film)",
  "logan": "Logan (film)",
  "deadpool": "Deadpool (film)",
  "deadpool-2": "Deadpool 2",
  "blade": "Blade (1998 film)",
  "blade-2": "Blade II",
  "blade-3": "Blade: Trinity",
  "ff-2005": "Fantastic Four (2005 film)",
  "ff-silver-surfer": "Fantastic Four: Rise of the Silver Surfer",
  "daredevil-2003": "Daredevil (2003 film)",
  "elektra": "Elektra (2005 film)",
  "ghost-rider": "Ghost Rider (2007 film)",
  "ghost-rider-2": "Ghost Rider: Spirit of Vengeance",
  "punisher-2004": "The Punisher (2004 film)",
};
