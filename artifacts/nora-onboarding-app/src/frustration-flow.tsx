import { useState } from 'react';
import type { ReactNode } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { agreementChoices } from './flow-content';
import { AgreementPrompt, choiceVisual } from './visuals';

type Choice = { value: string; label: string };

export const frustrationStatements = [
  "When something doesn't go as expected, [Name] gets upset quickly.",
  '[Name] has a hard time calming down once frustrated.',
  '[Name] gives up when an activity feels difficult.',
  'Small mistakes can lead to big reactions.',
  '[Name] struggles when they have to wait or take turns.',
  '[Name] finds it hard to try again after something goes wrong.',
  '[Name] becomes upset when asked to stop or change an activity they enjoy.',
];

const behaviorChoices: Choice[] = [
  { value: 'upset', label: 'Gets upset, cries, or becomes angry' },
  { value: 'cant', label: 'Says things like “I can\'t do it” or “I\'m no good at this”' },
  { value: 'reassurance', label: 'Looks to me for reassurance or help' },
  { value: 'stops', label: 'Stops participating or walks away' },
  { value: 'briefly', label: 'Gets upset briefly, then moves on' },
];

const strategyChoices: Choice[] = [
  { value: 'comfort', label: 'Comforting and reassuring them' },
  { value: 'encourage', label: 'Encouraging them to try again' },
  { value: 'solve', label: 'Helping them solve the problem' },
  { value: 'space', label: 'Giving them time and space to calm down' },
  { value: 'distract', label: 'Distracting them or moving on to something else' },
  { value: 'nothing', label: 'Nothing seems to work consistently' },
];

const workedChoices: Choice[] = [
  { value: 'improvement', label: 'Some improvement' },
  { value: 'sometimes', label: 'Helps only sometimes' },
  { value: 'change', label: 'No real change' },
  { value: 'harder', label: 'It’s getting harder' },
];

const differenceChoices: Choice[] = [
  { value: 'none', label: 'None that I know of' },
  { value: 'developmental-delays', label: 'Developmental delays' },
  { value: 'adhd', label: 'ADHD' },
  { value: 'asd', label: 'Autism spectrum disorder (ASD)' },
  { value: 'anxiety', label: 'Anxiety' },
  { value: 'another', label: 'Another difference not listed here' },
  { value: 'suspect', label: 'I suspect one of these, but there is no diagnosis yet' },
];

export type FrustrationStep =
  | 'f-intro'
  | `f-assessment-${number}`
  | 'f-behavior'
  | 'f-strategies'
  | 'f-worked'
  | 'f-temperament'
  | 'f-growth'
  | 'f-support'
  | 'f-differences'
  | 'f-play'
  | 'f-nora'
  | 'f-plan';

export const frustrationSteps: FrustrationStep[] = [
  'f-intro',
  ...frustrationStatements.map((_, i) => `f-assessment-${i}` as FrustrationStep),
  'f-behavior',
  'f-strategies',
  'f-worked',
  'f-temperament',
  'f-growth',
  'f-support',
  'f-differences',
  'f-play',
  'f-nora',
  'f-plan',
];

export const frustrationInsightSteps: string[] = ['f-intro', 'f-temperament', 'f-growth', 'f-support', 'f-play', 'f-nora', 'f-plan'];

export const frustrationCtaLabels: Record<string, string> = {
  'f-intro': "Let's start",
  'f-temperament': 'What does this mean for us?',
  'f-growth': 'How can I help?',
  'f-support': 'Where do we start?',
  'f-play': 'How does Nora help?',
  'f-nora': "Create my child's plan",
};

export type FrustrationAnswers = {
  ratings: Record<string, string>;
  behavior: string[];
  strategies: string[];
  worked: string;
  differences: string[];
};

export const emptyFrustrationAnswers: FrustrationAnswers = {
  ratings: {},
  behavior: [],
  strategies: [],
  worked: '',
  differences: [],
};

export function isFrustrationStep(step: string): step is FrustrationStep {
  return step.startsWith('f-');
}

export function frustrationHasAnswer(step: string, a: FrustrationAnswers) {
  if (step.startsWith('f-assessment-')) return Boolean(a.ratings[step]);
  if (step === 'f-behavior') return a.behavior.length > 0;
  if (step === 'f-strategies') return a.strategies.length > 0;
  if (step === 'f-differences') return a.differences.length > 0;
  if (step === 'f-worked') return Boolean(a.worked);
  return true;
}

