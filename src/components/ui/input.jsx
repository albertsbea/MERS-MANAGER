function Input({ className = '', label, hint, error, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">{label}</label>}
      <input
        className={[
          "h-9 w-full min-w-0 rounded-md border border-[#e2e8f0] bg-transparent px-3 py-1 text-sm shadow-sm transition-colors outline-none placeholder:text-[#94a3b8]",
          "focus:border-[#1A5EA8] focus:ring-2 focus:ring-[#1A5EA8]/20",
          "disabled:pointer-events-none disabled:opacity-50",
          error ? "border-red-400 focus:ring-red-200" : "",
          className
        ].filter(Boolean).join(' ')}
        {...props}
      />
      {hint && !error && <span className="text-xs text-[#94a3b8]">{hint}</span>}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}

export { Input }
