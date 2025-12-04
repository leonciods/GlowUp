import React, { useState } from 'react'
import { useSalonData } from '../hooks/useSalonData'
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {Calendar, DollarSign, TrendingUp, User, FileText, Clock, Search} from 'lucide-react'

const Relatorios: React.FC = () => {
  const { clients, appointments, loading } = useSalonData()
  
  const [filterPeriod, setFilterPeriod] = useState<'dia' | 'semana' | 'mes' | 'ano'>('mes')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedClient, setSelectedClient] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8e413a]"></div>
      </div>
    )
  }

  // Calcular período baseado no filtro selecionado
  const getPeriodRange = () => {
    switch (filterPeriod) {
      case 'dia':
        return { start: startOfDay(selectedDate), end: endOfDay(selectedDate) }
      case 'semana':
        return { start: startOfWeek(selectedDate), end: endOfWeek(selectedDate) }
      case 'mes':
        return { start: startOfMonth(selectedDate), end: endOfMonth(selectedDate) }
      case 'ano':
        return { start: startOfYear(selectedDate), end: endOfYear(selectedDate) }
      default:
        return { start: startOfMonth(selectedDate), end: endOfMonth(selectedDate) }
    }
  }

  const { start, end } = getPeriodRange()

  // Data atual (atualiza automaticamente)
  const today = new Date()
  const todayStart = startOfDay(today)
  const todayEnd = endOfDay(today)
  
  // Filtrar agendamentos do período selecionado
  const periodAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date)
    return aptDate >= start && aptDate <= end
  })

  // === LÓGICA POR PERÍODO ===
  
  // 1. HOJE: Total recebido hoje (atendimentos realizados no dia atual)
  const todayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date)
    return aptDate >= todayStart && aptDate <= todayEnd && apt.status !== 'cancelado'
  })
  const totalReceivedToday = todayAppointments.reduce((sum, apt) => sum + apt.price, 0)
  
  // 2. ESTA SEMANA: Total recebido na semana (atendimentos já realizados até hoje)
  const weekStart = startOfWeek(today)
  const weekAppointmentsRealized = appointments.filter(apt => {
    const aptDate = new Date(apt.date)
    return aptDate >= weekStart && aptDate <= today && apt.status !== 'cancelado'
  })
  const totalReceivedThisWeek = weekAppointmentsRealized.reduce((sum, apt) => sum + apt.price, 0)
  
  // 3. PENDENTES ESTA SEMANA: Do dia seguinte até o final da semana
  const weekEnd = endOfWeek(today)
  const tomorrowStart = new Date(today)
  tomorrowStart.setDate(tomorrowStart.getDate() + 1)
  tomorrowStart.setHours(0, 0, 0, 0)
  
  const pendingThisWeek = appointments.filter(apt => {
    const aptDate = new Date(apt.date)
    return aptDate >= tomorrowStart && aptDate <= weekEnd && 
           (apt.status === 'agendado' || apt.status === 'confirmado')
  })
  const totalPendingThisWeek = pendingThisWeek.reduce((sum, apt) => sum + apt.price, 0)

  // === CÁLCULOS BASEADOS NO FILTRO SELECIONADO ===
  
  // Atendimentos realizados no período (até hoje)
  const realizedAppointments = periodAppointments.filter(apt => {
    const aptDate = new Date(apt.date)
    return aptDate <= today && apt.status !== 'cancelado'
  })
  
  // Pendentes no período (após hoje)
  const pendingAppointments = periodAppointments.filter(apt => {
    const aptDate = new Date(apt.date)
    return aptDate > today && (apt.status === 'agendado' || apt.status === 'confirmado')
  })
  
  // 4. CANCELADOS: Buscar TODOS os cancelados de TODOS os clientes (não apenas do período)
  const allCanceledAppointments = appointments.filter(apt => apt.status === 'cancelado')

  // Cálculos financeiros baseados no filtro
  const totalReceived = realizedAppointments.reduce((sum, apt) => sum + apt.price, 0)
  const totalPending = pendingAppointments.reduce((sum, apt) => sum + apt.price, 0)
  const totalCanceled = allCanceledAppointments.reduce((sum, apt) => sum + apt.price, 0)

  // 7. SERVIÇOS MAIS REALIZADOS: Verificar TODO o histórico de clientes
  const allRealizedAppointments = appointments.filter(apt => apt.status !== 'cancelado')
  const serviceStats = allRealizedAppointments.reduce((acc, apt) => {
    acc[apt.service] = (acc[apt.service] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topServices = Object.entries(serviceStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  // Filtrar clientes para busca
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Histórico individual do cliente selecionado
  const getClientHistory = (clientId: string) => {
    return appointments
      .filter(apt => apt.clientId === clientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const selectedClientData = selectedClient ? clients.find(c => c._id === selectedClient) : null
  const clientHistory = selectedClient ? getClientHistory(selectedClient) : []

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Relatórios</h1>
        
        {/* Filtro de período */}
        <div className="flex items-center space-x-4">
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value as any)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e413a] focus:border-transparent"
          >
            <option value="dia">Hoje</option>
            <option value="semana">Esta Semana</option>
            <option value="mes">Este Mês</option>
            <option value="ano">Este Ano</option>
          </select>
          
          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e413a] focus:border-transparent"
          />
        </div>
      </div>

      {/* Cards de resumo financeiro - Dinâmico por período */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">
                {filterPeriod === 'dia' ? 'Total Recebido Hoje' : 
                 filterPeriod === 'semana' ? 'Total Recebido Esta Semana (Até Hoje)' : 
                 filterPeriod === 'mes' ? 'Total Recebido Este Mês (Até Hoje)' : 
                 'Total Recebido Este Ano (Até Hoje)'}
              </p>
              <p className="text-2xl font-bold text-green-600">
                R$ {(filterPeriod === 'dia' ? totalReceivedToday : 
                     filterPeriod === 'semana' ? totalReceivedThisWeek : 
                     totalReceived).toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">
                {filterPeriod === 'dia' ? todayAppointments.length : 
                 filterPeriod === 'semana' ? weekAppointmentsRealized.length : 
                 realizedAppointments.length} atendimentos
              </p>
            </div>
            <div className="bg-[#ffe4d8] p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-[#8e413a]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">
                {filterPeriod === 'semana' ? 'Pendentes Esta Semana' : 'Pendentes'}
              </p>
              <p className="text-2xl font-bold text-blue-600">
                R$ {(filterPeriod === 'semana' ? totalPendingThisWeek : totalPending).toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">
                {filterPeriod === 'semana' ? pendingThisWeek.length : pendingAppointments.length} agendamentos
              </p>
            </div>
            <div className="bg-[#f5d5c8] p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-[#aa6a62]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Cancelados (Histórico Total)</p>
              <p className="text-2xl font-bold text-red-600">R$ {totalCanceled.toFixed(2)}</p>
              <p className="text-sm text-gray-500">{allCanceledAppointments.length} cancelamentos</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 6. Lista de atendimentos realizados - TODOS os agendados até hoje */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Atendimentos Agendados - {filterPeriod === 'dia' ? 'Hoje' : 
            filterPeriod === 'semana' ? 'Esta Semana' : 
            filterPeriod === 'mes' ? 'Este Mês (Até Hoje)' : 
            'Este Ano (Até Hoje)'} ({realizedAppointments.length})
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {realizedAppointments.map((appointment) => (
              <div key={appointment._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{appointment.clientName}</p>
                  <p className="text-sm text-gray-600">{appointment.service}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(appointment.date), 'dd/MM/yyyy', { locale: ptBR })} - {appointment.time}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#8e413a]">R$ {appointment.price.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {appointment.duration}min
                  </p>
                </div>
              </div>
            ))}
            
            {realizedAppointments.length === 0 && (
              <p className="text-gray-500 text-center py-8">Nenhum atendimento realizado no período</p>
            )}
          </div>
        </div>

        {/* 7. Serviços mais realizados (TODO histórico) */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-[#8e413a]" />
            Serviços Mais Realizados (Histórico Total)
          </h2>
          <div className="space-y-3">
            {topServices.map(([service, count], index) => (
              <div key={service} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[#8e413a] text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    {index + 1}
                  </div>
                  <p className="font-medium text-gray-800">{service}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#8e413a]">{count} vezes</p>
                </div>
              </div>
            ))}
            
            {topServices.length === 0 && (
              <p className="text-gray-500 text-center py-8">Nenhum serviço realizado</p>
            )}
          </div>
        </div>
      </div>

      {/* 4. Lista de cancelados (Histórico completo) */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-red-600" />
          Histórico de Cancelamentos ({allCanceledAppointments.length})
        </h2>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {allCanceledAppointments.map((appointment) => (
            <div key={appointment._id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">{appointment.clientName}</p>
                <p className="text-sm text-gray-600">{appointment.service}</p>
                <p className="text-xs text-red-600">
                  Cancelado em {format(new Date(appointment.date), 'dd/MM/yyyy', { locale: ptBR })} - {appointment.time}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-red-600">R$ {appointment.price.toFixed(2)}</p>
                <p className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {appointment.duration}min
                </p>
              </div>
            </div>
          ))}
          
          {allCanceledAppointments.length === 0 && (
            <p className="text-gray-500 text-center py-8">Nenhum cancelamento registrado</p>
          )}
        </div>
      </div>

      {/* Histórico individual de clientes */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <User className="h-5 w-5 mr-2 text-[#8e413a]" />
          Histórico Individual de Cliente
        </h2>
        
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full max-w-md"
            />
          </div>
        </div>

        {searchTerm && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Selecione um cliente:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {filteredClients.map((client) => (
                <button
                  key={client._id}
                  onClick={() => {
                    setSelectedClient(client._id)
                    setSearchTerm('')
                  }}
                  className="text-left p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <p className="font-medium text-gray-800">{client.name}</p>
                  <p className="text-sm text-gray-600">{client.whatsapp}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedClientData && (
          <div>
            <div className="bg-[#ffe4d8] p-4 rounded-lg mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{selectedClientData.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total de atendimentos:</p>
                  <p className="font-bold text-[#8e413a]">{clientHistory.length}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total gasto:</p>
                  <p className="font-bold text-[#8e413a]">
                    R$ {clientHistory.reduce((sum, apt) => {
                      // Contar todos os agendamentos marcados (exceto cancelados)
                      if (apt.status !== 'cancelado') {
                        return sum + apt.price
                      }
                      return sum
                    }, 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Último atendimento:</p>
                  <p className="font-bold text-[#8e413a]">
                    {(() => {
                      // 5. Buscar atendimento mais recente (não cancelado)
                      const realizedHistory = clientHistory.filter(apt => apt.status !== 'cancelado')
                      return realizedHistory.length > 0 
                        ? format(new Date(realizedHistory[0].date), 'dd/MM/yyyy', { locale: ptBR }) 
                        : 'Nenhum'
                    })()}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {clientHistory.map((appointment) => (
                <div key={appointment._id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{appointment.service}</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(appointment.date), 'dd/MM/yyyy', { locale: ptBR })} às {appointment.time}
                      </p>
                      {appointment.products && (
                        <p className="text-xs text-gray-500 mt-1">Produtos: {appointment.products}</p>
                      )}
                      {appointment.notes && (
                        <p className="text-xs text-gray-500 mt-1">Obs: {appointment.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#8e413a]">R$ {appointment.price.toFixed(2)}</p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {appointment.duration}min
                      </p>
                      <p className={`text-xs font-medium ${
                        appointment.status === 'realizado' ? 'text-green-600' :
                        appointment.status === 'confirmado' ? 'text-blue-600' :
                        appointment.status === 'agendado' ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {clientHistory.length === 0 && (
                <p className="text-gray-500 text-center py-8">Nenhum atendimento registrado para este cliente</p>
              )}
            </div>
          </div>
        )}
        
        {!selectedClientData && !searchTerm && (
          <p className="text-gray-500 text-center py-8">Use a busca acima para selecionar um cliente e ver seu histórico</p>
        )}
      </div>
    </div>
  )
}

export default Relatorios