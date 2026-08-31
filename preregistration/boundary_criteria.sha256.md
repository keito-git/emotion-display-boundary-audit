# SHA-256 Note for `boundary_criteria.md`

**The body of the file has not been changed.** This sidecar note exists because writing
the SHA-256 value into the body of the file changes the file's own hash, making the
inline value stale immediately.

## Why two hash values exist

| | Value |
|---|---|
| Value written in line 3 of the body | `ca352ecb0f2677ec3caf7233394264a07ac80852a14022f78e967a45ef8b49d8` |
| **Hash of the file as it exists on disk** | `99e18148eb0d051aed2251975e41a3a93d86ee893c5e30d8c8ed020af6fe9898` |

The body value is the SHA-256 of the content **before** that line was inserted. Writing
the computed value into the file changed the file, so the whole-file hash differs.

## Verification procedure (confirmed empirically, 2026-08-27)

Remove line 3 (the SHA-256 line) and its immediately preceding blank line from the body,
then hash the remainder. The result matches `ca352ecb…`.

```python
import hashlib
lines = open("boundary_criteria.md", encoding="utf-8").read().split("\n")
i = next(k for k, l in enumerate(lines) if "SHA-256 (at the time" in l)
body = lines[:i-1] + lines[i+1:]
print(hashlib.sha256("\n".join(body).encode()).hexdigest())
# -> ca352ecb0f2677ec3caf7233394264a07ac80852a14022f78e967a45ef8b49d8
```

Removing only the SHA line (without the blank line) does not match (`d2dd4b78…`), because
one blank line was also inserted at write time.

**The content of the criteria is therefore unchanged before and after the insertion.**
Only the two inserted lines differ.

## Difference from the other two pre-registered documents

`enumeration_frame.md` and `verbatim_pinning_procedure.md` do not have a SHA written into
their bodies, so their stated and on-disk values agree. Only `boundary_criteria.md` was
left in the older form.

**Going forward, the SHA of any document being frozen must be placed in a sidecar file,
not in the body. Writing a hash into the body invalidates it upon writing.**
