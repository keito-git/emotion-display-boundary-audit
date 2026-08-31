#!/usr/bin/env python3
"""Runtime check for C-05 (ros4hri/hri_visualization @ cad9b32d, visualization.py).

Static prediction (frozen ledger, class_norm=confuser):
  hri_msgs/Expression.msg declares 25 expression constants.  The overlay resolves
  an emoji by `f"{expression.lower()}.png"` under images/, and only 6 png files
  exist there.  The other 19 constants have no drawing rule and fall into a single
  no-draw class, so C(19,2)=171 pairs are not distinguished.  FURIOUS / ASLEEP /
  EXCITED are among the 19.

What this harness does:
  `load_image` and `get_expression_image` (frozen file :202-226) and the emoji
  compositing block (:593-627) are re-used VERBATIM.  ROS (rclpy / hri /
  cv_bridge / ament_index) is not installed and is not the object under test, so
  the package share directory is replaced by a local copy of the frozen images/
  directory whose 6 png files were verified byte-identical to the frozen git
  tree (git blob sha).  self.get_logger() is replaced by a recorder.

Verification level: L-pixel (each of the 25 expressions is composited onto the
same base frame and the resulting frames are hashed).
"""
from __future__ import annotations
import hashlib, pathlib, re, sys
import cv2, numpy as np

PKG = pathlib.Path(sys.argv[1])          # directory containing images/
OUTDIR = pathlib.Path(sys.argv[2]); OUTDIR.mkdir(parents=True, exist_ok=True)
MSG = pathlib.Path(sys.argv[3])          # frozen hri_Expression.msg

# ---- VERBATIM constants from the frozen file (:40, :51, :61) ----
PASTEL_YELLOW = (174, 239, 238)
BLACK = (0, 0, 0)
FILLED = -1
EMOJI_SIZE_MAGIC_NUMBER = 0.0625
package_path = PKG                        # stands in for get_package_share_directory(...)


class Harness:
    def __init__(self):
        self.expressions = {}             # :173
        self.errors = []

    def get_logger(self):
        outer = self
        class L:
            def error(self, m): outer.errors.append(m)
        return L()

    # ---- VERBATIM: frozen visualization.py :202-214 ----
    def get_expression_image(self, expression):
        """Return the expression-related emoji."""
        if (expression not in self.expressions) or (self.expressions[expression] is None):
            filename = f"{expression.lower()}.png"
            emoji = self.load_image(filename)
            if emoji is not None:
                emoji_size = (int(emoji.shape[1]*EMOJI_SIZE_MAGIC_NUMBER),
                              int(emoji.shape[1]*EMOJI_SIZE_MAGIC_NUMBER))
                emoji = cv2.resize(emoji, emoji_size)
                emoji[:, :, :3] = emoji[:, :, :3] + PASTEL_YELLOW
            self.expressions[expression] = emoji

        return self.expressions[expression]

    # ---- VERBATIM: frozen visualization.py :216-226 ----
    def load_image(self, filename):
        image_path = pathlib.Path(package_path) / 'images' / \
            filename
        try:
            image = cv2.imread(str(image_path), cv2.IMREAD_UNCHANGED)
            if image is None:
                raise FileNotFoundError(f"Image file '{filename}' not found.")
            return image
        except Exception as e:
            self.get_logger().error(f"Error loading image: {e}")
            return None


def base_frame():
    """A fixed 640x480 frame with a face box already drawn, so that only the
    emoji step can differ between the 25 runs."""
    img = np.full((480, 640, 3), 70, np.uint8)
    cv2.rectangle(img, (200, 150), (200 + 180, 150 + 220), (174, 239, 238), 3)
    return img


def composite(h: Harness, raw_expression: str):
    img = base_frame()
    face_x, face_y, face_width, face_height = 200, 150, 180, 220
    drew = False
    # ---- VERBATIM: frozen visualization.py :593-627 (the `if face and (...)` guard
    #      is replaced by the loop over the 25 declared constants) ----
    expression = raw_expression
    if expression:
        expression = str(expression).split('.')[-1].title()
        emoji = h.get_expression_image(expression)

        if emoji is not None:
            drew = True
            emoji_bgr = emoji[:, :, :3]
            emoji_mask = emoji[:, :, 3]

            emoji_x = face_x + face_width + 2
            emoji_y = face_y - emoji.shape[0] - 2

            if emoji_y < 0:
                emoji_y = face_y + face_height + 2

            if emoji_x + emoji.shape[1] > img.shape[1]:
                emoji_x = face_x - emoji.shape[1] - 2

            emoji_x = max(0, emoji_x)
            emoji_y = min(emoji_y, img.shape[0] - emoji.shape[0])

            img = cv2.circle(img, (int(emoji_x + (emoji.shape[1]/2)),
                                   int(emoji_y + (emoji.shape[0]/2))),
                             int(min(emoji.shape[0]/2, emoji.shape[1]/2)) - 1,
                             BLACK, FILLED)

            roi = img[emoji_y:emoji_y + emoji.shape[1],
                      emoji_x:emoji_x + emoji.shape[0]]

            alpha_mask = emoji_mask / 255.0

            roi = alpha_mask[:, :, None] * emoji_bgr \
                + (1 - alpha_mask)[:, :, None] * roi

            img[emoji_y:emoji_y + emoji.shape[1],
                emoji_x:emoji_x + emoji.shape[0]] = roi
    # ---- end verbatim ----
    return img, drew


# constants declared in the frozen hri_msgs/Expression.msg
CONSTS = re.findall(r'^string ([A-Z_]+)="([a-z_]+)"', MSG.read_text(), re.M)
print(f"OpenCV {cv2.__version__}; {len(CONSTS)} expression constants declared in Expression.msg")
assert len(CONSTS) == 25, len(CONSTS)

h = Harness()
rows, groups = [], {}
for name, value in CONSTS:
    img, drew = composite(h, value)
    d = hashlib.sha256(img.tobytes()).hexdigest()
    groups.setdefault(d, []).append(value)
    rows.append((name, value, "drawn" if drew else "NO-DRAW", d[:16]))
    cv2.imwrite(str(OUTDIR / f"C-05_{value}.png"), img)

print(f"\n{'CONSTANT':<14}{'value':<14}{'emoji':<10}pixel-sha256[:16]")
for r in rows:
    print(f"{r[0]:<14}{r[1]:<14}{r[2]:<10}{r[3]}")

print("\n== distinct rendered frames ==")
for d, members in sorted(groups.items(), key=lambda kv: -len(kv[1])):
    print(f"  {d[:16]}  n={len(members):<3} {members}")

big = max(groups.values(), key=len)
n = len(big)
print(f"\nlargest indistinguishable class: n={n}  -> C(n,2) = {n*(n-1)//2} unordered pairs not distinguished")
print(f"distinct classes over the 25 declared constants: {len(groups)}")
for probe in ("furious", "asleep", "excited"):
    print(f"  '{probe}' in the no-draw class: {probe in big}")
print("\nlogger errors recorded (one per failed image load):", len(h.errors))
for m in h.errors[:3]:
    print("   ", m)
