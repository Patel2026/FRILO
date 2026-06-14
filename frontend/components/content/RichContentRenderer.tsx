import Link from 'next/link';
import { Fragment, ReactNode } from 'react';
import { RichTextMark, RichTextNode, cleanPublicUrl } from '@/lib/publicContent';
import { cn } from '@/lib/utils';

function renderMarks(children: ReactNode, marks: RichTextMark[] = []): ReactNode {
  return marks.reduce<ReactNode>((content, mark) => {
    if (mark.type === 'bold') {
      return <strong>{content}</strong>;
    }

    if (mark.type === 'italic') {
      return <em>{content}</em>;
    }

    if (mark.type === 'link') {
      const href = cleanPublicUrl(mark.attrs?.href, '#');
      const isInternal = href.startsWith('/');

      if (isInternal) {
        return <Link href={href} className="font-black underline underline-offset-4">{content}</Link>;
      }

      return (
        <a href={href} className="font-black underline underline-offset-4" rel="noreferrer" target="_blank">
          {content}
        </a>
      );
    }

    return content;
  }, children);
}

function renderChildren(nodes: RichTextNode[] | undefined): ReactNode {
  if (!Array.isArray(nodes) || nodes.length === 0) {
    return null;
  }

  return nodes.map((node, index) => (
    <Fragment key={`${node.type}-${index}`}>
      {renderNode(node, index)}
    </Fragment>
  ));
}

function renderNode(node: RichTextNode, index: number): ReactNode {
  if (node.type === 'text') {
    return renderMarks(node.text ?? '', node.marks);
  }

  if (node.type === 'paragraph') {
    return <p key={index}>{renderChildren(node.content)}</p>;
  }

  if (node.type === 'heading') {
    const level = node.attrs?.level ?? 2;
    const className = 'font-black tracking-tight text-slate-950';

    if (level === 4) {
      return <h4 key={index} className={cn(className, 'text-lg')}>{renderChildren(node.content)}</h4>;
    }

    if (level === 3) {
      return <h3 key={index} className={cn(className, 'text-xl')}>{renderChildren(node.content)}</h3>;
    }

    return <h2 key={index} className={cn(className, 'text-2xl')}>{renderChildren(node.content)}</h2>;
  }

  if (node.type === 'bullet_list') {
    return <ul key={index}>{renderChildren(node.content)}</ul>;
  }

  if (node.type === 'ordered_list') {
    return <ol key={index}>{renderChildren(node.content)}</ol>;
  }

  if (node.type === 'list_item') {
    return <li key={index}>{renderChildren(node.content)}</li>;
  }

  if (node.type === 'table') {
    return (
      <div key={index} className="overflow-x-auto">
        <table>
          <tbody>{renderChildren(node.content)}</tbody>
        </table>
      </div>
    );
  }

  if (node.type === 'table_row') {
    return <tr key={index}>{renderChildren(node.content)}</tr>;
  }

  if (node.type === 'table_cell') {
    return <td key={index}>{renderChildren(node.content)}</td>;
  }

  return null;
}

export function RichContentRenderer({
  document,
  className,
}: {
  document: RichTextNode | null | undefined;
  className?: string;
}) {
  if (!document || document.type !== 'doc') {
    return null;
  }

  return (
    <div className={cn(
      'space-y-4 text-sm leading-7 text-slate-600 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_table]:min-w-full [&_table]:border-collapse [&_td]:border [&_td]:border-slate-200 [&_td]:p-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5',
      className,
    )}>
      {renderChildren(document.content)}
    </div>
  );
}
