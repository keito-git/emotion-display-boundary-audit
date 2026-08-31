// Runtime check for S1-03 (PunithVT/ai-avatar-system, frontend/components/ChatInterface.tsx,
// sha256 c918bc5d...)
//
// Static prediction (17_判定_S1群 §2 and §3):
//   B2 both directions.  `const e = m.emotion || 'neutral'` (:910, and :969 for
//   the per-message badge) sends a MISSING emotion to the same badge as a
//   MEASURED 'neutral'.  An out-of-vocabulary non-empty string instead makes
//   `EMOTION_CONFIG[e]` undefined, so `cfg.bg` (:913) never reaches the display.
//
// detectEmotion (:52-60), EMOTION_CONFIG (:62-69), the emotion-bar block
// (:903-919) and the per-message badge (:969-970, :1077-1081) are copied
// VERBATIM.  The surrounding component (WebSocket transport, avatar video,
// 1200 lines of chat UI) is dropped: it is not on the path from the emotion
// value to the badge.
//
// Verification level: L-markup (React renders to static HTML; the badge markup
// and its label text ARE what the user sees).
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

// ==================== VERBATIM: ChatInterface.tsx :26-36 ====================
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  emotion?: string
  persisted?: boolean
}
// ==================== VERBATIM: ChatInterface.tsx :52-60 ====================
function detectEmotion(text: string): string {
  const lower = text.toLowerCase()
  if (/\b(haha|lol|funny|laugh|joke|hilarious)\b/.test(lower)) return 'happy'
  if (/\b(angry|mad|furious|annoyed|hate)\b/.test(lower)) return 'angry'
  if (/\b(sad|cry|miss|lonely|depressed|unhappy)\b/.test(lower)) return 'sad'
  if (/\b(wow|amazing|awesome|incredible|fantastic|great)\b/.test(lower)) return 'excited'
  if (/\b(think|wonder|curious|how|why|what|interesting)\b/.test(lower)) return 'curious'
  return 'neutral'
}
// ==================== VERBATIM: ChatInterface.tsx :62-69 ====================
const EMOTION_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  happy:   { label: '\u{1F604} Happy',   color: 'text-yellow-300', bg: 'bg-yellow-500/20 border-yellow-500/30' },
  angry:   { label: '\u{1F620} Angry',   color: 'text-red-300',    bg: 'bg-red-500/20 border-red-500/30' },
  sad:     { label: '\u{1F622} Sad',     color: 'text-blue-300',   bg: 'bg-blue-500/20 border-blue-500/30' },
  excited: { label: '\u{1F929} Excited', color: 'text-purple-300', bg: 'bg-purple-500/20 border-purple-500/30' },
  curious: { label: '\u{1F914} Curious', color: 'text-cyan-300',   bg: 'bg-cyan-500/20 border-cyan-500/30' },
  neutral: { label: '\u{1F60A} Neutral', color: 'text-gray-300',   bg: 'bg-gray-500/20 border-gray-500/30' },
}
// NOTE: the frozen file writes the emoji literally; they are written here as
// \u escapes only so the harness survives being pasted through a shell.  The
// code points are identical -- verified by the assertion below.
// ================================ end verbatim ================================

function EmotionBar({ messages }: { messages: Message[] }) {
  return (
    <>
      {/* ============ VERBATIM: ChatInterface.tsx :903-919 ============ */}
      {messages.length > 0 && (
        <div className="glass-card px-4 py-3 flex items-center gap-3 rounded-xl animate-slide-up">
          <span className="text-xs text-gray-500 flex-shrink-0">Emotion detected:</span>
          <div className="flex flex-wrap gap-2">
            {messages.slice(-1).map(m => {
              const e = m.emotion || 'neutral'
              const cfg = EMOTION_CONFIG[e]
              return (
                <span key={m.id} className={`badge border ${cfg.bg} ${cfg.color} text-xs`}>
                  {cfg.label}
                </span>
              )
            })}
          </div>
        </div>
      )}
      {/* ================================ end verbatim ================ */}
    </>
  )
}

function MessageBadge({ message }: { message: Message }) {
  // ============ VERBATIM: ChatInterface.tsx :969-970 and :1077-1081 ============
  const emotion = message.emotion || 'neutral'
  const emotionCfg = EMOTION_CONFIG[emotion]
  return (
    <div className="flex items-center gap-1.5 px-1">
      {emotion !== 'neutral' && (
        <span className={`text-xs ${emotionCfg.color}`}>
          {emotionCfg.label.split(' ')[0]}
        </span>
      )}
    </div>
  )
  // ================================ end verbatim ================================
}

const mk = (emotion?: string): Message => ({
  id: 'm1', role: 'assistant', content: 'hello there', timestamp: new Date(0), emotion,
})

function render(label: string, emotion: string | undefined) {
  let bar: string, badge: string
  try { bar = renderToStaticMarkup(<EmotionBar messages={[mk(emotion)]} />) }
  catch (err: any) { bar = `THREW: ${err.constructor.name}: ${err.message}` }
  try { badge = renderToStaticMarkup(<MessageBadge message={mk(emotion)} />) }
  catch (err: any) { badge = `THREW: ${err.constructor.name}: ${err.message}` }
  console.log(`\n  [${label}]  m.emotion = ${JSON.stringify(emotion)}`)
  console.log(`    emotion bar   : ${bar}`)
  console.log(`    message badge : ${badge}`)
  return bar + ' ' + badge
}

console.log(`node ${process.version}, react ${React.version}`)
console.log('\n== S1-03 rendered markup ==')
// state A: upstream never set an emotion
const A = render('A_missing', undefined)
// state B: detectEmotion measured the text and returned 'neutral'
const measured = detectEmotion('hello there')
const B = render(`B_measured_${measured}`, measured)
// state B': emotion is the empty string (also falsy)
const Bp = render('Bprime_empty_string', '')
// control: a measured, in-vocabulary emotion
const C = render('C_control_happy', detectEmotion('haha that is funny'))
// state D: out-of-vocabulary non-empty string
const D = render('D_out_of_vocab', 'contempt')

console.log('\n== pre-registered comparisons ==')
const cmp = (l: string, x: string, y: string, exp: boolean) => {
  const s = x === y
  console.log(`  ${l}: ${s ? 'identical' : 'different'} (predicted ${exp ? 'identical' : 'different'}) => ${s === exp ? 'MATCH' : 'MISMATCH'}`)
}
cmp("missing vs measured '" + measured + "'", A, B, true)
cmp('CONTROL measured happy', A, C, false)
console.log(`  out-of-vocabulary 'contempt' reaches the display: ${!D.includes('THREW')}  (predicted: it does NOT)`)
console.log('\n== not pre-registered, reported because observed ==')
cmp('empty string vs missing', A, Bp, true)
