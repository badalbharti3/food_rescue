export default function LoadingOverlay({ show, message = 'Loading...' }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#F7F5EF]/95 dark:bg-[#0a100d]/90">
      <div className="w-12 h-12 border-4 border-[#245C45] dark:border-[#86b891] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-[#245C45] dark:text-[#9dd0a6] animate-pulse">{message}</p>
    </div>
  );
}
