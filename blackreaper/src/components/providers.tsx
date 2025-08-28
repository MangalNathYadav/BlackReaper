'use client';

import { NextUIProvider } from '@heroui/react';
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      <ThemeProvider
        attribute="data-mode"
        defaultTheme="human"
        themes={['human', 'ghoul']}
        enableSystem={false}
      >
        {children}
      </ThemeProvider>
    </NextUIProvider>
  );
}
