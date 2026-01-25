import { LucideIcon, SearchX } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export default function EmptyState({
  icon: Icon = SearchX,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-dark-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-dark-500" />
      </div>
      <h3 className="text-lg font-semibold text-dark-100 mb-2">{title}</h3>
      <p className="text-dark-400 mb-6 max-w-sm mx-auto">{description}</p>
      {action && (
        <button onClick={action.onClick} className="btn-primary">
          {action.label}
        </button>
      )}
    </div>
  )
}
