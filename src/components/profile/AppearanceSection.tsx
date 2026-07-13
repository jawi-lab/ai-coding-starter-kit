'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme, type Theme } from '@/hooks/useTheme'

const OPTIONS: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Hell', Icon: Sun },
  { value: 'dark', label: 'Dunkel', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
]

export function AppearanceSection() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-2.5">
      <p className="text-[12px] font-[700] tracking-[0.06em] text-ink-3">
        Darstellung
      </p>
      <div
        role="radiogroup"
        aria-label="Farbschema"
        className="flex gap-1 bg-surface-2 rounded-pill p-0.5"
      >
        {OPTIONS.map(({ value, label, Icon }) => {
          const active = theme === value
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(value)}
              className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-pill text-[13px] font-[700] transition-colors
                ${active
                  ? 'bg-surface text-ink shadow-sm'
                  : 'text-ink-3 hover:text-ink-2'
                }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
