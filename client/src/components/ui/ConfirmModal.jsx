import { useEffect } from 'react';

export default function ConfirmModal({ open, title = 'Confirm', message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, danger = false }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onCancel && onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-2">{message}</p>
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">{cancelLabel}</button>
            <button onClick={onConfirm} className={`px-4 py-2 rounded-lg text-white ${danger ? 'bg-gray-700 hover:bg-gray-900' : 'bg-[#245C45] hover:bg-[#173F32]'}`}>{confirmLabel}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
