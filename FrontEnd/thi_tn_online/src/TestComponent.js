import React from 'react';
import { FaUser, FaLock, FaGoogle, FaMicrosoft, FaQrcode, FaGraduationCap, FaEye, FaEyeSlash } from 'react-icons/fa';

// Test imports
console.log('Testing imports...');

try {
  console.log('FaUser:', FaUser);
  console.log('FaLock:', FaLock);
  console.log('FaGoogle:', FaGoogle);
  console.log('FaMicrosoft:', FaMicrosoft);
  console.log('FaQrcode:', FaQrcode);
  console.log('FaGraduationCap:', FaGraduationCap);
  console.log('FaEye:', FaEye);
  console.log('FaEyeSlash:', FaEyeSlash);
} catch (error) {
  console.error('Import error:', error);
}

const TestComponent = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Components</h1>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <FaUser size={24} />
        <FaLock size={24} />
        <FaGoogle size={24} />
        <FaMicrosoft size={24} />
        <FaQrcode size={24} />
        <FaGraduationCap size={24} />
        <FaEye size={24} />
        <FaEyeSlash size={24} />
      </div>
      <p>All icons loaded successfully!</p>
    </div>
  );
};

export default TestComponent;
