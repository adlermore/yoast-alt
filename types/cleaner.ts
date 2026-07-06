/** HTML cleaner contracts. */

export interface CleanOptions {
  removeStyles: boolean;
  removeClasses: boolean;
  removeIds: boolean;
  removeDataAttrs: boolean;
  removeEventHandlers: boolean;
  removeComments: boolean;
  removeScripts: boolean;
  removeEmpty: boolean;
  unwrapSpans: boolean;
  removeImages: boolean;
  semanticTags: boolean;
  wordCruft: boolean;
  minify: boolean;
}

export interface CleanStats {
  beforeBytes: number;
  afterBytes: number;
  attributesRemoved: number;
  elementsRemoved: number;
  commentsRemoved: number;
  spansUnwrapped: number;
}

export interface CleanResult {
  html: string;
  stats: CleanStats;
}
