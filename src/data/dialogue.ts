// What Spruce, the avatar in the Contact section, says. One line per "Next" press, then it loops.

export const DIALOGUE: string[] = [
  "Hey, traveller! You flew all the way to the edge of the map. I'm Spruce, Sprucetrap's guide out here.",
  "Sprucetrap builds where cybersecurity meets full-stack: web apps, databases, ML pipelines and servers written from scratch.",
  'Got an idea, a project or a bug worth hunting together? Open an issue on any public repo on GitHub and the signal reaches us.',
  'Psst. Press ⌘K or / for the command terminal. And if you know a certain old cheat code… try it. Red team mode awaits.',
]

/** Longest line the speech bubble is designed for (keeps it from growing past the avatar on phones). */
export const MAX_LINE = 160
