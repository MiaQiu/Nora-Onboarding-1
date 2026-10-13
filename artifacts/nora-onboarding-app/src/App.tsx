import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronRight } from 'lucide-react';
import { agreementChoices, barrierChoices, screenMediaStatements } from './flow-content';
import { FrustrationScreen, emptyFrustrationAnswers, frustrationCtaLabels, frustrationHasAnswer, frustrationInsightSteps, frustrationSteps, isFrustrationStep } from './frustration-flow';
import type { FrustrationAnswers, FrustrationStep } from './frustration-flow';
import { AgreementPrompt, InsightIllustration, choiceVisual } from './visuals';
import { frequencyChoices, signalQuestions, teenChoices } from './signal-content';

type Choice = { value: string; label: string };
type Step =
  | 'welcome'
  | 'adult-name'
  | 'relationship'
  | 'child-name'
  | 'birth-month'
  | 'gender'
  | 'challenge'
  | 'intro'
  | 'hardest'
  | `assessment-${number}`
  | 'stops'
  | 'dopamine'
  | 'context'
  | 'differences'
  | 'strategies'
  | 'worked'
  | 'stress'
  | 'teen'
  | `signal-${number}`
  | 'windows'
  | 'goal'
  | 'barriers'
  | 'why'
  | 'cortex'
  | 'cortex-help'
  | 'practice'
  | 'transition'
  | 'play'
  | 'nora'
  | 'plan'
  | FrustrationStep;

type Profile = {
  adultName: string;
  relationship: string;
  childName: string;
  birthMonth: string;
  gender: string;
  challenge: string;
};

type Answers = {
  ratings: Record<string, string>;
  hardest: string;
  stops: string[];
  dopamine: string;
  differences: string[];
  strategies: string[];
  worked: string;
  stress: string;
  teen: string;
  signals: Record<string, string>;
  goal: string;
  barriers: string;
  cortex: string;
};

const genderChoices: Choice[] = [
  { value: 'girl', label: 'Girl' },
  { value: 'boy', label: 'Boy' },
  { value: 'prefer-not', label: 'Prefer not to say' },
];

const relationshipChoices: Choice[] = [
  { value: 'mother', label: 'Mother' },
  { value: 'father', label: 'Father' },
  { value: 'grandma', label: 'Grandma' },
  { value: 'grandpa', label: 'Grandpa' },
  { value: 'others', label: 'Others' },
];

const challengeChoices: Choice[] = [
  { value: 'screen', label: 'Screen-time tantrums' },
  { value: 'frustrated', label: 'Gets frustrated very easily' },
  { value: 'listen', label: "Doesn't listen" },
  { value: 'focus', label: 'Has trouble focusing' },
];

const stopChoices: Choice[] = [
  { value: 'asks', label: 'He asks for more' },
  { value: 'ignores', label: 'He ignores me and keeps watching' },
  { value: 'whines', label: 'He whines or cries' },
  { value: 'meltdown', label: 'He screams or has a meltdown' },
  { value: 'hits', label: 'He hits, kicks or throws things' },
];

const hardestChoices: Choice[] = [
  { value: 'stop', label: 'Getting Ethan to stop' },
  { value: 'more', label: 'He keeps asking for more' },
  { value: 'upset', label: 'He gets very upset when it ends' },
  { value: 'after', label: "He won't do anything else afterward" },
  { value: 'argue', label: 'I end up arguing or yelling' },
];

const differenceChoices: Choice[] = [
  { value: 'none', label: 'None that I know of' },
  { value: 'developmental-delays', label: 'Developmental Delays' },
  { value: 'adhd', label: 'ADHD' },
  { value: 'asd', label: 'ASD' },
  { value: 'anxiety', label: 'Anxiety' },
  { value: 'another', label: 'Another difference not listed here' },
  { value: 'suspected', label: 'I suspected one of those, but haven’t gotten any diagnoses yet' },
];

