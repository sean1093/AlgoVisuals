import { useI18n } from '../../i18n';
import Panel from './Panel';
import FactList from './FactList';
import Rich from './Rich';

interface IdeaSectionProps {
  title: string;
  idea: string[];
  /** Optional highlighted note under the idea */
  callout?: string;
  facts: { label: string; value: string; hint?: string }[];
  soft: string;
}

/**
 * "The idea in a minute" + "At a glance" panels shown under every demo
 */
function IdeaSection({ title, idea, callout, facts, soft }: IdeaSectionProps) {
  const { t } = useI18n();
  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
      <Panel eyebrow={t.common.ideaInAMinute} title={title}>
        <div className="space-y-3 leading-relaxed text-ink-soft">
          {idea.map((p) => (
            <p key={p}>
              <Rich text={p} />
            </p>
          ))}
        </div>
        {callout && (
          <div className="mt-5 rounded-2xl p-4 text-[13px] leading-relaxed text-ink-soft" style={{ backgroundColor: soft }}>
            <Rich text={callout} />
          </div>
        )}
      </Panel>
      <Panel eyebrow={t.common.atAGlance} title={t.common.howFast}>
        <FactList facts={facts} />
      </Panel>
    </div>
  );
}

export default IdeaSection;
