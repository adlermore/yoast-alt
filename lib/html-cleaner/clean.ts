/**
 * HTML cleaner — strips the cruft that CMS editors, Word, and Google Docs leave
 * behind (inline styles, classes, comments, empty tags, spans, namespaced Word
 * elements, event handlers, scripts) and optionally minifies. Pure and
 * deterministic; runs server-side (cheerio).
 */

import "server-only";
import * as cheerio from "cheerio";
import type { CleanOptions, CleanResult, CleanStats } from "@/types";
import { byteLength } from "@/lib/parser/dom";

/** Elements that are legitimately "empty" and must never be pruned. */
const KEEP_EMPTY = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
  "param", "source", "track", "wbr", "td", "th", "iframe", "video", "audio",
  "svg", "picture", "canvas", "textarea", "option",
]);

/** A descendant of one of these means an element isn't really empty. */
const MEDIA_SELECTOR =
  "img, br, hr, input, iframe, video, audio, svg, picture, canvas, embed, object";

export function cleanHtml(html: string, options: CleanOptions): CleanResult {
  const stats: CleanStats = {
    beforeBytes: byteLength(html),
    afterBytes: 0,
    attributesRemoved: 0,
    elementsRemoved: 0,
    commentsRemoved: 0,
    spansUnwrapped: 0,
  };

  const $ = cheerio.load(html, undefined, false);

  // Comments (including MS conditional comments).
  if (options.removeComments) {
    const walk = (node: Parameters<typeof $>[0]) => {
      $(node)
        .contents()
        .each((_, child) => {
          if (child.type === "comment") {
            $(child).remove();
            stats.commentsRemoved += 1;
          } else if (child.type === "tag") {
            walk(child);
          }
        });
    };
    walk($.root());
  }

  // Scripts / styles.
  if (options.removeScripts) {
    const targets = $("script, style, noscript");
    stats.elementsRemoved += targets.length;
    targets.remove();
  }

  // Word / Google Docs cruft: namespaced elements (o:p, w:*, v:*), xmlns/office
  // attributes, and Mso* classes.
  if (options.wordCruft) {
    $("*").each((_, el) => {
      const tag = String($(el).prop("tagName") ?? "");
      if (tag.includes(":")) {
        $(el).remove();
        stats.elementsRemoved += 1;
        return;
      }
      const attribs = $(el).attr();
      if (attribs) {
        for (const name of Object.keys(attribs)) {
          if (/^(xmlns|v:|o:|w:|m:)/i.test(name)) {
            $(el).removeAttr(name);
            stats.attributesRemoved += 1;
          }
        }
      }
    });
    $("[class]").each((_, el) => {
      const cls = $(el).attr("class") ?? "";
      if (/\bMso/i.test(cls)) {
        const kept = cls.split(/\s+/).filter((c) => c && !/^Mso/i.test(c)).join(" ");
        if (kept) $(el).attr("class", kept);
        else $(el).removeAttr("class");
      }
    });
  }

  // Semantic tag conversion.
  if (options.semanticTags) {
    const rename = (from: string, to: string) => {
      let guard = 0;
      while ($(from).length > 0 && guard < 500) {
        guard += 1;
        const el = $(from).first();
        el.replaceWith(`<${to}>${el.html() ?? ""}</${to}>`);
      }
    };
    rename("b", "strong");
    rename("i", "em");
    let guard = 0;
    while ($("font").length > 0 && guard < 500) {
      guard += 1;
      const el = $("font").first();
      el.replaceWith(el.contents());
    }
  }

  // Attribute stripping.
  const removeAttrsMatching = (pred: (name: string) => boolean) => {
    $("*").each((_, el) => {
      const $el = $(el);
      const attribs = $el.attr();
      if (!attribs) return;
      for (const name of Object.keys(attribs)) {
        if (pred(name)) {
          $el.removeAttr(name);
          stats.attributesRemoved += 1;
        }
      }
    });
  };
  if (options.removeStyles) removeAttrsMatching((n) => n === "style");
  if (options.removeClasses) removeAttrsMatching((n) => n === "class");
  if (options.removeIds) removeAttrsMatching((n) => n === "id");
  if (options.removeDataAttrs) removeAttrsMatching((n) => n.toLowerCase().startsWith("data-"));
  if (options.removeEventHandlers) removeAttrsMatching((n) => /^on/i.test(n));

  // Images.
  if (options.removeImages) {
    const targets = $("img, picture, svg");
    stats.elementsRemoved += targets.length;
    targets.remove();
  }

  // Unwrap spans (keep their content).
  if (options.unwrapSpans) {
    let guard = 0;
    while ($("span").length > 0 && guard < 1000) {
      guard += 1;
      const el = $("span").first();
      el.replaceWith(el.contents());
      stats.spansUnwrapped += 1;
    }
  }

  // Prune empty elements, repeatedly (removing one can empty its parent).
  if (options.removeEmpty) {
    let changed = true;
    let passes = 0;
    while (changed && passes < 8) {
      changed = false;
      passes += 1;
      $("*").each((_, el) => {
        const tag = String($(el).prop("tagName") ?? "").toLowerCase();
        if (!tag || KEEP_EMPTY.has(tag)) return;
        const $el = $(el);
        if ($el.text().trim() === "" && $el.find(MEDIA_SELECTOR).length === 0) {
          $el.remove();
          stats.elementsRemoved += 1;
          changed = true;
        }
      });
    }
  }

  let output = ($.html() ?? "").trim();
  if (options.minify) {
    output = output
      .replace(/>\s+</g, "><")
      .replace(/[ \t\r\n]{2,}/g, " ")
      .trim();
  }

  stats.afterBytes = byteLength(output);
  return { html: output, stats };
}
