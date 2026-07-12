/**
 * Best-effort Bangla → Latin phonetic transliteration, so English phonetic
 * typing (e.g. "alfayar", "churi", "lokkha") can find Bangla product names.
 * This is deliberately NOT a strict linguistic transliteration (it doesn't
 * track the inherent vowel that a bare consonant carries in formal Bangla
 * phonology) — it's tuned to match how Bangla product names get typed out
 * informally in Latin script, which is what search users actually type.
 */

// Nukta letters (ড়/ঢ়/য়) can arrive either as the single precomposed
// codepoint or as base letter + combining nukta (২ codepoints) — Unicode
// does NOT define a canonical decomposition for these, so NFC normalization
// can't reconcile the two forms. Written with explicit escapes since the
// visually-identical glyph can silently save as either form.
const NUKTA = "়"; // ়
const RA_NUKTA = "ড" + NUKTA; // ড়
const RHA_NUKTA = "ঢ" + NUKTA; // ঢ়
const YA_NUKTA = "য" + NUKTA; // য়
const RA_NUKTA_PRECOMPOSED = "ড়"; // ড়
const RHA_NUKTA_PRECOMPOSED = "ঢ়"; // ঢ়
const YA_NUKTA_PRECOMPOSED = "য়"; // য়

// Checked before the generic per-character map — a few conjuncts have
// pronunciations irregular enough that naive concatenation gets them wrong
// (ক্ষ concatenated naively would give "ksh", not the correct "kkh") — and
// the nukta letters above, which need multi-character lookahead when they
// arrive decomposed.
const CONJUNCT_OVERRIDES: Record<string, string> = {
  "ক্ষ": "kkh",
  "জ্ঞ": "gg",
  [RA_NUKTA]: "r",
  [RHA_NUKTA]: "rh",
  [YA_NUKTA]: "y",
};

const CONSONANTS: Record<string, string> = {
  "ক": "k", "খ": "kh", "গ": "g", "ঘ": "gh", "ঙ": "ng",
  "চ": "ch", "ছ": "chh", "জ": "j", "ঝ": "jh", "ঞ": "ny",
  "ট": "t", "ঠ": "th", "ড": "d", "ঢ": "dh", "ণ": "n",
  "ত": "t", "থ": "th", "দ": "d", "ধ": "dh", "ন": "n",
  "প": "p", "ফ": "f", "ব": "b", "ভ": "bh", "ম": "m",
  "য": "j", "র": "r", "ল": "l", "শ": "sh", "ষ": "sh",
  "স": "s", "হ": "h", "ৎ": "t",
  [RA_NUKTA_PRECOMPOSED]: "r",
  [RHA_NUKTA_PRECOMPOSED]: "rh",
  [YA_NUKTA_PRECOMPOSED]: "y",
};

const VOWELS: Record<string, string> = {
  "অ": "o", "আ": "a", "ই": "i", "ঈ": "i", "উ": "u", "ঊ": "u",
  "ঋ": "ri", "এ": "e", "ঐ": "oi", "ও": "o", "ঔ": "ou",
};

const VOWEL_SIGNS: Record<string, string> = {
  "া": "a", "ি": "i", "ী": "i", "ু": "u", "ূ": "u",
  "ৃ": "ri", "ে": "e", "ৈ": "oi", "ো": "o", "ৌ": "ou",
};

const VIRAMA = "্";
const YA_PHALA = "য";

export function toPhoneticKey(text: string): string {
  const chars = Array.from(text);
  let result = "";
  let i = 0;

  outer: while (i < chars.length) {
    for (const [conjunct, phonetic] of Object.entries(CONJUNCT_OVERRIDES)) {
      const conjunctChars = Array.from(conjunct);
      if (chars.slice(i, i + conjunctChars.length).join("") === conjunct) {
        result += phonetic;
        i += conjunctChars.length;
        continue outer;
      }
    }

    const ch = chars[i];
    if (ch === undefined) break;

    if (ch === VIRAMA) {
      // Ya-phala (্য) is a silent glide in casual phonetic spelling; any
      // other virama is just a joiner between consonants with no sound of
      // its own — either way, nothing is added to the output.
      i += chars[i + 1] === YA_PHALA ? 2 : 1;
      continue;
    }
    if (CONSONANTS[ch]) {
      result += CONSONANTS[ch];
      // A word-initial bare consonant (nothing before it, no vowel sign or
      // virama right after) needs its own inherent vowel to be pronounceable
      // at all — e.g. "লক্ষ্যা" starts "lo-", not "l-". Mid-word this doesn't
      // apply: "আলফায়ার" is "al-fayar", not "alo-fayar", since ল there closes
      // the first syllable rather than opening the word.
      const next = chars[i + 1];
      if (i === 0 && next !== VIRAMA && (next === undefined || !VOWEL_SIGNS[next])) {
        result += "o";
      }
    } else if (VOWELS[ch]) {
      result += VOWELS[ch];
    } else if (VOWEL_SIGNS[ch]) {
      result += VOWEL_SIGNS[ch];
    } else if (/[a-z0-9]/i.test(ch)) {
      result += ch.toLowerCase();
    }
    // Anything else (spaces, punctuation, parentheses) is dropped — the key
    // is meant for loose substring matching, not display.
    i += 1;
  }

  return result;
}

function normalizeLatin(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** True if `query` (Bangla text or English phonetic typing) matches
 * `productName` — either as a direct Bangla substring, or against the
 * product name's phonetic transliteration. Empty query always matches. */
export function matchesProductSearch(productName: string, query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed) return true;
  if (productName.toLowerCase().includes(trimmed.toLowerCase())) return true;
  const normalizedQuery = normalizeLatin(trimmed);
  // A query with no Latin letters at all (pure Bangla that didn't match
  // above, or stray punctuation) has nothing meaningful to compare against
  // the phonetic key — without this, an empty normalized query would make
  // `.includes("")` trivially true for every product.
  if (!normalizedQuery) return false;
  return toPhoneticKey(productName).includes(normalizedQuery);
}
