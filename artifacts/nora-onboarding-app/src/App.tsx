import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronRight } from 'lucide-react';

type Choice = { value: string; label: string };
type Step =
  | 'welcome'
  | 'adult-name'
  | 'relationship'
  | 'child-name'
  | 'birthday'
  | 'gender'
  | 'challenge'
  | 'intro'
  | 'hardest'
  | 'stops'
  | 'recover'
  | 'context'
  | 'strategies'
  | 'worked'
  | 'stress'
  | 'goal'
  | 'why'
  | 'skills'
  | 'cortex'
  | 'cortex-help'
  | 'practice'
  | 'play'
  | 'nora'
  | 'plan';

type Profile = {
  adultName: string;
  relationship: string;
  childName: string;
  birthday: string;
  gender: string;
  challenge: string;
};

type Answers = {
  hardest: string;
  stops: string[];
  recover: string;
  strategies: string[];
  worked: string;
  stress: string;
  goal: string;
  cortex: string;
};

const genderChoices: Choice[] = [
  { value: 'girl', label: 'Girl' },
  { value: 'boy', label: 'Boy' },
  { value: 'prefer-not', label: 'Prefer not to say' },
];

const relationshipChoices: Choice[] = [
  { value: 'parent', label: 'Parent' },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'family', label: 'Family member' },
  { value: 'caregiver', label: 'Caregiver' },
];

const challengeChoices: Choice[] = [
  { value: 'screen', label: 'Screen-time tantrums' },
  { value: 'frustrated', label: 'Gets frustrated very easily' },
  { value: 'listen', label: "Doesn't listen" },
  { value: 'focus', label: 'Has trouble focusing' },
];

const hardestChoices: Choice[] = [
  { value: 'stop', label: 'Getting Ethan to stop' },
  { value: 'more', label: 'He keeps asking for more' },
  { value: 'upset', label: 'He gets very upset when it ends' },
  { value: 'after', label: "He won't do anything else afterward" },
  { value: 'argue', label: 'I end up arguing or yelling' },
];

const stopChoices: Choice[] = [
  { value: 'asks', label: 'He asks for more' },
  { value: 'ignores', label: 'He ignores me and keeps watching' },
  { value: 'whines', label: 'He whines or cries' },
  { value: 'meltdown', label: 'He screams or has a meltdown' },
  { value: 'hits', label: 'He hits, kicks or throws things' },
];

const recoverChoices: Choice[] = [
  { value: 'under-2', label: 'Less than 2 minutes' },
  { value: '2-5', label: '2–5 minutes' },
  { value: '5-15', label: '5–15 minutes' },
  { value: 'over-15', label: 'More than 15 minutes' },
];

const strategyChoices: Choice[] = [
  { value: 'warning', label: 'Giving a warning before time is up' },
  { value: 'timer', label: 'Using a timer' },
  { value: 'rules', label: 'Setting screen-time rules in advance' },
  { value: 'activity', label: 'Offering another activity' },
  { value: 'explaining', label: 'Explaining why it’s time to stop' },
  { value: 'extra', label: 'Giving a little extra time' },
  { value: 'away', label: 'Taking the device away' },
  { value: 'figuring', label: 'I’m still figuring out what to try' },
];

const workedChoices: Choice[] = [
  { value: 'smoothly', label: 'Screen time usually ends smoothly' },
  { value: 'improvement', label: 'Some improvement' },
  { value: 'sometimes', label: 'Helps only sometimes' },
  { value: 'change', label: 'No real change' },
  { value: 'harder', label: 'It’s getting harder' },
];

const stressChoices: Choice[] = [
  { value: 'manageable', label: 'Manageable' },
  { value: 'somewhat', label: 'Somewhat stressful' },
  { value: 'very', label: 'Very stressful' },
  { value: 'overwhelming', label: 'Overwhelming' },
];

