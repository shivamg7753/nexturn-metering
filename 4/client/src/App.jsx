import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { createAppRouter } from './routes';
import './App.css';

/**
 * Main Application Component
 * Manages theme state and provides router
 */
function App() {
  // Initialize theme from localStorage, default to 'dark' if not set
  const [themeMode, setThemeMode] = useState(() => {
    const savedTheme = localStorage.getItem('themeMode');
    return savedTheme || 'dark';
  });

  // Update data-theme attribute for CSS variables and save to localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  const handleThemeToggle = () => {
    setThemeMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Create router with theme props
  const router = createAppRouter(themeMode, handleThemeToggle);

  return <RouterProvider router={router} />;
}

export default App;
