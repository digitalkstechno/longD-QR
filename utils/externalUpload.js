const axios = require('axios');
const FormData = require('form-data');

const PROJECT_NAME = process.env.DIGITALKS_PROJECT_NAME || 'upleex';
const BASE_URL = process.env.DIGITALKS_BASE_URL || 'https://service.digitalks.co.in';

const uploadToExternalService = async (file, folderName = 'sample') => {
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
  const MAX_VIDEO_SIZE = 25 * 1024 * 1024;

  const isVideo = file?.mimetype?.startsWith('video/');
  const isImage = file?.mimetype?.startsWith('image/');

  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    throw new Error('File size is too large. Please upload a smaller video (max 25MB).');
  }
  if (isImage && file.size > MAX_IMAGE_SIZE) {
    throw new Error('File size is too large. Please upload a smaller image (max 10MB).');
  }

  const formData = new FormData();
  formData.append('project', PROJECT_NAME);
  formData.append('folder_structure', folderName);
  formData.append('file', file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype
  });

  const response = await axios.post(`${BASE_URL}/upload-file`, formData, {
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    timeout: 300000,
    headers: {
      ...formData.getHeaders(),
      accept: 'application/json'
    }
  });

  if (response.data && response.data.status === 'success') {
    return response.data.file_url;
  }
  throw new Error(response.data?.message || 'Upload failed');
};

const updateFileOnExternalService = async (oldFileUrl, newFile) => {
  const formData = new FormData();
  formData.append('file_url', oldFileUrl);
  formData.append('new_file', newFile.buffer, {
    filename: newFile.originalname,
    contentType: newFile.mimetype
  });

  const response = await axios.put(`${BASE_URL}/update-file-by-url`, formData, {
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    timeout: 300000,
    headers: {
      ...formData.getHeaders(),
      accept: 'application/json'
    }
  });

  if (response.data && response.data.status === 'success') {
    return response.data.new_file_url;
  }
  throw new Error(response.data?.message || 'Update failed');
};

const deleteFileFromExternalService = async (fileUrl) => {
  if (!fileUrl) return;
  try {
    await axios.delete(`${BASE_URL}/delete-file-by-url`, {
      data: { file_url: fileUrl },
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 300000
    });
  } catch (error) {}
};

module.exports = {
  uploadToExternalService,
  updateFileOnExternalService,
  deleteFileFromExternalService
};
