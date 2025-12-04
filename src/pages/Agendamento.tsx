import React, { useState, useEffect } from 'react'
import { useSalonData } from '../hooks/useSalonData'
import { useTheme } from '../hooks/useTheme'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {Calendar, Clock, User, ChevronLeft, ChevronRight, Plus, X, Trash2, Cake} from 'lucide-react'
import { getAvailableTimeSlots, isHoliday, isSunday } from '../utils/businessRules'
import toast from 'react-hot-toast'

const Agendamento: React.FC = () => {
  const { clients, services, appointments, createAppointment, deleteAppointment, loading } = useSalonData()
  const { colors } = useTheme()
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showForm, setShowForm] = useState(false)

  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: ''
  })

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Obter agendamentos do mês atual
  const monthAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date)
    return aptDate >= monthStart && aptDate <= monthEnd && apt.status !== 'cancelado'
  })

  // Verificar se um dia tem agendamentos
  const getDayAppointments = (date: Date) => {
    return monthAppointments.filter(apt => {
      const aptDate = new Date(apt.date)
      return isSameDay(aptDate, date)
    })
  }

  // Obter horários disponíveis para o dia selecionado
  const availableTimeSlots = selectedDate ? getAvailableTimeSlots(selectedDate) : []

  // Filtrar horários já ocupados
  const occupiedTimes = selectedDate ? getDayAppointments(selectedDate).map(apt => apt.time) : []
  const freeTimeSlots = availableTimeSlots.filter(time => !occupiedTimes.includes(time))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedDate || !selectedTime || !selectedClient || !selectedService) {
      alert('❌ Por favor, preencha todos os campos obrigatórios')
      return
    }

    const service = services.find(s => s._id === selectedService)
    const client = clients.find(c => c._id === selectedClient)
    
    if (!service || !client) {
      alert('❌ Serviço ou cliente não encontrado')
      return
    }

    // VALIDAÇÃO: Verificar conflito de horário
    const existingAppointment = getDayAppointments(selectedDate).find(apt => apt.time === selectedTime)
    if (existingAppointment) {
      alert(`❌ CONFLITO DE HORÁRIO\n\nJá existe um agendamento para ${selectedTime}:\n• Cliente: ${existingAppointment.clientName}\n• Serviço: ${existingAppointment.service}\n\nPor favor, escolha outro horário disponível.`)
      return
    }

    try {
      await createAppointment({
        date: selectedDate.toISOString(),
        time: selectedTime,
        clientId: selectedClient,
        clientName: client.name,
        clientPhone: client.phone,
        service: service.name,
        price: service.price,
        duration: service.duration,
        notes: ''
      })

      // Reset form
      setSelectedDate(null)
      setSelectedTime('')
      setSelectedClient('')
      setSelectedService('')
      setShowForm(false)
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
      alert('❌ Erro ao criar agendamento. Tente novamente.')
    }
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <Calendar className="h-8 w-8 mr-3 text-purple-600" />
          Calendário
        </h1>
        
        {selectedDate && (
          <button
            onClick={() => setShowForm(true)}
            className={`${colors.primary} text-white px-6 py-3 rounded-lg flex items-center transition-colors`}
          >
            <Plus className="h-5 w-5 mr-2" />
            Confirmar Agendamento
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Header do calendário */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-6 w-6 text-gray-600" />
              </button>
              
              <h2 className="text-xl font-bold text-gray-800">
                {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
              </h2>
              
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* Dias da semana - CORRIGIDO: Segunda na coluna S, Domingo na coluna D */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              <div className="text-center text-sm font-medium text-gray-600 p-2">D</div>
              <div className="text-center text-sm font-medium text-gray-600 p-2">S</div>
              <div className="text-center text-sm font-medium text-gray-600 p-2">T</div>
              <div className="text-center text-sm font-medium text-gray-600 p-2">Q</div>
              <div className="text-center text-sm font-medium text-gray-600 p-2">Q</div>
              <div className="text-center text-sm font-medium text-gray-600 p-2">S</div>
              <div className="text-center text-sm font-medium text-gray-600 p-2">S</div>
            </div>

            {/* Grid do calendário */}
            <div className="grid grid-cols-7 gap-1">
              {/* Espaços em branco para o início do mês */}
              {Array.from({ length: monthStart.getDay() }, (_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              
              {/* Dias do mês */}
              {monthDays.map((day) => {
                const dayAppointments = getDayAppointments(day)
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const isToday = isSameDay(day, new Date())
                const isPast = day < new Date() && !isToday
                const isSundayDay = isSunday(day)
                const holiday = isHoliday(day)
                const isUnavailable = isSundayDay || holiday.isHoliday || isPast
                
                // Verificar aniversários
                const birthdayClients = clients.filter(client => {
                  if (!client.birthday) return false
                  const birthday = new Date(client.birthday)
                  return birthday.getDate() === day.getDate() && birthday.getMonth() === day.getMonth()
                })

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => !isUnavailable && setSelectedDate(day)}
                    disabled={isUnavailable}
                    className={`
                      aspect-square p-2 text-sm rounded-lg transition-all relative
                      ${isSelected 
                        ? `${colors.primary} text-white` 
                        : isToday
                        ? 'bg-blue-100 text-blue-800 font-bold'
                        : isUnavailable
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'hover:bg-gray-100 text-gray-800'
                      }
                    `}
                  >
                    <div className="font-medium">{format(day, 'd')}</div>
                    
                    {/* Indicador de agendamentos */}
                    {dayAppointments.length > 0 && !isUnavailable && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-white' : 'bg-purple-600'
                        }`} />
                      </div>
                    )}
                    
                    {/* Indicador de domingo */}
                    {isSundayDay && (
                      <div className="absolute top-1 right-1 text-xs text-red-500">
                        ✕
                      </div>
                    )}
                    
                    {/* Indicador de feriado */}
                    {holiday.isHoliday && (
                      <div className="absolute top-1 right-1 text-xs">
                        🎉
                      </div>
                    )}
                    
                    {/* Indicador de aniversário */}
                    {birthdayClients.length > 0 && (
                      <div className="absolute top-1 left-1 text-xs" title={`Aniversário: ${birthdayClients.map(c => c.name).join(', ')}`}>
                        🎂
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legenda */}
            <div className="flex flex-wrap gap-4 mt-6 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-100 rounded mr-2"></div>
                <span className="text-gray-600">Hoje</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-600 rounded mr-2"></div>
                <span className="text-gray-600">Com agendamentos</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-100 rounded mr-2"></div>
                <span className="text-gray-600">Indisponível</span>
              </div>
            </div>
          </div>
        </div>

        {/* Painel lateral */}
        <div className="space-y-6">
          {/* Data selecionada */}
          {selectedDate && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                Data Selecionada
              </h3>
              
              <div className={`p-4 ${colors.primaryBg} rounded-lg`}>
                <p className="text-lg font-bold text-gray-800">
                  {format(selectedDate, "EEEE", { locale: ptBR })}
                </p>
                <p className={`text-sm ${colors.primaryText}`}>
                  {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>

              {/* Horários disponíveis */}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-purple-600" />
                  Horários Disponíveis
                </h4>
                
                {freeTimeSlots.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {freeTimeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-2 text-sm rounded-lg border-2 transition-all ${
                          selectedTime === time
                            ? `${colors.primary} text-white border-transparent`
                            : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic">
                    Nenhum horário disponível para este dia
                  </p>
                )}
              </div>

              {/* Agendamentos existentes */}
              {getDayAppointments(selectedDate).length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <User className="h-4 w-4 mr-2 text-amber-700" />
                    Agendamentos do Dia
                  </h4>
                  
                  <div className="space-y-2">
                    {getDayAppointments(selectedDate).map((apt) => (
                      <div key={apt._id} className="p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{apt.time}</p>
                            <p className="text-sm text-gray-600">{apt.clientName}</p>
                            <p className="text-sm text-amber-700">{apt.service}</p>
                          </div>
                          <div className="flex items-start space-x-2">
                            <p className="text-sm font-bold text-gray-800">
                              R$ {apt.price.toFixed(2)}
                            </p>
                            <button
                              onClick={async () => {
                                if (confirm(`Cancelar agendamento de ${apt.clientName} às ${apt.time}?`)) {
                                  try {
                                    await deleteAppointment(apt._id)
                                    toast.success('Agendamento cancelado!')
                                  } catch (error) {
                                    toast.error('Erro ao cancelar agendamento')
                                  }
                                }
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                              title="Cancelar agendamento"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal do formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Confirmar Agendamento</h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Resumo do agendamento */}
                <div className={`p-4 ${colors.primaryBg} rounded-lg`}>
                  <p className="text-sm text-gray-600">Data e Horário</p>
                  <p className="font-bold text-gray-800">
                    {selectedDate && format(selectedDate, "dd/MM/yyyy", { locale: ptBR })} às {selectedTime}
                  </p>
                </div>

                {/* Seleção de cliente */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cliente *
                  </label>
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione um cliente</option>
                    {clients.map((client) => (
                      <option key={client._id} value={client._id}>
                        {client.name} - {client.phone}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seleção de serviço */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Serviço *
                  </label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione um serviço</option>
                    {services.map((service) => (
                      <option key={service._id} value={service._id}>
                        {service.name} - R$ {service.price.toFixed(2)} ({service.duration}min)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 px-4 py-3 ${colors.primary} text-white rounded-lg transition-colors`}
                  >
                    Confirmar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Agendamento