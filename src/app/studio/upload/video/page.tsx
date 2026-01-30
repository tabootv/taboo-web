'use client';

import { UploadWizard } from '../_components/UploadWizard';
import { VIDEO_CONFIG } from '../_config/video.config';

export default function UploadVideoPage() {
  return <UploadWizard config={VIDEO_CONFIG} />;
}
