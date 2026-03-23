function Select({ className = '', label, error, children, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">{label}</label>}
      <select
        className={[
          "h-9 w-full rounded-md border border-[#e2e8f0] bg-white px-3 py-1 text-sm shadow-sm transition-colors outline-none cursor-pointer",
          "focus:border-[#1A5EA8] focus:ring-2 focus:ring-[#1A5EA8]/20",
          "disabled:pointer-events-none disabled:opacity-50",
          error ? "border-red-400" : "",
          className
        ].filter(Boolean).join(' ')}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}

export { Select }
