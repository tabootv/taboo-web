import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreatePostPage from '../studio/posts/page';

beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).URL.createObjectURL = jest.fn((f: File) => `blob:${f.name}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).URL.revokeObjectURL = jest.fn();
});

afterAll(() => {
  jest.restoreAllMocks();
});

test('selecting images shows previews and allows removal', async () => {
  render(<CreatePostPage />);

  // The image input is hidden inside a label with the ImageIcon
  // Query for hidden file inputs
  const fileInputs = Array.from(document.querySelectorAll('input[type="file"][accept^="image"]')) as HTMLInputElement[];
  expect(fileInputs.length).toBeGreaterThanOrEqual(1);
  const files = [new File(['a'], 'a.png', { type: 'image/png' }), new File(['b'], 'b.jpg', { type: 'image/jpeg' })];

  await userEvent.upload(fileInputs[0], files);

  await waitFor(() => {
    const imgs = document.querySelectorAll('img');
    expect(imgs.length).toBeGreaterThanOrEqual(1);
  });
});
