import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import PassportForm from '@/components/PassportForm';

interface Photo {
  id: number;
  file_name: string;
  content_type: string;
  created_at: string;
  url?: string;
  image_data?: string;
}

export interface Regula {
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
  photo_id: number | null;
  delayed_response: number | null;
  created_at: string;
  updated_at: string;
  photo: Photo | null;
}

const RegulaDevices = () => {
  const [regulas, setRegulas] = useState<Regula[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRegula, setSelectedRegula] = useState<Regula | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const { showToast } = useToast();

  const [formData, setFormData] = useState<{
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
    photo_id: number | null;
    delayed_response: number | null;
  }>({
    name: '',
    last_name: '',
    first_name: '',
    middle_name: '',
    birth_date: '',
    issue_date: '',
    series: '',
    number: '',
    department_code: '',
    issued_by: '',
    birth_place: '',
    gender: 'M',
    photo_id: null,
    delayed_response: null,
  });

  const BACKEND_URL = `${window.location.protocol}//${window.location.hostname}:8000`;
  const API_URL = `${BACKEND_URL}/api/v1/regula`;
  const PHOTOS_API_URL = `${API_URL}/photos`;

  const fetchRegulas = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setRegulas(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Failed to load data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPhotos = async () => {
    try {
      const response = await fetch(PHOTOS_API_URL);
      if (!response.ok) throw new Error('Failed to fetch photos');
      const data = await response.json();
      setPhotos(data);
    } catch (error) {
      console.error('Error fetching photos:', error);
      showToast('Failed to load photos', 'error');
    }
  };

  useEffect(() => {
    fetchRegulas();
    fetchPhotos();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = (regula: Regula) => {
    setSelectedRegula(regula);
    setFormData({
      name: regula.name || '',
      last_name: regula.last_name,
      first_name: regula.first_name,
      middle_name: regula.middle_name,
      birth_date: regula.birth_date,
      issue_date: regula.issue_date,
      series: regula.series,
      number: regula.number,
      department_code: regula.department_code,
      issued_by: regula.issued_by,
      birth_place: regula.birth_place,
      gender: regula.gender,
      photo_id: regula.photo_id,
      delayed_response: regula.delayed_response,
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete record');
      
      showToast('Record deleted successfully', 'success');
      fetchRegulas();
    } catch (error) {
      console.error('Error deleting data:', error);
      showToast('Failed to delete record', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      last_name: '',
      first_name: '',
      middle_name: '',
      birth_date: '',
      issue_date: '',
      series: '',
      number: '',
      department_code: '',
      issued_by: '',
      birth_place: '',
      gender: 'M',
      photo_id: null,
      delayed_response: null,
    });
    setSelectedRegula(null);
    setIsEditMode(false);
  };

  const filteredRegulas = regulas.filter(regula => 
    `${regula.last_name} ${regula.first_name} ${regula.middle_name} ${regula.series}${regula.number}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Regula Devices</h1>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add New
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name or passport..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border">Full Name</th>
              <th className="py-2 px-4 border">Passport</th>
              <th className="py-2 px-4 border">Birth Date</th>
              <th className="py-2 px-4 border">Delayed Response (ms)</th>
              <th className="py-2 px-4 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRegulas.length > 0 ? (
              filteredRegulas.map((regula) => (
                <tr key={regula.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border">{`${regula.last_name} ${regula.first_name} ${regula.middle_name}`}</td>
                  <td className="py-2 px-4 border">{`${regula.series} ${regula.number}`}</td>
                  <td className="py-2 px-4 border">{regula.birth_date}</td>
                  <td className="py-2 px-4 border">{regula.delayed_response || '-'}</td>
                  <td className="py-2 px-4 border">
                    <button
                      onClick={() => handleEdit(regula)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(regula.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-2 px-4 border text-center">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {isEditMode ? 'Edit Record' : 'Add New Record'}
              </h2>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <PassportForm
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              formData={formData}
              setFormData={setFormData}
              onInputChange={handleInputChange}
              onSubmit={async (data) => {
                try {
                  const url = isEditMode && selectedRegula ? `${API_URL}/${selectedRegula.id}` : API_URL;
                  const method = isEditMode && selectedRegula ? 'PUT' : 'POST';
                  
                  const response = await fetch(url, {
                    method,
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                  });

                  if (!response.ok) throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} record`);
                  
                  showToast(`Record ${isEditMode ? 'updated' : 'created'} successfully`, 'success');
                  setIsModalOpen(false);
                  fetchRegulas();
                  resetForm();
                } catch (error) {
                  console.error('Error saving data:', error);
                  showToast(`Failed to ${isEditMode ? 'update' : 'create'} record`, 'error');
                }
              }}
              photos={photos}
              isLoadingPhotos={isLoadingPhotos}
              onDeletePhoto={async (photoId: number, e: React.MouseEvent) => {
                e.preventDefault();
                try {
                  setIsLoadingPhotos(true);
                  const response = await fetch(`${PHOTOS_API_URL}/${photoId}`, {
                    method: 'DELETE',
                  });
                  
                  if (!response.ok) throw new Error('Failed to delete photo');
                  
                  setFormData(prev => ({
                    ...prev,
                    photo_id: null
                  }));
                  await fetchPhotos();
                  showToast('Photo deleted successfully', 'success');
                } catch (error) {
                  console.error('Error deleting photo:', error);
                  showToast('Failed to delete photo', 'error');
                } finally {
                  setIsLoadingPhotos(false);
                }
              }}
              onUploadPhoto={async (file: File) => {
                try {
                  setIsLoadingPhotos(true);
                  const formData = new FormData();
                  formData.append('file', file);
                  
                  const response = await fetch(PHOTOS_API_URL, {
                    method: 'POST',
                    body: formData,
                  });

                  if (!response.ok) throw new Error('Failed to upload photo');
                  
                  const data = await response.json();
                  setFormData(prev => ({
                    ...prev,
                    photo_id: data.id
                  }));
                  await fetchPhotos();
                  showToast('Photo uploaded successfully', 'success');
                } catch (error) {
                  console.error('Error uploading photo:', error);
                  showToast('Failed to upload photo', 'error');
                } finally {
                  setIsLoadingPhotos(false);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RegulaDevices;
