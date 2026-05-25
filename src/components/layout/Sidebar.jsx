import { NavLink } from 'react-router-dom'
import { LayoutDashboard, PhoneCall, Ticket, Settings } from 'lucide-react'
import useAriaStore from '../../store/ariaStore'

const navItems = [
  { to: '/dashboard', label: 'Dashboard',    Icon: LayoutDashboard },
  { to: '/calls',     label: 'Active Calls', Icon: PhoneCall, live: true },
  { to: '/tickets',   label: 'Tickets Queue', Icon: Ticket },
]

const systemItems = [
  { to: '/settings', label: 'Settings', Icon: Settings },
]

function Sidebar() {
  const activeCalls = useAriaStore((s) => s.activeCalls)

  return (
    <div className="w-56 bg-[#0D1B2A] flex flex-col flex-shrink-0">

      {/* Logo */}
      <div className="px-4 py-5 border-b border-[#162233]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <PhoneCall size={15} color="white" />
          </div>
          <div>
            <div className="text-white font-extrabold text-base tracking-tight">ARIA</div>
            <div className="text-[#334155] text-[10px] tracking-widest uppercase mt-0.5">v1.0 · Production</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 px-3 py-4">
        <div className="text-[#334155] text-[10px] font-bold tracking-widest uppercase px-2 mb-2">Main Menu</div>

        {navItems.map(({ to, label, Icon, live }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-all duration-150 cursor-pointer
              ${isActive
                ? 'bg-[#1E3A5F] text-white font-semibold'
                : 'text-[#64748B] hover:text-white hover:bg-[#162233]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={15} color={isActive ? '#fff' : '#64748B'} />
                <span className="flex-1">{label}</span>
                {live && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                    <span className="text-emerald-400 text-[10px] font-bold">{activeCalls.length}</span>
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        <div className="text-[#334155] text-[10px] font-bold tracking-widest uppercase px-2 mt-5 mb-2">System</div>

        {systemItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-all duration-150 cursor-pointer
              ${isActive
                ? 'bg-[#1E3A5F] text-white font-semibold'
                : 'text-[#64748B] hover:text-white hover:bg-[#162233]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={15} color={isActive ? '#fff' : '#64748B'} />
                <span className="flex-1">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* User */}
      <div className="p-3 border-t border-[#162233]">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            SS
          </div>
          <div>
            <div className="text-slate-200 text-xs font-semibold">Shyam S.</div>
            <div className="text-[#475569] text-[11px]">Supervisor</div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Sidebar