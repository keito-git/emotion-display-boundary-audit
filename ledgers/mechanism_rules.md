# Rules for the `mechanism` Column (2026-08-28)

**Purpose**: To allow the five DEFAULT_SUPPLY cases that support the paper's central claim to be
mechanically re-derived from the ledger rather than from prose.

**Background**: `boundary_treatment` carries the Eaton three-way label (CODED / ABSENT / MISLEADING).
It does not distinguish *why* a MISLEADING outcome occurs — whether via language-level default supply,
rounding, freeze-window staleness, confidence loss, or threshold. Consequently the ten
"collapse(a)" entries in the paper are a superset of the five DEFAULT_SUPPLY cases.
The `mechanism` column encodes the reason so that those five cases can be isolated mechanically.

**The `mechanism` column is appended to the existing ledger without modifying any existing column.**

---

## 0. Invariants

- Existing columns are not modified. Only `mechanism` is appended.
- Values are derived from the judgment records. They are not assigned by hand.
- After appending, every row must have the same number of columns.

---

## 1. Decision procedure (apply in order; order determines the result)

### P0 (gate): `class_norm == 'confuser'`?

If **false**, `mechanism` is left **empty**. Fourteen components pass this gate.

> P0 is not decorative. Applying P1 alone to all 42 rows over-selects: S1-11, S1-43, S1-56,
> and S2-030 would be picked up even though they are not confusers. S1-11 and S1-43 have no
> reachable path to the default-supply expression; S1-56's default is a boundary-specific mark
> (CODED); S2-030 is classified on the distinction-preserving side.

### P1: Is the collapse caused by default-value supply?

For the 14 components that pass P0, the entry is `DEFAULT_SUPPLY` when the judgment record's
verbatim text matches one of the following frozen syntax patterns:

| # | Syntax | Example |
|---|---|---|
| a | Value-type default construction via subscript | C++ `std::map::operator[]` |
| b | Dictionary access with default as second argument | Python `dict.get(k, 0)` |
| c | Constant assignment to a missing-value indicator | R `is.na(x) <- 0` / `ifelse(is.na(x), 0, x)` |
| d | Falsy / nullish right-hand side | TS/JS `\|\| 'neutral'` / `?? 0` |
| e | **Default assignment explicitly documented in a vendor public document** | "When unmeasurable, displayed in Neutral colour" |

Reason for including (e): the supply mechanism is structurally identical even when the supplier
is a document rather than a language construct — a layer that did not write the drawing supplies
the value, and the semantics are settled there. The paper's separate paragraph for V-02 in §4.2
discloses the difference in origin; it is not a claim that the mechanism differs.

### P2: All other confusers

Components that pass P0 but not P1 receive one of the following values from the judgment record.
New values are not invented.

`ROUNDING` / `THRESHOLD` / `VOCABULARY` / `STALE` / `OVERRIDE` / `CONFIDENCE_DROP` / `ACCUMULATION`

---

## 2. Verification (run after implementation; this is a cross-check, not an acceptance criterion)

1. Filtering on `mechanism == 'DEFAULT_SUPPLY'` must yield **exactly {C-02, S1-26, S1-09, S1-03, V-02}**.
2. If it does not, the claim in the paper body (five cases) must be corrected. The rules must
   not be rewritten to match five. Doing so would make the verification circular.
3. Rows with a non-empty `mechanism` must total 14 (equal to the number of `class_norm == 'confuser'` rows).
4. Existing columns must be byte-identical to the pre-mechanism backup.

### Why the verification is not circular (empirical record, 2026-08-28)

Applying P1 alone to all 42 rows yields eight or more matches
(C-02, S1-03, S1-09, S1-26, plus S1-11, S1-43, S1-56, S2-030).
The conjunction of P0 and P1 is necessary to reach five. The rules have discriminating power.

---

## 3. Primary source

The judgment record for the S1 group contains a table titled
"cluster: encodes missing value as 0 — five cases"
that already lists C-02 / S1-26 / S1-09 / S1-03 / V-02 with verbatim text and language identifiers.
That table predates the `mechanism` column reconstruction. The five cases were not constructed
to match the column; the column transcribes an existing record.

---

## 4. Treatment of C-01 and C-06

**Do not force a single cell assignment.**

C-01 and C-06 each carry both CODED and MISLEADING at the same boundary. Assigning only one of
the two collapse-side entries would contradict the paper's own claim in §5.2 — that the premise
of a unique style assignment per boundary does not hold.

Table 1 permits one component to appear in multiple cells. Its caption states explicitly that
the column totals do not sum to 42. The same accounting rule applies to the language-breakdown
table: C-01 and C-06 should appear in both applicable columns, with a caption note that
column totals exceed the row count.

If single-attribution is kept for the language table, the count of components that carry both
CODED and MISLEADING at a single boundary must be stated in the caption; the single-attribution
must not be presented as if each component belongs to exactly one cell.
