import React, { useState } from 'react';
import axios from 'axios';

const FileUploader = ({ accessToken, onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setError(null);
  };

  const uploadFile = async () => {
    if (!file) {
      setError("No file selected");
      return;
    }
    setUploading(true);
    setError(null);

    if (file.type === 'application/pdf') {
      handlePdfFile();
    } else if ([
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ].includes(file.type)) {
      await handleSpreadsheetFile();
    } else {
      setError("Unsupported file type");
      setUploading(false);
    }
  };

  const handlePdfFile = () => {
    const blobUrl = URL.createObjectURL(file);
    onUploadComplete(blobUrl);
    setUploading(false);
  };

  const handleSpreadsheetFile = async () => {
    if (!accessToken) {
      setError("Not logged in");
      setUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify({
        name: file.name,
        mimeType: 'application/vnd.google-apps.spreadsheet'
      })], { type: 'application/json' }));
      formData.append('file', file);

      const uploadResponse = await axios.post(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const fileId = uploadResponse.data.id;

      await axios.post(
        `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
        { type: 'anyone', role: 'reader' },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const embedUrl = `https://docs.google.com/spreadsheets/d/${fileId}/edit?usp=sharing`;
      console.log("Embed URL:", embedUrl);
      onUploadComplete(embedUrl);
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(`Error uploading file: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} accept=".pdf,.xlsx,.xls,.csv" />
      <button onClick={uploadFile} disabled={!file || uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default FileUploader;
