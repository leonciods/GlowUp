
import React, { useState } from 'react'
import { useSalonData } from '../hooks/useSalonData'
import { format, isToday, isTomorrow, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {Calendar, Users, DollarSign, TrendingUp, Clock, Star, Database} from 'lucide-react'
import { seedNovemberData } from '../scripts/seedNovemberData'
import toast from 'react-hot-toast'

const Dashboard: React.FC = () => {
  const { clients, appointments, services, reminders, loading, fetchAllData } = useSalonData()
  const [seeding, setSeeding] = useState(false)

  const handleSeedData = async () => {
    if (seeding) return
    
    const confirm = window.confirm('Deseja popular o banco de dados com agendamentos de novembro? Esta ação criará cerca de 150+ agendamentos.')
    if (!confirm) return

    setSeeding(true)
    try {
      const result = await seedNovemberData()
      toast.success(`✅ ${result.appointmentsCreated} agendamentos criados!`)
      await fetchAllData() // Recarregar dados
    } catch (error) {
      toast.error('Erro ao popular dados')
      console.error(error)
    } finally {
      setSeeding(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8e413a]"></div>
      </div>
    )
  }

  // Calculate metrics
  const today = new Date()
  const currentMonth = { start: startOfMonth(today), end: endOfMonth(today) }
  
  const todayAppointments = appointments.filter(apt => 
    isToday(new Date(apt.date)) && apt.status !== 'cancelado'
  )
  
  const tomorrowAppointments = appointments.filter(apt => 
    isTomorrow(new Date(apt.date)) && apt.status !== 'cancelado'
  )
  
  const monthlyRevenue = appointments
    .filter(apt => {
      const aptDate = new Date(apt.date)
      return apt.status === 'realizado' && 
             aptDate >= currentMonth.start && 
             aptDate <= currentMonth.end
    })
    .reduce((sum, apt) => sum + apt.price, 0)
  
  const pendingReminders = reminders.filter(r => r.status === 'pendente').length
  
  const topServices = services
    .map(service => ({
      ...service,
      count: appointments.filter(apt => apt.service === service.name && apt.status === 'realizado').length
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
  
  const topClients = clients
    .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
    .slice(0, 3)

  const stats = [
    {
      title: 'Agendamentos Hoje',
      value: todayAppointments.length,
      icon: Calendar,
      color: 'bg-[#8e413a]'
    },
    {
      title: 'Total de Clientes',
      value: clients.length,
      icon: Users,
      color: 'bg-[#aa6a62]'
    },
    {
      title: 'Receita do Mês',
      value: `R$ ${monthlyRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-[#e3bbb1]'
    },
    {
      title: 'Lembretes Pendentes',
      value: pendingReminders,
      icon: Clock,
      color: 'bg-[#bfa866]'
    }
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSeedData}
            disabled={seeding}
            className="flex items-center space-x-2 px-4 py-2 bg-[#8e413a] text-white rounded-lg hover:bg-[#aa6a62] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Database className="h-5 w-5" />
            <span>{seeding ? 'Populando...' : 'Popular Dados Novembro'}</span>
          </button>
          <div className="text-gray-600">
            {format(today, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Agendamentos de Hoje</h2>
          {todayAppointments.length === 0 ? (
            <p className="text-gray-500">Nenhum agendamento para hoje</p>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((appointment) => (
                <div key={appointment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{appointment.clientName}</p>
                    <p className="text-sm text-gray-600">{appointment.service}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[#8e413a]">{appointment.time}</p>
                    <p className="text-sm text-gray-600">R$ {appointment.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tomorrow's Appointments */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Agendamentos de Amanhã</h2>
          {tomorrowAppointments.length === 0 ? (
            <p className="text-gray-500">Nenhum agendamento para amanhã</p>
          ) : (
            <div className="space-y-3">
              {tomorrowAppointments.map((appointment) => (
                <div key={appointment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{appointment.clientName}</p>
                    <p className="text-sm text-gray-600">{appointment.service}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[#aa6a62]">{appointment.time}</p>
                    <p className="text-sm text-gray-600">R$ {appointment.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Services */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-[#8e413a]" />
            Serviços Mais Realizados
          </h2>
          <div className="space-y-3">
            {topServices.map((service, index) => (
              <div key={service._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[#8e413a] text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{service.name}</p>
                    <p className="text-sm text-gray-600">R$ {service.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[#8e413a]">{service.count} vezes</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Clients */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Star className="h-5 w-5 mr-2 text-[#bfa866]" />
            Clientes VIP
          </h2>
          <div className="space-y-3">
            {topClients.map((client, index) => (
              <div key={client._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[#bfa866] text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{client.name}</p>
                    <p className="text-sm text-gray-600">{client.visitCount || 0} visitas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[#bfa866]">R$ {(client.totalSpent || 0).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
