# Ledgers

## `components.tsv` — the record

**This file is the artefact of record**: 43 lines (one header, 42 components),
13 fields per line, CRLF line endings, exactly as the paper's collation read it.

Two substitutions were applied for anonymisation, and nothing else was touched:

* `judgment_source` named four internal adjudication records after the person who
  wrote them. Those names are replaced by `adjudication_record_1.md` through
  `adjudication_record_4.md` (42 cells).
* Six correction annotations of the form `〔訂正 YYYY-MM-DD NAME: ...〕` are
  reduced to `〔訂正 YYYY-MM-DD: ...〕`. The content of each correction is kept
  verbatim; only the signature is removed.

No adjudication, classification, boundary type, or mechanism value was altered.
Row count, field count, and line endings are unchanged, so re-running the paper's
collation against this file gives the same result.

| Field | Meaning |
|---|---|
| `component_id` | Identifier used throughout the paper (C-*, V-*, S1-*, S2-*, S5-*) |
| `layer` | `L1` = Layer 1 (17 items) / `L2_expansion` = Layer 2 (25 items) |
| `boundary_type` | B1–B4, or a row category that carries no boundary type |
| `boundary_treatment` | How the implementation handles that boundary |
| `state_origin` | Where the displayed state comes from upstream |
| `judgment_call` | Whether the adjudication was contestable, and why |
| `user_facing` | Artefact kind: `oss_component` / `vendor_product` / `repo_artifact` |
| `kindlmann_class` | confuser / jumbler / out-of-scope / outside the framework, etc. |
| `multi_valued_note` | Present when one component occupies more than one cell |
| `judgment_source` | Which adjudication record the row was derived from |
| `exclusion_note` | Why a component was excluded, when it was |
| `class_norm` | Normalised class used by the collation scripts |
| `mechanism` | One of the eight mechanisms reported in Section 4.2 |

### Recurring values

```
B1                subject absence            B2   label coverage
B3                display threshold          B4   input failure
outside-boundary  a non-emotion trigger overwrites the level
surface-dependent confidence is not preserved across display surfaces
missing-value     upstream missing values are replaced; carries no boundary type

MISLEADING / ABSENT / CODED   the three-way classification of Eaton et al.
UNDET                         not determinable from the frozen artefact
REACH-UNDET                   reachability not determinable
```

## `components_en.tsv` — an English view

Produced by `translate_ledger.py` from `components.tsv`. **It is a convenience
view, not the record.**

**Structured codes are translated. Free-text adjudication notes are left in the
original Japanese**, because they are what the adjudicator wrote and translating
them would put a paraphrase where evidence should be. The script prints every
value it passed through untranslated, so a partial translation cannot pass
silently. At the time of writing there are 60 such values.

```
python3 translate_ledger.py
```

The script asserts that the row count and the field count are unchanged and
writes CRLF line endings, so `components.tsv` and `components_en.tsv` can be
compared field by field.

## `provenance.tsv`

Where each of the 42 components came from: `owner/repo` with a commit SHA-256 and
a path for repository artefacts, a URL with the SHA-256 of the retrieved page for
vendor documents. 60 rows, because a component that spans several files occupies
one row per file. This is Appendix E of the paper.

**The frozen sources themselves are not redistributed here.** Section 5.4 of the
paper explains why: for 16 of the 35 repositories and for all 6 vendor documents
we could not establish a licence that permits redistribution. Use the commit
identifiers in this file to retrieve the same material.

## `mechanism_rules.md`

The rule used to assign the `mechanism` field. Written before the field was
populated.
