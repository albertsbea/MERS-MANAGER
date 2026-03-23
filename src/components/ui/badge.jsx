const variants = {
  default:     "bg-[#0D2B5E] text-white",
  secondary:   "bg-[#f1f5f9] text-[#0f172a]",
  destructive: "bg-red-500 text-white",
  outline:     "border border-[#e2e8f0] text-[#0f172a]",
  blue:        "bg-[#EBF3FC] text-[#1A5EA8]",
  green:       "bg-[#E1F5EE] text-[#0F6E56]",
  yellow:      "bg-amber-50 text-amber-700",
  red:         "bg-red-50 text-red-600",
  slate:       "bg-slate-100 text-slate-600",
  purple:      "bg-[#EEEDFE] text-[#4842A8]",
  teal:        "bg-teal-50 text-teal-700",
  navy:        "bg-[#EBF3FC] text-[#0D2B5E]",
  gold:        "bg-amber-50 text-amber-700",
  pink:        "bg-pink-50 text-pink-700",
}
const sizes = {
  xs: "px-2 py-0 text-[10px] rounded-md",
  sm: "px-2.5 py-0.5 text-xs rounded-md",
  md: "px-3 py-1 text-xs rounded-lg",
}

function Badge({ className = '', variant = 'default', size = 'sm', ...props }) {
  const cls = [
    "inline-flex items-center font-semibold transition-colors",
    variants[variant] || variants.default,
    sizes[size] || sizes.sm,
    className
  ].filter(Boolean).join(' ')
  return <span className={cls} {...props} />
}

export { Badge }