function Option({ choice, selected, multi, onSelect, testId, visual }: { choice: Choice; selected: boolean; multi?: boolean; onSelect: () => void; testId: string; visual?: ReactNode }) {
  return (
    <button type="button" className={`nora-option ${selected ? 'is-selected' : ''}`} onClick={onSelect} aria-pressed={selected} data-testid={testId}>
      <span className={`nora-option-mark ${multi ? 'is-check' : ''}`}>{selected && <Check size={14} strokeWidth={3} />}</span>
      {visual}
      <span className="nora-option-text">{choice.label}</span>
      <ChevronRight size={17} className="nora-option-arrow" aria-hidden="true" />
    </button>
  );
}

function PlanCta() {
  const [notice, setNotice] = useState(false);
  return (
    <div className="nora-actions" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <button type="button" className="nora-button nora-button-wide" onClick={() => setNotice(true)} data-testid="button-create-account">
        Create my account
      </button>
      {notice && (
        <p className="nora-copy" role="status" style={{ marginTop: 4 }} data-testid="status-account-not-connected">
          Account creation is not connected yet, so no account has been created.
        </p>
      )}
    </div>
  );
}

export function FrustrationScreen({
  step,
  childName,
  answers,
  setAnswers,
  clearInvalid,
  art,
}: {
  step: FrustrationStep;
  childName: string;
  answers: FrustrationAnswers;
  setAnswers: (updater: (prev: FrustrationAnswers) => FrustrationAnswers) => void;
  clearInvalid: () => void;
  art: (small?: boolean) => ReactNode;
}) {
  const n = (text: string) => text.replaceAll('[Name]', childName);
  const title = (text: string) => <h1 className="nora-title" data-testid="text-step-title">{text}</h1>;

  const single = (key: 'worked', choices: Choice[]) => (
    <div className="nora-options" data-testid={`options-${step}`}>
      {choices.map((c) => (
        <Option key={c.value} choice={c} selected={answers[key] === c.value} testId={`choice-${step}-${c.value}`} visual={choiceVisual(step, c.value)}
          onSelect={() => { setAnswers((p) => ({ ...p, [key]: c.value })); clearInvalid(); }} />
      ))}
    </div>
  );

  const multi = (key: 'behavior' | 'strategies' | 'differences', choices: Choice[]) => (
    <div className="nora-options" data-testid={`options-${step}`}>
      {choices.map((c) => (
        <Option key={c.value} multi choice={c} selected={answers[key].includes(c.value)} testId={`choice-${step}-${c.value}`}
          onSelect={() => {
            setAnswers((p) => {
              const ex = p[key];
              let next = ex.includes(c.value) ? ex.filter((v) => v !== c.value) : [...ex, c.value];
              if (key === 'differences' && !ex.includes(c.value)) {
                next = c.value === 'none' ? ['none'] : next.filter((v) => v !== 'none');
              }
              return { ...p, [key]: next };
            });
            clearInvalid();
          }} />
      ))}
    </div>
  );

  if (step.startsWith('f-assessment-')) {
    const statement = frustrationStatements[Number(step.split('-')[2])];
    return (
      <>
        <AgreementPrompt />
        {title(n(statement))}
        <div className="nora-options" data-testid={`options-${step}`}>
          {agreementChoices.map((c) => (
            <Option key={c.value} choice={c} selected={answers.ratings[step] === c.value} testId={`choice-${step}-${c.value}`}
              onSelect={() => { setAnswers((p) => ({ ...p, ratings: { ...p.ratings, [step]: c.value } })); clearInvalid(); }} />
          ))}
        </div>
      </>
    );
  }

  switch (step) {
    case 'f-intro':
      return (
        <>
          {art(true)}
          {title('Big feelings over little things?')}
          <div className="nora-insight-body">
            <p className="nora-copy">When things don't go the way {childName} expects, even a small setback can turn into <strong className="nora-highlight">tears, anger, or giving up.</strong> It can be exhausting trying to figure out whether to comfort, encourage, step in, or give space.</p>
            <div className="nora-insight-callout"><p className="nora-copy"><strong>Let's understand what happens for {childName} and discover what might help.</strong></p></div>
          </div>
        </>
      );
    case 'f-behavior':
      return <>{title('When something goes wrong, what usually happens?')}<p className="nora-copy">Select all that apply.</p>{multi('behavior', behaviorChoices)}</>;
    case 'f-strategies':
      return <>{title(`What have you tried to help ${childName} when they get frustrated?`)}<p className="nora-copy">Select all that apply.</p>{multi('strategies', strategyChoices)}</>;
    case 'f-worked':
      return <>{title('How well have those approaches worked?')}{single('worked', workedChoices)}</>;
    case 'f-temperament':
      return (
        <>
          {title('Have you heard of temperament?')}
          <div className="nora-insight-body">
            <p className="nora-copy">Every child has a natural way of responding to the world. <strong className="nora-highlight">These differences are part of temperament.</strong> Some children feel emotions more intensely. Others find it harder to adapt when things don't go as expected or take longer to settle after becoming upset. These differences can influence how children respond to frustration.</p>
            <div className="nora-insight-callout"><p className="nora-copy"><strong>It's not your child's fault, and it's not your fault either.</strong></p></div>
          </div>
        </>
      );
    case 'f-growth':
      return (
        <>
          {title("Your child's temperament may make frustration harder to handle, but it doesn't determine how they'll respond forever.")}
          <div className="nora-insight-body">
            <div className="nora-insight-callout"><p className="nora-copy"><strong>Frustration tolerance is a skill that can grow with practice.</strong> With your support, {childName} can learn to handle disappointment, work through challenges, and recover when things go wrong.</p></div>
          </div>
        </>
      );
    case 'f-support':
      return (
        <>
          {title("You don't have to change who your child is. You can help them build new skills.")}
          <div className="nora-insight-body">
            <div className="nora-insight-callout"><p className="nora-copy">Small challenges, with your support, help {childName} practise <strong>handling disappointment, trying again, and working through frustration.</strong></p></div>
          </div>
        </>
      );
    case 'f-differences':
      return <>{title(`Does ${childName} have any learning or thinking differences?`)}<p className="nora-copy">Select all that apply.</p>{multi('differences', differenceChoices)}</>;
    case 'f-play':
      return (
        <>
          {title('Why start with play?')}
          <div className="nora-insight-body">
            <p className="nora-copy"><strong className="nora-highlight">Play helps children learn naturally.</strong></p>
            <div className="nora-insight-callout"><p className="nora-copy">We'll build {childName}'s frustration skills through play, then apply them to everyday challenges, including discipline.</p></div>
          </div>
        </>
      );
    case 'f-nora':
      return (
        <>
          {art(true)}
          {title('How Nora helps:')}
          <div className="nora-insight-body">
            <p className="nora-copy">Nora listens to your real play sessions, helps you recognise what you're doing well, and coaches you on <strong className="nora-highlight">one small skill to practise next.</strong></p>
            <div className="nora-insight-callout"><p className="nora-copy">As you grow more confident, we'll help you apply these skills to everyday challenges.</p></div>
          </div>
        </>
      );
    case 'f-plan':
      return (
        <div className="nora-complete">
          {art()}
          {title(`${childName}'s Nora Plan`)}
          <div className="nora-plan" data-testid="text-frustration-plan">
            <p><span className="nora-kicker" style={{ display: 'block', marginBottom: 6 }}>YOUR GOAL</span>Help {childName} handle frustration, recover from setbacks, and keep trying when things get hard.</p>
            <p>
              <span className="nora-kicker" style={{ display: 'block', marginBottom: 6 }}>WHAT WE'LL FOCUS ON</span>
              <span className="nora-plan-line">- Understanding and handling big feelings</span>
              <span className="nora-plan-line">- Coping with disappointment and mistakes</span>
              <span className="nora-plan-line">- Practising how to recover when things go wrong</span>
            </p>
            <p><span className="nora-kicker" style={{ display: 'block', marginBottom: 6 }}>YOUR FIRST STEP</span>Start with five minutes of guided play. Nora will help you practise one skill at a time.</p>
            <p>Your first three recordings are free. No payment required to start.</p>
          </div>
          <PlanCta />
        </div>
      );
    default:
      return null;
  }
}
