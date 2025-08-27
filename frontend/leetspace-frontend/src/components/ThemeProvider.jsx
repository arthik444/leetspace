import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() =>
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    const root = document.documentElement;
    const isLightOnlyRoute = typeof window !== 'undefined' && (
      window.location.pathname === '/auth' ||
      window.location.pathname.startsWith('/reset-password')
    );
    root.classList.remove("light", "dark");
    root.classList.add(isLightOnlyRoute ? "light" : theme);
    if (!isLightOnlyRoute) {
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
