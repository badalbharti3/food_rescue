export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/65 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#121c16] dark:border dark:border-[#223027] rounded-xl shadow-xl dark:shadow-black/60 max-w-lg w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#223027]">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#eef3f0]">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl leading-none">&times;</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
