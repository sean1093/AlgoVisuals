import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

function Navbar() {
  return (
    <nav className="bg-white border-b-2 border-borderGray shadow-soft">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Home size={24} className="text-borderBlue" />
            <span className="text-xl font-bold">Algorithm Canvas</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
