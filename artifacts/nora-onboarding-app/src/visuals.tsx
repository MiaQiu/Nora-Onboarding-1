import type { ReactNode } from 'react';

const S = { fill: 'none', stroke: '#5d438f', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

function Frame({ children, tone = '#f1ecf8' }: { children: ReactNode; tone?: string }) {
  return (
    <svg viewBox="0 0 40 40" className="nora-choice-visual" aria-hidden="true" focusable="false">
      <rect x="1" y="1" width="38" height="38" rx="11" fill={tone} />
      {children}
    </svg>
  );
}

export type Mood = 'calm' | 'okay' | 'unsure' | 'tense' | 'upset' | 'overwhelmed';

const mouths: Record<Mood, string> = {
  calm: 'M14 23 q6 6 12 0',
  okay: 'M15 24 q5 3 10 0',
  unsure: 'M15 25 q3 -2 5 0 t5 0',
  tense: 'M15 25 h10',
  upset: 'M15 27 q5 -5 10 0',
  overwhelmed: 'M16 28 q4 -6 8 0 z',
};
const tones: Record<Mood, string> = {
  calm: '#e3f4ec', okay: '#eef3e2', unsure: '#f1ecf8', tense: '#f7efe0', upset: '#f8e6e4', overwhelmed: '#f3dfe6',
};

export function EmotionFace({ mood }: { mood: Mood }) {
  const brows = mood === 'upset' || mood === 'overwhelmed' ? <><path d="M12 14 l5 2" {...S} /><path d="M28 14 l-5 2" {...S} /></> : mood === 'unsure' ? <path d="M23 14 l5 -1" {...S} /> : null;
  return (
    <Frame tone={tones[mood]}>
      <circle cx="20" cy="20" r="12" {...S} fill="#fffefd" />
      {brows}
      {mood === 'calm' ? <><path d="M14.5 18 q1.5 -2 3 0" {...S} /><path d="M22.5 18 q1.5 -2 3 0" {...S} /></> : <><circle cx="16" cy="18.5" r="1.3" fill="#5d438f" /><circle cx="24" cy="18.5" r="1.3" fill="#5d438f" /></>}
      <path d={mouths[mood]} {...S} />
      {mood === 'overwhelmed' && <path d="M30 9 q2 3 0 5" {...S} stroke="#8fa9d8" />}
    </Frame>
  );
}

const icons: Record<string, ReactNode> = {
  girl: <Frame tone="#f8e9ef"><circle cx="20" cy="21" r="8" {...S} fill="#fffefd" /><circle cx="10.5" cy="17" r="3" {...S} /><circle cx="29.5" cy="17" r="3" {...S} /><path d="M13 18 q7 -7 14 0" {...S} /><path d="M17 24 q3 2 6 0" {...S} /></Frame>,
  boy: <Frame tone="#e5eff8"><circle cx="20" cy="21" r="8" {...S} fill="#fffefd" /><path d="M12 19 q2 -8 9 -7 q6 1 7 6 l-4 -2 l-3 2 l-3 -2z" {...S} fill="#d8cdea" /><path d="M17 24 q3 2 6 0" {...S} /></Frame>,
  'prefer-not': <Frame><circle cx="20" cy="20" r="9" {...S} fill="#fffefd" /><path d="M14 20 h12" {...S} /><circle cx="20" cy="15.5" r="1" fill="#5d438f" /><circle cx="20" cy="24.5" r="1" fill="#5d438f" /></Frame>,
  screen: <Frame tone="#e9e4f6"><rect x="11" y="9" width="18" height="22" rx="3" {...S} fill="#fffefd" /><path d="M18 17 l5 3 -5 3z" {...S} fill="#c9bbe6" /><path d="M8 10 l-2 -2 M32 10 l2 -2" {...S} /></Frame>,
  frustrated: <Frame tone="#f7efe0"><path d="M12 24 a5 5 0 0 1 2 -9 a7 7 0 0 1 13 1 a4 4 0 0 1 1 8z" {...S} fill="#fffefd" /><path d="M20 26 l-2 5 h4 l-2 4" {...S} stroke="#c58a3a" /></Frame>,
  listen: <Frame tone="#e3f4ec"><path d="M10 10 h16 a3 3 0 0 1 3 3 v8 a3 3 0 0 1 -3 3 h-8 l-5 4 v-4 h-3 a3 3 0 0 1 -3 -3 v-8 a3 3 0 0 1 3 -3z" {...S} fill="#fffefd" /><path d="M12 15 h12 M12 19 h8" {...S} /><path d="M26 28 q3 -2 6 0 M27 32 h5" {...S} stroke="#9d88c6" /></Frame>,
  focus: <Frame tone="#e5eff8"><circle cx="20" cy="20" r="9" {...S} fill="#fffefd" /><circle cx="20" cy="20" r="3.5" {...S} /><circle cx="9" cy="10" r="1.5" fill="#8fa9d8" /><circle cx="32" cy="12" r="1.5" fill="#8fa9d8" /><circle cx="31" cy="31" r="1.5" fill="#8fa9d8" /></Frame>,
};

const moodFor: Record<string, Mood> = {
  smoothly: 'calm', improvement: 'okay', sometimes: 'unsure', change: 'tense', harder: 'upset',
  manageable: 'okay', somewhat: 'tense', very: 'upset', overwhelming: 'overwhelmed',
};

/** Returns a decorative visual for a choice value in a given group, or undefined. */
export function choiceVisual(group: string, value: string): ReactNode | undefined {
  if (group === 'gender' || group === 'challenge') return icons[value];
  if (group === 'worked' || group === 'stress' || group === 'f-worked') {
    const mood = moodFor[value];
    return mood ? <EmotionFace mood={mood} /> : undefined;
  }
  return undefined;
}

export function AgreementPrompt() {
  return <p className="nora-agree-prompt" data-testid="text-agree-prompt">Do you agree with the following statement?</p>;
}

type Scene = 'practice' | 'transition' | 'play';

export function InsightIllustration({ scene }: { scene: Scene }) {
  return (
    <svg viewBox="0 0 320 120" className="nora-illustration" aria-hidden="true" focusable="false" data-testid={`img-illustration-${scene}`}>
      <rect width="320" height="120" rx="16" fill="#f4f0f8" />
      {scene === 'practice' && (
        <g {...S}>
          <circle cx="110" cy="44" r="14" fill="#fffefd" /><path d="M88 104 q22 -44 44 0" fill="#d8cdea" />
          <circle cx="196" cy="62" r="10" fill="#fffefd" /><path d="M180 104 q16 -32 32 0" fill="#c4e8d8" />
          <path d="M134 74 q24 -14 46 -2" strokeDasharray="4 5" />
          <path d="M150 28 l4 -8 4 8 M246 40 h22 M246 52 h14" stroke="#9d88c6" />
        </g>
      )}
      {scene === 'transition' && (
        <g {...S}>
          <rect x="42" y="34" width="44" height="58" rx="7" fill="#fffefd" /><path d="M58 56 l12 7 -12 7z" fill="#d8cdea" />
          <path d="M100 63 h40" strokeDasharray="4 5" /><circle cx="160" cy="63" r="18" fill="#fffefd" /><path d="M160 52 v11 l7 5" />
          <path d="M184 63 h40" strokeDasharray="4 5" /><path d="M244 88 h40 l-6 -30 h-28z" fill="#c4e8d8" /><path d="M256 58 v-12 h16 v12" />
        </g>
      )}
      {scene === 'play' && (
        <g {...S}>
          <rect x="70" y="80" width="28" height="18" rx="3" fill="#d8cdea" /><rect x="74" y="62" width="22" height="18" rx="3" fill="#c4e8d8" /><rect x="78" y="44" width="16" height="18" rx="3" fill="#f7efe0" />
          <rect x="128" y="86" width="20" height="12" rx="3" fill="#f7efe0" transform="rotate(14 138 92)" />
          <circle cx="210" cy="50" r="13" fill="#fffefd" /><path d="M190 100 q20 -40 40 0" fill="#d8cdea" />
          <path d="M184 66 q-30 -6 -64 6" strokeDasharray="4 5" /><path d="M250 34 q8 6 0 12" stroke="#9d88c6" />
        </g>
      )}
    </svg>
  );
}
