import { useState, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import axiosInstance from '../../axios';

const AddImage = () => {
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const formik = useFormik({
    initialValues: {
      images: null,
      titles: [],
    },
    validationSchema: Yup.object({
      images: Yup.mixed()
        .required('Please select images to upload')
        .test('fileSize', 'File too large', (value) => {
          if (!value) return true;
          return Array.from(value).every(
            (file) => file.size <= 5 * 1024 * 1024
          ); // 5MB limit
        })
        .test('fileType', 'Unsupported file type', (value) => {
          if (!value) return true;
          const supportedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            'image/bmp',
            'image/tiff',
            'image/avif',
          ];
          return Array.from(value).every((file) =>
            supportedTypes.includes(file.type)
          );
        }),
      titles: Yup.array()
        .of(
          Yup.string()
            .required('Title is required')
            .min(3, 'Title must be at least 3 characters')
            .max(50, 'Title must be at most 50 characters')
        )
        .min(1, 'Please provide at least one title for the images'),
    }),
    onSubmit: async (values) => {
      const formData = new FormData();
      Array.from(values.images).forEach((file, index) => {
        formData.append('images', file);
        formData.append('titles[]', values.titles[index] || 'Untitled');
      });
      setLoading(true);
      try {
        const response = await axiosInstance.post('/images/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        if (response.status === 201) {
          toast.success('Images uploaded successfully!');
          formik.resetForm();
          setPreviews([]);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      } catch (error) {
        console.error('Error uploading images:', error);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleImageChange = (e) => {
    const files = e.target.files;
    if (files) {
      formik.setFieldValue('images', files);
      const filePreviewUrls = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setPreviews(filePreviewUrls);
      const initialTitles = Array.from(files).map(
        (file) =>
          file.name.substring(0, file.name.lastIndexOf('.')) || 'Untitled'
      );
      formik.setFieldValue('titles', initialTitles);
    }
  };

  const handleTitleChange = (index, event) => {
    const newTitles = [...(formik.values.titles || [])];
    newTitles[index] = event.target.value;
    formik.setFieldValue('titles', newTitles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files) {
      fileInputRef.current.files = files;
      handleImageChange({ target: { files } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
      <a
        href="#"
        className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
      >
        <img className="w-8 h-8 mr-2" src="/logo.webp" alt="logo" />
        Image Manager
      </a>
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Image Upload
          </h1>
          <p className="text-gray-500 text-sm">
            Select and upload multiple images with titles
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="w-full"
          >
            <label
              htmlFor="images"
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer 
                         bg-gray-100 hover:bg-gray-200 transition-colors duration-300
                         border-gray-300 hover:border-blue-500"
            >
              <div className="flex flex-col items-center justify-center text-center">
                <svg
                  className="w-10 h-10 mb-3 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-400">
                  PNG, JPG, GIF, SVG (Max 5MB)
                </p>
              </div>
              <input
                ref={fileInputRef}
                id="images"
                name="images"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/gif,image/svg+xml,image/avif,image/webp,image/bmp,image/tiff"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            {formik.errors.images && formik.touched.images && (
              <div className="text-red-500 text-sm mt-2 text-center">
                {formik.errors.images}
              </div>
            )}
          </div>

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-6">
              {previews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <input
                    type="text"
                    value={formik.values.titles[index] || ''}
                    placeholder="Image title"
                    onChange={(e) => handleTitleChange(index, e)}
                    className="mt-2 w-full p-2 text-sm border rounded-lg 
                               focus:ring-blue-500 focus:border-blue-500"
                  />
                  {formik.errors.titles && formik.errors.titles[index] && (
                    <div className="text-red-500 text-xs mt-1">
                      {formik.errors.titles[index]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={!formik.values.images || loading}
            className={`w-full py-3 text-white font-semibold rounded-lg 
              ${
                loading
                  ? 'bg-gray-500 cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-700'
              }
              transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed`}
          >
            {loading ? 'Uploading...' : 'Upload Images'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddImage;
