/**
 * Client-safe cleaner config: defaults, presets, and the option metadata the UI
 * renders. No cheerio here so this can be imported into the client component.
 */

import type { CleanOptions } from "@/types";

const OFF: CleanOptions = {
  removeStyles: false,
  removeClasses: false,
  removeIds: false,
  removeDataAttrs: false,
  removeEventHandlers: false,
  removeComments: false,
  removeScripts: false,
  removeEmpty: false,
  unwrapSpans: false,
  removeImages: false,
  semanticTags: false,
  wordCruft: false,
  minify: false,
};

export const DEFAULT_CLEAN_OPTIONS: CleanOptions = {
  ...OFF,
  removeStyles: true,
  removeClasses: true,
  removeDataAttrs: true,
  removeEventHandlers: true,
  removeComments: true,
  removeScripts: true,
  removeEmpty: true,
  semanticTags: true,
  wordCruft: true,
};

export interface CleanPreset {
  id: string;
  label: string;
  options: CleanOptions;
}

export const PRESETS: CleanPreset[] = [
  {
    id: "word",
    label: "Word / Docs paste",
    options: {
      ...OFF,
      removeStyles: true,
      removeClasses: true,
      removeIds: true,
      removeDataAttrs: true,
      removeEventHandlers: true,
      removeComments: true,
      removeScripts: true,
      removeEmpty: true,
      unwrapSpans: true,
      semanticTags: true,
      wordCruft: true,
    },
  },
  {
    id: "basic",
    label: "Basic tidy",
    options: {
      ...OFF,
      removeStyles: true,
      removeClasses: true,
      removeDataAttrs: true,
      removeEventHandlers: true,
      removeComments: true,
      removeScripts: true,
      removeEmpty: true,
    },
  },
  {
    id: "safe",
    label: "Minimal (safe)",
    options: { ...OFF, removeScripts: true, removeComments: true, removeEventHandlers: true },
  },
  {
    id: "strip",
    label: "Strip everything",
    options: {
      ...OFF,
      removeStyles: true,
      removeClasses: true,
      removeIds: true,
      removeDataAttrs: true,
      removeEventHandlers: true,
      removeComments: true,
      removeScripts: true,
      removeEmpty: true,
      unwrapSpans: true,
      removeImages: true,
      semanticTags: true,
      wordCruft: true,
      minify: true,
    },
  },
];

export interface OptionGroup {
  label: string;
  items: { key: keyof CleanOptions; label: string }[];
}

export const OPTION_GROUPS: OptionGroup[] = [
  {
    label: "Attributes",
    items: [
      { key: "removeStyles", label: "Inline styles" },
      { key: "removeClasses", label: "class" },
      { key: "removeIds", label: "id" },
      { key: "removeDataAttrs", label: "data-*" },
      { key: "removeEventHandlers", label: "on* handlers" },
    ],
  },
  {
    label: "Elements",
    items: [
      { key: "removeScripts", label: "<script> / <style>" },
      { key: "removeComments", label: "Comments" },
      { key: "removeEmpty", label: "Empty elements" },
      { key: "unwrapSpans", label: "Unwrap <span>" },
      { key: "removeImages", label: "Images" },
    ],
  },
  {
    label: "Transform",
    items: [
      { key: "semanticTags", label: "b → strong, i → em" },
      { key: "wordCruft", label: "Word / Docs cruft" },
      { key: "minify", label: "Minify output" },
    ],
  },
];
