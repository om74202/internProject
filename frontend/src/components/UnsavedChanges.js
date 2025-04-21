import { useState, useEffect } from 'react';
import { useBlocker, useNavigate } from 'react-router-dom';

export function useLeavePrevention(hasUnsavedChanges) {
  const [showModal, setShowModal] = useState(false);
  const [intendedPath, setIntendedPath] = useState('');
  const navigate = useNavigate();

  // For in-app navigation blocking
  useBlocker(({ nextLocation }) => {
    if (hasUnsavedChanges && nextLocation.pathname !== window.location.pathname) {
      setShowModal(true);
      setIntendedPath(nextLocation.pathname);
      return false; // Block navigation
    }
    return true; // Allow navigation
  });

  // For page refresh/close
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes!';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const proceedNavigation = () => {
    setShowModal(false);
    navigate(intendedPath);
  };

  const cancelNavigation = () => {
    setShowModal(false);
  };

  return { 
    showModal, 
    proceedNavigation, 
    cancelNavigation,
    intendedPath
  };
}