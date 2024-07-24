import React, { useState } from 'react';
import SplitScreenModal from './components/SplitScreenModal';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leftUrl, setLeftUrl] = useState('');
  const [rightUrl, setRightUrl] = useState('');

  const openModal = (url) => {
    setLeftUrl(url || '');
    setRightUrl('');
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      <a href="#" onClick={() => openModal('https://www.wipo.int/export/sites/www/sme/en/documents/pdf/ip_panorama_3_learning_points.pdf')}>
        Open Google Sheet in Split Screen
      </a>
      <div style={{ margin: '20px 0' }}>
        <button onClick={() => openModal()}>Split Screen</button>
      </div>
      <div style={{ margin: '20px 0' }}>
        <button onClick={() => openModal('https://patents.google.com/patent/US7654321B2')}>
          Open Google Patent in Split Screen
        </button>
      </div>
      {isModalOpen && (
        <SplitScreenModal
          leftSrc={leftUrl}
          rightSrc={rightUrl}
          setLeftSrc={setLeftUrl}
          setRightSrc={setRightUrl}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default App;