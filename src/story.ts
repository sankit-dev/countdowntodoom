// The words for the "story so far" deck and the per-title plot summaries.
// Everything here is spoiler-heavy by design. Edit freely.

export interface Chapter {
  kind: string; // which animation to draw (see components/Story.tsx)
  title: string;
  body: string[];
  watch: string[]; // title ids
  /** Optional custom picture, e.g. "story/multiverse.jpg" in public/. Falls back to the main film's poster. */
  image?: string;
}

export const CHAPTERS: Chapter[] = [
  {
    kind: "stones",
    title: "The Infinity Stones and the snap",
    body: [
      "The first 23 movies are basically one long story about six Infinity Stones. Thanos gets all of them and snaps away half of all life.",
      "Five years later the Avengers go back in time, borrow the stones and undo it. Tony dies doing it and Steve stays back in the past. You probably know this part already.",
    ],
    watch: ["avengers", "infinity-war", "endgame"],
  },
  {
    kind: "sacred",
    image: "story/sacred.jpg",
    title: "The TVA and the Sacred Timeline",
    body: [
      "Then the Loki show comes in. There's this group called the Time Variance Authority, the TVA, and their whole job is cutting off any branch of reality that doesn't match one \"Sacred Timeline\". Everyone living on those branches gets erased too, which is pretty dark.",
      "The guy running it is He Who Remains. He says it's the only way to stop other versions of himself from fighting a war across the multiverse.",
    ],
    watch: ["loki-1"],
  },
  {
    kind: "fracture",
    image: "story/fracture.jpg",
    title: "How the multiverse opened up",
    body: [
      "Remember the 2012 Loki who runs off with the Tesseract during the time heist in Endgame? That's how he ends up at the TVA, where he meets Sylvie, and Sylvie kills He Who Remains. With nobody left to cut the branches, the timeline splits into loads of them, and that's the multiverse.",
    ],
    watch: ["endgame", "loki-1"],
  },
  {
    kind: "multiverse",
    image: "story/multiverse.jpg",
    title: "Other universes start leaking in",
    body: [
      "A spell goes wrong in No Way Home and pulls villains and two other Spider-Men into Peter's world. Peter saves all of them, but the price is that everyone on Earth forgets him.",
      "Doctor Strange also goes jumping between universes and meets other versions of himself. Not all of them are good guys.",
    ],
    watch: ["no-way-home", "multiverse-of-madness"],
  },
  {
    kind: "incursion",
    image: "story/incursion.jpg",
    title: "What's an incursion?",
    body: [
      "This one is very important for Doomsday, so read it properly. An incursion is when two universes crash into each other, and one of them or both get destroyed.",
      "In Multiverse of Madness, the heroes on another Earth explain that their own Strange caused one by messing around with other realities. Then in the final scene, Clea tells our Strange that he has caused one too and he needs to fix it.",
    ],
    watch: ["multiverse-of-madness"],
  },
  {
    kind: "tree",
    image: "story/tree.jpg",
    title: "Loki holding everything together",
    body: [
      "In Loki season 2 the TVA's machine can't handle infinite branches, and they start dying. So Loki holds every timeline together himself, alone at the end of time. He's in the Doomsday cast though, so something gets him off that throne.",
    ],
    watch: ["loki-2"],
  },
  {
    kind: "kang",
    image: "story/kang.jpg",
    title: "Kang got dropped",
    body: [
      "Quantumania brought in Kang the Conqueror, plus a whole council of his variants, as the big villain of this saga.",
      "Then Marvel dropped that plan. The fifth Avengers movie got renamed to Doomsday and the story went to Doctor Doom instead. So you can skip Quantumania if you're short on time. It still explains the idea of a multiverse war, it just doesn't matter much for the plot now.",
    ],
    watch: ["quantumania"],
  },
  {
    kind: "void",
    image: "story/void.jpg",
    title: "Dying universes and the old X-Men",
    body: [
      "Deadpool & Wolverine goes to the universe of the old X-Men movies and shows that a universe slowly dies once its \"anchor being\" is gone. It also brings the TVA and those older heroes back in.",
      "And at the end of The Marvels, Monica Rambeau gets stuck in a universe where the X-Men exist. A few of those X-Men are in Doomsday, which is very cool if you grew up on those movies.",
    ],
    watch: ["days-of-future-past", "deadpool-wolverine", "the-marvels"],
  },
  {
    kind: "team",
    image: "story/team.jpg",
    title: "There's no Avengers team right now",
    body: [
      "Back home there's no Avengers team at all. Sam Wilson is Captain America now, and he gets warned that other worlds are coming.",
      "Meanwhile Yelena, Bucky, Red Guardian, Ghost, U.S. Agent and Sentry get branded the New Avengers, which is a funny name for a bunch of misfits. Then a ship with a 4 on it shows up in Earth's atmosphere.",
    ],
    watch: ["brave-new-world", "thunderbolts"],
  },
  {
    kind: "four",
    title: "The Fantastic Four, and Doom's first scene",
    body: [
      "That ship comes from another universe, where the Fantastic Four look after a retro-future Earth and save it from Galactus. Galactus wants Reed and Sue's son, Franklin.",
      "Doctor Doom shows up in the last scene, which is set years later. He's in a hood, holding a metal mask, alone with the kid.",
    ],
    watch: ["first-steps"],
  },
  {
    kind: "doom",
    image: "story/doom.jpg",
    title: "So, Doomsday",
    body: [
      "Here's who's in it: Sam's Avengers, the New Avengers, Wakanda, the Fantastic Four, the original X-Men, Thor and Loki, and Steve Rogers is back too.",
      "On the other side is Victor von Doom, played by Robert Downey Jr., the same guy who played Tony. It's out on 17 December 2026 in India and 18 December in the US, and Secret Wars comes a year after that. I can't wait.",
    ],
    watch: ["doomsday"],
  },
];

