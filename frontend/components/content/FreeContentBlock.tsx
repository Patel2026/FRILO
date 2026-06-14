import { FreeContentBlockData, RichTextNode } from '@/lib/publicContent';
import { cn } from '@/lib/utils';
import { RichContentRenderer } from './RichContentRenderer';

function richDocument(value: unknown): RichTextNode | null {
  if (value && typeof value === 'object' && !Array.isArray(value) && 'type' in value) {
    return value as RichTextNode;
  }

  return null;
}

export function FreeContentBlock({ block }: { block: FreeContentBlockData }) {
  const tone = typeof block.settings.tone === 'string' ? block.settings.tone : 'light';
  const baseClass = cn(
    'mx-auto my-8 max-w-7xl px-5 sm:px-6 lg:px-8',
    tone === 'dark' && 'bg-slate-950 py-8 text-white',
  );

  if (block.layout === 'two_columns') {
    return (
      <section className={baseClass}>
        <div className="grid gap-6 border-y border-slate-200 py-8 md:grid-cols-2">
          <RichContentRenderer document={richDocument(block.content.left)} />
          <RichContentRenderer document={richDocument(block.content.right)} />
        </div>
      </section>
    );
  }

  if (block.layout === 'media_text') {
    const mediaLabel = typeof block.content.media_label === 'string' ? block.content.media_label : 'FRILO';

    return (
      <section className={baseClass}>
        <div className="grid gap-6 border-y border-slate-200 py-8 md:grid-cols-[0.72fr_1.28fr] md:items-center">
          <div className="flex aspect-[4/3] items-center justify-center bg-slate-100 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
            {mediaLabel}
          </div>
          <RichContentRenderer document={richDocument(block.content.body)} />
        </div>
      </section>
    );
  }

  return (
    <section className={baseClass}>
      <div className="border-y border-slate-200 py-8">
        <RichContentRenderer document={richDocument(block.content.body)} />
      </div>
    </section>
  );
}
