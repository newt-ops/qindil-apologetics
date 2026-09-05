import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
};

const applyThemeToDOM = (theme: Theme) => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: getInitialTheme(),
      toggleTheme: () => {
        const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
        applyThemeToDOM(nextTheme);
        set({ theme: nextTheme });
      },
      setTheme: (theme: Theme) => {
        applyThemeToDOM(theme);
        set({ theme });
      },
    }),
    {
      name: 'qindil-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyThemeToDOM(state.theme);
        } else {
          applyThemeToDOM(getInitialTheme());
        }
      },
    }
  )
);

// Apply initial DOM state on module load
if (typeof window !== 'undefined') {
  const storedTheme = localStorage.getItem('qindil-theme');
  if (storedTheme) {
    try {
      const parsed = JSON.parse(storedTheme);
      if (parsed?.state?.theme) {
        applyThemeToDOM(parsed.state.theme);
      } else {
        applyThemeToDOM(getInitialTheme());
      }
    } catch {
      applyThemeToDOM(getInitialTheme());
    }
  } else {
    applyThemeToDOM(getInitialTheme());
  }
}
