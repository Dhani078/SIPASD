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
        <div className="empty" role="status">
          Memuat pembaca PDF digital...
        </div>
      }
    >
      <PdfPreviewPanel {...props} />
    </Suspense>
  );
}
