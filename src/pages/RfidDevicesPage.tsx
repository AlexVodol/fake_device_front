
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';

interface RfidDevice {
  id: number;
  name: string;
  rfid: string;
  clip_card: boolean;
  empty_card_bin: boolean;
  error_card_bin_full: boolean;
  pre_empty_card_bin: boolean;
  created_at: string;
  updated_at: string;
}

interface CreateRfidDeviceDto {
  name: string;
  rfid: string;
  clip_card: boolean;
  empty_card_bin: boolean;
  error_card_bin_full: boolean;
  pre_empty_card_bin: boolean;
}

export default function RfidDevicesPage() {
  const [devices, setDevices] = useState<RfidDevice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDevice, setNewDevice] = useState<CreateRfidDeviceDto>({
    name: '',
    rfid: '',
    clip_card: false,
    empty_card_bin: false,
    error_card_bin_full: false,
    pre_empty_card_bin: false
  });
  const [isCreating, setIsCreating] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<CreateRfidDeviceDto | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { showToast } = useToast();

  const handleUpdateDevice = async (id: number) => {
    if (!editFormData) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/v1/fake_rfid/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) throw new Error('Failed to update device');

      const updatedDevice = await response.json();
      setDevices(prev => 
        prev.map(device => 
          device.id === id ? { ...updatedDevice } : device
        )
      );
      
      setEditingId(null);
      setEditFormData(null);
      showToast('Device updated successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update device';
      showToast(errorMessage, 'error');
      console.error('Error updating device:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const startEditing = (device: RfidDevice) => {
    setEditingId(device.id);
    setEditFormData({
      name: device.name,
      rfid: device.rfid,
      clip_card: device.clip_card,
      empty_card_bin: device.empty_card_bin,
      error_card_bin_full: device.error_card_bin_full,
      pre_empty_card_bin: device.pre_empty_card_bin
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditFormData(null);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editFormData) return;
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev!,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => showToast('URL has been copied to clipboard!'),
      () => showToast('Failed to copy URL. Please copy it manually.')
    );
  };

  const generateRandomData = () => {
    const randomString = (length: number) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    };

    setNewDevice(prev => ({
      ...prev, // Keep all existing values
      name: `Device-${Math.floor(1000 + Math.random() * 9000)}`,
      rfid: randomString(10)
      // Keep all boolean values (clip_card, empty_card_bin, etc.) as they are
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewDevice(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSwitchChange = (name: keyof CreateRfidDeviceDto) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewDevice(prev => ({
      ...prev,
      [name]: e.target.checked
    }));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    try {
      const response = await fetch('/api/v1/fake_rfid/delete-many', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rfid_ids: selectedIds
        })
      });

      if (!response.ok) throw new Error('Failed to delete devices');

      setDevices(prev => prev.filter(device => !selectedIds.includes(device.id)));
      setSelectedIds([]);
      setShowBulkDelete(false);
      showToast('Selected devices deleted successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete devices';
      showToast(errorMessage, 'error');
      console.error('Error deleting devices:', err);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(devices.map(device => device.id));
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

  const handleCancelBulkDelete = () => {
    setSelectedIds([]);
    setShowBulkDelete(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    
    try {
      const response = await fetch('/api/v1/fake_rfid/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDevice),
      });

      if (!response.ok) {
        throw new Error('Failed to create device');
      }

      const data = await response.json();
      // Add new device to the beginning of the array to show it at the top
      setDevices([data, ...devices]);
      setIsDialogOpen(false);
      showToast('Device created successfully!');
      
      // Reset form
      setNewDevice({
        name: '',
        rfid: '',
        clip_card: false,
        empty_card_bin: false,
        error_card_bin_full: false,
        pre_empty_card_bin: false
      });
    } catch (err) {
      showToast('Failed to create device. Please try again.');
      console.error('Error creating device:', err);
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const fetchDevices = async () => {
      try {
        const apiUrl = '/api/v1/fake_rfid/'; // Will be proxied to http://localhost:8000/api/v1/fake_rfid/
        console.log('Fetching from:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit', // Don't send credentials
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        const responseText = await response.text();
        console.log('Raw response:', responseText);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}, response: ${responseText}`);
        }
        
        let data;
        try {
          data = JSON.parse(responseText);
          const devicesArray = Array.isArray(data) ? data : [data];
          // Sort by ID in descending order (newest first)
          const sortedDevices = [...devicesArray].sort((a, b) => b.id - a.id);
          if (isMounted) {
            setDevices(sortedDevices);
          }
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch RFID devices';
        if (isMounted) {
          setError(errorMessage);
          showToast(errorMessage, 'error');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDevices();
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array to run only once on mount

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    
    try {
      const date = new Date(dateString);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      // Convert to local timezone
      const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
      return localDate.toLocaleString(undefined, options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // Return original string if there's an error
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">RFID Devices</h1>
        <p>Loading devices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">RFID Devices</h1>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {showBulkDelete && selectedIds.length > 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Selected {selectedIds.length} devices</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCancelBulkDelete}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 flex items-center space-x-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>Delete Selected</span>
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">RFID Devices</h1>
          <div className="flex space-x-2">
            <button 
              onClick={() => setIsDialogOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Add New
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-600">To use the device, use a URL: </p>
          <div className="flex items-center bg-gray-100 rounded overflow-hidden mt-1">
            <code className="px-2 py-1">http://localhost:8000/api/v1/fake_rfid/&#123;rfid_id&#125;/</code>
            <button 
              onClick={() => copyToClipboard('http://localhost:8000/api/v1/fake_rfid/{rfid_id}/')}
              className="px-2 py-1 bg-gray-200 hover:bg-gray-300 transition-colors"
              title="Copy to clipboard"
            >
              📋
            </button>
          </div>
        </div>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New RFID Device</h2>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={generateRandomData}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
                  title="Generate random data"
                >
                  Random Data
                </button>
                <button 
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name Device
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={newDevice.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="rfid" className="block text-sm font-medium text-gray-700 mb-1">
                  RFID
                </label>
                <input
                  id="rfid"
                  name="rfid"
                  type="text"
                  value={newDevice.rfid}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="clip_card"
                  type="checkbox"
                  checked={newDevice.clip_card}
                  onChange={handleSwitchChange('clip_card')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="clip_card" className="text-sm text-gray-700">
                  Clip Card
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="empty_card_bin"
                  type="checkbox"
                  checked={newDevice.empty_card_bin}
                  onChange={handleSwitchChange('empty_card_bin')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="empty_card_bin" className="text-sm text-gray-700">
                  Empty Bin
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="error_card_bin_full"
                  type="checkbox"
                  checked={newDevice.error_card_bin_full}
                  onChange={handleSwitchChange('error_card_bin_full')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="error_card_bin_full" className="text-sm text-gray-700">
                  Bin Full Error
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="pre_empty_card_bin"
                  type="checkbox"
                  checked={newDevice.pre_empty_card_bin}
                  onChange={handleSwitchChange('pre_empty_card_bin')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="pre_empty_card_bin" className="text-sm text-gray-700">
                  Pre-Empty Bin
                </label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isCreating}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isCreating}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create Device'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedIds.length === devices.length && devices.length > 0}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name Device</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RFID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clip Card</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empty Bin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bin Full</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pre-Empty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {devices.length > 0 ? (
                devices.map((device) => (
                  <tr 
                    key={device.id} 
                    className={`hover:bg-gray-50 cursor-pointer ${selectedIds.includes(device.id) ? 'bg-blue-50' : ''}`}
                    onClick={() => !editingId && startEditing(device)}
                  >
                    <td className="px-4 py-4 whitespace-nowrap" onClick={(e) => {
                      e.stopPropagation();
                      if (editingId) return;
                    }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(device.id)}
                        onChange={(e) => handleSelectOne(e, device.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{device.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === device.id ? (
                        <input
                          type="text"
                          name="name"
                          value={editFormData?.name || ''}
                          onChange={handleEditInputChange}
                          className="w-full px-2 py-1 border rounded"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-900">{device.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === device.id ? (
                        <input
                          type="text"
                          name="rfid"
                          value={editFormData?.rfid || ''}
                          onChange={handleEditInputChange}
                          className="w-full px-2 py-1 border rounded"
                        />
                      ) : (
                        <span className="text-sm text-gray-500">{device.rfid}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === device.id ? (
                        <input
                          type="checkbox"
                          name="clip_card"
                          checked={editFormData?.clip_card || false}
                          onChange={handleEditInputChange}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                      ) : (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          device.clip_card ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {device.clip_card ? 'Yes' : 'No'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === device.id ? (
                        <input
                          type="checkbox"
                          name="empty_card_bin"
                          checked={editFormData?.empty_card_bin || false}
                          onChange={handleEditInputChange}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                      ) : (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          device.empty_card_bin ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {device.empty_card_bin ? 'Yes' : 'No'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === device.id ? (
                        <input
                          type="checkbox"
                          name="error_card_bin_full"
                          checked={editFormData?.error_card_bin_full || false}
                          onChange={handleEditInputChange}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                      ) : (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          device.error_card_bin_full ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {device.error_card_bin_full ? 'Yes' : 'No'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === device.id ? (
                        <input
                          type="checkbox"
                          name="pre_empty_card_bin"
                          checked={editFormData?.pre_empty_card_bin || false}
                          onChange={handleEditInputChange}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                      ) : (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          device.pre_empty_card_bin ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {device.pre_empty_card_bin ? 'Yes' : 'No'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingId === device.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateDevice(device.id);
                            }}
                            disabled={isUpdating}
                            className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                          >
                            {isUpdating ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelEditing();
                            }}
                            disabled={isUpdating}
                            className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span>{formatDate(device.updated_at)}</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                    No RFID devices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