const goalChoices: Choice[] = [
  { value: 'meltdowns', label: 'Fewer meltdowns' },
  { value: 'recovery', label: 'Faster recovery' },
  { value: 'yelling', label: 'Less yelling' },
  { value: 'transitions', label: 'Easier transitions' },
  { value: 'confidence', label: 'More confidence holding the limit' },
];

function NoraArt({ small = false }: { small?: boolean }) {
  return (
    <div className={`nora-art ${small ? 'nora-art-small' : ''}`}>
      <img src="/assets/nora-character.png" alt="Nora the purple dragon" data-testid="img-nora-character" />
    </div>
  );
}

function ChoiceButton({
  choice,
  selected,
  multi,
  onSelect,
  testId,
}: {
  choice: Choice;
  selected: boolean;
  multi?: boolean;
  onSelect: () => void;
  testId: string;
}) {
  return (
    <button
      type="button"
      className={`nora-option ${selected ? 'is-selected' : ''}`}
      onClick={onSelect}
      aria-pressed={selected}
      data-testid={testId}
    >
      <span className={`nora-option-mark ${multi ? 'is-check' : ''}`}>
        {selected && <Check size={14} strokeWidth={3} />}
      </span>
      <span className="nora-option-text">{choice.label}</span>
      <ChevronRight size={17} className="nora-option-arrow" aria-hidden="true" />
    </button>
  );
}

