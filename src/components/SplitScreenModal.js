import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import SplitScreen from './SplitScreen';
import FileUploader from './GoogleSheetsUploader';
import { useGoogleLogin } from '@react-oauth/google';
import BigQueryPatentFetcher from './BigQueryPatentFetcher';

const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: white;
  padding: 10px;
  border-radius: 8px;
  width: 90%;
  height: 90%;
  display: flex;
  flex-direction: column;
`;

const CloseButton = styled.button`
  align-self: flex-end;
  background: red;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
`;

const InputContainer = styled.div`
  margin: 10px 0;
`;

const Iframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

const PatentDisplay = styled.div`
  padding: 20px;
  overflow-y: auto;
`;

const PatentInput = styled.input`
  margin-right: 10px;
  width: 200px;
`;

const PatentButton = styled.button`
  padding: 5px 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
`;

const SplitScreenModal = ({ leftSrc, rightSrc, setLeftSrc, setRightSrc, onClose }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [patentData, setPatentData] = useState(null);
  const [leftPatentInput, setLeftPatentInput] = useState('');
  const [rightPatentInput, setRightPatentInput] = useState('');
  const [error, setError] = useState(null);

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setAccessToken(tokenResponse.access_token);
    },
    scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets',
  });

  const handleUrlInput = (e, setSrc) => {
    const url = e.target.value;
    setSrc(url);
  };

  const handleUploadComplete = (side, url) => {
    if (side === 'left') {
      setLeftSrc(url);
    } else {
      setRightSrc(url);
    }
  };

  const fetchPatentData = async (patentNumber, side) => {
    const fetcher = new BigQueryPatentFetcher();
    try {
      setError(null);
      const data = await fetcher.fetchPatentData(patentNumber);
      setPatentData(prevState => ({...prevState, [side]: data}));
      if (side === 'left') {
        setLeftSrc(`patent:${patentNumber}`);
      } else {
        setRightSrc(`patent:${patentNumber}`);
      }
    } catch (error) {
      console.error('Error fetching patent data:', error);
      setError(`Error fetching patent data: ${error.message}`);
    }
  };

  const handlePatentFetch = (side) => {
    const patentNumber = side === 'left' ? leftPatentInput : rightPatentInput;
    if (patentNumber) {
      fetchPatentData(patentNumber, side);
    }
  };

  const renderContent = (src, side) => {
    if (src.startsWith('blob:')) {
      return <embed src={src} type="application/pdf" width="100%" height="100%" />;
    } else if (src.startsWith('patent:') && patentData && patentData[side]) {
      const data = patentData[side];
      return (
        <PatentDisplay>
          <h2>{data.title}</h2>
          <p><strong>Publication Number:</strong> {data.publication_number}</p>
          <p><strong>Filing Date:</strong> {data.filing_date}</p>
          <p><strong>Grant Date:</strong> {data.grant_date}</p>
          <p><strong>Inventors:</strong> {data.inventor_harmonized.join(', ')}</p>
          <p><strong>Assignees:</strong> {data.assignee_harmonized.join(', ')}</p>
          <h3>Abstract</h3>
          <p>{data.abstract}</p>
        </PatentDisplay>
      );
    } else {
      return <Iframe src={src} title="Content" />;
    }
  };

  return (
    <ModalBackground onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>Close</CloseButton>
        {!accessToken && <button onClick={() => login()}>Sign in with Google</button>}
        <InputContainer>
          <div>
            <input
              type="text"
              placeholder="Enter left URL"
              value={leftSrc}
              onChange={(e) => handleUrlInput(e, setLeftSrc)}
              style={{ marginRight: '10px', width: '45%' }}
            />
            <FileUploader
              accessToken={accessToken}
              onUploadComplete={(url) => handleUploadComplete('left', url)}
            />
            <PatentInput
              type="text"
              placeholder="Enter patent number"
              value={leftPatentInput}
              onChange={(e) => setLeftPatentInput(e.target.value)}
            />
            <PatentButton onClick={() => handlePatentFetch('left')}>Fetch Patent</PatentButton>
          </div>
          <div>
            <input
              type="text"
              placeholder="Enter right URL"
              value={rightSrc}
              onChange={(e) => handleUrlInput(e, setRightSrc)}
              style={{ marginRight: '10px', width: '45%' }}
            />
            <FileUploader
              accessToken={accessToken}
              onUploadComplete={(url) => handleUploadComplete('right', url)}
            />
            <PatentInput
              type="text"
              placeholder="Enter patent number"
              value={rightPatentInput}
              onChange={(e) => setRightPatentInput(e.target.value)}
            />
            <PatentButton onClick={() => handlePatentFetch('right')}>Fetch Patent</PatentButton>
          </div>
        </InputContainer>
        {error && <div style={{ color: 'red', margin: '10px 0' }}>{error}</div>}
        <SplitScreen leftWidth={1} rightWidth={1}>
          {leftSrc && renderContent(leftSrc, 'left')}
          {rightSrc && renderContent(rightSrc, 'right')}
        </SplitScreen>
      </ModalContent>
    </ModalBackground>
  );
};

export default SplitScreenModal;