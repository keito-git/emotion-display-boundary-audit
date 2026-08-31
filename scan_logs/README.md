# scan_logs — Raw Enumeration Scan Logs

This directory fulfils the promise made in §3 of the paper:
"The selection criteria for each layer are published as scan logs."

---

## Files

### `candidates_included.tsv`

All 42 components that passed the inclusion criteria.

Columns: `id`, `name`, `url`, `retrieved_utc`, `version_or_sha`, `face`,
`source_type`, `state_space`, `render_space`, `B_levels`, `cost_glyphs`, `cost_area`,
`cost_symbol_vocab`, `decision`, `reason_code`, `evidence_locus`, `notes`

One row per included component. Corresponds to Table 1 in the paper.

### `candidates_excluded.tsv`

All candidates that were examined and excluded, with the reason code and free-text rationale.

Columns: `id`, `name`, `url`, `retrieved_utc`, `face`, `reason_code`, `judgment_call`,
`reason_free_text`

Exclusion codes are defined in `preregistration/enumeration_frame.md` (§4, Exclusion Rules).
Every exclusion was logged; the count and rate are reported in §3 of the paper.

### `enumeration_funnel.tsv`

Step-by-step funnel showing how the raw search results were filtered down to the audit
candidates at each search face (S1–S5).

Columns: `face`, `stage`, `rule_or_query`, `count`, `ceiling_hit`, `audited`, `note`

Corresponds to §3 in the paper. The correction note at the bottom of the file documents
a recount of the S2 intermediate rows carried out against the frozen artefacts on 2026-08-26.

### `scan_manifest.txt`

SHA-256 manifest of the raw API response files that were captured during the scan.
Lists every file retrieved, its size in bytes, and its hash, so that the content of the
scan can be verified against the frozen copies.

The manifest was generated at the time of the scan. The `frame_sha256` field records the
hash of the enumeration frame (`preregistration/enumeration_frame.md`) at the time the
scan was run — confirming that the frame was fixed before retrieval began.

---

## What is NOT here

The raw API response files themselves (JSON payloads from the GitHub search API, HTML pages
from PyPI/npm, vendor documentation snapshots, and PDF files from S4) are not included in
this distribution. They are large binary/text files whose combined size exceeds the
supplement size limit. Their SHA-256 hashes are listed in `scan_manifest.txt`; the
files can be retrieved from the original sources at the URLs listed in
`candidates_included.tsv` and `candidates_excluded.tsv`.

The frozen source artefacts for each included component (the pinned commit checkouts)
are not redistributed here. Redistribution is not possible for most of them under their
individual licences, and the paper (§5.4) states this explicitly. Every artefact is
identified by its commit SHA in `ledgers/provenance.tsv`.
