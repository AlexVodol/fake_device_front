import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import RfidDevices from './RfidDevicesPage';

type Photo = {
  id: number;
  file_name: string;
  content_type: string;
  created_at: string;
};

type Regula = {
  id: number;
  name: string;
  last_name: string;
  first_name: string;
  middle_name: string;
  birth_date: string;
  issue_date: string;
  series: string;
  number: string;
  department_code: string;
  issued_by: string;
  birth_place: string;
  gender: string;
  photo_id: number;
  created_at: string;
  updated_at: string;
  photo: Photo;
};

type ApiResponse = {
  items: Regula[];
  total: number;
  skip: number;
  limit: number;
};

// Use the current hostname and port 8000 for the API
const API_URL = `${window.location.protocol}//${window.location.hostname}:8000/api/v1/regula`;

function RegulaDevices() {
  const [regulas, setRegulas] = useState<Regula[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRegulas = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ApiResponse = await response.json();
        setRegulas(data.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRegulas();
  }, []);

  const formatDate = (utcDateString: string, includeTime: boolean = true) => {
    // Create date object from UTC string
    const date = new Date(utcDateString);
    
    // Get user's timezone offset in minutes and convert to milliseconds
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    
    // Adjust the date by the timezone offset to get local time
    const localDate = new Date(date.getTime() - timezoneOffset);
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Europe/Moscow' // Explicitly set to Moscow timezone
    };
    
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
      // Removed timeZoneName to hide GMT+3
    }
    
    return localDate.toLocaleString('ru-RU', options);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error loading data: {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Regula Devices</h1>
      <p className="text-gray-600 mb-6">
        To use the device, use a URL: {window.location.protocol}//{window.location.hostname}:8000/regula/&#123;id_regula&#125;
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Birth Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {regulas.map((regula) => (
              <tr 
                key={regula.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => window.open(`http://${window.location.hostname}:8000/regula/${regula.id}`, '_blank')}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{regula.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {regula.last_name} {regula.first_name} {regula.middle_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(regula.birth_date, false)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {regula.series} {regula.number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(regula.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DevicesPage() {
  const location = useLocation();
  const isRegulaTab = location.pathname === '/devices/regula' || location.pathname === '/devices' || location.pathname === '/';
  const isRfidTab = location.pathname === '/devices/rfid';

  return (
    <div className="p-6">
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <Link
            to="/devices/regula"
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              isRegulaTab
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Regula Devices
          </Link>
          <Link
            to="/devices/rfid"
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              isRfidTab
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            RFID Devices
          </Link>
        </nav>
      </div>
      
      {isRegulaTab ? <RegulaDevices /> : <RfidDevices />}
    </div>
  );
}
