// The words for the "story so far" deck and the per-title plot summaries.
// Everything here is spoiler-heavy by design. Edit freely.

export interface Chapter {
  kind: string; // which animation to draw (see components/Story.tsx)
  title: string;
  body: string[];
  watch: string[]; // title ids
}

export const CHAPTERS: Chapter[] = [
  {
    kind: "stones",
    title: "Six stones, one snap",
    body: [
      "The first 23 films tell one story: the hunt for six Infinity Stones. Thanos collects them all and, with a snap of his fingers, erases half of all life.",
      "Five years later the Avengers travel back through time, borrow the stones and undo it. Tony Stark dies to finish the job. Steve Rogers stays in the past.",
    ],
    watch: ["avengers", "infinity-war", "endgame"],
  },
  {
    kind: "sacred",
    title: "One timeline, kept by force",
    body: [
      "Then Loki reveals that time was never free. The Time Variance Authority prunes every branch of reality that strays from a single \"Sacred Timeline\" — and erases everyone living on it.",
      "The man behind it, He Who Remains, says it is the only way to stop his own variants from fighting a war across the multiverse.",
    ],
    watch: ["loki-1"],
  },
  {
    kind: "fracture",
    title: "The moment it broke",
    body: [
      "During the time heist in Endgame, a 2012 Loki escapes with the Tesseract. That small detour leads him to the TVA, and to Sylvie — who kills He Who Remains.",
      "With nobody left to prune it, the timeline splinters into countless branches. The multiverse is open.",
    ],
    watch: ["endgame", "loki-1"],
  },
  {
    kind: "multiverse",
    title: "Everyone has a variant",
    body: [
      "Other universes start to bleed in. A botched spell pulls villains and two other Spider-Men into Peter Parker's world; he saves them all, and pays by being forgotten by everyone on Earth.",
      "Doctor Strange crosses between universes and meets other versions of himself — not all of them good.",
    ],
    watch: ["no-way-home", "multiverse-of-madness"],
  },
  {
    kind: "incursion",
    title: "What is an incursion?",
    body: [
      "The key word for Doomsday. An incursion is what happens when two universes collide: one of them, or both, is destroyed.",
      "In Multiverse of Madness, the heroes of another Earth explain that their own Doctor Strange caused one by meddling across realities. In the final scene, Clea tells our Strange that he has caused one too — and it needs fixing.",
    ],
    watch: ["multiverse-of-madness"],
  },
  {
    kind: "tree",
    title: "The god who holds it together",
    body: [
      "The TVA's machine cannot carry infinite branches, and they begin to die.",
      "Loki ends his story by stepping in himself: he gathers every timeline in his hands and holds them alive, alone, at the end of time. He is on the Doomsday cast list — which means something pulls him off that throne.",
    ],
    watch: ["loki-2"],
  },
  {
    kind: "kang",
    title: "The villain who wasn't",
    body: [
      "Quantumania introduced Kang the Conqueror, and a whole council of his variants, as the big threat of this saga.",
      "That plan was dropped. The fifth Avengers film was renamed Doomsday and the story turned to Doctor Doom instead. Kang's chapters still explain the idea of a multiversal war; they matter less for the plot.",
    ],
    watch: ["quantumania"],
  },
  {
    kind: "void",
    title: "Dying worlds",
    body: [
      "Deadpool & Wolverine visits the universe of the old X-Men films and shows that a universe can wither once its \"anchor being\" is gone. It puts the TVA and those legacy heroes back in play.",
      "In The Marvels, Monica Rambeau is left stranded in a universe where the X-Men exist. Several of those X-Men are in Doomsday.",
    ],
    watch: ["days-of-future-past", "deadpool-wolverine", "the-marvels"],
  },
  {
    kind: "team",
    title: "A world without Avengers",
    body: [
      "Back home, there is no team. Sam Wilson, now Captain America, is warned that other worlds are coming.",
      "A crew of misfits — Yelena, Bucky, Red Guardian, Ghost, U.S. Agent and Sentry — gets branded the New Avengers. Then a ship marked with a 4 enters Earth's atmosphere.",
    ],
    watch: ["brave-new-world", "thunderbolts"],
  },
  {
    kind: "four",
    title: "The first family, and the man in the mask",
    body: [
      "That ship comes from another universe, where the Fantastic Four protect a retro-future Earth and save it from Galactus, who wants Reed and Sue's son, Franklin.",
      "In the last scene, years later, a hooded figure holding a metal mask is alone with the child. Doctor Doom has arrived.",
    ],
    watch: ["first-steps"],
  },
  {
    kind: "doom",
    title: "Doomsday",
    body: [
      "Everything converges: Sam's Avengers, the New Avengers, Wakanda, the Fantastic Four, the original X-Men, Thor and Loki, and a returning Steve Rogers.",
      "Against them stands Victor von Doom, played by Robert Downey Jr. — wearing the face of the man who started it all. 18 December 2026. Secret Wars follows a year later.",
    ],
    watch: ["doomsday"],
  },
];

