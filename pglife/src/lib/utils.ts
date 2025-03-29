import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(dateString))
}

export function formatPhoneNumber(phone: string): string {
  // Assuming Indian phone numbers
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`
  }
  return phone
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  // Assuming Indian phone numbers
  const phoneRegex = /^[6-9]\d{9}$/
  return phoneRegex.test(phone)
}

export function validatePassword(password: string): {
  isValid: boolean;
  message: string;
} {
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long',
    }
  }
  
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter',
    }
  }
  
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter',
    }
  }
  
  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number',
    }
  }
  
  if (!/[!@#$%^&*]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one special character (!@#$%^&*)',
    }
  }
  
  return {
    isValid: true,
    message: 'Password is valid',
  }
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function calculateSubscriptionEndDate(startDate: Date, planType: 'weekly' | 'monthly'): Date {
  const endDate = new Date(startDate)
  if (planType === 'weekly') {
    endDate.setDate(endDate.getDate() + 7)
  } else {
    endDate.setMonth(endDate.getMonth() + 1)
  }
  return endDate
}

export function isSubscriptionActive(endDate: string): boolean {
  return new Date(endDate) > new Date()
}

export function getSubscriptionPrice(planType: 'weekly' | 'monthly'): number {
  return planType === 'weekly' ? 99 : 299
}

export function getPropertyUploadPrice(): number {
  return 100 // Price per property upload
}

export function calculateDaysLeft(endDate: string): number {
  const end = new Date(endDate)
  const now = new Date()
  const diffTime = end.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function getAmenityIcon(amenity: string): string {
  const icons: Record<string, string> = {
    wifi: '📶',
    ac: '❄️',
    tv: '📺',
    parking: '🅿️',
    laundry: '👕',
    kitchen: '🍳',
    gym: '💪',
    security: '🔒',
    cleaning: '🧹',
    water: '💧',
    power: '⚡',
    lift: '🛗',
  }
  return icons[amenity.toLowerCase()] || '📌'
}

export function getRuleIcon(rule: string): string {
  const icons: Record<string, string> = {
    smoking: '🚭',
    pets: '🐾',
    guests: '👥',
    parties: '🎉',
    drinking: '🍺',
    music: '🎵',
    cooking: '🍳',
    timing: '⏰',
  }
  return icons[rule.toLowerCase()] || '📜'
}

export function getPropertyTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    '1BHK': '🏠',
    '2BHK': '🏡',
    '3BHK': '🏘️',
    '4BHK': '🏰',
    'Single Room': '🛏️',
    'Shared Room': '👥',
  }
  return icons[type] || '🏠'
}

export function getFurnishingStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    furnished: '🛋️',
    'semi-furnished': '📺',
    unfurnished: '🏠',
  }
  return icons[status.toLowerCase()] || '🏠'
}

export function getAvailableForIcon(availableFor: string): string {
  const icons: Record<string, string> = {
    male: '👨',
    female: '👩',
    all: '👥',
  }
  return icons[availableFor.toLowerCase()] || '👥'
}

export function getPaymentStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    pending: '⏳',
    completed: '✅',
    failed: '❌',
  }
  return icons[status.toLowerCase()] || '❓'
}

export function getPaymentTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    subscription: '🔄',
    property_upload: '📤',
  }
  return icons[type.toLowerCase()] || '💰'
}

export function getRoleIcon(role: string, isOwner: boolean): string {
  if (role === 'admin') return '👑'
  if (isOwner) return '🏠'
  return '👤'
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    booked: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    expired: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  }
  return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800'
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function getRandomColor(): string {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500'
  ]
  
  return colors[Math.floor(Math.random() * colors.length)]
} 