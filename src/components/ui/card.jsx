function cn(...cls) { return cls.filter(Boolean).join(' ') }

function Card({ className, ...props }) {
  return <div className={cn("flex flex-col gap-6 rounded-xl border border-[#e2e8f0] bg-white py-6 shadow-sm", className)} {...props} />
}
function CardHeader({ className, ...props }) {
  return <div className={cn("flex flex-col gap-1.5 px-6", className)} {...props} />
}
function CardTitle({ className, ...props }) {
  return <div className={cn("font-semibold leading-none text-[#0f172a]", className)} {...props} />
}
function CardDescription({ className, ...props }) {
  return <div className={cn("text-sm text-[#64748b]", className)} {...props} />
}
function CardContent({ className, ...props }) {
  return <div className={cn("px-6", className)} {...props} />
}
function CardFooter({ className, ...props }) {
  return <div className={cn("flex items-center px-6", className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