/** What happens in each title, in a sentence or two. Spoilers. */
export const PLOT: Record<string, string> = {
  "iron-man": "Weapons maker Tony Stark is captured, builds an armoured suit to escape and comes home a changed man. He ends by telling the world: \"I am Iron Man.\"",
  "incredible-hulk": "Bruce Banner hunts for a cure while General Ross hunts him. He ends up fighting the Abomination in Harlem.",
  "iron-man-2": "Tony is being poisoned by the thing keeping him alive, while a rival and a vengeful physicist come for his tech. S.H.I.E.L.D. and Black Widow step in.",
  "thor": "Arrogant Thor is banished to Earth without his hammer and learns humility, while his brother Loki schemes for Asgard's throne.",
  "first-avenger": "In 1943, frail Steve Rogers becomes a super-soldier, fights Hydra, loses his friend Bucky and crashes into the ice — waking up seventy years later.",
  "avengers": "Loki invades New York with an alien army. Iron Man, Captain America, Thor, Hulk, Black Widow and Hawkeye team up for the first time to stop him.",
  "iron-man-3": "Shaken by New York, Tony faces the Mandarin with almost no armour — and finds the terrorist is a front for someone else.",
  "dark-world": "Thor teams up with an imprisoned Loki to stop the Dark Elves from using the Aether, which turns out to be an Infinity Stone.",
  "winter-soldier": "Steve discovers Hydra has been growing inside S.H.I.E.L.D. for decades, and that its assassin, the Winter Soldier, is Bucky. He meets Sam Wilson.",
  "guardians": "A thief, an assassin, a raccoon, a tree and a warrior become an unlikely family while keeping an Infinity Stone away from Ronan.",
  "age-of-ultron": "Tony's peacekeeping AI, Ultron, decides humanity is the problem. The Avengers stop him in Sokovia at a terrible cost. Wanda and Vision join.",
  "ant-man": "Ex-con Scott Lang inherits a suit that shrinks him and pulls a heist to keep the technology out of the wrong hands.",
  "civil-war": "A law to control the Avengers splits them. Steve protects Bucky, Tony wants oversight, and the team tears itself apart. Black Panther and Spider-Man debut.",
  "doctor-strange": "Surgeon Stephen Strange loses the use of his hands, finds sorcery instead and learns to guard the Time Stone.",
  "guardians-2": "Peter Quill meets his father, a living planet with plans for the galaxy, and learns who his real family is.",
  "homecoming": "Fifteen-year-old Peter Parker wants to prove himself to Tony Stark and takes on the Vulture alone.",
  "ragnarok": "Thor loses his hammer, his home and an eye. He escapes a gladiator planet with Hulk and Loki, and lets Asgard be destroyed to save its people.",
  "black-panther": "T'Challa becomes king of hidden Wakanda and is challenged by Killmonger, who wants to arm the world with its technology.",
  "infinity-war": "Thanos gathers the six Infinity Stones. The Avengers fail to stop him, and he erases half of all life.",
  "ant-man-wasp": "Scott and Hope rescue Janet van Dyne from the Quantum Realm while dodging a phasing thief called Ghost. Scott ends up trapped there.",
  "captain-marvel": "In 1995, pilot Carol Danvers recovers her memories, finds out who the real enemy is and becomes one of the universe's most powerful heroes.",
  "endgame": "Five years after the snap, the Avengers travel through time to borrow the stones and bring everyone back. Tony dies. Steve returns to the past.",
  "far-from-home": "On a school trip, a grieving Peter is tricked by Mysterio, who then reveals Peter's identity to the world.",
  "wandavision": "Wanda builds a sitcom reality around a town so she can live with Vision, and becomes the Scarlet Witch.",
  "falcon-winter-soldier": "Sam Wilson struggles with the shield's legacy while a government-picked Captain America, John Walker, falls apart. Sam takes up the mantle.",
  "loki-1": "A Loki who escaped in 2012 is arrested by the Time Variance Authority, meets his variant Sylvie and finds the man who controls all of time.",
  "black-widow": "On the run after Civil War, Natasha reunites with her spy \"family\" — Yelena, Red Guardian and Melina — to bring down the Red Room.",
  "shang-chi": "Shang-Chi is pulled back into the world of his father, the immortal leader of the Ten Rings, and inherits the rings himself.",
  "eternals": "Immortal beings who have guided humanity for millennia learn their real purpose is to let a Celestial be born from the Earth — and refuse.",
  "hawkeye": "Clint Barton just wants to get home for Christmas. Instead he gains a protégée, Kate Bishop, and Yelena comes hunting him.",
  "no-way-home": "A spell to make the world forget Peter is Spider-Man goes wrong and pulls in villains and heroes from other universes. Peter ends up forgotten by everyone.",
  "moon-knight": "Mild gift-shop worker Steven Grant discovers he shares a body with a mercenary who serves an Egyptian moon god.",
  "multiverse-of-madness": "Strange protects America Chavez, who can travel the multiverse, from a corrupted Wanda. He learns what an incursion is — and that he has caused one.",
  "ms-marvel": "Jersey City teenager Kamala Khan gains powers from a family bangle and learns where her family came from.",
  "love-and-thunder": "Thor faces Gorr the God Butcher alongside Jane Foster, now wielding Mjolnir. He ends up raising Gorr's daughter.",
  "she-hulk": "Lawyer Jennifer Walters becomes a Hulk and has to run a superhuman law practice, a dating life and a fourth wall at the same time.",
  "werewolf": "Monster hunters gather for a deadly competition, and one of them is hiding that he is a monster himself.",
  "wakanda-forever": "After T'Challa's death, Wakanda is threatened by Namor and the undersea nation of Talokan. Shuri becomes the Black Panther.",
  "holiday-special": "Mantis and Drax decide the perfect Christmas present for Quill is Kevin Bacon.",
  "quantumania": "Scott Lang's family is pulled into the Quantum Realm, where Kang the Conqueror is exiled and trying to get out.",
  "guardians-3": "The Guardians race to save Rocket's life and confront the man who made him. The team goes its separate ways.",
  "secret-invasion": "Nick Fury returns to Earth to stop a faction of shape-shifting Skrulls who have replaced people in power.",
  "loki-2": "With time unravelling, Loki tries to save the TVA and every branching timeline — and ends up holding them together himself.",
  "the-marvels": "Carol Danvers, Monica Rambeau and Kamala Khan find their powers tangled together. Monica is left stranded in another universe.",
  "echo": "Maya Lopez returns home to Oklahoma with the Kingpin's empire chasing her and reconnects with her Choctaw roots.",
  "x-men": "In another universe, Professor X's mutants take in Wolverine and Rogue and stop Magneto's plan to mutate world leaders.",
  "x2": "The X-Men and Magneto form an uneasy alliance against William Stryker, who wants to wipe out every mutant. Jean Grey sacrifices herself.",
  "days-of-future-past": "From a doomed future, Wolverine's mind is sent back to 1973 to stop an assassination and rewrite history.",
  "deadpool-wolverine": "The TVA plans to erase Deadpool's dying universe. He recruits a broken Wolverine from another world to save it.",
  "agatha": "Stripped of her powers, Agatha Harkness gathers a coven and walks the Witches' Road to get them back.",
  "brave-new-world": "Sam Wilson uncovers a plot around President Ross, who turns into the Red Hulk. A warning at the end points to other worlds.",
  "born-again-1": "Matt Murdock tries to put Daredevil behind him while Wilson Fisk is elected Mayor of New York. Neither can stay out of the dark.",
  "thunderbolts": "Yelena, Bucky, Red Guardian, Ghost and U.S. Agent are thrown together against the Void, the dark side of the super-powered Bob. They are rebranded the New Avengers.",
  "ironheart": "Genius inventor Riri Williams returns to Chicago and falls in with a crew whose leader wears a cloak with a dark source.",
  "first-steps": "On a retro-future Earth in another universe, the Fantastic Four face Galactus, who demands Reed and Sue's unborn son. Doctor Doom appears in the final scene.",
  "wonder-man": "Struggling actor Simon Williams chases the lead in a superhero remake while hiding that he has powers of his own.",
  "born-again-2": "The war for New York goes on, with Daredevil and his allies against Mayor Fisk's city.",
  "brand-new-day": "Peter Parker, now anonymous and alone, is Spider-Man full time in New York. The last film before Doomsday.",
  "doomsday": "Not released yet. Earth's heroes — from several universes — against Doctor Doom.",
};
