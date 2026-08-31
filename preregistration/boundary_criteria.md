# Boundary Classification Criteria (Frozen)

**SHA-256 (at the time the body was finalised):
ca352ecb0f2677ec3caf7233394264a07ac80852a14022f78e967a45ef8b49d8**
2026-08-26 — **fixed before the recount of the frozen artefacts**

## 0. Position of this document

During §2 re-examination, the numbers on both sides of the main result were found not to match
the actual artefacts. The criteria are fixed here before the recount, to avoid repeating the
design-time regression (pre-registration added after the fact).

## 1. Object of judgment

The **pair** (component v, boundary type B). Not the component alone.

- B1 — absence of a subject (no input target)
- B2 — label coverage (the token the upstream emits is outside the display vocabulary)
- B3 — display threshold (the value falls below the display floor)

## 2. Procedure (in order; no step may be skipped)

1. **Path** — Is there a branch in the frozen artefact that decides B? If no verbatim text
   can be pinned, the result is UNDET.
2. **Reachability** — Under the frozen upstream specification, can the boundary side be reached?
   - If the upstream set is not in the frozen artefact: REACH-UNDET; do not proceed.
   - If it can be shown to be unreachable: UNREACHABLE; stop here.
3. **Drawing distinction** — Does the boundary-side drawing differ from that of every non-boundary state?

## 3. Three-way classification of drawing distinction (structurally equivalent to Eaton, Plaisant & Drizd 2005)

- **CODED** — a symbol, word, or axis category appears that marks the boundary.
- **ABSENT** — nothing is drawn, and the **viewer can distinguish this from all non-boundary states**.
- **MISLEADING** — the drawing is identical to that of some regular state.

### 3-1. Mechanical rule for distinguishing ABSENT from MISLEADING

When the drawing call is not made for the boundary side:
- If the previous drawing **persists on screen** (persistent canvas; a `continue` that skips
  the display call appears before the draw call) → **MISLEADING**. The viewer cannot distinguish
  the boundary from the previous state.
- If the screen is redrawn on every frame and only the overlay is missing → **ABSENT**.

This distinction follows from whether the relevant loop places the display call before or after
the boundary branch. It is readable from code. If not readable, the result is UNDET.

## 4. Aggregation

- Distinct treatment **yes** = CODED or ABSENT
- Distinct treatment **no** = MISLEADING
- UNREACHABLE / REACH-UNDET / UNDET — counted separately; not in either total.

## 5. Denominator

The denominator is "the number of components for which judgment was completed for that
boundary type", not 42. Using 42 as the denominator is valid only when all 42 components
have been assigned to one of the four classes for that boundary type. The denominator must be
reported separately for each boundary type.

## 6. Do not judge by token alone

Tokens such as `unknown`, `other`, and `default` are candidates, not judgments. In S5-004 and
S5-005, `unknown` is a TypeScript generic type argument, not an emotion label. Usage must
always be read.
