import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import { Link, useLocation } from 'react-router-dom';
import RfidDevices from './RfidDevicesPage';

interface Photo {
  id: number;
  file_name: string;
  content_type: string;
  created_at: string;
  url?: string;
  image_data?: string;
}

interface PassportFormData {
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
}

interface PhotoUploadData {
  image_data: string;
  file_name: string;
  content_type: string;
}

const initialFormData: PassportFormData = {
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
  gender: 'm',
  photo_id: 0,
  delayed_response: null
};

const BACKEND_URL = `${window.location.protocol}//${window.location.hostname}:8001`;

interface PassportFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PassportFormData) => void;
  title: string;
  formData: PassportFormData;
  setFormData: React.Dispatch<React.SetStateAction<PassportFormData>>;
}

const PassportForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title,
  formData,
  setFormData 
}: PassportFormProps) => {
  if (!isOpen) return null;
  // Photo upload states
  const [isLoadingPhotos, setIsLoadingPhotos] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const { showToast } = useToast();

  const handleDeletePhoto = async (photoId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const response = await fetch(`${PHOTO_API_URL}/${photoId}`, {
        method: 'DELETE',
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.detail || 'Failed to delete photo');
      }
      
      // Remove photo from the list
      setPhotos(prev => prev.filter((p: Photo) => p.id !== photoId));
      
      // If the deleted photo was selected, clear the selection
      if (formData.photo_id === photoId) {
        setFormData(prev => ({ ...prev, photo_id: null }));
      }
      
      showToast('Photo deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting photo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete photo';
      showToast(errorMessage, 'error');
    }
  };

  // Fetch photos when component mounts
  useEffect(() => {
    const fetchPhotos = async () => {
      if (!isOpen) return;
      
      setIsLoadingPhotos(true);
      try {
        const response = await fetch(PHOTOS_API_URL);
        if (!response.ok) throw new Error('Failed to fetch photos');
        const data = await response.json();
        setPhotos(data.photos || []);
      } catch (error) {
        console.error('Error fetching photos:', error);
      } finally {
        setIsLoadingPhotos(false);
      }
    };

    fetchPhotos();
  }, [isOpen]);

  const generateRandomData = () => {
    // Russian names and data for realistic test data
    const maleFirstNames = ['Иван', 'Александр', 'Сергей', 'Дмитрий', 'Алексей', 'Андрей', 'Михаил', 'Евгений', 'Максим', 'Артём'];
    const femaleFirstNames = ['Анна', 'Елена', 'Ольга', 'Наталья', 'Ирина', 'Татьяна', 'Мария', 'Светлана', 'Екатерина', 'Юлия'];
    const maleLastNames = ['Иванов', 'Петров', 'Сидоров', 'Смирнов', 'Кузнецов', 'Попов', 'Васильев', 'Павлов', 'Семёнов', 'Голубев'];
    const femaleLastNames = ['Иванова', 'Петрова', 'Сидорова', 'Смирнова', 'Кузнецова', 'Попова', 'Васильева', 'Павлова', 'Семёнова', 'Голубева'];
    const maleMiddleNames = ['Иванович', 'Александрович', 'Сергеевич', 'Дмитриевич', 'Алексеевич', 'Андреевич', 'Михайлович', 'Евгеньевич', 'Максимович', 'Артёмович'];
    const femaleMiddleNames = ['Ивановна', 'Александровна', 'Сергеевна', 'Дмитриевна', 'Алексеевна', 'Андреевна', 'Михайловна', 'Евгеньевна', 'Максимовна', 'Артёмовна'];
    const cities = ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань', 'Нижний Новгород', 'Челябинск', 'Самара', 'Омск', 'Ростов-на-Дону'];
    
    // Generate random dates
    const randomDate = (start: Date, end: Date) => {
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    };
    
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };
    
    const birthDate = randomDate(new Date(1950, 0, 1), new Date(2003, 0, 1));
    const issueDate = randomDate(new Date(2010, 0, 1), new Date(2023, 11, 31));
    
    // Determine gender first
    const isMale = Math.random() > 0.5;
    const gender = isMale ? 'male' : 'female';
    
    // Select appropriate names based on gender
    const firstName = isMale 
      ? maleFirstNames[Math.floor(Math.random() * maleFirstNames.length)]
      : femaleFirstNames[Math.floor(Math.random() * femaleFirstNames.length)];
      
    const lastName = isMale 
      ? maleLastNames[Math.floor(Math.random() * maleLastNames.length)]
      : femaleLastNames[Math.floor(Math.random() * femaleLastNames.length)];
      
    const middleName = isMale 
      ? maleMiddleNames[Math.floor(Math.random() * maleMiddleNames.length)]
      : femaleMiddleNames[Math.floor(Math.random() * femaleMiddleNames.length)];
    
    // Generate random passport data
    const randomData: PassportFormData = {
      name: lastName,
      last_name: lastName,
      first_name: firstName,
      middle_name: middleName,
      birth_date: formatDate(birthDate),
      issue_date: formatDate(issueDate),
      series: Math.floor(1000 + Math.random() * 9000).toString(),
      number: Math.floor(100000 + Math.random() * 900000).toString(),
      department_code: Math.floor(100 + Math.random() * 900) + '-' + Math.floor(100 + Math.random() * 900),
      issued_by: 'Отделом УФМС по городу ' + cities[Math.floor(Math.random() * cities.length)],
      birth_place: 'г. ' + cities[Math.floor(Math.random() * cities.length)],
      gender: gender,
      photo_id: photos.length > 0 ? photos[Math.floor(Math.random() * photos.length)].id : null,
      delayed_response: Math.random() > 0.5 ? Math.floor(Math.random() * 10) : null
    };
    
    setFormData(randomData);
  };

  useEffect(() => {
    const fetchPhotos = async () => {
      if (!isOpen) return;
      
      setIsLoadingPhotos(true);
      try {
        const response = await fetch(PHOTOS_API_URL);
        if (!response.ok) throw new Error('Failed to fetch photos');
        const data = await response.json();
        setPhotos(data.photos || []);
      } catch (error) {
        console.error('Error fetching photos:', error);
      } finally {
        setIsLoadingPhotos(false);
      }
    };

    fetchPhotos();
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  
  const handleUploadPhoto = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    
    try {
      // Read file as base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result?.toString().split(',')[1] || '');
        reader.onerror = error => reject(error);
        reader.readAsDataURL(selectedFile);
      });

      const uploadData: PhotoUploadData = {
        image_data: base64Data,
        file_name: `photo_${Date.now()}.${selectedFile.name.split('.').pop()}`,
        content_type: selectedFile.type,
      };

      const response = await fetch(PHOTO_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uploadData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload photo');
      }

      const newPhoto = await response.json();
      setPhotos(prev => [newPhoto, ...(prev || [])]);
      setFormData(prev => ({ ...prev, photo_id: newPhoto.id }));
      setPreviewUrl(null);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading photo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload photo. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <button
          type="button"
          onClick={generateRandomData}
          className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
          title="Generate random data"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Random Data
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Name Device</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Middle Name</label>
          <input
            type="text"
            name="middle_name"
            value={formData.middle_name}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Birth Date</label>
          <input
            type="date"
            name="birth_date"
            value={formData.birth_date}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Issue Date</label>
          <input
            type="date"
            name="issue_date"
            value={formData.issue_date}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Series</label>
          <input
            type="text"
            name="series"
            value={formData.series}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Number</label>
          <input
            type="text"
            name="number"
            value={formData.number}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Department Code</label>
          <input
            type="text"
            name="department_code"
            value={formData.department_code}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Issued By</label>
          <input
            type="text"
            name="issued_by"
            value={formData.issued_by}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Birth Place</label>
          <input
            type="text"
            name="birth_place"
            value={formData.birth_place}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Delayed Response (seconds)</label>
          <input
            type="number"
            name="delayed_response"
            value={formData.delayed_response ?? ''}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value, 10) : null;
              setFormData(prev => ({
                ...prev,
                delayed_response: isNaN(value as number) ? null : value
              }));
            }}
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter delay in seconds"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
          
          {/* Photo selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Выберите фото</label>
            <p className="text-xs text-gray-500 mb-2">Наведите на фото для выбора или удаления</p>
          {isLoadingPhotos ? (
            <div className="text-gray-500">Loading photos...</div>
          ) : photos.length > 0 ? (
            <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 border rounded">
              {photos.map(photo => (
                <div 
                  key={photo.id}
                  className={`relative group cursor-pointer border-2 rounded p-1 ${formData.photo_id === photo.id ? 'border-blue-500' : 'border-transparent'}`}
                >
                  <img 
                    src={photo.id ? `${BACKEND_URL}/api/v1/regula/photo/${photo.id}` : (photo.image_data ? `data:${photo.content_type};base64,${photo.image_data}` : '')} 
                    alt={photo.file_name}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      console.error('Failed to load image:', target.src);
                      target.style.display = 'none';
                      // Show a placeholder if the image fails to load
                      const container = target.parentElement;
                      if (container) {
                        const placeholder = document.createElement('div');
                        placeholder.className = 'w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs';
                        const regulaId = target.alt.split(' ');
                        const initial = (regulaId[0]?.[0] || '') + (regulaId[1]?.[0] || '');
                        placeholder.textContent = initial || 'No img';
                        container.appendChild(placeholder);
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFormData(prev => ({ ...prev, photo_id: photo.id }));
                      }}
                      className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                      title="Выбрать"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeletePhoto(photo.id, e);
                      }}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="Удалить"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">No photos available</div>
          )}
          
          {/* Photo upload */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Or upload new photo</label>
            <div className="flex items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {selectedFile && (
                <button
                  type="button"
                  onClick={handleUploadPhoto}
                  disabled={isUploading}
                  className="ml-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              )}
            </div>
            {previewUrl && (
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-1">Preview:</p>
                <img src={previewUrl} alt="Preview" className="h-20 w-auto border rounded" />
              </div>
            )}
          </div>
          
          {/* Hidden input for form submission */}
          <input
            type="hidden"
            name="photo_id"
            value={formData.photo_id || ''}
            required
          />
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save
        </button>
      </div>
    </form>
  );
};


