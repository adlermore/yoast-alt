"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

interface TextFocusValue {
  /** Currently focused sentence index in the text review, or null. */
  activeIndex: number | null;
  /** Bumped on every focus() call so repeated clicks re-trigger scrolling. */
  nonce: number;
  focus: (index: number) => void;
}

const TextFocusContext = createContext<TextFocusValue | null>(null);

/**
 * Coordinates "click a finding → reveal it in the text": check items call
 * `focus(index)`, the annotated text scrolls to and highlights that sentence.
 * Consumers outside a provider (e.g. the saved-report view) get `null` and
 * simply render non-interactive highlights.
 */
export function TextFocusProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ index: number | null; nonce: number }>({
    index: null,
    nonce: 0,
  });

  const focus = useCallback((index: number) => {
    setState((prev) => ({ index, nonce: prev.nonce + 1 }));
  }, []);

  const value = useMemo<TextFocusValue>(
    () => ({ activeIndex: state.index, nonce: state.nonce, focus }),
    [state.index, state.nonce, focus],
  );

  return (
    <TextFocusContext.Provider value={value}>{children}</TextFocusContext.Provider>
  );
}

export function useTextFocus(): TextFocusValue | null {
  return useContext(TextFocusContext);
}
