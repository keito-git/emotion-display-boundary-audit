# Runtime Verification: Pre-registered Criteria (2026-08-28)

**This document was fixed before the harnesses were written. Criteria are not moved after execution.**

The seven components below were selected because their behaviour can be predicted from the frozen
artefact alone and can be executed using the available toolchain
(python3.11 / node24 / clang++ / Rscript 4.3.1).
Vendor products (V-01 through V-06) have no executable artefact and are excluded from the outset.

## 0. Three verification levels (stated per row)

- **L-pixel**: rendered pixels (PNG) were compared.
- **L-markup**: rendered markup or recorded draw-call sequence was compared.
- **L-expr**: the relevant expression or block was extracted verbatim from the frozen artefact and
  executed; values were compared.

**L-expr does not prove that the expression reached the interface.** This limitation is stated
in each applicable row.

## 1. Match / mismatch determination rule (fixed before execution)

For each component, two input states described in the prediction are identified in advance.
Only whether the **outputs of those two states are identical** (at the stated comparison
granularity) is examined.

- **Match (✓)** — the output of two states predicted to "collapse" is **byte-identical** at
  the comparison granularity; OR the output of two states predicted to "not collapse" **differs**.
- **Mismatch (✗)** — the opposite of the above.
- **Partial (△)** — identical on one dimension, different on another. Both dimensions must
  be reported.

## 2. Input pairs fixed in advance (not changed after execution)

| Component | State A (the "collapse partner" per the prediction) | State B | Prediction |
|---|---|---|---|
| C-02 | key absent from `emotions` (missing) | `emotions[k] = 0.0f` (measured at zero) | A = B (zero-width bar) |
| S1-26 | key absent from `detected_emotions` | key present, value 0.0 | A = B (zero-height bar) |
| S1-26b | initial screen on launch (`[0]*7`, :34) | all emotions missing in `update_chart` | A = B |
| S1-03 | `m.emotion` is undefined | `m.emotion === 'neutral'` (result of detectEmotion) | A = B (same badge) |
| S1-03b | `m.emotion` is a non-empty out-of-vocabulary string | — | does not reach the display (throws) |
| S1-09 | word absent from NRC lexicon (0/0 = NaN → 0) | word in lexicon, score 0 on the displayed emotion | A = B (alpha = 0) |
| C-05 | any of the 19 constants with no png file | any other of the same 19 | all 19 are identical (no draw) |
| C-04 | probability = 0.05 (below threshold 0.1) | probability = 0.0 | A = B (row absent) |
| C-04b | probability = 0.099 | probability = 0.0 | A = B |
| S1-60 | same `totalSmoothed`, same `lastDominant`, called twice | — | display may differ (not a function) |
| S1-60b | Sad = 0.90 is the maximum | all emotions at or below threshold | A = B (both display 'Neutral') |

## 3. Predicted failure modes (declared before execution)

The following are recorded as ✗ if observed; they are not concealed.

- C-02: a zero-width rectangle is not drawn; measured-0 and missing differ in pixels.
- S1-26: matplotlib leaves some trace (baseline, etc.) at height 0; missing and measured-0 differ.
- C-05: `cv2.imread` raises an exception on a missing png rather than returning None;
  the 19 produce an abnormal exit, not a silent no-draw.
- C-04: the comparison is `>`; it is unclear whether probability = 0.1 exactly is dropped.
- S1-60: the `Math.random()` branch does not actually change the display (converges to the
  same value downstream).

## 4. What is not done

- Substitute a different input pair when the registered one does not match.
- Attribute a mismatch to "environment issues" without evidence.
- Count a component that could not be executed in the match table (it goes in the
  "not executed" table instead).

---

## Addendum 2026-08-28: Discrepancy between registered and executed pair for C-04b

**The body above is not changed.** Retroactively correcting a pre-fixed document would change
the meaning of past records; this addendum is placed here instead.

A second reviewer noted the following discrepancy:

- The table above (§2) registers the C-04b pair as **`probability = 0.099` vs `0.0`**.
- The harness `h_C-04.cjs` actually compared **`C_sad=0.099` vs `D_sad=0.100`**
  (see the run log in the deviation record).
- **The registered pair `0.099` vs `0.0` was never executed.**

This is distinct from §4 item 1 ("do not substitute a different pair when one does not match").
The present case is not a substitution after a mismatch — it is a case where a different pair
was run without the registered pair having been attempted at all. Both the distinction and the
deviation are recorded in the deviation log (timestamped 2026-08-28).

**There is no effect on the paper body (§4.7), which does not mention C-04b.**
The executed pair (`0.099` vs `0.100`) is in fact stronger: because the comparison is `>`,
it shows that the value 0.1 exactly is also dropped. Even so, a deviation between the
registered and executed pair with no record is incompatible with the stated practice of
"fixing criteria before applying them", and it is therefore recorded.
