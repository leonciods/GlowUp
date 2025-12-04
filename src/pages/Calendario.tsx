
import React, { useState } from 'react'
import { useSalonData } from '../hooks/useSalonData'
import { useTheme } from '../hooks/useTheme'
import { format, addDays, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {ChevronLeft, ChevronRight, Calendar, Clock, X, User, Cake} from 'lucide-react'
import { getAvailableTimeSlots, isHoliday, isSunday } from '../utils/businessRules'

const Calendario: React.FC = () => {
  const { appointments, clients, loading } = useSalonData()
  const { colors } = useTheme()
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Filtrar agendamentos do dia selecionado
  const dayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date)
    return format(aptDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') &&
           apt.status !== 'cancelado'
  })

  // Verificar aniversariantes do dia
  const birthdayClients = clients.filter(client => {
    if (!client.birthday) return false
    const birthday = new Date(client.birthday)
    return birthday.getDate() === selectedDate.getDate() && 
           birthday.getMonth() === selectedDate.getMonth()
  })

  // Obter todos os horários possíveis para o dia
  const getAllTimeSlots = () => {
    const dayOfWeek = selectedDate.getDay()
    
    // Domingo - fechado
    if (dayOfWeek === 0) {
      return []
    }
    
    // Verificar se é feriado
    if (isHoliday(selectedDate).isHoliday) {
      return []
    }
    
    const slots: string[] = []
    
    if (dayOfWeek === 6) {
      // Sábado - 08:00 às 20:00, exceto 12:00-13:00
      for (let hour = 8; hour < 12; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`)
        slots.push(`${hour.toString().padStart(2, '0')}:30`)
      }
      // Horário de almoço indisponível
      slots.push('12:00') // Adicionar para mostrar como indisponível
      slots.push('12:30') // Adicionar para mostrar como indisponível
      
      for (let hour = 13; hour < 20; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`)
        slots.push(`${hour.toString().padStart(2, '0')}:30`)
      }
    } else {
      // Segunda a sexta - 08:00 às 18:00, exceto 12:00-13:00
      for (let hour = 8; hour < 12; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`)
        slots.push(`${hour.toString().padStart(2, '0')}:30`)
      }
      // Horário de almoço indisponível
      slots.push('12:00') // Adicionar para mostrar como indisponível
      slots.push('12:30') // Adicionar para mostrar como indisponível
      
      for (let hour = 13; hour < 18; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`)
        slots.push(`${hour.toString().padStart(2, '0')}:30`)
      }
    }
    
    return slots
  }

  // Verificar se é domingo ou feriado
  const isDateClosed = isSunday(selectedDate)
  const holiday = isHoliday(selectedDate)

  // Função para obter agendamento por horário
  const getAppointmentByTime = (time: string) => {
    return dayAppointments.find(apt => apt.time === time)
  }

  // Verificar se é horário de almoço
  const isLunchTime = (time: string) => {
    return time === '12:00' || time === '12:30'
  }

  const goToPreviousDay = () => {
    setSelectedDate(prev => subDays(prev, 1))
  }

  const goToNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1))
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const allTimeSlots = getAllTimeSlots()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header com navegação de data */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <Calendar className="h-8 w-8 mr-3 text-purple-600" />
            Agenda do Dia
          </h1>
          
          <button
            onClick={goToToday}
            className={`${colors.primary} text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium`}
          >
            Hoje
          </button>
        </div>

        {/* Navegação de data */}
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousDay}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-gray-600" />
          </button>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {format(selectedDate, "EEEE", { locale: ptBR })}
            </h2>
            <p className="text-lg text-gray-600">
              {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
            
            {/* Indicadores especiais */}
            {isDateClosed && (
              <div className="mt-2 inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                <X className="h-4 w-4 mr-1" />
                Domingo - Fechado
              </div>
            )}
            
            {holiday.isHoliday && (
              <div className="mt-2 inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                🎉 Feriado - {holiday.name}
              </div>
            )}
            
            {birthdayClients.length > 0 && (
              <div className="mt-2 inline-flex items-center px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-medium">
                <Cake className="h-4 w-4 mr-1" />
                Aniversário: {birthdayClients.map(c => c.name).join(', ')}
              </div>
            )}
          </div>

          <button
            onClick={goToNextDay}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-6 w-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Grade de horários */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-purple-600" />
          Horários do Dia
        </h3>

        {isDateClosed || holiday.isHoliday ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              {holiday.isHoliday ? '🎉' : '😴'}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {holiday.isHoliday ? `Feriado - ${holiday.name}` : 'Domingo - Fechado'}
            </h3>
            <p className="text-gray-600">
              {holiday.isHoliday ? 'Não há atendimentos em feriados' : 'Não funcionamos aos domingos'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {allTimeSlots.map((time) => {
              const appointment = getAppointmentByTime(time)
              const isLunch = isLunchTime(time)
              
              return (
                <div
                  key={time}
                  className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                    appointment 
                      ? `${colors.primaryBg} border-purple-200`
                      : isLunch
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="w-20 text-lg font-bold text-gray-800">
                    {time}
                  </div>
                  
                  <div className="flex-1 ml-4">
                    {appointment ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-purple-600 mr-2" />
                          <div>
                            <p className="text-lg font-semibold text-gray-800">
                              {appointment.clientName}
                            </p>
                            <p className={`text-sm ${colors.primaryText}`}>
                              {appointment.service}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-800">
                            R$ {appointment.price.toFixed(2)}
                          </p>
                          <p className={`text-sm font-medium ${
                            appointment.status === 'confirmado' ? 'text-green-600' :
                            appointment.status === 'agendado' ? 'text-blue-600' :
                            appointment.status === 'realizado' ? 'text-purple-600' :
                            'text-gray-600'
                          }`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </p>
                        </div>
                      </div>
                    ) : isLunch ? (
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-orange-600 mr-2" />
                        <p className="text-orange-700 font-medium">Horário de Almoço - Indisponível</p>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Horário disponível</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Resumo do dia */}
        {!isDateClosed && !holiday.isHoliday && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Resumo do Dia</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-purple-600">{dayAppointments.length}</p>
                <p className="text-sm text-gray-600">Agendamentos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {allTimeSlots.filter(time => !getAppointmentByTime(time) && !isLunchTime(time)).length}
                </p>
                <p className="text-sm text-gray-600">Horários Livres</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {dayAppointments.reduce((total, apt) => total + apt.price, 0).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">Faturamento</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Calendario
