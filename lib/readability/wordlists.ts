/**
 * Word lists backing the style checks. Deliberately English-only and
 * heuristic — these power *guidance*, not linguistic certainty, matching how
 * mainstream SEO tools flag passive voice and transitions.
 */

/** Common single-word transitions plus the first word of multi-word phrases. */
export const TRANSITION_WORDS: ReadonlySet<string> = new Set([
  "accordingly", "additionally", "afterward", "afterwards", "albeit", "also",
  "although", "altogether", "another", "basically", "because", "before",
  "besides", "briefly", "but", "certainly", "chiefly", "comparatively",
  "consequently", "conversely", "correspondingly", "despite", "doubtedly",
  "during", "earlier", "eventually", "evidently", "explicitly", "finally",
  "first", "firstly", "following", "formerly", "forthwith", "further",
  "furthermore", "generally", "hence", "henceforth", "however", "indeed",
  "instead", "later", "lastly", "likewise", "meanwhile", "moreover",
  "namely", "nevertheless", "nonetheless", "nor", "notwithstanding",
  "obviously", "occasionally", "ordinarily", "otherwise", "overall",
  "particularly", "presently", "previously", "rather", "regardless",
  "second", "secondly", "similarly", "simultaneously", "since", "so",
  "soon", "specifically", "still", "subsequently", "surely", "then",
  "thereafter", "therefore", "thereupon", "third", "thirdly", "though",
  "thus", "till", "too", "ultimately", "undoubtedly", "unless", "unlike",
  "until", "whenever", "whereas", "wherever", "while", "yet",
]);

/** Multi-word transition phrases, matched as substrings of the lower-cased sentence. */
export const TRANSITION_PHRASES: readonly string[] = [
  "above all", "after all", "as a result", "as well as", "at last",
  "at the same time", "by contrast", "even though", "for example",
  "for instance", "for this reason", "in addition", "in conclusion",
  "in contrast", "in fact", "in general", "in other words", "in particular",
  "in short", "in summary", "in the meantime", "on the contrary",
  "on the other hand", "such as", "that is", "to begin with",
  "to conclude", "to summarize",
];

/** Forms of "to be" that can head a passive construction. */
export const BE_FORMS: ReadonlySet<string> = new Set([
  "is", "are", "was", "were", "be", "been", "being", "am", "get", "gets",
  "got", "gotten",
]);

/** Common irregular past participles (regular ones are caught by the -ed rule). */
export const IRREGULAR_PARTICIPLES: ReadonlySet<string> = new Set([
  "arisen", "awoken", "beaten", "become", "begun", "bent", "bitten", "blown",
  "born", "borne", "bought", "broken", "brought", "built", "burnt", "caught",
  "chosen", "come", "cost", "cut", "dealt", "done", "drawn", "driven", "drunk",
  "eaten", "fallen", "felt", "fought", "found", "flown", "forbidden",
  "forgotten", "forgiven", "frozen", "given", "gone", "grown", "hidden",
  "held", "hung", "hurt", "kept", "known", "laid", "led", "left", "lent",
  "let", "lost", "made", "meant", "met", "paid", "put", "read", "ridden",
  "risen", "run", "said", "seen", "sent", "set", "shaken", "shown", "shut",
  "sold", "sought", "spent", "spoken", "spread", "stolen", "struck", "sung",
  "sunk", "sworn", "taken", "taught", "thrown", "told", "torn", "understood",
  "woken", "won", "worn", "written",
]);
