import React from 'react';
import { CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error';
  title: string;
  message: string;
}

const StatusModal: React.FC<StatusModalProps> = ({ isOpen, onClose, type, title, message }) => {
  if (!isOpen) return null;

  return (
    // changed bg-indigo-900/80 to bg-white/30 for the frosted glass look
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/30 backdrop-blur-md">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100">
        <div className="flex flex-col items-center text-center">
          <div className={`p-4 rounded-full mb-4 ${type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
            {type === 'success' ? (
              <CheckCircle className="w-12 h-12 text-green-500" />
            ) : (
              <AlertCircle className="w-12 h-12 text-red-500" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-500 mb-8 font-medium">{message}</p>
          
          <button
            onClick={onClose}
            className={`w-full py-3 px-6 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${
              type === 'success' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-gray-800 hover:bg-gray-900 shadow-gray-200'
            }`}
          >
            {type === 'success' ? 'Back to Page' : 'Try Again'}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;