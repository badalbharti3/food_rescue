export default function Button({ children, variant='primary', size='md', className='', ...props }) {
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3 text-base' };
  const base = `inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-transform duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none ${sizes[size]}`;
  const variants = {
    primary: 'clay-btn text-white',
    secondary: 'bg-gradient-to-br from-[#78A77B] to-[#245C45] text-white shadow-[6px_6px_12px_rgba(36,92,69,0.25),-4px_-4px_10px_rgba(255,255,255,0.6)] hover:-translate-y-0.5 active:translate-y-0.5 rounded-xl',
    outline: 'bg-white/80 border border-[#245C45]/30 text-[#245C45] shadow-sm hover:bg-[#245C45]/5 hover:-translate-y-0.5 rounded-xl',
    danger: 'bg-gradient-to-br from-gray-700 to-gray-900 text-white shadow-[6px_6px_12px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 active:translate-y-0.5 rounded-xl',
    ghost: 'text-gray-700 hover:bg-white/60 rounded-xl'
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>;
}
