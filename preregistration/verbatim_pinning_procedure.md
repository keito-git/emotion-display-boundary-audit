# Verbatim-Pinning Verification Procedure (all 17 components; no sampling)

2026-08-26 — **Rationale**: Both of the two claims checked were wrong (MorphCast's
"93 states have no drawing" / a missed line in the C-05 specification). With an error rate
of 2/2, "the others are probably fine" cannot be asserted.

**This procedure replaces "being careful."** The same pattern (opening the primary source
while failing to register text that contradicts a claim) occurred three times.
The remedy is procedural, not intentional.

---

## 1. Scope

**All 17 components. No sampling.**

## 2. For every claim in every row of the table, all four fields must be filled

| # | Field | Content | If empty |
|---|---|---|---|
| 1 | **Verbatim quotation** | The **exact string** supporting the claim (not a summary — the original text) | **Drop the claim from the table** |
| 2 | **Location** | File path + line number / character offset | Same |
| 3 | **SHA-256 of the frozen file** | Identity of the source | Same |
| 4 | **Refutation search** | **Was text that could falsify the claim searched for? List every search term used.** | **Drop the claim from the table** |

### Field 4 is the core requirement

- **MorphCast**: searching `Top 10` would have found the refuting text.
- **C-05**: searching `not supposed or expected to handle all` would have found it.

**Once a claim is made, actively search for text that kills it.** Logging the search terms
makes it visible when a search was not performed.

### Example refutation search terms by claim type

| Claim type | Terms to search (examples) |
|---|---|
| "Only k of N states are drawn" | `Top`, `top \d+`, `all`, `full`, `complete`, `export`, `CSV`, `download`, `additional`, `also`, `matrix`, `list` |
| "No mapping rule exists" | `default`, `fallback`, `else`, `except`, `not supposed`, `not expected`, `optional`, `may not`, `subset` |
| "Same value drawn multiple times" | `same`, `duplicate`, `both`, `redundan`, `consisten` |
| "Out-of-vocabulary value causes X" | `KeyError`, `try`, `except`, `catch`, `default`, `fallback`, `??`, `\|\|`, `getOrElse` |

**This table is a starting point, not a ceiling.** Each claim requires its own refutation terms.

## 3. Output format

`verbatim_pinning_verification.tsv` (one claim per row):

```
component_id  claim_id  claim_text  verbatim  file_path  line_or_offset  sha256  refutation_queries  refutation_found  verdict
```

- `refutation_found` — if refuting text is found, record its verbatim text.
- `verdict` — `supported` (all four fields filled, no refutation found) /
  `revised` (refutation found; claim was rewritten; record both the original and revised claim) /
  `dropped` (verbatim cannot be written, or refutation is decisive).

## 4. Two-person review

The verification table is prepared by the enumerator; every row is audited by the analyst
who uses the results in the main finding.

## 5. Prohibitions

- Do not leave "probably so" in the table. If the verbatim cannot be written, drop the claim.
- Do not substitute a summary. The exact string from the original text is required.
- Do not skip the refutation search. A row where the search was skipped is `verdict=dropped`.
