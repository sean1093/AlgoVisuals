import { Fragment } from 'react';

/**
 * Renders translated text where **double asterisks** mark emphasis
 */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
        i % 2 ? (
          <b key={i} className="font-semibold text-ink">
            {part}
          </b>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  );
}

export default Rich;