interface Photo {
  [key: string]: any; 
}

interface Regula {
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

// Removed ApiResponse interface as the API now returns an array directly;

// Use the current hostname and port 8000 for the API
const API_URL = `${window.location.protocol}//${window.location.hostname}:8000/api/v1/regula`;

const PHOTOS_API_URL = `${API_URL}/photos`;
const PHOTO_API_URL = `${API_URL}/photo`;

function RegulaDevices() {
  const [regulas, setRegulas] = useState<Regula[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRegula, setEditingRegula] = useState<Regula | null>(null);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [formData, setFormData] = useState<PassportFormData>(initialFormData);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showBulkDelete, setShowBulkDelete] = useState<boolean>(false);
  const { showToast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => showToast('URL has been copied to clipboard!'),
      () => showToast('Failed to copy URL. Please copy it manually.')
    );
  };

  useEffect(() => {
    const fetchRegulas = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Regula[] = await response.json();
        // Sort by ID in descending order
        const sortedItems = [...data].sort((a, b) => b.id - a.id);
        setRegulas(sortedItems);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка';
        setError(errorMessage);
        console.error('Error fetching data:', err);
        showToast(`Error loading data: ${errorMessage}`, 'error');
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

  const handleSubmit = async (formData: PassportFormData) => {
    try {
      const isEdit = !!editingRegula;
      const url = isEdit ? `${API_URL}/${editingRegula?.id}` : API_URL;
      
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        if (response.status === 409) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Passport with these details already exists');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (isEdit) {
        // Update existing item
        setRegulas(prev => 
          prev.map(item => item.id === editingRegula?.id ? result : item)
            .sort((a, b) => b.id - a.id)
        );
        setSubmitStatus({ success: true, message: 'Passport data updated successfully!' });
        setIsModalOpen(false);
      } else {
        // Add new item
        setRegulas(prev => [...prev, result].sort((a, b) => b.id - a.id));
        setSubmitStatus({ success: true, message: 'Passport data added successfully!' });
        setIsModalOpen(false);
      }
      
      setFormData(initialFormData);
      setEditingRegula(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSubmitStatus(null), 3000);
    } catch (err) {
      console.error('Error submitting form:', err);
      setSubmitStatus({ 
        success: false, 
        message: err instanceof Error ? err.message : `Failed to ${editingRegula ? 'update' : 'add'} passport data`,
      });
      showToast(`Form submission error: ${err instanceof Error ? err.message : 'An error occurred'}`, 'error');
      
      // Auto-hide error message after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    console.error('Failed to load image:', target.src);
    target.style.display = 'none';
    // Show a placeholder if the image fails to load
    const container = target.parentElement;
    if (container) {
      const placeholder = document.createElement('div');
      placeholder.className = 'w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs';
      const regulaId = target.alt.split(' ');
      const initial = (regulaId[0]?.[0] || '') + (regulaId[1]?.[0] || '');
      placeholder.textContent = initial || 'No img';
      container.appendChild(placeholder);
    }
  };


  const handleEdit = (regula: Regula) => {
    // Format dates to YYYY-MM-DD for the date inputs
    const formatDateForInput = (dateString: string) => {
      return dateString ? dateString.split('T')[0] : '';
    };

    setFormData({
      name: regula.name || '',
      last_name: regula.last_name || '',
      first_name: regula.first_name || '',
      middle_name: regula.middle_name || '',
      birth_date: formatDateForInput(regula.birth_date) || '',
      issue_date: formatDateForInput(regula.issue_date) || '',
      series: regula.series || '',
      number: regula.number || '',
      department_code: regula.department_code || '',
      issued_by: regula.issued_by || '',
      birth_place: regula.birth_place || '',
      gender: regula.gender || 'm',
      photo_id: regula.photo_id || null,
      delayed_response: regula.delayed_response || null
    });
    
    setEditingRegula(regula);
    setIsModalOpen(true);
  };


  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(regulas.map(regula => regula.id));
      setShowBulkDelete(true);
    } else {
      setSelectedIds([]);
      setShowBulkDelete(false);
    }
  };

  const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    if (e.target.checked) {
      setSelectedIds(prev => [...prev, id]);
      setShowBulkDelete(true);
    } else {
      const newSelected = selectedIds.filter(selectedId => selectedId !== id);
      setSelectedIds(newSelected);
      setShowBulkDelete(newSelected.length > 0);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/delete-many`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passport_ids: selectedIds
        })
      });

      if (!response.ok) throw new Error('Ошибка при удалении записей');

      setRegulas(prev => prev.filter(item => !selectedIds.includes(item.id)));
      setSelectedIds([]);
      setShowBulkDelete(false);
      setSubmitStatus({ success: true, message: 'Выбранные записи успешно удалены' });
      setTimeout(() => setSubmitStatus(null), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка';
      console.error('Error deleting records:', error);
      setSubmitStatus({ 
        success: false, 
        message: 'Ошибка при удалении записей'
      });
      showToast(`Error deleting records: ${errorMessage}`, 'error');
      setTimeout(() => setSubmitStatus(null), 5000);
    }
  };

  const handleCancelBulkDelete = () => {
    setSelectedIds([]);
    setShowBulkDelete(false);
  };

  return (
    <div className="p-6">
      {showBulkDelete && selectedIds.length > 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Выбрано {selectedIds.length} устройств</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCancelBulkDelete}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                Отменить выбор
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 flex items-center space-x-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>Удалить выбранные</span>
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Regula Devices</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Add New
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-600">To use the device, use a URL: </p>
          <div className="flex items-center bg-gray-100 rounded overflow-hidden mt-1">
            <code className="px-2 py-1">{window.location.protocol}//{window.location.hostname}:8000/api/v1/regula/&#123;id_regula&#125;</code>
            <button 
              onClick={() => copyToClipboard(`${window.location.protocol}//${window.location.hostname}:8000/api/v1/regula/{id_regula}`)}
              className="px-2 py-1 bg-gray-200 hover:bg-gray-300 transition-colors"
              title="Copy to clipboard"
            >
              📋
            </button>
          </div>
        </div>
      </div>
      {submitStatus && (
        <div className={`mb-4 p-4 rounded-md ${submitStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {submitStatus.message}
        </div>
      )}
      
{isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {editingRegula ? 'Редактирование записи' : 'Новая запись'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setFormData(initialFormData);
                  setEditingRegula(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <PassportForm 
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                setFormData(initialFormData);
                setEditingRegula(null);
              }}
              onSubmit={handleSubmit}
              title={editingRegula ? 'Редактировать' : 'Создать'}
              formData={formData}
              setFormData={setFormData}
            />
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 w-12">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedIds.length === regulas.length && regulas.length > 0}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name Device</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Birth Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delayed Response (s)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {regulas.map((regula) => (
              <tr 
                key={regula.id} 
                className={`hover:bg-gray-50 ${selectedIds.includes(regula.id) ? 'bg-blue-50' : ''} cursor-pointer`}
                onClick={() => handleEdit(regula)}
              >
                <td className="px-4 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(regula.id)}
                    onChange={(e) => handleSelectOne(e, regula.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </td>
                <td 
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                  onClick={() => handleEdit(regula)}
                >
                  <div className="flex items-center space-x-2">
                    <span>{regula.id}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {regula.name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {(() => {
                    // If we have a photo_id, fetch the photo using the API endpoint
                    if (regula.photo_id) {
                      return (
                        <img 
                          src={`${window.location.protocol}//${window.location.hostname}:8000/api/v1/regula/photo/${regula.photo_id}`}
                          onLoad={() => console.log('Image loaded successfully:', regula.photo_id)}
                          alt={`${regula.first_name} ${regula.last_name}`}
                          className="w-16 h-16 object-cover rounded"
                          onError={handleImageError}
                        />
                      );
                    }
                    // Fallback to initials
                    return (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        {regula.first_name?.[0]}{regula.last_name?.[0]}
                      </div>
                    );
                  })()}
                </td>
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
                  {regula.delayed_response ?? '-'}
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
