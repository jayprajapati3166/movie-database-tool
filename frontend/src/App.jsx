import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';

function App() {
  return (
    <div className="min-h-screen transition-colors duration-300">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;