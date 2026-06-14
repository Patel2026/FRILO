import { ReactNode } from 'react';
import { PublicContentResponse, getBlocksForAnchor } from '@/lib/publicContent';
import { FreeContentBlock } from './FreeContentBlock';

export function ProtectedSectionRenderer({
  content,
  anchor,
  children,
}: {
  content: PublicContentResponse;
  anchor: string;
  children: ReactNode;
}) {
  const blocks = getBlocksForAnchor(content, anchor);

  return (
    <>
      {children}
      {blocks.map((block) => (
        <FreeContentBlock key={block.id} block={block} />
      ))}
    </>
  );
}
