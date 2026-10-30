/**
 * An engine age band → a figure bucket.
 *
 * The boundaries are a judgement, not a fact, and they are recorded here rather
 * than inlined so there is one place to argue with:
 *
 *   teens and below → young     a teenager is not an adult figure (also a stated age under 20)
 *   20s–50s         → adult     the bulk of most casts
 *   60s+            → senior    (also a stated age of 60 or more)
 *
 * `50s` sits on the line and is deliberately `adult`: the senior figure reads
 * distinctly older, and mis-ageing someone upward is the more noticeable error.
 *
 * Anything unrecognised — including empty and "not stated", which is 31 of 34
 * characters in the real data — falls to `adult`, the neutral middle. That is not a claim about
 * the character; `Portrait` pairs it with the `unknown` gender figure, and the
 * pair reads as "no demographics" rather than as a specific person.
 */
export function ageBucket(value: any): "adult" | "young" | "senior";
/**
 * An engine gender value → a figure bucket.
 *
 * `non-binary` arrives hyphenated from the engine and the asset filenames have
 * no hyphen, so separators are stripped before matching. Accepting only the
 * filename spelling sent every non-binary character to the `unknown` figure —
 * a plausible wrong figure rather than a visible failure, which reads as a data
 * gap rather than a mapping bug.
 */
export function genderBucket(value: any): "unknown" | "female" | "male" | "nonbinary";
