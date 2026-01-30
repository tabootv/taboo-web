'use client';

import { UploadForm, SHORT_UPLOAD_CONFIG, ShortsTipsBanner } from '../../_components/UploadForm';

export default function UploadShortPage() {
  return <UploadForm config={SHORT_UPLOAD_CONFIG} tipsBanner={<ShortsTipsBanner />} />;
}
