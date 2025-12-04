
import React from 'react'
import { NavLink } from 'react-router-dom'
import {LayoutDashboard, Calendar, CalendarDays, Users, BarChart3, Bell, Settings, Scissors} from 'lucide-react'

const Sidebar: React.FC = () => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: CalendarDays, label: 'Calendário', path: '/agendamento' },
    { icon: Calendar, label: 'Agenda do Dia', path: '/calendario' },
    { icon: Users, label: 'Clientes', path: '/clientes' },
    { icon: BarChart3, label: 'Relatórios', path: '/relatorios' },
    { icon: Bell, label: 'Lembretes', path: '/lembretes' },
    { icon: Settings, label: 'Configurações', path: '/configuracoes' }
  ]

  return (
    <div className="w-64 bg-gradient-to-b from-[#ffe4d8] to-[#f5d5c8] border-r border-[#e3bbb1] min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <Scissors className="h-8 w-8 text-[#8e413a]" />
          <div>
            <h1 className="text-2xl font-bold text-[#8e413a]">GlowUp</h1>
            <p className="text-[#aa6a62] text-sm">A beleza nas suas mãos</p>
          </div>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#8e413a] text-white shadow-md'
                    : 'text-[#8e413a] hover:bg-[#e3bbb1] hover:text-[#8e413a]'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default Sidebar
