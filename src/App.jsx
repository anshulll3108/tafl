import { useState } from 'react';
import CFGSimulator from './components/CFGSimulator';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-light-bg dark:bg-slate-950 transition-colors duration-300">
        <CFGSimulator />
      </div>
    </ThemeProvider>
  );
}

export default App;
