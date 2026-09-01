# EmotionConfusers — Code and Data Package

This package accompanies the paper "EmotionConfusers: An Exhaustive Enumeration of
Confusers in Deployed Emotion Displays" submitted to CHI 2028.

---

## 1. Overview

The package contains:

- **Ledgers** — the classification ledger for all 42 audited components, provenance records,
  and the derivation rules for the `mechanism` column.
- **Preregistration documents** — the enumeration frame, boundary classification criteria,
  and verbatim-pinning verification procedure, all frozen before the corresponding steps
  were executed.
- **Runtime verification harnesses** — scripts that re-execute the draw logic of selected
  components and compare predictions against observed output.
- **Observed outputs** — PNG images and JSONL draw-call logs produced by the harnesses.
- **Scan logs** — the raw enumeration logs that fulfil §3's promise to publish the selection
  criteria for each search face.

No GPU is required. All harnesses run on CPU.
The pre-registered runtime checks require less than 5 minutes total on a standard laptop.

---

## 2. What is NOT included and why

### Frozen third-party source files

The paper (§5.4) states explicitly that frozen source files are not redistributed, because
most cannot be redistributed under their individual licences. Every frozen artefact is
identified by its commit SHA or document snapshot hash in `ledgers/provenance.tsv`.
Use that table to retrieve the exact version of each artefact from its original source.

### h_C-05.py — requires frozen ros4hri package assets

`runtime/harness/h_C-05.py` requires:
- `images/` directory containing the 6 PNG emoji files from the frozen
  `ros4hri/hri_visualization` repository at commit `cad9b32d` (verified by git blob SHA).
- `hri_msgs/Expression.msg` — the frozen message definition file.

To run: obtain both from the pinned commit listed in `ledgers/provenance.tsv` for C-05, then:

```bash
python3 runtime/harness/h_C-05.py <path-to-package-share> runtime/observed/c05 <path-to-hri_Expression.msg>
```

### h_C-04.cjs — requires face-api.js@0.22.2

`runtime/harness/h_C-04.cjs` requires `face-api.js@0.22.2` installed locally:

```bash
mkdir faceapi_env && cd faceapi_env
npm init -y && npm install face-api.js@0.22.2
cd ..
node runtime/harness/h_C-04.cjs faceapi_env
```

### verify_C-04_transpile.cjs — requires frozen TypeScript sources and face-api.js

`runtime/harness/verify_C-04_transpile.cjs` requires:
1. The three frozen TypeScript source files (not redistributed; see `ledgers/provenance.tsv` for C-04).
2. `face-api.js@0.22.2` node_modules (same install as above).
3. `typescript@3.8.3` (named in the package devDependencies; install via npm).

### h_S1-03.tsx — requires React and a TypeScript runner

`runtime/harness/h_S1-03.tsx` requires React and `react-dom`:

```bash
mkdir s103_env && cd s103_env
npm init -y && npm install react react-dom
cp ../runtime/harness/h_S1-03.tsx .
npx tsx h_S1-03.tsx
```

---

## 3. File Inventory

### ledgers/

| File | Paper section |
|------|--------------|
| `components.tsv` | Main classification ledger — 42 components (Table 1, §4) |
| `provenance.tsv` | Source provenance — repository, commit SHA, file path for each component (§3) |
| `mechanism_rules.md` | Rules for deriving the `mechanism` column; encodes the five DEFAULT_SUPPLY cases (§4.2) |

### preregistration/

| File | Paper section |
|------|--------------|
| `enumeration_frame.md` | Pre-registered enumeration frame — search faces, query strings, inclusion/exclusion rules, passage criteria (§3, G1-a) |
| `boundary_criteria.md` | Pre-registered criteria for the three-way boundary classification (CODED / ABSENT / MISLEADING), fixed before the recount (§4.5) |
| `boundary_criteria.sha256.md` | Explanation of why two SHA-256 values exist for `boundary_criteria.md` |
| `verbatim_pinning_procedure.md` | Pre-registered procedure for verbatim-pinning verification — all 17 L1 components, no sampling (§3) |

### runtime/

| File | Paper section |
|------|--------------|
| `criteria.md` | Pre-registered runtime verification criteria — input pairs, match rule, verification levels, predicted failure modes (§4.6) |
| `collation.tsv` | Collation table — static prediction vs. runtime observation for each executed component (§4.6, Table 2) |
| `not_executed.tsv` | Components not run at runtime, with reason codes (§4.6) |

### runtime/harness/

