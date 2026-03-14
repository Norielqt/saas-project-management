const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
  xl: 'w-14 h-14 text-lg',
}

function getInitials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

// Simple deterministic color based on name
const COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
]

function nameToColor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i)
  return COLORS[hash % COLORS.length]
}

export default function Avatar({ src, name = '', size = 'md', className = '' }) {
  const sizeClass = sizeClasses[size] ?? sizeClasses.md

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0 ${className}`}
      />
    )
  }

  return (
    <div
      className={`${sizeClass} ${nameToColor(name)} rounded-full flex items-center justify-center
        text-white font-semibold flex-shrink-0 select-none ${className}`}
      title={name}
    >
      {getInitials(name)}
    </div>
  )
}
