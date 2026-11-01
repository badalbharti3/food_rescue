export default function FilterBar({ options, value, onChange, className = '' }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((o) => (
        <button
          key={o.value || 'all'}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`px-3 py-1.5 rounded-full text-sm transition-colors border ${
            value === o.value
              ? 'bg-[#245C45] text-white border-[#245C45] shadow-md shadow-[#245C45]/20 font-medium'
              : 'bg-white/70 text-gray-600 border-gray-200 hover:bg-white hover:text-[#245C45]'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
