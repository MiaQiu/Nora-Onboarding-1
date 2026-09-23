import { useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  HeartHandshake,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

const queryClient = new QueryClient();

type Choice = { value: string; label: string; hint?: string };
type Answers = Record<string, string | string[]>;

const genderChoices: Choice[] = [
  { value: 'girl', label: 'Girl' },
  { value: 'boy', label: 'Boy' },
  { value: 'prefer-not', label: 'Prefer not to say' },
];

const challengeChoices: Choice[] = [
  { value: 'screen', label: 'Screen-time tantrums', hint: 'The hardest moments start when it is time to stop.' },
  { value: 'frustration', label: 'Gets frustrated very easily' },
  { value: 'listening', label: "Doesn't listen" },
  { value: 'focus', label: 'Has trouble focusing' },
];

const skills = [
  {
    title: 'Shifting attention',
    copy: 'Moving from something highly engaging to whatever comes next.',
    icon: Target,
  },
  {
    title: 'Handling disappointment',
    copy: 'Managing: “I want more, but I can’t have it.”',
    icon: HeartHandshake,
  },
  {
    title: 'Following a boundary',
    copy: 'Accepting a limit even when they do not like the limit.',
    icon: ShieldCheck,
  },
];

function ChoiceButton({
  choice,
  selected,
  onSelect,
  testId,
  multi = false,
}: {
  choice: Choice;
  selected: boolean;
  onSelect: () => void;
  testId: string;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      className={`nora-option ${selected ? 'is-selected' : ''}`}
      onClick={onSelect}
      data-testid={testId}
      aria-pressed={selected}
    >
      <span className={`nora-option-mark ${multi ? 'is-check' : ''}`}>
        {selected && <Check size={14} strokeWidth={3} />}
      </span>
      <span className="nora-option-text">
        {choice.label}
        {choice.hint && <span className="nora-option-hint">{choice.hint}</span>}
      </span>
      <ChevronRight size={17} className="text-[#9d91ae]" aria-hidden="true" />
    </button>
  );
}

function NoraArt({ small = false }: { small?: boolean }) {
  return (
    <div className={`nora-art ${small ? 'nora-art-small' : ''}`} aria-label="Nora, a friendly purple dragon">
      <img src="/assets/nora-character.png" alt="Nora the purple dragon" data-testid="img-nora-character" />
    </div>
  );
}

function AppContent() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [skillIndex, setSkillIndex] = useState(0);
  const [handoff, setHandoff] = useState(false);
  const [profile, setProfile] = useState({
    gender: '',
    name: '',
    month: '',
    year: '',
    address: '',
    relationship: '',
    challenge: '',
  });
  const [answers, setAnswers] = useState<Answers>({});
  const [error, setError] = useState('');

  const childName = profile.name.trim() || 'your child';
  const flow = useMemo(
    () =>
      profile.challenge === 'screen'
        ? ['profile', 'address', 'relationship', 'challenge', 'intro', 'hardest', 'stops', 'recover', 'reflect', 'warning', 'after', 'desired', 'forYou', 'skills', 'learned', 'practice', 'done']
        : ['profile', 'address', 'relationship', 'challenge', 'other', 'done'],
    [profile.challenge],
  );
  const current = flow[step] ?? 'profile';
  const progress = started ? Math.min(100, ((step + 1) / flow.length) * 100) : 0;

  const updateProfile = (field: keyof typeof profile, value: string) => {
    setProfile((previous) => ({ ...previous, [field]: value }));
    setError('');
  };

  const choose = (key: string, value: string) => {
    setAnswers((previous) => ({ ...previous, [key]: value }));
    if (key === 'gender') setProfile((previous) => ({ ...previous, gender: value }));
    setError('');
  };

  const toggle = (key: string, value: string, max?: number) => {
    setAnswers((previous) => {
      const existing = Array.isArray(previous[key]) ? previous[key] as string[] : [];
      const next = existing.includes(value)
        ? existing.filter((item) => item !== value)
        : max && existing.length >= max
          ? existing
          : [...existing, value];
      return { ...previous, [key]: next };
    });
    setError('');
  };

  const selected = (key: string, value: string) => answers[key] === value;
  const selectedMulti = (key: string, value: string) =>
    Array.isArray(answers[key]) && (answers[key] as string[]).includes(value);

  const canContinue = () => {
    if (current === 'profile') return Boolean(profile.gender && profile.name.trim() && profile.month && profile.year);
    if (current === 'address') return Boolean(profile.address);
    if (current === 'relationship') return Boolean(profile.relationship);
    if (current === 'challenge') return Boolean(profile.challenge);
    if (['hardest', 'stops', 'recover'].includes(current)) return Boolean(answers[current]);
    if (['desired', 'forYou'].includes(current)) return Array.isArray(answers[current]) && (answers[current] as string[]).length > 0;
    return true;
  };

  const next = () => {
    if (current === 'skills' && skillIndex < skills.length - 1) {
      setSkillIndex((value) => value + 1);
      return;
    }
    if (!canContinue()) {
      setError(current === 'profile' ? 'A few details help Nora make this personal.' : 'Choose one to continue.');
      return;
    }
    setError('');
    setStep((value) => Math.min(flow.length - 1, value + 1));
  };

  const back = () => {
    setError('');
    if (current === 'skills') setSkillIndex(0);
    setStep((value) => Math.max(0, value - 1));
  };

  const start = () => {
    setStarted(true);
    setStep(0);
    setHandoff(false);
  };

  const heading = (kicker: string, title: string, subtitle?: string) => (
    <>
      <p className="nora-kicker">{kicker}</p>
      <h1 className="nora-title" data-testid="text-step-title">{title}</h1>
      {subtitle && <p className="nora-subtitle">{subtitle}</p>}
    </>
  );

  const optionList = (key: string, choices: Choice[], multi = false, max?: number) => (
    <div className="nora-options" data-testid={`options-${key}`}>
      {choices.map((choice) => (
        <ChoiceButton
          key={choice.value}
          choice={choice}
          selected={multi ? selectedMulti(key, choice.value) : selected(key, choice.value)}
          onSelect={() => (multi ? toggle(key, choice.value, max) : choose(key, choice.value))}
          testId={`choice-${key}-${choice.value}`}
          multi={multi}
        />
      ))}
    </div>
  );

  const renderWelcome = () => (
    <main className="nora-main nora-complete">
      <NoraArt />
      <p className="nora-kicker">A quieter way to begin</p>
      <h1 className="nora-title">You do not have to figure this out <em>alone.</em></h1>
      <p className="nora-subtitle">
        Nora is a calm, practical companion for the moments that stretch you most. First, we will get to know your family.
      </p>
      <div className="nora-actions">
        <button type="button" className="nora-button nora-button-wide" onClick={start} data-testid="button-start">
          Start gently <ArrowRight size={18} />
        </button>
      </div>
      <div className="nora-helper"><ShieldCheck size={15} /> Built with child-development science, made for real family life.</div>
    </main>
  );

  const renderStep = () => {
    switch (current) {
      case 'profile':
        return (
          <>
            {heading('First, your little one', 'Let’s start with a few details.', 'There is no perfect answer here. This simply helps Nora speak to your family.')}
            <div className="nora-panel">
              <p className="nora-field-label">Your child is a…</p>
              {optionList('gender', genderChoices.map((item) => ({ ...item, value: `gender-${item.value}` })))}
              <div className="nora-field-wrap">
                <label className="nora-field-label" htmlFor="child-name">What is their name?</label>
                <input id="child-name" className="nora-field" value={profile.name} onChange={(event) => updateProfile('name', event.target.value)} placeholder="A name Nora can use" data-testid="input-child-name" />
              </div>
              <div className="nora-field-row">
                <div>
                  <label className="nora-field-label" htmlFor="birth-month">Birth month</label>
                  <select id="birth-month" className="nora-field" value={profile.month} onChange={(event) => updateProfile('month', event.target.value)} data-testid="select-birth-month">
                    <option value="">Month</option>
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => <option key={month} value={month}>{month}</option>)}
                  </select>
                </div>
                <div>
                  <label className="nora-field-label" htmlFor="birth-year">Birth year</label>
                  <select id="birth-year" className="nora-field" value={profile.year} onChange={(event) => updateProfile('year', event.target.value)} data-testid="select-birth-year">
                    <option value="">Year</option>
                    {Array.from({ length: 8 }, (_, index) => String(new Date().getFullYear() - index)).map((year) => <option key={year} value={year}>{year}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </>
        );
      case 'address':
        return (
          <>
            {heading('Your name, your way', 'How should Nora address you?', 'Choose what feels most natural. You can change this later.')}
            {optionList('address', [
              { value: 'mum', label: 'Mum' },
              { value: 'mom', label: 'Mom' },
              { value: 'dad', label: 'Dad' },
              { value: 'parent', label: 'Parent' },
              { value: 'caregiver', label: 'Caregiver' },
            ])}
          </>
        );
      case 'relationship':
        return (
          <>
            {heading('The people around them', 'What is your relationship to your child?', 'Nora will keep your role in mind as we go.')}
            {optionList('relationship', [
              { value: 'parent', label: 'I am their parent' },
              { value: 'grandparent', label: 'I am their grandparent' },
              { value: 'relative', label: 'I am a family member' },
              { value: 'caregiver', label: 'I care for them regularly' },
            ])}
          </>
        );
      case 'challenge':
        return (
          <>
            {heading('Right now', 'What feels hardest?', 'Pick the moment you would most like a little more support with.')}
            {optionList('challenge', challengeChoices)}
            <div className="nora-callout">
              <p>Small moments are where big skills grow.</p>
              <small>Nora will start exactly where your family is today.</small>
            </div>
          </>
        );
      case 'intro':
        return (
          <>
            <NoraArt small />
            {heading('A closer look', 'Let’s make screen-time endings easier.', `A few questions will help Nora understand what happens when screen time ends for ${childName}—and what skills may make those moments easier.`)}
            <div className="nora-helper"><Clock3 size={16} /> About 2 minutes</div>
          </>
        );
      case 'hardest':
        return (
          <>
            {heading('Screen time', 'What’s hardest about screen time right now?', 'Choose the part that feels most familiar.')}
            {optionList('hardest', [
              { value: 'stop', label: `Getting ${childName} to stop` },
              { value: 'more', label: 'They keep asking for more' },
              { value: 'upset', label: 'They get very upset when it ends' },
              { value: 'after', label: 'They will not do anything else afterward' },
              { value: 'argue', label: 'I end up arguing or yelling' },
              { value: 'battle', label: 'Screen time feels like a battle' },
            ])}
          </>
        );
      case 'stops':
        return (
          <>
            {heading('When it ends', 'When it’s time to stop, what usually happens?', 'There can be more than one true answer. Choose the closest fit.')}
            {optionList('stops', [
              { value: 'asks', label: 'They ask for more' },
              { value: 'ignores', label: 'They ignore me and keep watching' },
              { value: 'whines', label: 'They whine or cry' },
              { value: 'meltdown', label: 'They scream or have a meltdown' },
              { value: 'hits', label: 'They hit, kick or throw things' },
              { value: 'depends', label: 'It depends on the day' },
            ])}
          </>
        );
      case 'recover':
        return (
          <>
            {heading('After the hard moment', `How long does ${childName} usually need to recover?`)}
            {optionList('recover', [
              { value: 'under-2', label: 'Less than 2 minutes' },
              { value: '2-5', label: '2–5 minutes' },
              { value: '5-15', label: '5–15 minutes' },
              { value: 'over-15', label: 'More than 15 minutes' },
            ])}
          </>
        );
      case 'reflect':
        return (
          <>
            <div className="nora-callout">
              <p>Screen-time endings are genuinely hard for many kids.</p>
              <small>
                Screens offer rapid feedback, novelty and experiences children really enjoy. When it is suddenly time to stop, {childName} has to pull their attention away, handle disappointment, and shift to something else.
              </small>
            </div>
            <div className="nora-callout">
              <p>You’re definitely not the only one.</p>
              <small>Holding a boundary while your child is melting down is hard—especially when you are tired too.</small>
            </div>
            {heading('A kinder lens', 'A meltdown does not necessarily mean they are choosing to be difficult.', 'Sometimes their skills simply have not caught up with the moment yet.')}
          </>
        );
      case 'warning':
        return (
          <>
            {heading('Your patterns', `How do you usually let ${childName} know screen time is ending?`)}
            {optionList('warning', [
              { value: 'warning', label: 'I give them a warning' },
              { value: 'timer', label: 'I use a timer' },
              { value: 'tell', label: 'I tell them it is time to stop' },
              { value: 'several', label: 'I ask several times' },
              { value: 'take', label: 'I take the device away' },
              { value: 'changes', label: 'It changes depending on the day' },
            ])}
          </>
        );
      case 'after':
        return (
          <>
            {heading('Stay curious', `When ${childName} refuses to stop, what usually happens next?`, 'Choose all that fit. There is no “right” response here.')}
            {optionList('after', [
              { value: 'explain', label: 'I explain why they need to stop' },
              { value: 'ask', label: 'I ask again' },
              { value: 'bargain', label: 'I bargain with them' },
              { value: 'more', label: 'I give them a few more minutes' },
              { value: 'threaten', label: 'I threaten a consequence' },
              { value: 'remove', label: 'I take the screen away' },
              { value: 'voice', label: 'I get frustrated or raise my voice' },
              { value: 'calm', label: 'I stay calm and hold the limit' },
            ], true)}
          </>
        );
      case 'desired':
        return (
          <>
            {heading('A small wish', `If screen time could feel different, what would you most want for ${childName}?`, 'Choose up to 2.')}
            {optionList('desired', [
              { value: 'stop', label: 'Stop when screen time ends' },
              { value: 'no-more', label: 'Handle “no more” without melting down' },
              { value: 'recover', label: 'Recover faster when disappointed' },
              { value: 'move', label: 'Move to the next activity more easily' },
              { value: 'ask-less', label: 'Ask for screens less often' },
              { value: 'listen', label: 'Listen without me having to yell' },
            ], true, 2)}
          </>
        );
      case 'forYou':
        return (
          <>
            {heading('And for you?', 'What would make the biggest difference in your day?', 'Choose up to 2.')}
            {optionList('forYou', [
              { value: 'calmer', label: 'Feel calmer' },
              { value: 'know', label: 'Know exactly what to do' },
              { value: 'repeat', label: 'Stop repeating myself' },
              { value: 'limits', label: 'Hold limits without guilt' },
              { value: 'arguments', label: 'Have fewer arguments' },
            ], true, 2)}
          </>
        );
      case 'skills':
        return (
          <>
            {heading('Look beneath the moment', 'It may not actually be about the screen.', 'Turning off something they love can ask several developing skills to work together.')}
            <div className="nora-skill-card">
              {(() => {
                const SkillIcon = skills[skillIndex].icon;
                return <SkillIcon className="nora-skill-icon" size={22} />;
              })()}
              <h3>{skills[skillIndex].title}</h3>
              <p>{skills[skillIndex].copy}</p>
            </div>
            <p className="nora-copy">Nora is looking at the skill underneath the behavior, not judging the behavior itself.</p>
          </>
        );
      case 'learned':
        return (
          <>
            {heading('Here is what we learned', `Based on what you told us, ${childName} may need the most support with:`)}
            <div className="nora-panel">
              <h3 className="text-lg font-semibold text-[#4a2d68]">Frustration tolerance</h3>
              <p className="nora-copy mt-1">Handling disappointment without becoming overwhelmed.</p>
              <h3 className="mt-6 text-lg font-semibold text-[#4a2d68]">Transitions</h3>
              <p className="nora-copy mt-1">Moving away from something they love and into what’s next.</p>
            </div>
            <div className="nora-callout">
              <p>The good news? These are skills—not fixed traits. And skills can be practiced.</p>
            </div>
            <p className="nora-copy">Everyday interactions with you give {childName} hundreds of tiny opportunities to practice waiting, handling “no”, switching attention, and recovering from frustration.</p>
          </>
        );
      case 'practice':
        return (
          <>
            {heading('Practice when it is easy', 'Why not just tell me what to do during the tantrum?', 'Because knowing what to do and being able to do it when your child is screaming and you are frustrated are two very different things.')}
            <div className="nora-panel">
              <p className="nora-copy mt-0">Let {childName} choose the play. You follow their lead. Nora coaches you to practice small ways of responding that strengthen focus, persistence, cooperation and frustration recovery.</p>
              <div className="nora-helper"><Sparkles size={16} /> The skills travel with them into harder moments.</div>
            </div>
            {heading('A gentle beginning', 'That’s why Nora starts with 5 calm minutes.', `A small, safe practice with ${childName}—so the learning is there when the hard moment arrives.`)}
          </>
        );
      case 'other':
        return (
          <>
            <NoraArt small />
            {heading('You are in the right place', 'We will start with the moment that feels hardest.', 'Nora will help you notice the skill underneath it, then practice in a way that fits your family.')}
            <div className="nora-callout"><p>You’re definitely not the only one.</p><small>There is no judgment here. Just a calmer next step.</small></div>
          </>
        );
      case 'done':
        return (
          <div className="nora-complete">
            <NoraArt />
            <p className="nora-kicker">Your Nora rhythm</p>
            <h1 className="nora-title">A calmer moment can begin <em>small.</em></h1>
            <p className="nora-subtitle">You made space to understand what is happening. Now let’s turn that understanding into 5 calm minutes.</p>
            <div className="nora-breathe"><Timer size={23} /><span>5 min</span></div>
            {!handoff ? (
              <div className="nora-actions">
                <button type="button" className="nora-button nora-button-wide" onClick={() => setHandoff(true)} data-testid="button-start-practice">
                  Begin 5 calm minutes <Play size={17} fill="currentColor" />
                </button>
              </div>
            ) : (
              <div className="nora-panel text-left" data-testid="status-practice-ready">
                <p className="nora-kicker">Practice ready</p>
                <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#43265f]">Follow their lead.</h2>
                <p className="nora-copy">For the next five minutes, let {childName} choose the play. You do not need to fix, teach or perform. Nora will be here when you are ready to reflect.</p>
                <button type="button" className="nora-button mt-5 w-full" onClick={() => setHandoff(false)} data-testid="button-reset-practice">I’m ready when you are <ArrowRight size={17} /></button>
              </div>
            )}
            <div className="nora-helper justify-center"><CircleHelp size={15} /> It’s not a test. It’s your mirror.</div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="nora-app">
      <div className="nora-shell">
        <header className="nora-topbar">
          <span className="nora-wordmark">nora</span>
          {started && current !== 'done' && <span className="nora-topbar-note">A few quiet questions</span>}
        </header>
        {started && current !== 'done' && <div className="nora-progress mt-5" aria-label={`Onboarding progress ${Math.round(progress)} percent`}><div className="nora-progress-fill" style={{ width: `${progress}%` }} data-testid="progress-onboarding" /></div>}
        {!started ? renderWelcome() : (
          <>
            <main className="nora-main" key={`${current}-${skillIndex}`}>{renderStep()}</main>
            {current !== 'done' && (
              <footer>
                {error && <p className="nora-error text-center" data-testid="status-validation">{error}</p>}
                <div className="nora-actions">
                  {step > 0 && <button type="button" className="nora-button nora-button-quiet" onClick={back} data-testid="button-back"><ArrowLeft size={17} /> Back</button>}
                  <button type="button" className="nora-button nora-button-wide" onClick={next} data-testid={`button-continue-${current}`}>
                    {current === 'intro' ? 'Let’s start' : current === 'skills' && skillIndex < skills.length - 1 ? 'See the next skill' : 'Continue'} <ArrowRight size={17} />
                  </button>
                </div>
              </footer>
            )}
          </>
        )}
        <div className="nora-footer">Nora · a little more calm, one moment at a time</div>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;