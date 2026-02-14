import Link from 'next/link';

const MENTION_REGEX = /@(\w+)/g;

interface MentionTextProps {
  content: string;
}

export function MentionText({ content }: MentionTextProps) {
  const parts = content.split(/@(\w+)/);

  return (
    <span className="whitespace-pre-wrap break-words">
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <Link
            key={`${index}-${part}`}
            href={`/profile/${part}`}
            className="bg-red-primary/10 text-red-primary px-0.5 rounded hover:underline"
          >
            @{part}
          </Link>
        ) : (
          <span key={`${index}-${part}`}>{part}</span>
        )
      )}
    </span>
  );
}

// Export regex for potential reuse
export { MENTION_REGEX };
