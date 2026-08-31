#!/usr/bin/env python3
"""Runtime check for S1-26 (SOMESH2014/emotion-detection1, emotion_detection.py).

Static prediction (frozen ledger / 17_判定_S1群):
  B2 MISLEADING -- `detected_emotions.get(emotion, 0)` renders a key that is
  absent from the upstream dict as a bar of height 0, indistinguishable from a
  key measured at 0.0.  The initial screen (`ax.bar(emotion_labels, [0]*7)`, :34)
  is also predicted to coincide with "every emotion missing".

What this harness does:
  Lines 10-19 (`update_chart`) and lines 31-39 (figure setup) of the frozen file
  are re-used VERBATIM.  Only the upstream (webcam + FER model, lines 22-23 and
  48-68) is replaced, because a webcam and the FER weights are not the object
  under test -- the display is.  Everything below the substitution point is the
  original code text.

Verification level: L-pixel (rendered PNG buffers are compared byte-for-byte).
"""
from __future__ import annotations

import hashlib
import pathlib
import sys

import matplotlib
matplotlib.use("Agg")  # headless; the original calls plt.ion() for an on-screen window
import matplotlib.pyplot as plt

OUTDIR = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else pathlib.Path(".")
OUTDIR.mkdir(parents=True, exist_ok=True)

# ---- VERBATIM from frozen S1-26, line 33 -----------------------------------
emotion_labels = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']
# ---------------------------------------------------------------------------


# ---- VERBATIM from frozen S1-26, lines 10-19 -------------------------------
def update_chart(detected_emotions, ax, fig):
    ax.clear()
    ax.bar(emotion_labels, [detected_emotions.get(emotion, 0) for emotion in emotion_labels], color='lightblue')
    plt.ylim(0, 1)
    plt.ylabel('Confidence')
    plt.title('Real-time Emotion Detection')
    ax.set_xticks(range(len(emotion_labels)))
    ax.set_xticklabels(emotion_labels, rotation=45)
    fig.canvas.draw()
    fig.canvas.flush_events()
# ---------------------------------------------------------------------------


def fresh_initial_figure():
    """VERBATIM from frozen S1-26, lines 32 and 34-39 (plt.ion() dropped: Agg backend)."""
    fig, ax = plt.subplots()
    bars = ax.bar(emotion_labels, [0]*7, color='lightblue')
    plt.ylim(0, 1)
    plt.ylabel('Confidence')
    plt.title('Real-time Emotion Detection')
    ax.set_xticks(range(len(emotion_labels)))
    ax.set_xticklabels(emotion_labels, rotation=45)
    fig.canvas.draw()
    return fig, ax


def render(name: str, detected):
    """`detected is None` -> render the initial screen, else run update_chart."""
    fig, ax = fresh_initial_figure()
    if detected is not None:
        update_chart(detected, ax, fig)
    path = OUTDIR / f"S1-26_{name}.png"
    fig.savefig(path, dpi=100)
    plt.close(fig)
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    print(f"  {name:<28} sha256={digest}  -> {path.name}")
    return digest


ALL = emotion_labels

cases = {
    # state A of the pre-registered pair: keys absent from the dict
    "A_all_missing":        {},
    # state B: same keys present and measured at exactly 0.0
    "B_all_measured_zero":  {e: 0.0 for e in ALL},
    # initial screen, line 34
    "C_initial_screen":     None,
    # one measured emotion, the other six absent
    "D_happy09_rest_missing":  {"happy": 0.9},
    # one measured emotion, the other six measured at 0.0
    "E_happy09_rest_zero":     {e: (0.9 if e == "happy" else 0.0) for e in ALL},
    # control: a genuinely different state must NOT collapse
    "F_happy09_sad04_rest_missing": {"happy": 0.9, "sad": 0.4},
}

print("== S1-26 runtime render ==")
print(f"matplotlib {matplotlib.__version__}, backend {matplotlib.get_backend()}, python {sys.version.split()[0]}")
digests = {k: render(k, v) for k, v in cases.items()}

print("\n== pre-registered comparisons ==")
def cmp(label, a, b, expect_same):
    same = digests[a] == digests[b]
    verdict = "MATCH" if same == expect_same else "MISMATCH"
    print(f"  {label}: {a} vs {b} -> {'identical' if same else 'different'} "
          f"(predicted {'identical' if expect_same else 'different'}) => {verdict}")
    return same == expect_same

ok = []
ok.append(cmp("missing vs measured-0", "A_all_missing", "B_all_measured_zero", True))
ok.append(cmp("initial vs all-missing", "C_initial_screen", "A_all_missing", True))
ok.append(cmp("partial missing vs partial 0", "D_happy09_rest_missing", "E_happy09_rest_zero", True))
ok.append(cmp("CONTROL different data", "D_happy09_rest_missing", "F_happy09_sad04_rest_missing", False))
print("\nall pre-registered comparisons as predicted:", all(ok))
