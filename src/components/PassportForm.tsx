import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';

interface Photo {
  id: number;
  file_name: string;
  content_type: string;
  created_at: string;
  url?: string;
  image_data?: string;
}

export interface PassportFormData {
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
}

interface PassportFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PassportFormData) => void;
  formData: PassportFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<PassportFormData>>;
  photos?: Photo[];
  onDeletePhoto?: (photoId: number, e: React.MouseEvent) => void;
  onUploadPhoto?: (file: File) => Promise<void>;
  isLoadingPhotos?: boolean;
  isEditMode?: boolean;
}

const PassportForm: React.FC<PassportFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  photos = [],
  onDeletePhoto = () => {},
  onUploadPhoto = async () => {},
  isLoadingPhotos = false,
}) => {
  const { showToast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: PassportFormData) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Clean up previous preview URL if it exists
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      // Create new preview URL
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
    }
  };

  // Handle photo upload
  const handleUploadPhoto = async () => {
    if (!selectedFile) return;
    try {
      setIsUploading(true);
      await onUploadPhoto(selectedFile);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setSelectedFile(null);
      showToast('Photo uploaded successfully', 'success');
    } catch (error) {
      console.error('Error uploading photo:', error);
      showToast('Failed to upload photo', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Passport Information</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            {/* Add other form fields here with the same pattern */}
            
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
          </div>

          {/* Photo upload section */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo
            </label>
            
            <div className="mt-1 flex items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {selectedFile && (
                <button
                  type="button"
                  onClick={handleUploadPhoto}
                  disabled={isUploading}
                  className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              )}
            </div>

            {/* Photo preview or gallery */}
            <div className="mt-4">
              {isLoadingPhotos ? (
                <div className="text-gray-500">Loading photos...</div>
              ) : photos.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {photos.map(photo => (
                    <div 
                      key={photo.id}
                      className={`relative group cursor-pointer border-2 rounded p-1 ${
                        formData.photo_id === photo.id ? 'border-blue-500' : 'border-transparent'
                      }`}
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        photo_id: photo.id
                      }))}
                    >
                      <img
                        src={photo.url || `data:${photo.content_type};base64,${photo.image_data}`}
                        alt={photo.file_name}
                        className="w-full h-24 object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePhoto(photo.id, e);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Delete photo"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No photos available</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
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
      </div>
    </div>
  );
};

export default PassportForm;
