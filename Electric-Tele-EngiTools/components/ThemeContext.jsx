import { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext();

const THEME_KEY = "APP_THEME_MODE";

export const ThemeProvider = ({ children }) => {
  const systemTheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemTheme === "dark");

  // Load stored theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_KEY);
        if (savedTheme) {
          setIsDarkMode(savedTheme === "dark");
        } else {
          setIsDarkMode(systemTheme === "dark");
        }
      } catch (error) {
        console.error("Error loading theme:", error);
      }
    };
    loadTheme();
  }, [systemTheme]);

  // Toggle theme and persist in AsyncStorage
  const toggleTheme = async () => {
    const newTheme = !isDarkMode ? "dark" : "light";
    await AsyncStorage.setItem(THEME_KEY, newTheme);
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
