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

type Choice = { value: string; label: string };
type Answers = Record<string, string | string[]>;
type Step =
  | 'gender'
  | 'name'
  | 'birth'
  | 'address'
  | 'relationship'
  | 'challenge'
  | 'intro'
  | 'hardest'
  | 'stops'
  | 'recover'
  | 'education'
  | 'warning'
  | 'after'
  | 'feeling'
  | 'reassurance'
  | 'desired'
  | 'forYou'
  | 'skill1'
  | 'skill2'
  | 'skill3'
  | 'learned'
  | 'why'
  | 'fiveMinutes'
  | 'scenario'
  | 'record'
  | 'other'
  | 'done';

const genderChoices: Choice[] = [
  { value: 'girl', label: 'Girl' },
  { value: 'boy', label: 'Boy' },
  { value: 'prefer-not', label: 'Prefer not to say' },
];

const challengeChoices: Choice[] = [
  { value: 'screen', label: 'Screen-time tantrums' },
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
    copy: 'Managing: "I want more, but I can’t have it."',
    icon: HeartHandshake,
  },
  {
    title: 'Following a boundary',
    copy: 'Accepting a limit even when they don’t like the limit.',
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
      <span className="nora-option-text">{choice.label}</span>
      <ChevronRight size={17} className="text-[#9d91ae]" aria-hidden="true" />
    </button>
  );
}

function NoraArt({ small = false }: { small?: boolean }) {
  return (
    <div
      className={`nora-art ${small ? 'nora-art-small' : ''}`}
      aria-label="Nora, a friendly purple dragon"
    >
      <img
        src="/assets/nora-character.png"
        alt="Nora the purple dragon"
        data-testid="img-nora-character"
      />
    </div>
  );
}

