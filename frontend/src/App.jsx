import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { useState, useEffect } from 'react';

function App() {
  const [fontScale, setFontScale] = useState(1);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', fontScale);
  }, [fontScale]);

  useEffect(() => {
    window.setFontScale = setFontScale;
  }, []);

  return <RouterProvider router={router} />;
}

export default App;