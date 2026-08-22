function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 1. Backdrop overlay */}
      <div
        className="fixed inset-0 bg-gray-900/60 dark:bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* 2. Modal Box */}
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-lg overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 text-gray-900 dark:text-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg p-1.5 transition-colors cursor-pointer text-lg leading-none hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
