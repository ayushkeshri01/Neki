"use client";

import * as React from "react";
import { useServerInsertedHTML } from "next/navigation";

type Theme = "light" | "dark" | "system";

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  storageKey?: string;
  themes?: string[];
  forcedTheme?: string;
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  forcedTheme?: string;
  resolvedTheme?: "light" | "dark";
  themes: string[];
  systemTheme?: "light" | "dark";
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

function getThemeInitScript(
  storageKey: string,
  defaultTheme: Theme,
  themes: string[],
  attribute: string,
  enableSystem: boolean,
) {
  const themesJson = JSON.stringify(themes);
  return `(function(){try{var t=localStorage.getItem('${storageKey}')||'${defaultTheme}';var r=t;if(t==='system'&&${enableSystem}){r=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'}var d=document.documentElement;if('${attribute}'==='class'){d.classList.remove.apply(d.classList,${themesJson});d.classList.add(r)}else{d.setAttribute('${attribute}',r)}d.style.colorScheme=r}catch(e){}})()`;
}

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = false,
  storageKey = "theme",
  themes = ["light", "dark"],
  forcedTheme,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">("light");
  const [systemTheme, setSystemTheme] = React.useState<"light" | "dark">("light");

  useServerInsertedHTML(() => (
    <script
      key="next-themes-init"
      dangerouslySetInnerHTML={{
        __html: getThemeInitScript(storageKey, defaultTheme, themes, attribute, enableSystem),
      }}
    />
  ));

  const applyTheme = React.useCallback(
    (newTheme: Theme) => {
      const resolved = newTheme === "system" ? systemTheme : (newTheme as "light" | "dark");
      const root = document.documentElement;

      if (attribute === "class") {
        root.classList.remove(...themes);
        root.classList.add(resolved);
      } else {
        root.setAttribute(attribute, resolved);
      }

      root.style.colorScheme = resolved;
    },
    [attribute, themes, systemTheme],
  );

  const setTheme = React.useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch {}
      applyTheme(newTheme);
    },
    [storageKey, applyTheme],
  );

  React.useEffect(() => {
    const stored = (() => {
      try {
        return localStorage.getItem(storageKey) as Theme | null;
      } catch {
        return null;
      }
    })();

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const sysTheme = mql.matches ? "dark" : "light";
    setSystemTheme(sysTheme);

    const initial = stored || defaultTheme;
    setThemeState(initial);

    const resolved = initial === "system" ? sysTheme : (initial as "light" | "dark");
    setResolvedTheme(resolved);

    const handleChange = (e: MediaQueryListEvent) => {
      const newSys = e.matches ? "dark" : "light";
      setSystemTheme(newSys);
    };

    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  React.useEffect(() => {
    if (theme === "system") {
      setResolvedTheme(systemTheme);
    }
  }, [systemTheme, theme]);

  React.useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        setTheme(e.newValue as Theme);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [storageKey, setTheme]);

  const contextValue = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      forcedTheme,
      resolvedTheme,
      themes: enableSystem ? [...themes, "system"] : themes,
      systemTheme,
    }),
    [theme, setTheme, forcedTheme, resolvedTheme, themes, enableSystem, systemTheme],
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext);
  if (!context) {
    return {
      theme: "system",
      setTheme: () => {},
      themes: ["light", "dark"],
    };
  }
  return context;
}
