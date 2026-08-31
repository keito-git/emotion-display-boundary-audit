#!/usr/bin/env python3
"""Produce an English view of components.tsv without altering the record.

components.tsv is the artefact of record: it is byte-identical to the ledger the
paper was collated against, and it is left untouched. This script writes a second
file, components_en.tsv, in which recurring Japanese values are replaced by the
English glossary below. Every row keeps all 13 fields and the CRLF line endings of
the source, so the two files can be diffed field by field.

    python3 translate_ledger.py

Any value not covered by the glossary is passed through unchanged and reported, so
that a silent partial translation is impossible.
"""
import csv, io, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "components.tsv")
OUT = os.path.join(HERE, "components_en.tsv")

# Substring replacements, longest first so that nested terms resolve correctly.
GLOSSARY = [
    ("分類対象外(描画に到達しない)", "out-of-scope (rendering never reached)"),
    ("分類しない(表示全体では潰れない)", "not classified (display as a whole preserves the distinction)"),
    ("UNDET(凍結物から確定できない)", "UNDET (not determinable from the frozen artefact)"),
    ("3-5-b(水準数は確定できない)", "3-5-b (number of levels not determinable)"),
    ("枠組みの外(写像が関数でない)", "outside the framework (mapping is not a function)"),
    ("限定つき記録(主張に使わない)", "recorded with qualification (not used in any claim)"),
    ("6-9-2(区別を守る側)", "6-9-2 (preserves the distinction)"),
    ("confuser(閾値下の帯)", "confuser (sub-threshold band)"),
    ("UNDET(材料なし)", "UNDET (no material)"),
    ("上書き(境界外)", "OVERRIDE (outside the boundary)"),
    ("B2(両方向)", "B2 (both directions)"),
    ("分類対象外", "out-of-scope"),
    ("面依存", "surface-dependent"),
    ("欠測", "missing-value"),
    ("境界外", "outside-boundary"),
]

def main():
    raw = open(SRC, "rb").read()
    text = raw.decode("utf-8")
    rows = list(csv.reader(io.StringIO(text), delimiter="\t"))
    ncol = len(rows[0])
    leftover = set()
    out = []
    for r in rows:
        if len(r) != ncol:
            sys.exit(f"field count differs from the header: {r[:1]} has {len(r)}")
        cells = []
        for c in r:
            for ja, en in GLOSSARY:
                c = c.replace(ja, en)
            if any("぀" <= ch <= "ヿ" or "一" <= ch <= "鿿" for ch in c):
                leftover.add(c)
            cells.append(c)
        out.append("\t".join(cells))
    # The source ends every line with CRLF; reproduce that exactly.
    open(OUT, "wb").write(("\r\n".join(out) + "\r\n").encode("utf-8"))

    chk = list(csv.reader(io.StringIO(open(OUT, encoding="utf-8").read()), delimiter="\t"))
    assert len(chk) == len(rows), "row count changed"
    assert {len(r) for r in chk} == {ncol}, "field count changed"
    print(f"wrote {os.path.basename(OUT)}: {len(chk)} rows x {ncol} fields")
    if leftover:
        print(f"{len(leftover)} value(s) still contain Japanese and were passed through:")
        for v in sorted(leftover):
            print("   ", v[:110])
    else:
        print("no Japanese remains in the output")

if __name__ == "__main__":
    main()
