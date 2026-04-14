import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Tableau de bord',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    to: '/zones',
    label: 'Zones',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    to: '/capteurs',
    label: 'Capteurs',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M6.3 6.3a8 8 0 0 0 0 11.4M17.7 6.3a8 8 0 0 1 0 11.4M3.5 3.5a13 13 0 0 0 0 17M20.5 3.5a13 13 0 0 1 0 17" />
      </svg>
    ),
  },
  {
    to: '/comparaison',
    label: 'Comparaison',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    to: '/carte',
    label: 'Carte',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
        <line x1="8" y1="2" x2="8" y2="18" />
        <line x1="16" y1="6" x2="16" y2="22" />
      </svg>
    ),
  },
  {
    to: '/types-capteur',
    label: 'Types de capteur',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
]

const Sidebar = () => {
  return (
    <aside
      style={{ fontFamily: 'var(--font-display)' }}
      className="w-64 shrink-0 bg-white border-r border-[#e2e8f0] flex flex-col min-h-screen sticky top-0"
    >
      {/* Logo */}
      <div className="px-6 py-8 border-b border-[#e2e8f0]">
        <span className="text-2xl font-bold tracking-wider text-[#0d0f14] uppercase">
          UrbanHub
        </span>
        <p className="mt-1 text-sm tracking-wide text-[#94a3b8] font-medium">
          Réseau de capteurs
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
        <p className="px-3 mb-3 text-[11px] tracking-[0.15em] text-[#94a3b8] uppercase font-semibold">
          Navigation
        </p>
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium tracking-wide transition-all duration-150',
                isActive
                  ? 'bg-[#00e5a0]/10 text-[#00b07d] border border-[#00e5a0]/20'
                  : 'text-[#64748b] border border-transparent hover:text-[#1e293b] hover:bg-[#f1f5f9]',
              ].join(' ')
            }
          >
            {icon}
            <span className="tracking-wider text-sm">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-5 border-t border-[#e2e8f0]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00e5a0] animate-pulse" />
          <span style={{ fontFamily: 'var(--font-mono)' }} className="text-[11px] text-[#94a3b8] tracking-wider uppercase">
            Système actif
          </span>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
