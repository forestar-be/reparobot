'use client';

import React from 'react';

type ModalType = 'error' | 'loading' | 'success' | 'info';

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  message: string;
  type?: ModalType;
  closable?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'error',
  closable = true,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (closable && onClose) {
      onClose();
    }
  };

  const handleCloseClick = () => {
    if (closable && onClose) {
      onClose();
    }
  };

  // Configuration pour chaque type de modal
  const config = {
    error: {
      title: title || 'Erreur',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      titleColor: 'text-red-600',
      messageBg: 'bg-red-50',
      borderColor: 'border-red-200/30',
      icon: (
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      ),
    },
    loading: {
      title: title || 'Envoi en cours',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-600',
      messageBg: 'bg-blue-50',
      borderColor: 'border-blue-200/30',
      icon: (
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      ),
    },
    success: {
      title: title || 'Succès',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      titleColor: 'text-green-600',
      messageBg: 'bg-green-50',
      borderColor: 'border-green-200/30',
      icon: (
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    info: {
      title: title || 'Information',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-600',
      messageBg: 'bg-blue-50',
      borderColor: 'border-blue-200/30',
      icon: (
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  };

  const currentConfig = config[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm ${
          closable ? 'cursor-pointer' : 'cursor-not-allowed'
        }`}
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div
        className={`relative mx-4 w-full max-w-md transform rounded-2xl border ${currentConfig.borderColor} bg-white/95 p-6 shadow-2xl backdrop-blur-lg transition-all`}
      >
        {/* Header */}
        <div className="mb-4 text-center">
          <div
            className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full ${currentConfig.iconBg}`}
          >
            <div className={currentConfig.iconColor}>{currentConfig.icon}</div>
          </div>
          <h2
            className={`text-xl font-bold sm:text-2xl ${currentConfig.titleColor}`}
          >
            {currentConfig.title}
          </h2>
        </div>

        {/* Message */}
        <div className={`mb-6 rounded-xl p-4 ${currentConfig.messageBg}`}>
          <p className="text-center text-sm text-gray-700 sm:text-base">
            {message}
          </p>
        </div>

        {/* Action Button - Seulement si la modal est fermable */}
        {closable && (
          <div className="flex justify-center">
            <button
              onClick={handleCloseClick}
              className="btn-primary w-full px-6 py-3 text-sm sm:w-auto sm:text-base"
            >
              {type === 'error' ? 'Compris' : 'OK'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