function AppContent() {
  const [started, setStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
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

  const childName = profile.name.trim() || 'Ethan';
  const flow = useMemo<Step[]>(
    () =>
      profile.challenge === 'screen'
        ? [
            'gender',
            'name',
            'birth',
            'address',
            'relationship',
            'challenge',
            'intro',
            'hardest',
            'stops',
            'recover',
            'education',
            'warning',
            'after',
            'feeling',
            'reassurance',
            'desired',
            'forYou',
            'skill1',
            'skill2',
            'skill3',
            'learned',
            'why',
            'fiveMinutes',
            'scenario',
            'record',
            'done',
          ]
        : [
            'gender',
            'name',
            'birth',
            'address',
            'relationship',
            'challenge',
            'other',
            'done',
          ],
    [profile.challenge],
  );
  const current = flow[stepIndex] ?? 'gender';
  const progress = started
    ? Math.min(100, ((stepIndex + 1) / flow.length) * 100)
    : 0;

  const updateProfile = (
    field: keyof typeof profile,
    value: string,
  ) => {
    setProfile((previous) => ({ ...previous, [field]: value }));
    setError('');
  };

  const choose = (key: string, value: string) => {
    setAnswers((previous) => ({ ...previous, [key]: value }));
    setError('');
  };

  const toggle = (key: string, value: string, max?: number) => {
    setAnswers((previous) => {
      const existing = Array.isArray(previous[key])
        ? (previous[key] as string[])
        : [];
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
    Array.isArray(answers[key]) &&
    (answers[key] as string[]).includes(value);

  const canContinue = () => {
    if (current === 'gender') return Boolean(profile.gender);
    if (current === 'name') return Boolean(profile.name.trim());
    if (current === 'birth') return Boolean(profile.month && profile.year);
    if (current === 'address') return Boolean(profile.address);
    if (current === 'relationship') return Boolean(profile.relationship);
    if (current === 'challenge') return Boolean(profile.challenge);
    if (['hardest', 'stops', 'recover', 'warning', 'feeling'].includes(current)) {
      return Boolean(answers[current]);
    }
    if (['after', 'desired', 'forYou'].includes(current)) {
      return (
        Array.isArray(answers[current]) &&
        (answers[current] as string[]).length > 0
      );
    }
    return true;
  };

  const next = () => {
    if (!canContinue()) {
      setError(
        current === 'name'
          ? 'Please enter your child’s name.'
          : current === 'birth'
            ? 'Please choose a month and year.'
            : 'Choose one to continue.',
      );
      return;
    }
    setError('');
    setStepIndex((value) => Math.min(flow.length - 1, value + 1));
  };

  const back = () => {
    setError('');
    setStepIndex((value) => Math.max(0, value - 1));
  };

  const start = () => {
    setStarted(true);
    setStepIndex(0);
    setHandoff(false);
  };

  const heading = (kicker: string, title: string, subtitle?: string) => (
    <>
      <p className="nora-kicker">{kicker}</p>
      <h1 className="nora-title" data-testid="text-step-title">
        {title}
      </h1>
      {subtitle && <p className="nora-subtitle">{subtitle}</p>}
    </>
  );

  const optionList = (
    key: string,
    choices: Choice[],
    multi = false,
    max?: number,
  ) => (
    <div className="nora-options" data-testid={`options-${key}`}>
      {choices.map((choice) => (
        <ChoiceButton
          key={choice.value}
          choice={choice}
          selected={
            multi
              ? selectedMulti(key, choice.value)
              : selected(key, choice.value)
          }
          onSelect={() =>
            multi ? toggle(key, choice.value, max) : choose(key, choice.value)
          }
          testId={`choice-${key}-${choice.value}`}
          multi={multi}
        />
      ))}
    </div>
  );

  const renderWelcome = () => (
    <main className="nora-main nora-complete">
      <NoraArt />
      <p className="nora-kicker">Nora Parenting</p>
      <h1 className="nora-title">
        Let’s make the hard moments <em>easier.</em>
      </h1>
      <p className="nora-subtitle">
        A few questions will help Nora understand your family and what feels
        hardest right now.
      </p>
      <div className="nora-actions">
        <button
          type="button"
          className="nora-button nora-button-wide"
          onClick={start}
          data-testid="button-start"
        >
          Let’s start <ArrowRight size={18} />
        </button>
      </div>
      <div className="nora-helper">
        <ShieldCheck size={15} /> Built on proven behavioral science.
      </div>
    </main>
  );

  const renderStep = () => {
    switch (current) {
      case 'gender':
        return (
          <>
            {heading('Your child', 'Your child’s gender')}
            {optionList('gender', genderChoices)}
          </>
        );
      case 'name':
        return (
          <>
            {heading('Your child', 'Your child’s name')}
            <div className="nora-panel">
              <label className="nora-field-label" htmlFor="child-name">
                Your child’s name
              </label>
              <input
                id="child-name"
                className="nora-field"
                value={profile.name}
                onChange={(event) =>
                  updateProfile('name', event.target.value)
                }
                placeholder="Enter their name"
                data-testid="input-child-name"
                autoComplete="off"
              />
            </div>
          </>
        );
      case 'birth':
        return (
          <>
            {heading('Your child', "Your child's month/year of birth")}
            <div className="nora-panel">
              <div className="nora-field-row nora-field-row-birth">
                <div>
                  <label className="nora-field-label" htmlFor="birth-month">
                    Month
                  </label>
                  <select
                    id="birth-month"
                    className="nora-field"
                    value={profile.month}
                    onChange={(event) =>
                      updateProfile('month', event.target.value)
                    }
                    data-testid="select-birth-month"
                  >
                    <option value="">Month</option>
                    {[
                      'January',
                      'February',
                      'March',
                      'April',
                      'May',
                      'June',
                      'July',
                      'August',
                      'September',
                      'October',
                      'November',
                      'December',
                    ].map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="nora-field-label" htmlFor="birth-year">
                    Year
                  </label>
                  <select
                    id="birth-year"
                    className="nora-field"
                    value={profile.year}
                    onChange={(event) =>
                      updateProfile('year', event.target.value)
                    }
                    data-testid="select-birth-year"
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 8 }, (_, index) =>
                      String(new Date().getFullYear() - index),
                    ).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </>
        );
      case 'address':
        return (
          <>
            {heading('About you', 'How to address you')}
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
            {heading('About you', 'Your relationship with the child')}
            {optionList('relationship', [
              { value: 'parent', label: 'Parent' },
              { value: 'grandparent', label: 'Grandparent' },
              { value: 'family-member', label: 'Family member' },
              { value: 'caregiver', label: 'Caregiver' },
            ])}
          </>
        );
      case 'challenge':
        return (
          <>
            {heading('Right now', 'What feels hardest right now?')}
            {optionList('challenge', challengeChoices)}
          </>
        );
      case 'intro':
        return (
          <>
            <NoraArt small />
            {heading(
              'Screen-time tantrums',
              "Let's make screen-time endings easier.",
              `A few questions will help Nora understand what happens when screen time ends for ${childName}—and what skills may make those moments easier.`,
            )}
            <div className="nora-helper">
              <Clock3 size={16} /> About 2 minutes
            </div>
          </>
        );
      case 'hardest':
        return (
          <>
            {heading("What's hardest about screen time right now?", '')}
            {optionList('hardest', [
              { value: 'stop', label: `Getting ${childName} to stop` },
              { value: 'more', label: 'He keeps asking for more' },
              { value: 'upset', label: 'He gets very upset when it ends' },
              { value: 'after', label: "He won't do anything else afterward" },
              { value: 'argue', label: 'I end up arguing or yelling' },
              { value: 'battle', label: 'Screen time feels like a battle' },
            ])}
          </>
        );
      case 'stops':
        return (
          <>
            {heading("When it's time to stop, what usually happens?", '')}
            {optionList('stops', [
              { value: 'asks', label: 'He asks for more' },
              { value: 'ignores', label: 'He ignores me and keeps watching' },
              { value: 'whines', label: 'He whines or cries' },
              { value: 'meltdown', label: 'He screams or has a meltdown' },
              { value: 'hits', label: 'He hits, kicks or throws things' },
              { value: 'depends', label: 'It depends on the day' },
            ])}
          </>
        );
      case 'recover':
        return (
          <>
            {heading(`How long does ${childName} usually need to recover?`, '')}
            {optionList('recover', [
              { value: 'under-2', label: 'Less than 2 minutes' },
              { value: '2-5', label: '2–5 minutes' },
              { value: '5-15', label: '5–15 minutes' },
              { value: 'over-15', label: 'More than 15 minutes' },
            ])}
          </>
        );
      case 'education':
        return (
          <>
            {heading('A little context', 'Screen-time endings are genuinely hard for many kids.')}
            <p className="nora-copy">
              Screens are incredibly engaging. They offer rapid feedback,
              novelty and experiences children really enjoy. So when it’s
              suddenly time to stop, {childName} has to do something that’s
              still developing: pull their attention away, handle
              disappointment, and shift to something else.
            </p>
            <p className="nora-copy">
              A meltdown doesn’t necessarily mean he’s choosing to be
              difficult. Sometimes his skills simply haven’t caught up with
              the moment yet.
            </p>
          </>
        );
      case 'warning':
        return (
          <>
            {heading(`How do you usually let ${childName} know screen time is ending?`, '')}
            {optionList('warning', [
              { value: 'warning', label: 'I give him a warning' },
              { value: 'timer', label: 'I use a timer' },
              { value: 'tell', label: "I tell him it's time to stop" },
              { value: 'several', label: 'I ask several times' },
              { value: 'take', label: 'I take the device away' },
              { value: 'changes', label: 'It changes depending on the day' },
            ])}
          </>
        );
      case 'after':
        return (
          <>
            {heading(
              `When ${childName} refuses to stop, what usually happens next?`,
              '',
            )}
            <p className="nora-subtitle nora-select-note">Allow multi-select.</p>
            {optionList(
              'after',
              [
                { value: 'explain', label: 'I explain why he needs to stop' },
                { value: 'ask', label: 'I ask again' },
                { value: 'bargain', label: 'I bargain with him' },
                { value: 'more', label: 'I give him a few more minutes' },
                { value: 'threaten', label: 'I threaten a consequence' },
                { value: 'remove', label: 'I take the screen away' },
                { value: 'voice', label: 'I get frustrated or raise my voice' },
                { value: 'calm', label: 'I stay calm and hold the limit' },
              ],
              true,
            )}
          </>
        );
      case 'feeling':
        return (
          <>
            {heading('Afterward', 'How do you usually feel afterward?')}
            {optionList('feeling', [
              { value: 'drained', label: '😣 Drained' },
              { value: 'frustrated', label: '😡 Frustrated' },
              { value: 'guilty', label: '😔 Guilty' },
              { value: 'worried', label: '😟 Worried about his screen use' },
              { value: 'unsure', label: '😕 Unsure what I should have done' },
              { value: 'okay', label: '😌 Usually okay' },
            ])}
          </>
        );
      case 'reassurance':
        return (
          <>
            {heading('You’re definitely not the only one.', '')}
            <p className="nora-copy">
              Holding a boundary while your child is melting down is
              hard—especially when you’re tired too. Nora isn’t here to judge
              how you handled yesterday. We’re going to help make tomorrow’s
              hard moment easier.
            </p>
          </>
        );
      case 'desired':
        return (
          <>
            {heading(
              `If screen time could feel different, what would you most want for ${childName}?`,
              '',
            )}
            <p className="nora-subtitle nora-select-note">
              Choose up to 2.
            </p>
            {optionList(
              'desired',
              [
                { value: 'stop', label: 'Stop when screen time ends' },
                {
                  value: 'no-more',
                  label: 'Handle "no more" without melting down',
                },
                {
                  value: 'recover',
                  label: 'Recover faster when disappointed',
                },
                {
                  value: 'move',
                  label: 'Move to the next activity more easily',
                },
                { value: 'ask-less', label: 'Ask for screens less often' },
                { value: 'listen', label: 'Listen without me having to yell' },
              ],
              true,
              2,
            )}
          </>
        );
      case 'forYou':
        return (
          <>
            {heading('And for you?', '')}
            <p className="nora-subtitle nora-select-note">
              Choose up to 2.
            </p>
            {optionList(
              'forYou',
              [
                { value: 'calmer', label: 'Feel calmer' },
                { value: 'know', label: 'Know exactly what to do' },
                { value: 'repeat', label: 'Stop repeating myself' },
                { value: 'limits', label: 'Hold limits without guilt' },
                { value: 'arguments', label: 'Have fewer arguments' },
              ],
              true,
              2,
            )}
          </>
        );
      case 'skill1':
      case 'skill2':
      case 'skill3': {
        const index = Number(current.replace('skill', '')) - 1;
        const SkillIcon = skills[index].icon;
        return (
          <>
            {index === 0 &&
              heading('Look beneath the moment', 'It may not actually be about the screen.')}
            <p className="nora-copy">
              Turning off something {childName} loves can ask several
              developing skills to work together.
            </p>
            <div className="nora-skill-card">
              <SkillIcon className="nora-skill-icon" size={22} />
              <h3>{skills[index].title}</h3>
              <p>{skills[index].copy}</p>
            </div>
            {index === 2 && (
              <p className="nora-copy">
                {childName} may understand perfectly well that screen time is
                over—and still struggle to use these skills at that moment.
              </p>
            )}
          </>
        );
      }
      case 'learned':
        return (
          <>
            {heading('Here’s what we learned', `Based on what you told us, ${childName} may need the most support with:`)}
            <div className="nora-panel">
              <h3 className="nora-card-title">Frustration Tolerance</h3>
              <p className="nora-copy mt-1">
                Handling disappointment without becoming overwhelmed.
              </p>
              <h3 className="nora-card-title nora-card-title-next">
                Transitions
              </h3>
              <p className="nora-copy mt-1">
                Moving away from something he loves and into what’s next.
              </p>
            </div>
            <p className="nora-copy">
              The good news? These are skills—not fixed traits. And skills can
              be practiced.
            </p>
          </>
        );
      case 'why':
        return (
          <>
            {heading('Practice when it’s easy', 'So why not just tell me what to do during the tantrum?')}
            <p className="nora-copy">
              Because knowing what to do and being able to do it when {childName}
              is screaming and you’re frustrated are two very different things.
            </p>
          </>
        );
      case 'fiveMinutes':
        return (
          <>
            {heading('Practice when it’s easy', "That's why Nora starts with 5 calm minutes.")}
            <p className="nora-copy">
              Let {childName} choose the play. You follow his lead. Nora
              coaches you to practice small ways of responding that strengthen
              skills like:
            </p>
            <div className="nora-skill-list">
              <span>Focus</span>
              <span>Persistence</span>
              <span>Cooperation</span>
              <span>Frustration recovery</span>
            </div>
          </>
        );
      case 'scenario':
        return (
          <>
            {heading('What does playing for 5 minutes have to do with screen time?', '')}
            <div className="nora-scenario" data-testid="scenario-five-minutes">
              <div className="nora-scenario-step">
                <span>1</span>
                <strong>{childName} builds a tower.</strong>
              </div>
              <div className="nora-scenario-arrow">↓</div>
              <div className="nora-scenario-step">
                <span>2</span>
                <strong>It falls.</strong>
              </div>
              <div className="nora-scenario-arrow">↓</div>
              <div className="nora-scenario-step">
                <span>3</span>
                <strong>{childName} gets frustrated.</strong>
              </div>
            </div>
            <p className="nora-copy">
              You now have a small, safe opportunity to help {childName}: feel
              frustration, stay with it, try again, recover, persist.
            </p>
          </>
        );
      case 'record':
        return (
          <>
            {heading('Why record the 5 minutes?', '')}
            <p className="nora-copy">
              Because pressing Record puts you in practice mode.
            </p>
            <p className="nora-copy">
              Parents tell us they become more present and intentional once
              they hit Record—really trying to use the skills they’re learning.
            </p>
            <p className="nora-copy">
              And because our own patterns are hard to notice in the moment,
              Nora can show you what worked and what to practice next.
            </p>
            <div className="nora-callout">
              <p>It’s not a test. It’s your mirror.</p>
            </div>
          </>
        );
      case 'other':
        return (
          <>
            <NoraArt small />
            {heading('You’re definitely not the only one.', '')}
            <p className="nora-copy">
              Nora will help you notice the skill underneath the moment, then
              practice in a way that fits your family.
            </p>
          </>
        );
      case 'done':
        return (
          <div className="nora-complete">
            <NoraArt />
            <p className="nora-kicker">Nora Parenting</p>
            <h1 className="nora-title">
              That’s why Nora starts with <em>5 calm minutes.</em>
            </h1>
            <p className="nora-subtitle">
              Let {childName} choose the play. You follow his lead.
            </p>
            {!handoff ? (
              <div className="nora-actions">
                <button
                  type="button"
                  className="nora-button nora-button-wide"
                  onClick={() => setHandoff(true)}
                  data-testid="button-start-practice"
                >
                  Start 5 calm minutes <Play size={17} fill="currentColor" />
                </button>
              </div>
            ) : (
              <div
                className="nora-panel text-left"
                data-testid="status-practice-ready"
              >
                <p className="nora-kicker">Practice mode</p>
                <p className="nora-copy mt-0">
                  Let {childName} choose the play. You follow his lead. Nora
                  will show you what worked and what to practice next.
                </p>
                <button
                  type="button"
                  className="nora-button mt-5 w-full"
                  onClick={() => setHandoff(false)}
                  data-testid="button-reset-practice"
                >
                  I’m ready <ArrowRight size={17} />
                </button>
              </div>
            )}
            <div className="nora-helper justify-center">
              <CircleHelp size={15} /> It’s not a test. It’s your mirror.
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const continueLabel =
    current === 'intro'
      ? "Let's start"
      : current === 'education'
        ? 'That sounds familiar'
        : 'Continue';

  return (
    <div className="nora-app">
      <div className="nora-shell">
        <header className="nora-topbar">
          <span className="nora-wordmark">nora</span>
          {started && current !== 'done' && (
            <span className="nora-topbar-note">
              {stepIndex + 1} of {flow.length}
            </span>
          )}
        </header>
        {started && current !== 'done' && (
          <div
            className="nora-progress mt-5"
            aria-label={`Onboarding progress ${Math.round(progress)} percent`}
          >
            <div
              className="nora-progress-fill"
              style={{ width: `${progress}%` }}
              data-testid="progress-onboarding"
            />
          </div>
        )}
        {!started ? (
          renderWelcome()
        ) : (
          <>
            <main className="nora-main" key={current}>
              {renderStep()}
            </main>
            {current !== 'done' && (
              <footer>
                {error && (
                  <p className="nora-error text-center" data-testid="status-validation">
                    {error}
                  </p>
                )}
                <div className="nora-actions">
                  {stepIndex > 0 && (
                    <button
                      type="button"
                      className="nora-button nora-button-quiet"
                      onClick={back}
                      data-testid="button-back"
                    >
                      <ArrowLeft size={17} /> Back
                    </button>
                  )}
                  <button
                    type="button"
                    className="nora-button nora-button-wide"
                    onClick={next}
                    data-testid={`button-continue-${current}`}
                  >
                    {continueLabel} <ArrowRight size={17} />
                  </button>
                </div>
              </footer>
            )}
          </>
        )}
        <div className="nora-footer">
          Nora · a little more calm, one moment at a time
        </div>
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