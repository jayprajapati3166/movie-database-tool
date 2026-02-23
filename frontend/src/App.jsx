import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;