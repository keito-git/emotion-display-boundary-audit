# G1-a Enumeration Frame (Pre-registered)

**Created**: before any candidate was enumerated — frozen at that point.
**Rationale**: G1-a requirement (i) — the enumeration frame (search engines, query strings,
retrieval date, population definition) must be pre-registered **before** enumeration begins.

---

## 1. Population Definition

> A component that **displays the result of emotion-state estimation to a human viewer** and
> whose **state-to-drawing mapping is deterministically readable from (a) public source code or
> (b) a vendor's publicly available specification**.

**"Deterministically readable"**: the correspondence from input (distribution, score, or label
of an emotion category) to output (drawn symbol, level, colour, bar length) is uniquely
determined from code or specification text **without requiring human interpretation**.

## 2. Search Faces (all must be executed)

| # | Face | Query strings (used verbatim) |
|---|---|---|
| S1 | GitHub code search | `emotion` + (`chart` OR `bar` OR `emoji` OR `gauge`), `sentiment` + `visualization`, `mood tracker` + `chart`, `affect` + `display` |
| S2 | GitHub repository search | `mood-tracker`, `emotion-recognition demo`, `sentiment-dashboard`, `affective-computing ui` |
| S3 | PyPI / npm | `emotion` + `visuali*`, `sentiment` + `plot`, `mood` + `chart` |
| S4 | Vendor public specifications | Publicly available documentation from providers of emotion-estimation APIs (pages listing display examples, score-display formats, or category lists) |
| S5 | Academic artefacts | Public repositories associated with papers that include emotion displays (implementations, not the papers themselves) |

**Retrieval date must be recorded for every candidate.** Query strings must not be changed
from those listed above. If a change becomes necessary, logs for both the original and
modified query must be retained.

## 3. Inclusion Rules

1. The display subject is an **emotion, affect, valence/arousal, or emotional response**.
2. The display is **intended for end users** (developer-facing log output and debug displays are excluded).
3. The mapping is deterministic in the sense of §1.
4. The component is **publicly accessible** (materials requiring login or a contract are
   excluded and recorded as such).

## 4. Exclusion Rules (all exclusions must be logged)

| Exclusion code | Criterion |
|---|---|
| E1 | Mapping is not readable (screenshots only, or specification is not public) |
| E2 | The construct is not an emotion |
| E3 | Not end-user-facing |
| E4 | Unreachable (broken link, requires contract) |
| E5 | Duplicate (fork or mirror of an already-enumerated implementation) |
| E6 | Other (free-text reason required for every instance) |

Exclusion rule: "when judgment is required, exclude" (§6-3). The exclusion count and reason
for every case must be published. Adoption rate must also be reported.

## 5. Fields Recorded for Each Candidate

Name / URL / retrieval date / **commit SHA or version** / source face (S1–S5) /
(a) source code or (b) vendor public spec / description of the state space /
description of the drawing space / number of levels B (where applicable) /
display cost (glyph count, occupied area, symbol vocabulary size) /
INCLUDE or EXCLUDE + reason code

## 6. Passage Criteria (frozen — not negotiable)

> **(iii) Components based on vendor public specifications ≥ 3 (binding constraint)**
> **(iv) Auditable components, total ≥ 8**

If not met (fewer than 8 total, or fewer than 3 vendor-based): escalate to PI immediately.
Do not silently lower the threshold.

## 7. Reporting Discipline

- Do **not** write "X% of deployed components" anywhere in the body, abstract, or figures
  (§7-3 discipline applied to Study B as well). Report the exhaustive table and counts only.
  Do not attach confidence intervals.
- State explicitly that "8" is an editorial decision, not a statistical threshold (its structure
  requires: ≥ 3 vendor specifications + components on both sides of the granularity band +
  at least one family with multiple implementations — the minimum count that makes the table
  structure hold).

---

**This document was written before any candidate was enumerated.** Any revision after
implementation must be made only with a revision history.
