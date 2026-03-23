import * as React from "react"
import { X } from "lucide-react"

function cn(...cls) { return cls.filter(Boolean).join(' ') }

const DialogContext = React.createContext(null)

function Dialog({ open, onOpenChange, children }) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

function DialogTrigger({ children, asChild }) {
  const { onOpenChange } = React.useContext(DialogContext) || {}
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { onClick: () => onOpenChange?.(true) })
  }
  return <button onClick={() => onOpenChange?.(true)}>{children}</button>
}

function DialogClose({ children, asChild }) {
  const { onOpenChange } = React.useContext(DialogContext) || {}
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { onClick: () => onOpenChange?.(false) })
  }
  return <button onClick={() => onOpenChange?.(false)}>{children}</button>
}

function DialogContent({ className, children, ...props }) {
  const { open, onOpenChange } = React.useContext(DialogContext) || {}
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={() => onOpenChange?.(false)}
      />
      {/* Panel */}
      <div
        className={cn(
          "relative z-50 w-full max-w-lg rounded-xl border border-[#e2e8f0] bg-white shadow-2xl",
          className
        )}
        onClick={e => e.stopPropagation()}
        {...props}
      >
        {children}
        <button
          onClick={() => onOpenChange?.(false)}
          className="absolute top-4 right-4 rounded-md p-1 text-[#94a3b8] opacity-70 transition-opacity hover:opacity-100 hover:bg-[#f1f5f9] focus:outline-none"
        >
          <X size={16} />
          <span className="sr-only">Fermer</span>
        </button>
      </div>
    </div>
  )
}

function DialogHeader({ className, ...props }) {
  return <div className={cn("flex flex-col gap-1.5 px-6 pt-6 pb-4 border-b border-[#f1f5f9]", className)} {...props} />
}
function DialogTitle({ className, ...props }) {
  return <h2 className={cn("text-base font-semibold leading-none text-[#0f172a]", className)} {...props} />
}
function DialogDescription({ className, ...props }) {
  return <p className={cn("text-sm text-[#64748b]", className)} {...props} />
}
function DialogBody({ className, ...props }) {
  return <div className={cn("px-6 py-4 overflow-y-auto max-h-[65vh]", className)} {...props} />
}
function DialogFooter({ className, ...props }) {
  return <div className={cn("flex items-center justify-end gap-2 px-6 py-4 border-t border-[#f1f5f9]", className)} {...props} />
}

export { Dialog, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter }
