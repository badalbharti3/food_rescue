const colors = {
  pending: 'bg-[#DCE9DC] text-[#245C45] dark:bg-[#1e3327] dark:text-[#9dd0a6]',
  approved: 'bg-[#245C45] text-white dark:bg-[#2e7254]',
  reserved: 'bg-gray-200 text-gray-800 dark:bg-[#223027] dark:text-[#c8d2cc]',
  completed: 'bg-[#173F32] text-white dark:bg-[#1d4a3a]',
  cancelled: 'bg-gray-300 text-gray-700 dark:bg-[#202c25] dark:text-[#9aa69f]',
  expired: 'bg-gray-400 text-white dark:bg-[#3a453f]',
  rejected: 'bg-gray-500 text-white dark:bg-[#4a3a3a]',
  verified: 'bg-[#245C45] text-white dark:bg-[#2e7254]',
  active: 'bg-[#78A77B] text-white dark:bg-[#3f6b49]',
  paused: 'bg-gray-300 text-gray-800 dark:bg-[#202c25] dark:text-[#9aa69f]',
  suspended: 'bg-gray-600 text-white dark:bg-[#4a3030]',
  open: 'bg-gray-200 text-gray-800 dark:bg-[#223027] dark:text-[#c8d2cc]',
  resolved: 'bg-[#245C45] text-white dark:bg-[#2e7254]'
};

export default function Badge({ status, children }) {
  const s = (status || '').toLowerCase();
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colors[s] || 'bg-gray-100 text-gray-700 dark:bg-[#18231c] dark:text-[#c8d2cc]'}`}>{children || status}</span>;
}
