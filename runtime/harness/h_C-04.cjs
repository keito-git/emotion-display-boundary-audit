// Runtime check for C-04 (justadudewhohacks/face-api.js, src/draw/drawFaceExpressions.ts)
//
// Static prediction (16_判定_第1層OSS):
//   `sorted.filter(expr => expr.probability > minConfidence)` with minConfidence
//   = 0.1 drops the whole row for any expression at or below the threshold, so
//   every value in [0, 0.1] produces the same output.  Separately, `round` uses
//   Math.floor, so the printed number is always <= the true value.
//
// This harness runs the PUBLISHED package face-api.js@0.22.2, whose
// build/commonjs/draw/drawFaceExpressions.js is a line-for-line transpilation of
// the frozen TypeScript (checked by eye against the frozen file, see log).
// A recording Canvas/CanvasRenderingContext2D is monkey-patched in, because the
// text drawn on the canvas IS the display and node has no DOM.
//
// Verification level: L-markup (the canvas fillText/fillRect calls are recorded).
const path = process.argv[2];
const faceapi = require(path + '/node_modules/face-api.js');

class FakeCtx {
  constructor(c) { this.canvas = c; this.calls = []; this.font = ''; this.fillStyle = ''; }
  measureText(t) { return { width: t.length * 7 }; }         // fixed metric, same for every case
  fillRect(x, y, w, h) { this.calls.push(['fillRect', x, y, w, h, this.fillStyle]); }
  fillText(t, x, y) { this.calls.push(['fillText', t, x, y, this.fillStyle]); }
}
class FakeCanvas {
  constructor(w, h) { this.width = w; this.height = h; this._ctx = new FakeCtx(this); }
  getContext(k) { return k === '2d' ? this._ctx : null; }
}
faceapi.env.monkeyPatch({
  Canvas: FakeCanvas,
  CanvasRenderingContext2D: FakeCtx,
  Image: class {}, ImageData: class {}, Video: class {},
  createCanvasElement: () => new FakeCanvas(640, 480),
  createImageElement: () => ({}),
  fetch: () => { throw new Error('network disabled in this harness'); },
  readFile: () => { throw new Error('fs disabled in this harness'); },
});

// FACE_EXPRESSION_LABELS order, frozen FaceExpressions.ts:1
const L = ['neutral', 'happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised'];

function run(label, probs) {
  const canvas = new FakeCanvas(640, 480);
  const fe = new faceapi.FaceExpressions(probs);
  faceapi.draw.drawFaceExpressions(canvas, fe);          // default minConfidence = 0.1
  const drawn = canvas._ctx.calls.filter(c => c[0] === 'fillText').map(c => c[1]);
  const sig = JSON.stringify(canvas._ctx.calls);
  console.log(`  ${label.padEnd(30)} lines drawn = ${JSON.stringify(drawn)}`);
  return sig;
}

console.log(`node ${process.version}, face-api.js ${require(path + '/node_modules/face-api.js/package.json').version}`);
console.log('\n== pre-registered pair: sad at 0.05 (below threshold) vs sad at 0.0 ==');
// index order: neutral happy sad angry fearful disgusted surprised
const A = run('A_sad=0.05', [0.90, 0.05, 0.05, 0, 0, 0, 0]);
const B = run('B_sad=0.00', [0.95, 0.05, 0.00, 0, 0, 0, 0]);
// NOTE: happy is held at 0.05 in both so that only `sad` differs among the
// sub-threshold entries; neutral absorbs the remaining mass.
const B2 = run('B2_sad=0.00 neutral=0.90', [0.90, 0.05, 0.00, 0, 0, 0.05, 0]);
const C = run('C_sad=0.099', [0.90, 0.001, 0.099, 0, 0, 0, 0]);
const D = run('D_sad=0.100 (exactly)', [0.90, 0.000, 0.100, 0, 0, 0, 0]);
const E = run('E_sad=0.101 (control)', [0.899, 0.000, 0.101, 0, 0, 0, 0]);

const same = (x, y) => x === y;
console.log('\n== pre-registered comparisons ==');
console.log(`  sad=0.05 vs sad=0.00 -> ${same(A, B) ? 'identical' : 'different'} (predicted identical) => ${same(A, B) ? 'MATCH' : 'MISMATCH'}`);
console.log(`  sad=0.099 vs sad=0.100 -> ${same(C, D) ? 'identical' : 'different'} (predicted identical, both <= threshold)`);
console.log(`  CONTROL sad=0.101 differs from sad=0.099 -> ${!same(C, E) ? 'different' : 'identical'} (predicted different) => ${!same(C, E) ? 'MATCH' : 'MISMATCH'}`);

console.log('\n== round() is Math.floor, not rounding (frozen utils/index.ts:34-37) ==');
for (const p of [0.999, 0.9999, 0.1234, 0.129, 0.101]) {
  console.log(`  round(${p}) = ${faceapi.utils.round(p)}   (Math.round would give ${Math.round(p * 100) / 100})`);
}
