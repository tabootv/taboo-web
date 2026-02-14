'use client';

import { createContext, useContext } from 'react';

export const DetailActiveContext = createContext({
  isActive: false,
  setActive: (_active: boolean) => {},
});

export function useDetailActive() {
  return useContext(DetailActiveContext);
}
