function Skeleton({ className = '', ...props }) {
  return <div className={['animate-pulse rounded-md bg-[#f1f5f9]', className].join(' ')} {...props} />
}

export { Skeleton }
