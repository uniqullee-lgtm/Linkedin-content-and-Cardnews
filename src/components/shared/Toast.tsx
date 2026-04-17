'use client'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: string
  message: string
  type: ToastType
}

let toastListeners: ((toast: ToastMessage) => void)[] = []

export function showToast(message: string, type: ToastType = 'info') {
  const toast: ToastMessage = { id: Date.now().toString(), message, type }
  toastListeners.forEach(fn => fn(toast))
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    const handler = (toast: ToastMessage) => {
      setToasts(prev => [...prev, toast])
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id))
      }, 3000)
    }
    toastListeners.push(handler)
    return () => {
      toastListeners = toastListeners.filter(fn => fn !== handler)
    }
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white',
            'animate-in slide-in-from-right-4 duration-200',
            toast.type === 'success' && 'bg-green-600',
            toast.type === 'error' && 'bg-red-600',
            toast.type === 'info' && 'bg-brand-navy',
          )}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
