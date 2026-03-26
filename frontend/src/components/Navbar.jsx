import { useEffect, useState } from 'react';
import { Sun, Moon, Accessibility } from 'lucide-react';

function Navbar() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [isColour, setisColour] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessibility') === 'active';
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    if (isColour) {
      document.documentElement.classList.add('colour');
      localStorage.setItem('accessibility', 'active'); 
    } else {
      document.documentElement.classList.remove('colour');
      localStorage.setItem('accessibility', 'standard'); 
    }
  }, [isDark, isColour]);

  const toggleTheme = () => setIsDark(!isDark);
  const toggleColour = () => setisColour(!isColour);

  return (
    <nav className="bg-gray-800 dark:bg-gray-900 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">Movie Database</h1>
        <div className="flex items-center space-x-4">
          <ul className="flex space-x-4">
            <li><a href="#" className="text-white hover:text-gray-300">Home</a></li>
            <li><a href="#" className="text-white hover:text-gray-300">Movies</a></li>
          </ul>
          <button
            onClick={toggleColour}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
            aria-label='Toggle Colour Blind Mode'
          >
            <Accessibility  size ={20} />
            <span>{isColour? "Standard Colour": "Colour blind Mode"}</span>
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;