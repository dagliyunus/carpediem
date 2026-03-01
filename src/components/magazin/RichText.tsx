import { Fragment } from 'react';
import { slugify } from '@/lib/cms/content';

type HeadingBlock = {
  type: 'heading';
  level: number;
  text: string;
  id: string;
};

type ParagraphBlock = {
  type: 'paragraph';
  text: string;
};

type ListBlock = {
  type: 'list';
  items: string[];
};

type RichTextBlock = HeadingBlock | ParagraphBlock | ListBlock;

function normalizeText(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

export function parseMagazinRichText(content: string): RichTextBlock[] {
  const lines = content.split('\n');
  const blocks: RichTextBlock[] = [];
  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];

  const flushParagraph = () => {
    const text = normalizeText(paragraphBuffer.join(' '));
    if (text) {
      blocks.push({ type: 'paragraph', text });
    }
    paragraphBuffer = [];
  };

  const flushList = () => {
    const items = listBuffer.map((item) => normalizeText(item)).filter(Boolean);
    if (items.length > 0) {
      blocks.push({ type: 'list', items });
    }
    listBuffer = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      const text = normalizeText(headingMatch[2]);
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        text,
        id: slugify(text),
      });
      continue;
    }

    const listMatch = line.match(/^[-*]\s+(.+)$/);
    if (listMatch) {
      flushParagraph();
      listBuffer.push(listMatch[1]);
      continue;
    }

    flushList();
    paragraphBuffer.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}

export function extractMagazinHeadings(content: string) {
  return parseMagazinRichText(content).filter((block): block is HeadingBlock => block.type === 'heading');
}

function renderInlineText(text: string) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g).filter(Boolean);

  return parts.map((part, index) => {
    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (!match) {
      return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
    }

    return (
      <a
        key={`${match[2]}-${index}`}
        href={match[2]}
        className="text-primary-300 underline decoration-primary-400/40 underline-offset-4"
      >
        {match[1]}
      </a>
    );
  });
}

export function MagazinRichText({
  content,
  className = '',
}: {
  content: string;
  className?: string;
}) {
  const blocks = parseMagazinRichText(content);

  return (
    <div className={className}>
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          if (block.level === 1) {
            return (
              <h2 key={`${block.id}-${index}`} id={block.id} className="text-3xl font-semibold leading-tight text-white">
                {block.text}
              </h2>
            );
          }

          return (
            <h3
              key={`${block.id}-${index}`}
              id={block.id}
              className="text-2xl font-semibold leading-tight text-white"
            >
              {block.text}
            </h3>
          );
        }

        if (block.type === 'list') {
          return (
            <ul key={`list-${index}`} className="space-y-2 pl-5 text-accent-100">
              {block.items.map((item) => (
                <li key={item} className="list-disc">
                  {renderInlineText(item)}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={`paragraph-${index}`} className="leading-8 text-accent-100">
            {renderInlineText(block.text)}
          </p>
        );
      })}
    </div>
  );
}
