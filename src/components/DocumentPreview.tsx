'use client';

import { lazy, Suspense } from 'react';
import type { ComponentProps } from 'react';

const PdfPreviewPanel = lazy(() => import('./PdfPreviewPanel'));

export default function DocumentPreview(
  props: ComponentProps<typeof PdfPreviewPanel>
) {
  return (
    <Suspense
      fallback={
        <output className="empty">
          Memuat pembaca PDF digital...
        </output>
      }
    >
      <PdfPreviewPanel {...props} />
    </Suspense>
  );
}
