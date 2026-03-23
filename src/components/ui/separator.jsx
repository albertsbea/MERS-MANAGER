function Separator({ className = '', orientation = 'horizontal', ...props }) {
  const cls = [
    "shrink-0 bg-[#e2e8f0]",
    orientation === 'horizontal' ? "h-px w-full" : "h-full w-px",
    className
  ].filter(Boolean).join(' ')
  return <div role="separator" className={cls} {...props} />
}

export { Separator }
