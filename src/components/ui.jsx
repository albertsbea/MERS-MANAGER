// Re-exports de tous les composants UI — zéro dépendance externe
export { Button } from './ui/button.jsx'
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card.jsx'
export { Input } from './ui/input.jsx'
export { Select } from './ui/select.jsx'
export { Badge } from './ui/badge.jsx'
export { Separator } from './ui/separator.jsx'
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table.jsx'
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter, DialogClose } from './ui/dialog.jsx'
export { Skeleton } from './ui/skeleton.jsx'

import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from './ui/dialog.jsx'

function cn(...cls) { return cls.filter(Boolean).join(' ') }

// ── Modal (backward compat) ───────────────────────────────────
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <Dialog open={isOpen} onOpenChange={v => !v && onClose()}>
      <DialogContent className={sizes[size]}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogBody>{children}</DialogBody>
      </DialogContent>
    </Dialog>
  )
}

// ── StatCard ─────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon, accent = 'blue', trend, trendLabel }) {
  const accents = {
    blue:   { iconBg: '#EBF3FC', ic: '#1A5EA8' },
    gold:   { iconBg: '#FEF6E7', ic: '#C8880A' },
    green:  { iconBg: '#E1F5EE', ic: '#1D9E75' },
    purple: { iconBg: '#EEEDFE', ic: '#534AB7' },
    red:    { iconBg: '#FEF0F0', ic: '#E24B4A' },
    navy:   { iconBg: '#EBF3FC', ic: '#0D2B5E' },
    teal:   { iconBg: '#E0F5EF', ic: '#0F7A5A' },
  }
  const a = accents[accent] || accents.blue
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
      {icon && (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: a.iconBg }}>
          {icon(a.ic)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#64748b]">{label}</p>
        <p className="truncate text-2xl font-bold text-[#0f172a] leading-tight">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-[#94a3b8]">{sub}</p>}
        {trend !== undefined && (
          <span className={cn(
            'mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
            trend >= 0 ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-red-50 text-red-600'
          )}>
            {trend >= 0 ? '↑' : '↓'} {trendLabel}
          </span>
        )}
      </div>
    </div>
  )
}

// ── PageHeader ───────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold text-[#0f172a] leading-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[#64748b]">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

// ── EmptyState ───────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
          {icon}
        </div>
      )}
      <p className="font-semibold text-[#0f172a]">{title}</p>
      {description && <p className="mt-1.5 max-w-xs text-sm text-[#64748b] leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

// ── Spinner ──────────────────────────────────────────────────
export function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#0D2B5E]/15 border-t-[#0D2B5E]" />
      <p className="text-xs font-medium text-[#94a3b8]">Chargement...</p>
    </div>
  )
}

// ── Legacy aliases ────────────────────────────────────────────
export function CardBody({ children, className = '' }) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>
}
export function Th({ children, right = false }) {
  return (
    <th className={cn('h-10 px-4 align-middle text-xs font-semibold text-[#64748b] uppercase tracking-wider bg-[#f8fafc] border-b border-[#f1f5f9]', right ? 'text-right' : 'text-left')}>
      {children}
    </th>
  )
}
export function Td({ children, right = false, bold = false, className = '' }) {
  return (
    <td className={cn('px-4 py-3.5 align-middle text-sm', right ? 'text-right' : '', bold ? 'font-semibold text-[#0f172a]' : 'text-[#64748b]', className)}>
      {children}
    </td>
  )
}
