import type { DocumentSummary } from '@/lib/loadData';


const TONES = ['tertiary-container', 'secondary-container', 'primary-container'] as const;
export function badgeStyle(doc: DocumentSummary, index: number) {
  if (doc.background) return `--badge-bg:${doc.background};--badge-fg:#fff`;
  const tone = TONES[index % TONES.length];
  return `--badge-bg:var(--pastel-${tone});--badge-fg:var(--pastel-on-${tone})`;
}