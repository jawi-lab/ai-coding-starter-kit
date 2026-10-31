import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DesktopSidebar } from './DesktopSidebar'
import { useAuth } from '@/contexts/AuthContext'

vi.mock('@/contexts/AuthContext', () => ({ useAuth: vi.fn() }))

function renderWith(auth: object) {
  vi.mocked(useAuth).mockReturnValue(auth as ReturnType<typeof useAuth>)
  render(<DesktopSidebar active="home" targetGroupId={null} onProfile={() => {}} />)
}

const user = { email: 'a@example.com', user_metadata: { display_name: 'Alter Name' } }

describe('DesktopSidebar', () => {
  it('zeigt den Namen aus dem Profil, nicht aus den Auth-Metadaten', () => {
    renderWith({ user, profile: { display_name: 'Neuer Name' } })
    expect(screen.getByText('Neuer Name')).toBeInTheDocument()
    expect(screen.queryByText('Alter Name')).not.toBeInTheDocument()
  })

  it('zeigt ohne geladenes Profil weder Metadaten noch E-Mail', () => {
    renderWith({ user, profile: null })
    expect(screen.getByText('Du')).toBeInTheDocument()
    expect(screen.queryByText('a@example.com')).not.toBeInTheDocument()
  })
})