/** What happens in each title, in a sentence or two. Spoilers. */
export const PLOT: Record<string, string> = {
  "iron-man": "Tony Stark makes weapons, gets captured, builds a suit of armour to escape and comes home a changed man. At the end he tells the whole world \"I am Iron Man\".",
  "incredible-hulk": "Bruce Banner is looking for a cure while General Ross is looking for him, and it ends with him fighting the Abomination in Harlem.",
  "iron-man-2": "The thing keeping Tony alive is slowly poisoning him, and a rival and an angry physicist are both after his tech. S.H.I.E.L.D. and Black Widow get involved.",
  "thor": "Thor is arrogant, so he gets sent to Earth without his hammer and learns some humility. Meanwhile Loki plots to take Asgard's throne.",
  "first-avenger": "In 1943, skinny Steve Rogers becomes a super-soldier, fights Hydra, loses his friend Bucky and crashes into the ice. He wakes up seventy years later.",
  "avengers": "Loki invades New York with an alien army, and Iron Man, Captain America, Thor, Hulk, Black Widow and Hawkeye team up for the first time to stop him.",
  "iron-man-3": "Tony is still shaken after New York and has to face the Mandarin with almost no armour. Turns out the Mandarin is a front for someone else.",
  "dark-world": "Thor teams up with Loki, who's in prison, to stop the Dark Elves from using the Aether. The Aether turns out to be an Infinity Stone.",
  "winter-soldier": "Steve finds out Hydra has been growing inside S.H.I.E.L.D. for decades and that their assassin, the Winter Soldier, is Bucky. He also meets Sam Wilson.",
  "guardians": "A thief, an assassin, a raccoon, a tree and a warrior end up as a weird little family while keeping an Infinity Stone away from Ronan.",
  "age-of-ultron": "Tony builds an AI called Ultron to keep the peace, and Ultron decides humans are the problem. The Avengers stop him in Sokovia but it costs a lot, and Wanda and Vision join.",
  "ant-man": "Scott Lang is an ex-con who gets a suit that shrinks him, and he pulls off a heist to keep the tech away from the wrong people.",
  "civil-war": "A new law to control the Avengers splits the team. Steve protects Bucky, Tony wants oversight, and they tear each other apart. Black Panther and Spider-Man show up for the first time.",
  "doctor-strange": "Stephen Strange is a surgeon who loses the use of his hands, finds magic instead and learns to guard the Time Stone.",
  "guardians-2": "Peter Quill meets his dad, a living planet with big plans for the galaxy, and figures out who his real family is.",
  "homecoming": "Peter Parker is fifteen and wants to prove himself to Tony Stark, so he goes after the Vulture on his own.",
  "ragnarok": "Thor loses his hammer, his home and an eye. He escapes a gladiator planet with Hulk and Loki and lets Asgard get destroyed to save its people.",
  "black-panther": "T'Challa becomes king of hidden Wakanda and gets challenged by Killmonger, who wants to arm the world with Wakanda's tech.",
  "infinity-war": "Thanos collects all six Infinity Stones. The Avengers can't stop him, and he wipes out half of all life.",
  "ant-man-wasp": "Scott and Hope rescue Janet van Dyne from the Quantum Realm while dodging Ghost, a thief who can phase through things. Scott ends up stuck in there.",
  "captain-marvel": "It's 1995 and pilot Carol Danvers gets her memories back, finds out who the real enemy is and becomes one of the most powerful heroes in the universe.",
  "endgame": "Five years after the snap, the Avengers go back in time to borrow the stones and bring everyone back. Tony dies and Steve goes back to the past.",
  "far-from-home": "On a school trip, Peter is still grieving and gets tricked by Mysterio, who then tells the whole world who Spider-Man is.",
  "wandavision": "Wanda builds a fake sitcom world around a whole town so she can live with Vision, and becomes the Scarlet Witch.",
  "falcon-winter-soldier": "Sam Wilson struggles with what the shield means, while John Walker, the Captain America the government picked, falls apart. In the end Sam takes the shield.",
  "loki-1": "The Loki who escaped in 2012 gets arrested by the Time Variance Authority, meets Sylvie, another version of himself, and finds the guy who controls all of time.",
  "black-widow": "Natasha is on the run after Civil War and teams up with her old spy family, Yelena, Red Guardian and Melina, to take down the Red Room.",
  "shang-chi": "Shang-Chi gets pulled back into his dad's world. His dad is the immortal leader of the Ten Rings, and Shang-Chi ends up with the rings himself.",
  "eternals": "Immortal beings who have been guiding humans for thousands of years find out their real job is to let a Celestial be born out of the Earth, and they refuse.",
  "hawkeye": "Clint Barton just wants to get home for Christmas. Instead he picks up a protégée, Kate Bishop, and Yelena comes after him.",
  "no-way-home": "A spell to make everyone forget Peter is Spider-Man goes wrong and pulls in villains and heroes from other universes. In the end the whole world forgets who Peter is.",
  "moon-knight": "Steven Grant works in a gift shop and finds out he shares his body with a mercenary who works for an Egyptian moon god.",
  "multiverse-of-madness": "Strange has to protect America Chavez, who can travel between universes, from a corrupted Wanda. He learns what an incursion is, and that he has caused one.",
  "ms-marvel": "Kamala Khan is a teenager from Jersey City who gets powers from a family bangle and learns where her family came from.",
  "love-and-thunder": "Thor goes up against Gorr the God Butcher with Jane Foster, who's now using Mjolnir. By the end he's raising Gorr's daughter.",
  "she-hulk": "Lawyer Jennifer Walters becomes a Hulk and has to handle a superhuman law practice, her dating life and the fourth wall all at once.",
  "werewolf": "Monster hunters get together for a deadly contest, and one of them is secretly a monster himself.",
  "wakanda-forever": "After T'Challa dies, Wakanda is threatened by Namor and his underwater nation, Talokan. Shuri becomes the new Black Panther.",
  "holiday-special": "Mantis and Drax decide the best Christmas present for Quill is Kevin Bacon. That's the plot.",
  "quantumania": "Scott Lang's family gets pulled into the Quantum Realm, where Kang the Conqueror is stuck and trying to get out.",
  "guardians-3": "The Guardians race to save Rocket's life and go after the guy who made him. After that the team splits up.",
  "secret-invasion": "Nick Fury comes back to Earth to stop a group of shape-shifting Skrulls who have replaced people in power.",
  "loki-2": "Time is falling apart, and Loki tries to save the TVA and every branching timeline. In the end he holds them all together himself.",
  "the-marvels": "Carol Danvers, Monica Rambeau and Kamala Khan get their powers tangled together, and Monica ends up stuck in another universe.",
  "echo": "Maya Lopez goes back home to Oklahoma with the Kingpin's people after her, and reconnects with her Choctaw roots.",
  "x-men": "In another universe, Professor X's mutants take in Wolverine and Rogue and stop Magneto's plan to turn world leaders into mutants.",
  "x2": "The X-Men and Magneto team up against William Stryker, who wants to wipe out every mutant. Jean Grey sacrifices herself.",
  "days-of-future-past": "In a doomed future, Wolverine's mind gets sent back to 1973 to stop an assassination and change history.",
  "deadpool-wolverine": "The TVA wants to erase Deadpool's dying universe, so he grabs a broken Wolverine from another world to help save it.",
  "agatha": "Agatha Harkness has lost her powers, so she gets a coven together and walks the Witches' Road to get them back.",
  "brave-new-world": "Sam Wilson uncovers a plot around President Ross, who turns into the Red Hulk. There's a warning at the end about other worlds.",
  "born-again-1": "Matt Murdock tries to leave Daredevil behind while Wilson Fisk gets elected Mayor of New York, but both of them get pulled back into their old ways.",
  "thunderbolts": "Yelena, Bucky, Red Guardian, Ghost and U.S. Agent get thrown together against the Void, the dark side of a super-powered guy called Bob. By the end they get rebranded as the New Avengers.",
  "ironheart": "Riri Williams, a genius inventor, goes back to Chicago and joins a crew whose leader wears a cloak with a dark source.",
  "first-steps": "On a retro-future Earth in another universe, the Fantastic Four face Galactus, who wants Reed and Sue's unborn son. Doctor Doom shows up in the final scene.",
  "wonder-man": "Simon Williams is a struggling actor going for the lead in a superhero remake, while hiding that he has powers of his own.",
  "born-again-2": "The fight for New York keeps going, with Daredevil and his friends against Mayor Fisk's city.",
  "brand-new-day": "Peter Parker is on his own now, with nobody knowing who he is, and he's Spider-Man full time in New York. It's the last movie before Doomsday.",
  "doomsday": "Not out yet. It's heroes from a bunch of different universes against Doctor Doom.",
};
