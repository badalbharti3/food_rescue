export default function Spinner() {
  return <div className="flex justify-center p-6"><div className="w-8 h-8 border-4 border-[#245C45] border-t-transparent rounded-full animate-spin" /></div>;
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-[#DCE9DC] flex items-center justify-center mb-3">
        <span className="text-2xl">📦</span>
      </div>
      <p className="font-semibold text-gray-800">{title}</p>
      {description && <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', description, onRetry }) {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-200 flex items-center justify-center mb-3">
        <span className="text-2xl">⚠️</span>
      </div>
      <p className="font-semibold text-gray-800">{title}</p>
      {description && <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">{description}</p>}
      {onRetry && <button onClick={onRetry} className="mt-4 px-4 py-2 rounded-xl bg-[#245C45] text-white text-sm font-semibold hover:bg-[#173F32] transition">Try again</button>}
    </div>
  );
}
