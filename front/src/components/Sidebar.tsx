import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  {
    to: '/mesures',
    label: 'Mesures',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
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
      className="w-60 shrink-0 bg-[#111318] border-r border-[#1e2230] flex flex-col min-h-screen sticky top-0"
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b border-[#1e2230]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-[#00e5a0] flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d0f14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-wider text-white uppercase">
            UrbanHub
          </span>
        </div>
        <p className="mt-1.5 text-xs tracking-widest text-[#3d4455] uppercase font-medium">
          Réseau de capteurs
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        <p className="px-3 mb-2 text-[10px] tracking-[0.15em] text-[#3d4455] uppercase font-semibold">
          Navigation
        </p>
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium tracking-wide transition-all duration-150',
                isActive
                  ? 'bg-[#00e5a0]/10 text-[#00e5a0] border border-[#00e5a0]/20'
                  : 'text-[#64748b] border border-transparent hover:text-[#cbd5e1] hover:bg-[#1e2230]',
              ].join(' ')
            }
          >
            {icon}
            <span className="uppercase tracking-wider text-xs">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#1e2230]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-pulse" />
          <span style={{ fontFamily: 'var(--font-mono)' }} className="text-[10px] text-[#3d4455] tracking-widest uppercase">
            Système actif
          </span>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