| File | Requires | Runs standalone |
|------|---------|----------------|
| `h_C-02.cpp` + `cv_shim.hpp` | clang++ / g++ (C++17) | Yes |
| `replay_C-02.py` | opencv-python, numpy; the JSONL in `observed/` | Yes |
| `h_C-05.py` | opencv-python, numpy; frozen ros4hri assets (not included) | No — see §2 |
| `h_S1-09.R` | R + dplyr, tidyr, data.table, ggplot2 | Yes |
| `h_S1-26.py` | matplotlib | Yes |
| `h_S1-60.mjs` | Node.js (no external packages) | Yes |
| `h_S1-03.tsx` | Node.js + react + react-dom + tsx runner | See §2 |
| `h_C-04.cjs` | Node.js + face-api.js@0.22.2 | See §2 |
| `verify_C-04_transpile.cjs` | Node.js + face-api.js + typescript@3.8.3 + frozen TS sources | No — see §2 |
| `h_C-02_posthoc.cpp` | Same as `h_C-02.cpp` | Yes |

### runtime/observed/

Pre-computed output files (PNG images and JSONL draw-call logs) from the harnesses.
These allow reviewers to inspect the observed output without re-running the harnesses.

| File(s) | Produced by |
|---------|------------|
| `C-02_*.png` | `replay_C-02.py` applied to `C-02_drawops.jsonl` |
| `C-02_drawops.jsonl` | `h_C-02` (compiled from `h_C-02.cpp`) |
| `C-02_posthoc_drawops.jsonl` | `h_C-02_posthoc` (compiled from `h_C-02_posthoc.cpp`) |
| `c05/C-05_*.png` | `h_C-05.py` |
| `S1-26_*.png` | `h_S1-26.py` |
| `s109/*.png` + `s109/nrc.csv` | `h_S1-09.R` |

### scan_logs/

See `scan_logs/README.md` for details. Briefly:

| File | Content |
|------|---------|
| `candidates_included.tsv` | All 42 included components with metadata |
| `candidates_excluded.tsv` | All examined-and-excluded candidates with reason codes |
| `enumeration_funnel.tsv` | Step-by-step filtering counts per search face |
| `scan_manifest.txt` | SHA-256 manifest of raw API response files captured during the scan |

---

## 4. Reproduction Instructions

### Python harnesses (h_S1-26.py, replay_C-02.py)

```bash
pip install opencv-python matplotlib numpy
```

**h_S1-26.py** (standalone; no external data needed):

```bash
mkdir s126_out
python3 runtime/harness/h_S1-26.py s126_out
# Renders 6 PNG files to s126_out/ and prints comparison results
```

Expected last line: `all pre-registered comparisons as predicted: True`

**h_C-02.cpp → replay_C-02.py** (two-step):

```bash
# Step 1: compile the C++ harness (uses the cv_shim.hpp recording shim)
clang++ -std=c++17 -I runtime/harness runtime/harness/h_C-02.cpp -o h_C-02
./h_C-02 > my_C02_drawops.jsonl 2>stderr.txt

# Step 2: replay through real OpenCV
python3 runtime/harness/replay_C-02.py my_C02_drawops.jsonl
# Writes PNG files alongside the JSONL and prints comparison results
```

The pre-existing `runtime/observed/C-02_drawops.jsonl` can be replayed directly:

```bash
python3 runtime/harness/replay_C-02.py runtime/observed/C-02_drawops.jsonl
```

Expected: `missing key vs measured 0.0: ... => MATCH` and `CONTROL: surprise=0.30: ... => MATCH`

### h_S1-60.mjs (pure Node.js)

```bash
node runtime/harness/h_S1-60.mjs
```

Expected: display updated ~10% of 20,000 trials; `same dominant label: true`

### h_S1-09.R (requires R ≥ 4.0 and dplyr, tidyr, data.table, ggplot2)

```bash
mkdir s109_out
Rscript runtime/harness/h_S1-09.R s109_out
```

The pre-registered pair reports MISMATCH (expected; see `runtime/collation.tsv` and
`runtime/criteria.md` §3 for the explanation). The post-hoc controlled test reports MATCH.

---

## 5. License

License terms are to be determined (pending PI decision).
Contact the authors via the paper's review system.

---

## 6. Hardware and Computation

No GPU is required. All harnesses run on CPU.
The pre-registered runtime checks require less than 5 minutes total on a standard laptop.

## Licence

MIT. See `LICENSE`.

The copyright line reads "The Authors" while the paper is under anonymous review;
it will name the author on publication.

**The audited third-party sources are not in this repository and are not covered by
this licence.** They remain under whatever terms their own projects set. This
repository holds the criteria fixed in advance, the scan logs, the adjudication
ledgers, the provenance of the 42 components, the collation scripts, and the
runtime harnesses, all of which are the authors' own work.
