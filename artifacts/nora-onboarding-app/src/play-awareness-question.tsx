import { Check, ChevronRight } from 'lucide-react';

export function PlayAwarenessQuestion({ answer, onAnswer }: { answer: string; onAnswer: (value: string) => void }) {
  return (
    <>
      <h1 className="nora-title" data-testid="text-step-title">Have you heard before that play is one of the main ways children learn?</h1>
      <div className="nora-options" data-testid="options-play-awareness">
        {[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }].map((choice) => (
          <button
            key={choice.value}
            type="button"
            className={`nora-option ${answer === choice.value ? 'is-selected' : ''}`}
            aria-pressed={answer === choice.value}
            onClick={() => onAnswer(choice.value)}
            data-testid={`choice-play-awareness-${choice.value}`}
          >
            <span className="nora-option-mark">{answer === choice.value && <Check size={14} strokeWidth={3} />}</span>
            <span className="nora-option-text">{choice.label}</span>
            <ChevronRight size={17} className="nora-option-arrow" aria-hidden="true" />
          </button>
        ))}
      </div>
    </>
  );
}