const strategyChoices: Choice[] = [
  { value: 'warning', label: 'Giving a warning before time is up' },
  { value: 'timer', label: 'Using a timer' },
  { value: 'rules', label: 'Setting screen-time rules in advance' },
  { value: 'activity', label: 'Offering another activity' },
  { value: 'explaining', label: 'Explaining why it’s time to stop' },
  { value: 'extra', label: 'Giving a little extra time' },
  { value: 'away', label: 'Taking the device away' },
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
  visual,
}: {
  choice: Choice;
  selected: boolean;
  multi?: boolean;
  onSelect: () => void;
  testId: string;
  visual?: ReactNode;
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
      {visual}
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
    birthMonth: '',
    gender: '',
    challenge: '',
  });
  const [answers, setAnswers] = useState<Answers>({
    ratings: {},
    hardest: '',
    stops: [],
    dopamine: '',
    differences: [],
    strategies: [],
    worked: '',
    stress: '',
    teen: '',
    signals: {},
    goal: '',
    barriers: '',
    cortex: '',
  });

  const [frustration, setFrustration] = useState<FrustrationAnswers>(emptyFrustrationAnswers);

  const childName = profile.childName.trim() || 'Ethan';
  const replaceEthan = (label: string) => label.replaceAll('Ethan', childName);
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const [birthYear, birthMonth] = profile.birthMonth.split('-').map(Number);
  const childAge = Math.max(0, today.getFullYear() - birthYear - (today.getMonth() + 1 < birthMonth ? 1 : 0));

  const flow = useMemo<Step[]>(
    () => [
      'welcome',
      'adult-name',
      'relationship',
      'child-name',
      'birth-month',
      'gender',
      'challenge',
      ...(profile.challenge === 'screen'
        ? ([
            'intro',
            'hardest',
            ...screenMediaStatements.map((_, index) => `assessment-${index}` as Step),
            'stops',
            'dopamine',
            'context',
            'differences',
            'strategies',
            'worked',
            'stress',
            'teen',
            'barriers',
            'goal',
            'why',
            ...signalQuestions.map((_, index) => `signal-${index}` as Step),
            'cortex',
            'cortex-help',
            'windows',
            'practice',
            'transition',
            'play',
            'nora',
            'plan',
          ] as Step[])
        : profile.challenge === 'frustrated'
          ? frustrationSteps
          : []),
    ],
    [profile.challenge],
  );

  const current = flow[stepIndex] ?? 'welcome';
  const progress = started ? Math.round((stepIndex / Math.max(flow.length - 1, 1)) * 100) : 0;

  const updateProfile = (key: keyof Profile, value: string) => {
    setProfile((previous) => ({ ...previous, [key]: value }));
    setInvalid(false);
  };

  const choose = (key: Exclude<keyof Answers, 'ratings' | 'signals' | 'stops' | 'strategies' | 'differences'> | 'relationship' | 'challenge' | 'gender', value: string) => {
    if (key in profile) {
      setProfile((previous) => ({ ...previous, [key]: value }));
    } else {
      setAnswers((previous) => ({ ...previous, [key]: value }));
    }
    setInvalid(false);
    if (key === 'challenge' && (value === 'screen' || value === 'frustrated')) {
      setStepIndex((index) => index + 1);
    }
  };

  const toggle = (key: 'stops' | 'strategies' | 'differences', value: string) => {
    setAnswers((previous) => {
      const existing = previous[key];
      let next = existing.includes(value)
        ? existing.filter((item) => item !== value)
        : [...existing, value];
      if (key === 'differences' && !existing.includes(value)) {
        next = value === 'none' ? ['none'] : next.filter((item) => item !== 'none');
      }
      return { ...previous, [key]: next };
    });
    setInvalid(false);
  };

  const hasAnswer = () => {
    if (current === 'adult-name') return profile.adultName.trim().length > 0;
    if (current === 'relationship') return Boolean(profile.relationship);
    if (current === 'child-name') return profile.childName.trim().length > 0;
    if (current === 'birth-month') return Boolean(profile.birthMonth) && profile.birthMonth <= currentMonth;
    if (current === 'gender') return Boolean(profile.gender);
    if (current === 'challenge') return profile.challenge === 'screen' || profile.challenge === 'frustrated';
    if (isFrustrationStep(current)) return frustrationHasAnswer(current, frustration);
    if (current.startsWith('assessment-')) return Boolean(answers.ratings[current]);
    if (current.startsWith('signal-')) return Boolean(answers.signals[current]);
    if (current === 'teen') return Boolean(answers.teen);
    if (current === 'hardest' || current === 'dopamine' || current === 'worked' || current === 'stress' || current === 'barriers' || current === 'goal' || current === 'cortex') {
      return Boolean(answers[current]);
    }
    if (current === 'stops' || current === 'strategies' || current === 'differences') return answers[current].length > 0;
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

  const optionList = (key: Exclude<keyof Answers, 'ratings' | 'signals'> | 'relationship' | 'challenge' | 'gender', choices: Choice[], multi = false) => (
    <div className="nora-options" data-testid={`options-${key}`}>
      {choices.map((choice) => {
        const selected = multi
          ? (answers[key as 'stops' | 'strategies' | 'differences'] as string[]).includes(choice.value)
          : profile[key as keyof Profile] === choice.value || answers[key as keyof Answers] === choice.value;
        return (
          <ChoiceButton
            key={choice.value}
            choice={{ ...choice, label: replaceEthan(choice.label) }}
            selected={selected}
            multi={multi}
            onSelect={() => (multi ? toggle(key as 'stops' | 'strategies' | 'differences', choice.value) : choose(key as Parameters<typeof choose>[0], choice.value))}
            testId={`choice-${key}-${choice.value}`}
            visual={choiceVisual(key, choice.value)}
          />
        );
      })}
    </div>
  );

  const screen = () => {
    if (isFrustrationStep(current)) {
      return (
        <FrustrationScreen
          step={current}
          childName={childName}
          answers={frustration}
          setAnswers={setFrustration}
          clearInvalid={() => setInvalid(false)}
          art={(small) => <NoraArt small={small} />}
        />
      );
    }
    if (current.startsWith('assessment-')) {
      const statement = screenMediaStatements[Number(current.split('-')[1])];
      return (
        <>
          <AgreementPrompt />
          <h1 className="nora-title" data-testid="text-step-title">{statement}</h1>
          <div className="nora-options" data-testid={`options-${current}`}>
            {agreementChoices.map((choice) => (
              <ChoiceButton
                key={choice.value}
                choice={choice}
                selected={answers.ratings[current] === choice.value}
                testId={`choice-${current}-${choice.value}`}
                onSelect={() => {
                  setAnswers((previous) => ({ ...previous, ratings: { ...previous.ratings, [current]: choice.value } }));
                  setInvalid(false);
                }}
              />
            ))}
          </div>
        </>
      );
    }
    if (current.startsWith('signal-')) {
      const question = signalQuestions[Number(current.split('-')[1])];
      return (
        <>
          <h1 className="nora-title" data-testid="text-step-title">{question}</h1>
          <div className="nora-options" data-testid={`options-${current}`}>
            {frequencyChoices.map((choice) => (
              <ChoiceButton
                key={choice.value}
                choice={choice}
                selected={answers.signals[current] === choice.value}
                testId={`choice-${current}-${choice.value}`}
                onSelect={() => {
                  setAnswers((previous) => ({ ...previous, signals: { ...previous.signals, [current]: choice.value } }));
                  setInvalid(false);
                }}
              />
            ))}
          </div>
        </>
      );
    }
    switch (current) {
      case 'teen':
        return <><h1 className="nora-title" data-testid="text-step-title">Do you worry those challenges might get harder as your child becomes a teenager?</h1>{optionList('teen', teenChoices)}</>;
      case 'windows':
        return (
          <>
            <h1 className="nora-title" data-testid="text-step-title">The windows of opportunity.</h1>
            <div className="nora-insight-body nora-insight-large">
              <p className="nora-copy">At {childName}’s age, the prefrontal cortex is still developing.</p>
              <p className="nora-copy">This is a key time to practise <strong className="nora-highlight">focus, self-control, and managing frustration.</strong></p>
              <div className="nora-insight-callout"><p className="nora-copy"><strong>And you have the greatest influence on their learning.</strong></p></div>
            </div>
          </>
        );
      case 'welcome':
        return (
          <div className="nora-complete nora-welcome">
            <NoraArt />
            <h1 className="nora-title" data-testid="text-step-title">Beyond Parenting Advice. Build Real Skills.</h1>
            <p className="nora-subtitle nora-welcome-copy" data-testid="text-welcome-description">
              Personalised AI coaching to help you navigate tantrums, build better listening and develop your child’s focus.
            </p>
            <div className="nora-actions">
              <button type="button" className="nora-button nora-button-wide" onClick={() => { setStarted(true); setStepIndex(1); }} data-testid="button-start">
                Let's start <ArrowRight size={18} />
              </button>
            </div>
          </div>
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
      case 'birth-month':
        return (
          <>
            <h1 className="nora-title" data-testid="text-step-title">What’s your child’s birth month and year?</h1>
            <div className="nora-panel">
              <input type="month" className={`nora-field ${invalid ? 'is-invalid' : ''}`} value={profile.birthMonth} max={currentMonth} onChange={(event) => updateProfile('birthMonth', event.target.value)} aria-label="Birth month and year" data-testid="input-birth-month" />
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
            <h1 className="nora-title" data-testid="text-step-title">You’re not alone.</h1>
            <div className="nora-insight-body nora-insight-large">
              <p className="nora-copy">Many parents face excessive screen time at {childAge} years old.</p>
              <p className="nora-copy">It’s often less about behavior and more about <strong className="nora-highlight">something deeper beneath the surface.</strong></p>
              <p className="nora-copy">Let’s look at whether we can find any patterns.</p>
            </div>
          </>
        );
      case 'hardest':
        return <><h1 className="nora-title" data-testid="text-step-title">What's hardest about screen time right now?</h1>{optionList('hardest', hardestChoices)}</>;
      case 'stops':
        return <><h1 className="nora-title" data-testid="text-step-title">When it's time to stop, what usually happens (Can select multiple)?</h1>{optionList('stops', stopChoices, true)}</>;
      case 'dopamine':
        return <><h1 className="nora-title" data-testid="text-step-title">Have you heard about the dopamine loop?</h1>{optionList('dopamine', [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }])}</>;
      case 'context':
        return (
          <>
            <h1 className="nora-title nora-insight-long-title" data-testid="text-step-title">screens are incredibly stimulating—they deliver constant novelty and excitement in a way that few other activities can match.</h1>
            <div className="nora-insight-body nora-insight-large">
              <p className="nora-copy"><strong>This makes stopping genuinely hard for many kids.</strong></p>
              <p className="nora-copy">When the stimulation suddenly stops, their nervous system has to shift gears quickly, and that shift can feel really uncomfortable.</p>
              <div className="nora-insight-callout"><p className="nora-copy">This is called <strong>the dopamine loop.</strong></p><p className="nora-copy">The meltdown isn't defiance or manipulation—<strong className="nora-highlight">it's a brain that hasn't caught up to the transition yet.</strong></p></div>
            </div>
          </>
        );
      case 'strategies':
        return <><h1 className="nora-title" data-testid="text-step-title">What have you already tried to make screen time easier to end? (Select all that apply.)</h1>{optionList('strategies', strategyChoices, true)}</>;
      case 'differences':
        return <><h1 className="nora-title" data-testid="text-step-title">Does {childName} have any learning and thinking differences?</h1><p className="nora-copy">Select all that apply.</p>{optionList('differences', differenceChoices, true)}</>;
      case 'worked':
        return <><h1 className="nora-title" data-testid="text-step-title">How well have those approaches worked?</h1>{optionList('worked', workedChoices)}</>;
      case 'stress':
        return <><h1 className="nora-title" data-testid="text-step-title">How hard are screen-time endings on you?</h1>{optionList('stress', stressChoices)}</>;
      case 'barriers':
        return <><h1 className="nora-title" data-testid="text-step-title">What’s holding you back?</h1>{optionList('barriers', barrierChoices)}</>;
      case 'goal':
        return <><h1 className="nora-title" data-testid="text-step-title">What would you most like to change?</h1>{optionList('goal', goalChoices)}</>;
      case 'why':
        return (
          <>
            <h1 className="nora-title" data-testid="text-step-title">Why hasn’t it worked so far?</h1>
            <div className="nora-insight-body nora-insight-large">
              <p className="nora-copy">Most screen-time strategies focus on getting {childName} to put the device down.</p>
              <p className="nora-copy"><strong className="nora-highlight">But that’s only the surface.</strong></p>
              <p className="nora-copy">Underneath, At that moment, {childName} has to switch attention, cope with disappointment, and move on.</p>
              <div className="nora-insight-callout"><p className="nora-copy"><strong>Those skills are still developing.</strong></p></div>
              <p className="nora-copy">Let’s look at the hidden signals you might has missed to understand how they are really coping.</p>
            </div>
          </>
        );
      case 'cortex':
        return <><h1 className="nora-title" data-testid="text-step-title">Have you heard of the prefrontal cortex?</h1>{optionList('cortex', [{ value: 'yes', label: 'Yes' }, { value: 'not-really', label: 'Not really' }])}</>;
      case 'cortex-help':
        return (
          <>
            <h1 className="nora-title" data-testid="text-step-title">What does the prefrontal cortex help children do?</h1>
            <div className="nora-insight-body">
              <p className="nora-copy">It helps children <strong className="nora-highlight">focus, pause, switch plans, and think about what to do next.</strong> These abilities develop over many years and grow with experience and practice. So when {childName} struggles to stop a screen, the question isn’t just “How do I get them to listen?”</p>
              <div className="nora-insight-callout"><p className="nora-copy">It’s also <strong>“How can I help them practise what this moment asks of them?”</strong></p></div>
            </div>
          </>
        );
      case 'practice':
        return (
          <>
            <h1 className="nora-title" data-testid="text-step-title">You’re part of how {childName} learns.</h1>
            <InsightIllustration scene="practice" />
            <div className="nora-insight-body nora-insight-large">
              <p className="nora-copy">Small moments with you give {childName} chances to <strong className="nora-highlight">wait, handle “no,” try a different plan, and recover</strong> when something doesn’t work.</p>
              <div className="nora-insight-callout"><p className="nora-copy">Those are the same kinds of skills screen-time endings ask for.</p></div>
            </div>
          </>
        );
      case 'transition':
        return (
          <>
            <h1 className="nora-title nora-insight-long-title" data-testid="text-step-title">We will start with understanding what’s happening during the screen time transition first and coach you how to apply strategies to make screentime predictable from your child first.</h1>
            <InsightIllustration scene="transition" />
            <div className="nora-insight-body">
              <div className="nora-insight-callout"><p className="nora-copy">Once the screentime becomes predictable. We will coach you techniques to practice with {childName} during your daily play time if {childName} still find it challenging.</p></div>
            </div>
          </>
        );
      case 'play':
        return (
          <>
            <h1 className="nora-title" data-testid="text-step-title">Why start with play?</h1>
            <InsightIllustration scene="play" />
            <div className="nora-insight-body">
              <p className="nora-copy">Imagine {childName} builds a tower and it falls. They feel disappointed—but <strong className="nora-highlight">the stakes are low, and you’re right there.</strong></p>
              <div className="nora-insight-callout"><p className="nora-copy">Play gives {childName} room to practise trying again or changing plans.</p></div>
              <p className="nora-copy">It also gives you a calmer moment to practise how you respond, so you have something familiar to draw on when emotions run high.</p>
            </div>
          </>
        );
      case 'nora':
        return (
          <>
            <NoraArt small />
            <h1 className="nora-title" data-testid="text-step-title">Nora makes the practice personal.</h1>
            <div className="nora-insight-body">
              <p className="nora-copy">Nora uses what happens in your real moments together to suggest <strong>one small thing to practise next.</strong></p>
              <div className="nora-insight-callout"><p className="nora-copy">Then you can try that approach during play and at your next screen-time ending.</p></div>
            </div>
          </>
        );
      case 'plan': {
        const goal = goalChoices.find((choice) => choice.value === answers.goal)?.label ?? '';
        const pattern = [
          hardestChoices.find((choice) => choice.value === answers.hardest)?.label ?? '',
          ...answers.stops.map((value) => stopChoices.find((choice) => choice.value === value)?.label ?? ''),
        ].filter(Boolean).join(', ');
        const tried = answers.strategies.map((value) => strategyChoices.find((choice) => choice.value === value)?.label ?? '').join(', ');
        return (
          <div className="nora-complete">
            <NoraArt />
            <h1 className="nora-title" data-testid="text-step-title">{childName}’s starting plan.</h1>
            <div className="nora-plan-goal" data-testid="text-two-month-goal">
              <p className="nora-plan-goal-title">Our two-month goal: Help {childName} manage screen time without tantrums.</p>
              <p className="nora-plan-goal-note" data-testid="text-goal-disclaimer">Progress varies from child to child; this is a goal, not a guaranteed outcome.</p>
            </div>
            <div className="nora-plan" data-testid="text-starting-plan">
              <p><span className="nora-plan-line">Your goal: <strong>{goal}</strong>.</span>{' '}<span className="nora-plan-line">The hard moment: <strong>{replaceEthan(pattern)}</strong>.</span>{' '}<span className="nora-plan-line">What you’ve tried: <strong>{replaceEthan(tried)}</strong></span></p>
              <p>Start with: Helping {childName} practise switching, coping, and moving on in small moments together.</p>
              <p data-testid="text-plan-closing">You’re not just making screen-time endings easier. You’re building essential life skills and a stronger parent-child bond that will last for years.</p>
              <p>No payment required to start. First three times is free!</p>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  const ctaLabels: Partial<Record<Step, string>> = {
    intro: "Let's start",
    context: 'Sounds Familiar',
    'cortex-help': 'How can I help?',
    practice: 'Where do we start?',
    play: 'How does Nora help?',
    nora: 'create an account to see your 8 weeks plan.',
  };
  const ctaLabel = ctaLabels[current] ?? frustrationCtaLabels[current] ?? 'Continue';

  const isChallengeStop = current === 'challenge' && profile.challenge !== '' && profile.challenge !== 'screen' && profile.challenge !== 'frustrated';
  const isPlan = current === 'plan' || current === 'f-plan';
  const showFooter = started && !isPlan;

  return (
    <div className="nora-app">
      <div className="nora-shell">
        <header className="nora-topbar">
          <span className="nora-wordmark">nora</span>
          {started && !isPlan && <span className="nora-topbar-note">{progress}%</span>}
        </header>
        {started && !isPlan && <div className="nora-progress" aria-label={`${progress}%`}><div className="nora-progress-fill" style={{ width: `${progress}%` }} /></div>}
        <main key={current} className={`nora-main ${current === 'welcome' ? 'is-welcome' : ''} ${(['intro', 'context', 'why', 'cortex-help', 'windows', 'practice', 'transition', 'play', 'nora', 'plan'] as Step[]).includes(current) || frustrationInsightSteps.includes(current) ? 'is-insight' : ''}`}>
          {screen()}
          {invalid && (isFrustrationStep(current) || current === 'teen' || current.startsWith('signal-')) && <p className="nora-copy" role="alert" data-testid="text-answer-required">Please select an answer to continue.</p>}
        </main>
        {showFooter && (
          <footer className="nora-footer">
            <button type="button" className="nora-button nora-button-quiet" onClick={back} disabled={stepIndex === 1} data-testid="button-back">
              <ArrowLeft size={17} /> Back
            </button>
            {!isChallengeStop && (
              <button type="button" className="nora-button" onClick={next} data-testid="button-continue">
                {ctaLabel} <ArrowRight size={17} />
              </button>
            )}
          </footer>
        )}
      </div>
    </div>
  );
}

export default App;