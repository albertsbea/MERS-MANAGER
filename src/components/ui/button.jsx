import * as React from "react"

const variants = {
  default:     "bg-[#0D2B5E] text-white shadow hover:bg-[#152f6b]",
  destructive: "bg-red-500 text-white shadow hover:bg-red-600",
  outline:     "border border-[#e2e8f0] bg-white shadow-sm hover:bg-[#f8fafc] hover:text-[#0D2B5E]",
  secondary:   "bg-[#f1f5f9] text-[#0f172a] shadow-sm hover:bg-[#e2e8f0]",
  ghost:       "hover:bg-[#f1f5f9] hover:text-[#0D2B5E]",
  link:        "text-[#0D2B5E] underline-offset-4 hover:underline",
  gold:        "bg-[#C8880A] text-white shadow hover:bg-[#a87209]",
  navy:        "bg-[#0D2B5E] text-white shadow hover:bg-[#152f6b]",
}
const sizes = {
  default: "h-9 px-4 py-2 text-sm",
  sm:      "h-8 px-3 text-xs rounded-md",
  lg:      "h-10 px-6 text-sm rounded-md",
  icon:    "h-9 w-9",
}

function Button({ className = '', variant = 'default', size = 'default', asChild = false, children, ...props }) {
  const base = "inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-all outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
  const cls = [base, variants[variant] || variants.default, sizes[size] || sizes.default, className].filter(Boolean).join(' ')

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      className: [cls, children.props.className].filter(Boolean).join(' '),
    })
  }
  return <button className={cls} {...props}>{children}</button>
}

export { Button }
