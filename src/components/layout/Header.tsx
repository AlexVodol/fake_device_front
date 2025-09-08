import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Fake Device
        </Link>
        <nav>
          <ul className="flex space-x-6 items-center">
            <li>
              <Link to="/devices" className="hover:text-gray-300 transition-colors">
                Devices
              </Link>
            </li>
            <li>
              <a 
                href="http://localhost:8000/api/docs#/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                API
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
