import { ReactNode } from 'react';
import { Check } from 'lucide-react';

export interface GuideStep {
  title: ReactNode;
  detail?: ReactNode;
  done: boolean;
}

interface GuideStepsProps {
  steps: GuideStep[];
  accent: string;
}

/**
 * A short "try this" checklist that ticks itself off as the visitor plays
 */
function GuideSteps({ steps, accent }: GuideStepsProps) {
  const current = steps.findIndex((s) => !s.done);

  return (
    <ol className="space-y-4">
      {steps.map((step, i) => {
        const active = i === current;
        return (
          <li key={i} className="flex gap-3.5">
            <span
              className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-300 ${
                step.done ? 'text-white' : active ? 'border-2 bg-card' : 'border border-line bg-card text-ink-mute'
              }`}
              style={
                step.done
                  ? { backgroundColor: accent }
                  : active
                    ? { borderColor: accent, color: accent }
                    : undefined
              }
            >
              {step.done ? <Check size={14} strokeWidth={3} /> : i + 1}
            </span>
            <div className={`transition-opacity duration-300 ${!step.done && !active ? 'opacity-55' : ''}`}>
              <p className={`text-sm font-medium ${step.done ? 'text-ink-mute line-through decoration-line-strong' : 'text-ink'}`}>
                {step.title}
              </p>
              {step.detail && active && <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{step.detail}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default GuideSteps;