function App() {
  const [started, setStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [invalid, setInvalid] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    adultName: '',
    relationship: '',
    childName: '',
    birthday: '',
    gender: '',
    challenge: '',
  });
  const [answers, setAnswers] = useState<Answers>({
    hardest: '',
    stops: [],
    recover: '',
    strategies: [],
    worked: '',
    stress: '',
    goal: '',
    cortex: '',
  });

  const childName = profile.childName.trim() || 'Ethan';
  const replaceEthan = (label: string) => label.replaceAll('Ethan', childName);
  const strategiesHaveWorkedQuestion = answers.strategies.some((value) => value !== 'figuring');

  const flow = useMemo<Step[]>(
    () => [
      'welcome',
      'adult-name',
      'relationship',
      'child-name',
      'birthday',
      'gender',
      'challenge',
      ...(profile.challenge === 'screen'
        ? ([
            'intro',
            'hardest',
            'stops',
            'recover',
            'context',
            'strategies',
            ...(strategiesHaveWorkedQuestion ? ['worked' as Step] : []),
            'stress',
            'goal',
            'why',
            'skills',
            'cortex',
            'cortex-help',
            'practice',
            'play',
            'nora',
            'plan',
          ] as Step[])
        : []),
    ],
    [profile.challenge, strategiesHaveWorkedQuestion],
  );

  const current = flow[stepIndex] ?? 'welcome';
  const progress = started ? Math.round((stepIndex / Math.max(flow.length - 1, 1)) * 100) : 0;

  const updateProfile = (key: keyof Profile, value: string) => {
    setProfile((previous) => ({ ...previous, [key]: value }));
    setInvalid(false);
  };

  const choose = (key: keyof Answers | 'relationship' | 'challenge' | 'gender', value: string) => {
    if (key in profile) {
      setProfile((previous) => ({ ...previous, [key]: value }));
    } else {
      setAnswers((previous) => ({ ...previous, [key]: value }));
    }
    setInvalid(false);
  };

  const toggle = (key: 'stops' | 'strategies', value: string) => {
    setAnswers((previous) => {
      const existing = previous[key];
      const next = existing.includes(value)
        ? existing.filter((item) => item !== value)
        : [...existing, value];
      return { ...previous, [key]: next };
    });
    setInvalid(false);
  };

  const hasAnswer = () => {
    if (current === 'adult-name') return profile.adultName.trim().length > 0;
    if (current === 'relationship') return Boolean(profile.relationship);
    if (current === 'child-name') return profile.childName.trim().length > 0;
    if (current === 'birthday') return Boolean(profile.birthday);
    if (current === 'gender') return Boolean(profile.gender);
    if (current === 'challenge') return profile.challenge === 'screen';
    if (current === 'hardest' || current === 'recover' || current === 'worked' || current === 'stress' || current === 'goal' || current === 'cortex') {
      return Boolean(answers[current]);
    }
    if (current === 'stops' || current === 'strategies') return answers[current].length > 0;
    return true;
  };

  const next = () => {
    if (!hasAnswer()) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setStepIndex((value) => Math.min(flow.length - 1, value + 1));
  };

  const back = () => {
    setInvalid(false);
    setStepIndex((value) => Math.max(0, value - 1));
  };

  const optionList = (key: keyof Answers | 'relationship' | 'challenge' | 'gender', choices: Choice[], multi = false) => (
    <div className="nora-options" data-testid={`options-${key}`}>
      {choices.map((choice) => {
        const selected = multi
          ? (answers[key as 'stops' | 'strategies'] as string[]).includes(choice.value)
          : profile[key as keyof Profile] === choice.value || answers[key as keyof Answers] === choice.value;
        return (
          <ChoiceButton
            key={choice.value}
            choice={{ ...choice, label: replaceEthan(choice.label) }}
            selected={selected}
            multi={multi}
            onSelect={() => (multi ? toggle(key as 'stops' | 'strategies', choice.value) : choose(key, choice.value))}
            testId={`choice-${key}-${choice.value}`}
          />
        );
      })}
    </div>
  );

  const screen = () => {
    switch (current) {
      case 'welcome':
        return (
          <div className="nora-complete nora-welcome">
            <NoraArt />
            <h1 className="nora-title" data-testid="text-step-title">Personalized Parenting Practice for Real Life</h1>
            <p className="nora-subtitle nora-welcome-copy" data-testid="text-welcome-description">
              Nora turns five minutes of play into personalized practice—helping your child build focus, handle frustration and learn to cooperate, while helping you respond with confidence in everyday moments.
            </p>
            <div className="nora-actions">
              <button type="button" className="nora-button nora-button-wide" onClick={() => { setStarted(true); setStepIndex(1); }} data-testid="button-start">
                Let's start <ArrowRight size={18} />
              </button>
            </div>
          </main>
        );
      case 'adult-name':
        return (
          <>
            <h1 className="nora-title" data-testid="text-step-title">What’s your name?</h1>
            <div className="nora-panel">
              <input id="adult-name" className={`nora-field ${invalid ? 'is-invalid' : ''}`} value={profile.adultName} onChange={(event) => updateProfile('adultName', event.target.value)} aria-label="What’s your name?" data-testid="input-adult-name" autoComplete="name" />
            </div>
          </>
        );
      case 'relationship':
        return (
          <>
            <h1 className="nora-title" data-testid="text-step-title">What’s your relationship with the child?</h1>
            {optionList('relationship', relationshipChoices)}
          </>
        );
      case 'child-name':
        return (
          <>
            <h1 className="nora-title" data-testid="text-step-title">What’s your child’s name?</h1>
            <div className="nora-panel">
              <input id="child-name" className={`nora-field ${invalid ? 'is-invalid' : ''}`} value={profile.childName} onChange={(event) => updateProfile('childName', event.target.value)} aria-label="What’s your child’s name?" data-testid="input-child-name" autoComplete="off" />
            </div>
          </>
        );
      case 'birthday':
        return (
          <>
            <h1 className="nora-title" data-testid="text-step-title">Birthday</h1>
            <div className="nora-panel">
              <input type="date" className={`nora-field ${invalid ? 'is-invalid' : ''}`} value={profile.birthday} onChange={(event) => updateProfile('birthday', event.target.value)} aria-label="Birthday" data-testid="input-birthday" />
            </div>
          </>
        );
      case 'gender':
        return <><h1 className="nora-title" data-testid="text-step-title">Gender</h1>{optionList('gender', genderChoices)}</>;
      case 'challenge':
        return <><h1 className="nora-title" data-testid="text-step-title">What feels hardest right now?</h1>{optionList('challenge', challengeChoices)}</>;
      case 'intro':
        return (
          <>
            <NoraArt small />
            <p className="nora-kicker">Screentime Tantrum</p>
            <h1 className="nora-title" data-testid="text-step-title">Let's make screen-time endings easier.</h1>
            <p className="nora-subtitle">A few questions will help Nora understand what happens when screen time ends for {childName}—and what skills may make those moments easier.</p>
            <p className="nora-kicker" style={{ marginTop: 26 }}>About 2 minutes</p>
          </>
        );
      case 'hardest':
        return <><h1 className="nora-title" data-testid="text-step-title">What's hardest about screen time right now?</h1>{optionList('hardest', hardestChoices)}</>;
      case 'stops':
        return <><h1 className="nora-title" data-testid="text-step-title">When it's time to stop, what usually happens (Can select multiple)?</h1>{optionList('stops', stopChoices, true)}</>;
      case 'recover':
        return <><h1 className="nora-title" data-testid="text-step-title">How long does {childName} usually need to recover?</h1>{optionList('recover', recoverChoices)}</>;
      case 'context':
        return (
          <>
            <h1 className="nora-title" data-testid="text-step-title">Meltdowns when screens end are one of the most common struggles parents face, and they're genuinely hard on everyone.</h1>
            <p className="nora-copy">Here's what's happening: screens are incredibly stimulating—they deliver constant novelty and excitement in a way that few other activities can match. This makes stopping genuinely hard for many kids.</p>
            <p className="nora-copy">When the stimulation suddenly stops, their nervous system has to shift gears quickly, and that shift can feel really uncomfortable.</p>
          </>
        );
      case 'strategies':
        return <><h1 className="nora-title" data-testid="text-step-title">What have you already tried to make screen time easier to end? (Select all that apply.)</h1>{optionList('strategies', strategyChoices, true)}</>;
      case 'worked':
        return <><h1 className="nora-title" data-testid="text-step-title">How well have those approaches worked?</h1>{optionList('worked', workedChoices)}</>;
      case 'stress':
        return <><h1 className="nora-title" data-testid="text-step-title">How hard are screen-time endings on you?</h1>{optionList('stress', stressChoices)}</>;
      case 'goal':
        return <><h1 className="nora-title" data-testid="text-step-title">What would you most like to change?</h1>{optionList('goal', goalChoices)}</>;
      case 'why':
        return (
          <>
            <h1 className="nora-title" data-testid="text-step-title">Why hasn’t it worked so far?</h1>
            <p className="nora-copy">Most screen-time strategies focus on getting {childName} to put the device down. But that’s only the surface. Underneath,At that moment, {childName} has to switch attention, cope with disappointment, and move on. Those skills are still growing.</p>
          </>
        );
      case 'skills':
        return (
          <>
            <h1 className="nora-title" data-testid="text-step-title">Switch. Cope. Move on.</h1>
            <p className="nora-copy">When a screen turns off, {childName} is doing three hard things at once: Switch away from something exciting. Cope with wanting more. Move on to what comes next. A meltdown can mean that this moment is harder than {childName} can handle right now.</p>
          </>
        );
      case 'cortex':
        return <><h1 className="nora-title" data-testid="text-step-title">Have you heard of the prefrontal cortex?</h1>{optionList('cortex', [{ value: 'yes', label: 'Yes' }, { value: 'not-really', label: 'Not really' }])}</>;
      case 'cortex-help':
        return (
          <>
            <h1 className="nora-title" data-testid="text-step-title">What does the prefrontal cortex help children do?</h1>
            <p className="nora-copy">It helps children focus, pause, switch plans, and think about what to do next. These abilities develop over many years and grow with experience and practice. So when {childName} struggles to stop a screen, the question isn’t just “How do I get them to listen?” It’s also “How can I help them practise what this moment asks of them?”</p>
          </>
        );
      case 'practice':
        return (
          <>
            <h1 className="nora-title" data-testid="text-step-title">You’re part of how {childName} learns.</h1>
            <p className="nora-copy">Small moments with you give {childName} chances to wait, handle “no,” try a different plan, and recover when something doesn’t work. Those are the same kinds of skills screen-time endings ask for.</p>
          </>
        );
      case 'play':
        return (
          <>
            <h1 className="nora-title" data-testid="text-step-title">Why start with play?</h1>
            <p className="nora-copy">Imagine {childName} builds a tower and it falls. They feel disappointed—but the stakes are low, and you’re right there. Play gives {childName} room to practise trying again or changing plans. It also gives you a calmer moment to practise how you respond, so you have something familiar to draw on when emotions run high.</p>
          </>
        );
      case 'nora':
        return (
          <>
            <NoraArt small />
            <h1 className="nora-title" data-testid="text-step-title">Nora makes the practice personal.</h1>
            <p className="nora-copy">Spend five minutes playing together and record the interaction. Nora uses what happens in your real moments together to suggest one small thing to practise next. Then you can try that approach during play and at your next screen-time ending.</p>
          </>
        );
      case 'plan': {
        const goal = goalChoices.find((choice) => choice.value === answers.goal)?.label ?? '';
        const pattern = answers.stops.map((value) => stopChoices.find((choice) => choice.value === value)?.label ?? '').join(', ');
        const tried = answers.strategies.map((value) => strategyChoices.find((choice) => choice.value === value)?.label ?? '').join(', ');
        return (
          <div className="nora-complete">
            <NoraArt />
            <h1 className="nora-title" data-testid="text-step-title">{childName}’s starting plan.</h1>
            <div className="nora-plan" data-testid="text-starting-plan">
              <p>Your goal: <strong>{goal}</strong>. The hard moment: <strong>{replaceEthan(pattern)}</strong>. What you’ve tried: <strong>{replaceEthan(tried)}</strong></p>
              <p>Start with: Helping {childName} practise switching, coping, and moving on in small moments together.</p>
              <p>No payment required to start. First three times is free!</p>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  const ctaLabel =
    current === 'intro'
      ? "Let's start"
      : current === 'context'
        ? 'That sounds familiar'
        : current === 'why'
          ? 'What skills'
          : current === 'skills'
            ? "Why it’s so hard?"
            : current === 'cortex-help'
              ? 'How can I help?'
              : current === 'practice'
                ? 'Where do we start?'
                : current === 'play'
                  ? 'How does Nora help?'
                  : current === 'nora'
                    ? 'create account to see your 8 weeks plan.'
                    : 'Continue';

  const isChallengeStop = current === 'challenge' && profile.challenge !== '' && profile.challenge !== 'screen';
  const showFooter = started && current !== 'plan';

  return (
    <div className="nora-app">
      <div className="nora-shell">
        <header className="nora-topbar">
          <span className="nora-wordmark">nora</span>
          {started && current !== 'plan' && <span className="nora-topbar-note">{progress}%</span>}
        </header>
        {started && current !== 'plan' && <div className="nora-progress" aria-label={`${progress}%`}><div className="nora-progress-fill" style={{ width: `${progress}%` }} /></div>}
        <main className="nora-main">{screen()}</main>
        {showFooter && (
          <footer className="nora-footer">
            <button type="button" className="nora-button nora-button-quiet" onClick={back} disabled={stepIndex === 1} data-testid="button-back">
              <ArrowLeft size={17} /> Back
            </button>
            <button type="button" className="nora-button" onClick={next} disabled={isChallengeStop} data-testid="button-continue">
              {ctaLabel} <ArrowRight size={17} />
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}

export default App;