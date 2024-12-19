import { useEffect, useState, useRef } from 'react';
import { Trash2, Edit } from 'lucide-react';
import axiosInstance from '../../axios';
import { toast } from 'react-toastify';
import './Images.css';

const URL = 'https://vintagerags.store/';

const ImageManagement = () => {
  const [images, setImages] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [editingImage, setEditingImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axiosInstance.get('/images/data');
        setImages(response.data.user.images);
      } catch (error) {
        console.error('Fetch images error:', error);
      }
    };

    fetchImages();
  }, []);

  const handleDeleteImage = async (imageId) => {
    try {
      await axiosInstance.delete(`/images/delete/${imageId}`);
      toast.success('Image deleted successfully');
      setImages(images.filter((image) => image._id !== imageId));
    } catch (error) {
      console.error('Delete image error:', error);
    }
  };

  const handleEditImage = (image) => {
    setEditingImage(image);
  };

  const handleSubmitEdit = async () => {
    try {
      const formData = new FormData();
      formData.append('title', editingImage.title);
      if (editingImage.newFile) {
        formData.append('image', editingImage.newFile);
      }
      setLoading(true);
      const response = await axiosInstance.put(
        `/images/edit/${editingImage._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setImages(
        images.map((img) =>
          img._id === editingImage._id
            ? {
                ...img,
                title: response.data.image.title,
                path: response.data.image.path,
              }
            : img
        )
      );
      toast.success('Image updated successfully');
      setEditingImage(null);
    } catch (error) {
      console.error('Update image error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (index) => {
    if (draggedIndex !== index) {
      setHoveredIndex(index);
    }
  };

  const handleDrop = (index) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      const newImages = [...images];
      [newImages[draggedIndex], newImages[index]] = [
        newImages[index],
        newImages[draggedIndex],
      ];
      setImages(newImages);
      const reorderedImageIds = newImages.map((img) => img._id);
      axiosInstance
        .post('/images/rearrange', { order: reorderedImageIds })
        .catch((error) => {
          console.error('Reorder images error:', error);
        });
    }
    setDraggedIndex(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">My Uploads</h2>

      <div className="image-grid">
        {images.length === 0 ? (
          <div className="w-full grid grid-cols-3 gap-4">
            <div className="w-[1250px] grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 animate-pulse">
              {[...Array(9)].map((_, index) => (
                <div
                  key={index}
                  className="w-full h-44 bg-gray-300 rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        ) : (
          images.map((image, index) => (
            <div
              key={image._id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => {
                e.preventDefault();
                handleDragOver(index);
              }}
              onDrop={() => handleDrop(index)}
              className={`image-item ${
                draggedIndex === index ? 'dragged' : ''
              } ${hoveredIndex === index ? 'hovered' : ''}`}
            >
              <div className="image-wrapper">
                <img
                  src={`${URL}${image.path}`}
                  alt={image.title}
                  className="image"
                />
                <div className="image-overlay">
                  {draggedIndex !== index && (
                    <>
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-xl font-bold text-gray-200 p-2 rounded-md text-center mt-2">
                          {image.title}
                        </p>
                        <div>
                          <button
                            onClick={() => handleEditImage(image)}
                            className="bg-white/20 hover:bg-white/40 p-2 m-2 rounded-full "
                            title="Edit Image"
                          >
                            <Edit className="text-white w-6 h-6" />
                          </button>
                          <button
                            onClick={() => handleDeleteImage(image._id)}
                            className="bg-red-500/50 hover:bg-red-500/70 m-2 p-2 rounded-full"
                            title="Delete Image"
                          >
                            <Trash2 className="text-white w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {editingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full">
            <h3 className="text-xl font-semibold mb-4">Edit Image</h3>

            <img
              src={`${URL}${editingImage.path}`}
              alt={editingImage.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={editingImage.title}
                onChange={(e) =>
                  setEditingImage((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter image title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Change Image
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setEditingImage((prev) => ({
                        ...prev,
                        previewUrl: reader.result,
                        newFile: file,
                      }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                accept="image/*"
                className="w-full px-3 py-2 border rounded-lg"
              />

              {editingImage.previewUrl && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">
                    New Image Preview:
                  </p>
                  <img
                    src={editingImage.previewUrl}
                    alt="New preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setEditingImage(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitEdit}
                disabled={loading} 
                className={`px-4 py-2 rounded-lg text-white ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageManagement;
