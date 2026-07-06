/**
 * Persisted application settings (data/settings.json — no database).
 *
 * Currently governs which optional analyzers run. The SEO analyzer is always
 * on; the keyword analyzer runs whenever a focus keyword is provided.
 */

export interface AnalyzerToggles {
  readability: boolean;
  technical: boolean;
  schema: boolean;
}

export interface AppSettings {
  analyzers: AnalyzerToggles;
}

export const DEFAULT_SETTINGS: AppSettings = {
  analyzers: {
    readability: true,
    technical: true,
    schema: true,
  },
};
