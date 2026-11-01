import { forwardRef } from 'react';

const Input = forwardRef(function Input({ label, error, className='', ...props }, ref) {
  return (
    <div className="mb-3">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input ref={ref} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#245C45] ${error ? 'border-gray-500' : 'border-gray-300'} ${className}`} {...props} />
      {error && <p className="text-xs text-gray-600 mt-1">{error}</p>}
    </div>
  );
});

export default Input;
export function Textarea({ label, error, className='', ...props }) {
  return (
    <div className="mb-3">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <textarea className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#245C45] ${error ? 'border-gray-500' : 'border-gray-300'} ${className}`} {...props} />
      {error && <p className="text-xs text-gray-600 mt-1">{error}</p>}
    </div>
  );
}
export function Select({ label, error, children, className='', ...props }) {
  return (
    <div className="mb-3">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#245C45] ${error ? 'border-gray-500' : 'border-gray-300'} ${className}`} {...props}>{children}</select>
      {error && <p className="text-xs text-gray-600 mt-1">{error}</p>}
    </div>
  );
}
