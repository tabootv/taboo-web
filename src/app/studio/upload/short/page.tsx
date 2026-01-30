'use client';

import { UploadWizard } from '../_components/UploadWizard';
import { SHORT_CONFIG } from '../_config/short.config';

export default function UploadShortPage() {
  return <UploadWizard config={SHORT_CONFIG} />;
}
