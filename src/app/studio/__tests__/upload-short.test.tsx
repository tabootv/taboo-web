import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UploadShortPage from '../studio/upload/short/page';

beforeAll(() => {
  (global as any).URL.createObjectURL = jest.fn(() => 'blob:short-preview');
  (global as any).URL.revokeObjectURL = jest.fn();
});

afterAll(() => {
  jest.restoreAllMocks();
});

test('short selection shows preview', async () => {
  render(<UploadShortPage />);

  // Find label by the prompt text
  const label = screen.getByText(/Drag and drop your short video here/i).closest('label');
  expect(label).toBeTruthy();
  const input = label!.querySelector('input[type="file"]') as HTMLInputElement;
  expect(input).toBeTruthy();

  const file = new File(['dummy'], 'short.mp4', { type: 'video/mp4' });
  await userEvent.upload(input, file);

  await waitFor(() => {
    const video = document.querySelector('video');
    expect(video).toBeTruthy();
  });
});
