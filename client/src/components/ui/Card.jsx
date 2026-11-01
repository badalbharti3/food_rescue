export default function Card({ children, className='', glass = false, clay = false }) {
  let base;
  if (glass) base = 'glass rounded-2xl p-5';
  else if (clay) base = 'clay p-5';
  else base = 'bg-white/95 dark:bg-[#121c16] rounded-2xl shadow-[0_4px_20px_-4px_rgba(36,92,69,0.08)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.45)] border border-white/70 dark:border-[#223027] p-5 transition-shadow hover:shadow-[0_8px_30px_-4px_rgba(36,92,69,0.14)] dark:hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.6)]';
  return <div className={`${base} ${className}`}>{children}</div>;
}
export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
