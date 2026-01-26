import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UploadVideoPage from '../studio/upload/video/page';

beforeAll(() => {
  (global as any).URL.createObjectURL = jest.fn(() => 'blob:video-preview');
  (global as any).URL.revokeObjectURL = jest.fn();
});

afterAll(() => {
  jest.restoreAllMocks();
});

test('video selection shows preview and remove revokes URL', async () => {
  render(<UploadVideoPage />);

  // The file input is hidden inside the label; find the label by its prompt text
  const label = screen.getByText(/Drag and drop your video here/i).closest('label');
  expect(label).toBeTruthy();
  const input = label!.querySelector('input[type="file"]') as HTMLInputElement;
  expect(input).toBeTruthy();

  const file = new File(['dummy'], 'clip.mp4', { type: 'video/mp4' });
  await userEvent.upload(input, file);

  // preview video element should appear
  await waitFor(() => {
    const video = screen.getByRole('video') || document.querySelector('video');
    expect(video).toBeTruthy();
  });

  // click remove button (the X in the video preview)
  const removeBtn =
    document.querySelector('button[aria-label]') || document.querySelector('button');
  if (removeBtn) userEvent.click(removeBtn as Element);

  expect(URL.revokeObjectURL).toHaveBeenCalled();
});
re;
