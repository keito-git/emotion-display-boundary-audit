#!/usr/bin/env python3
"""Replay the draw-call stream emitted by h_C-02 through the real OpenCV.

The geometry in C-02_drawops.jsonl was computed by the ORIGINAL C++ source
(visualizer.cpp :16-51, copied verbatim).  Here each recorded call is issued to
the same OpenCV primitives the demo uses, so the resulting PNG is the overlay a
user would actually see.

Verification level: L-pixel.
"""
import hashlib, json, pathlib, sys
import cv2, numpy as np

obs = pathlib.Path(sys.argv[1])
lines = obs.read_text().splitlines()

cases, cur = {}, None
for ln in lines:
    if ln.startswith("### CASE "):
        cur = ln[len("### CASE "):].strip()
        cases[cur] = []
    elif ln.strip():
        cases[cur].append(json.loads(ln))

print(f"OpenCV {cv2.__version__}")
digests = {}
for name, ops in cases.items():
    img = np.zeros((480, 640, 3), np.uint8)
    img[:] = (40, 40, 40)           # a non-black frame so the overlay is visible
    for op in ops:
        if op["op"] == "addWeighted":
            roi = img[0:140, 0:300]
            sc = np.array([[op["scalar"][0]], [op["scalar"][1]],
                           [op["scalar"][2]], [op["scalar"][3]]], dtype=np.float64)
            img[0:140, 0:300] = cv2.addWeighted(roi, op["alpha"], sc, op["beta"], op["gamma"])
        elif op["op"] == "putText":
            cv2.putText(img, op["text"], tuple(op["org"]), op["font"], op["scale"],
                        tuple(op["color"]), op["thickness"])
        elif op["op"] == "rectangle":
            x, y, w, h = op["rect"]
            cv2.rectangle(img, (x, y, w, h), tuple(op["color"]), op["thickness"])
    crop = img[0:145, 0:305]        # the emotion bar panel only
    p = obs.parent / f"C-02_{name}.png"
    cv2.imwrite(str(p), crop)
    digests[name] = hashlib.sha256(crop.tobytes()).hexdigest()
    print(f"  {name:<22} pixel-sha256={digests[name]}  -> {p.name}")

def cmp(a, b, expect_same, label):
    same = digests[a] == digests[b]
    print(f"  {label}: {'identical' if same else 'different'} "
          f"(predicted {'identical' if expect_same else 'different'}) "
          f"=> {'MATCH' if same == expect_same else 'MISMATCH'}")

print("\n== pre-registered comparisons (pixels) ==")
cmp("A_missing", "B_measured_zero", True,  "missing key vs measured 0.0")
cmp("A_missing", "C_control_different", False, "CONTROL: surprise=0.30")
print("\n== not pre-registered, reported because observed ==")
cmp("A_missing", "D_tiny_0004", True, "missing key vs measured 0.004")
