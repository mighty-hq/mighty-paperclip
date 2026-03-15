import React from 'react';
import ClipboardHistory from '../components/ClipboardHistory';

const ClipboardPage: React.FC = () => {
  return (
    <div className="h-full overflow-hidden">
      <ClipboardHistory onBack={() => window.history.back()} />
    </div>
  );
};

export default ClipboardPage;
