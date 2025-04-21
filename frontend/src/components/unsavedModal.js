// src/components/UnsavedChangesModal.jsx
export function UnsavedChangesModal({ 
    show, 
    onProceed, 
    onCancel 
  }) {
    if (!show) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-md w-full">
          <h3 className="text-lg font-bold mb-4">Unsaved Changes</h3>
          <p className="mb-4">You have unsaved changes. Are you sure you want to leave?</p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Stay on Page
            </button>
            <button
              onClick={onProceed}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Leave Anyway
            </button>
          </div>
        </div>
      </div>
    );
  }