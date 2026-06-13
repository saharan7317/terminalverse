// TerminalVerse — Terminal Output Component

import type { CommandOutput } from '../../types/commands';
import { colorize } from '../../utils/ansiColors';

interface TerminalOutputProps {
  outputs: CommandOutput[];
}

export default function TerminalOutput({ outputs }: TerminalOutputProps) {
  return (
    <div className="terminal-output-block">
      {outputs.map((output, index) => (
        <OutputLine key={index} output={output} />
      ))}
    </div>
  );
}

function OutputLine({ output }: { output: CommandOutput }) {
  switch (output.type) {
    case 'text':
      return (
        <div className="output-line output-text">
          <pre>{output.content}</pre>
        </div>
      );

    case 'html':
      return (
        <div
          className="output-line output-html"
          dangerouslySetInnerHTML={{ __html: formatContent(output.content) }}
        />
      );

    case 'ascii':
      return (
        <div className="output-line output-ascii">
          <pre dangerouslySetInnerHTML={{ __html: output.content }} />
        </div>
      );

    case 'error':
      return (
        <div className="output-line output-error">
          <pre
            dangerouslySetInnerHTML={{
              __html: `\n  ${colorize('✗', 'error')} ${colorize(output.content, 'error')}\n`,
            }}
          />
        </div>
      );

    case 'system':
      // System messages are handled by the Terminal component
      return null;

    case 'break':
      return <div className="output-break" />;

    default:
      return (
        <div className="output-line">
          <pre>{output.content}</pre>
        </div>
      );
  }
}

function formatContent(content: string): string {
  // Wrap in pre to preserve whitespace, but allow HTML inside
  return `<pre class="output-pre">${content}</pre>`;
}
