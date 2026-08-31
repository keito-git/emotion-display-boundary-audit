// Runtime check for S1-60 (BITBCI/neurallens-ai, EmotionMeshTab.tsx, sha256 25ee00a8...)
//
// Static prediction (17_判定_S1群 §1):
//   (a) `if (Math.random() < 0.1 || avgDom !== lastDominantEmotionRef.current)`
//       makes the displayed state a NON-function of the data state: the same
//       input can produce two different displays.
//   (b) `if (key === 'Sad') continue;` removes Sad from the dominant-emotion
//       ballot, so Sad=0.90 and "nothing above threshold" both display 'Neutral'.
//
// Lines 372-393 are copied VERBATIM below.  React's setState calls are replaced
// by recorders, because what is under test is which value reaches the display,
// not React's renderer.
//
// Verification level: L-expr.  This shows the update GATE is stochastic; it does
// not photograph the rendered widget.

// ---- display recorders (stand in for React setState) ----
let display = { emotions: null, vibeValue: null, dominantEmotion: 'Neutral' };
const setEmotions = v => { display.emotions = v; };
const setVibeValue = v => { display.vibeValue = v; };
const setDominantEmotion = v => { display.dominantEmotion = v; };
let lastDominantEmotionRef = { current: 'Neutral' };
let vibeValueRef = { current: 0 };

function tick(totalSmoothed, numFaces, totalMoodTarget) {
  // ================= VERBATIM: frozen EmotionMeshTab.tsx :369-393 =================
  const avgMoodTarget = totalMoodTarget / numFaces;
  vibeValueRef.current = avgMoodTarget;

  const avgSmoothed = { Smile: 0, Laugh: 0, Sad: 0, Angry: 0, Surprised: 0, Fear: 0 };
  let avgDom = 'Neutral';
  let maxScore = 0.15;

  for (const key in totalSmoothed) {
    const val = totalSmoothed[key] / numFaces;
    avgSmoothed[key] = val;
    if (key === 'Sad') continue;
    if (val > maxScore) {
      maxScore = val;
      avgDom = key;
    }
  }

  if (Math.random() < 0.1 || avgDom !== lastDominantEmotionRef.current) {
    setEmotions(avgSmoothed);
    setVibeValue(avgMoodTarget);
    if (avgDom !== lastDominantEmotionRef.current) {
      setDominantEmotion(avgDom);
      lastDominantEmotionRef.current = avgDom;
    }
  }
  // =============================== end verbatim ===============================
  return avgDom;
}

function reset(dom = 'Neutral') {
  display = { emotions: null, vibeValue: null, dominantEmotion: dom };
  lastDominantEmotionRef = { current: dom };
  vibeValueRef = { current: 0 };
}

const j = o => JSON.stringify(o);
console.log(`node ${process.version}`);

// ---- (a) same data state, repeated: does the display stay the same? ----
console.log('\n== (a) identical input applied twice from the same display state ==');
const S = { Smile: 0.50, Laugh: 0.10, Sad: 0.05, Angry: 0.02, Surprised: 0.01, Fear: 0.00 };
// warm the display up so that avgDom === lastDominant (the || right operand is false)
reset('Neutral');
tick(S, 1, 0.7);                       // this flips lastDominant to 'Smile'
console.log('  after warm-up, display =', j(display));

// now feed a SECOND, DIFFERENT data state whose dominant emotion is unchanged
const S2 = { Smile: 0.95, Laugh: 0.10, Sad: 0.05, Angry: 0.02, Surprised: 0.01, Fear: 0.00 };
const outcomes = new Map();
const N = 20000;
for (let i = 0; i < N; i++) {
  reset('Neutral');
  tick(S, 1, 0.7);                     // identical warm-up
  const before = j(display);
  tick(S2, 1, 0.9);                    // identical second input every trial
  const after = j(display);
  const changed = before !== after;
  outcomes.set(changed, (outcomes.get(changed) || 0) + 1);
}
const upd = outcomes.get(true) || 0;
console.log(`  identical (data state, display state) pair applied ${N} times:`);
console.log(`    display UPDATED   : ${upd} (${(100 * upd / N).toFixed(2)} %)`);
console.log(`    display UNCHANGED : ${N - upd} (${(100 * (N - upd) / N).toFixed(2)} %)`);
console.log(`  => the display is a function of the data state: ${upd === 0 || upd === N}`);
console.log(`  (predicted: NOT a function, i.e. both outcomes occur)`);

// ---- (b) Sad excluded from the dominant ballot ----
console.log('\n== (b) Sad = 0.90 vs nothing above threshold ==');
reset('Neutral');
const domSad = tick({ Smile: 0.01, Laugh: 0.00, Sad: 0.90, Angry: 0.00, Surprised: 0.00, Fear: 0.00 }, 1, 0.2);
console.log('  Sad=0.90            -> avgDom =', domSad, '| display.dominantEmotion =', display.dominantEmotion);
reset('Neutral');
const domFlat = tick({ Smile: 0.01, Laugh: 0.00, Sad: 0.00, Angry: 0.00, Surprised: 0.00, Fear: 0.00 }, 1, 0.2);
console.log('  everything <= 0.15  -> avgDom =', domFlat, '| display.dominantEmotion =', display.dominantEmotion);
console.log(`  => same dominant label: ${domSad === domFlat} (predicted: true)`);

// ---- (c) threshold is strict ">" : is 0.15 itself excluded? ----
console.log('\n== (c) not pre-registered, reported because observed: maxScore starts at 0.15 ==');
reset('Neutral');
console.log('  Smile=0.150 ->', tick({ Smile: 0.150, Laugh: 0, Sad: 0, Angry: 0, Surprised: 0, Fear: 0 }, 1, 0.5));
reset('Neutral');
console.log('  Smile=0.151 ->', tick({ Smile: 0.151, Laugh: 0, Sad: 0, Angry: 0, Surprised: 0, Fear: 0 }, 1, 0.5));
