
export const BUSINESS_HOURS = {
  MONDAY_TO_FRIDAY: {
    start: '08:00',
    end: '18:00',
    lunchBreak: {
      start: '12:00',
      end: '13:00'
    },
    interval: 30 // 30 minutos
  },
  SATURDAY: {
    start: '08:00', 
    end: '20:00',
    lunchBreak: {
      start: '12:00',
      end: '13:00'
    },
    interval: 30
  },
  SUNDAY: {
    closed: true
  }
}

// Feriados nacionais 2025 (pode ser expandido)
export const HOLIDAYS_2025 = [
  { date: '2025-01-01', name: 'Confraternização Universal' },
  { date: '2025-02-17', name: 'Carnaval' },
  { date: '2025-02-18', name: 'Carnaval' },
  { date: '2025-04-18', name: 'Sexta-feira Santa' },
  { date: '2025-04-21', name: 'Tiradentes' },
  { date: '2025-05-01', name: 'Dia do Trabalhador' },
  { date: '2025-09-07', name: 'Independência do Brasil' },
  { date: '2025-10-12', name: 'Nossa Senhora Aparecida' },
  { date: '2025-11-02', name: 'Finados' },
  { date: '2025-11-15', name: 'Proclamação da República' },
  { date: '2025-12-25', name: 'Natal' }
]

export const SERVICE_REMINDER_RULES = {
  CHEMICAL_SERVICES: {
    services: [
      'Combo de mechas + corte',
      'Realinhamento Capilar', 
      'Coloração De Raiz Com Cobertura De Brancos',
      'Mechas'
    ],
    reminderDays: 15,
    message: 'Olá {cliente}! Está na hora de cuidar da sua química! Já faz {dias} dias desde seu último {servico}. Que tal agendar uma manutenção? 💇‍♀️✨'
  },
  OTHER_SERVICES: {
    services: [
      'COMBO Tratamento Keune + CORTE + Finalização',
      'Tratamentos Keune',
      'Penteados',
      'Corte Feminino', 
      'Escova Lisa ou Modelada',
      'Finalização Em Cabelos Com Curvatura'
    ],
    reminderDays: 15,
    message: 'Olá {cliente}! Que tal repetir aquele {servico} maravilhoso? Já faz {dias} dias e você merece se cuidar! Vamos agendar? 💄✨'
  }
}

export const isHoliday = (date: Date): { isHoliday: boolean; name?: string } => {
  const dateStr = date.toISOString().split('T')[0]
  const holiday = HOLIDAYS_2025.find(h => h.date === dateStr)
  return {
    isHoliday: !!holiday,
    name: holiday?.name
  }
}

// CORREÇÃO: Domingo é quando getDay() retorna 0
// 0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta, 6 = Sábado
export const isSunday = (date: Date): boolean => {
  return date.getDay() === 0 // 0 = Domingo
}

export const getAvailableTimeSlots = (date: Date): string[] => {
  const dayOfWeek = date.getDay()
  
  // Domingo - fechado (0 = Domingo)
  if (dayOfWeek === 0) {
    return []
  }
  
  // Verificar se é feriado
  if (isHoliday(date).isHoliday) {
    return []
  }
  
  const slots: string[] = []
  
  if (dayOfWeek === 6) {
    // Sábado - 08:00 às 20:00, exceto 12:00-13:00
    for (let hour = 8; hour < 12; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    // Pular horário do almoço (12:00-13:00)
    for (let hour = 13; hour < 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
  } else {
    // Segunda a sexta (1-5) - 08:00 às 18:00, exceto 12:00-13:00
    for (let hour = 8; hour < 12; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    // Pular horário do almoço (12:00-13:00)
    for (let hour = 13; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
  }
  
  return slots
}

export const getServiceReminderRule = (serviceName: string) => {
  if (SERVICE_REMINDER_RULES.CHEMICAL_SERVICES.services.includes(serviceName)) {
    return SERVICE_REMINDER_RULES.CHEMICAL_SERVICES
  }
  
  if (SERVICE_REMINDER_RULES.OTHER_SERVICES.services.includes(serviceName)) {
    return SERVICE_REMINDER_RULES.OTHER_SERVICES
  }
  
  // Padrão para outros serviços
  return {
    reminderDays: 15,
    message: 'Olá {cliente}! Que tal agendar um novo atendimento? Já faz {dias} dias desde sua última visita! 💇‍♀️'
  }
}

export const shouldCreateReminder = (appointment: any): boolean => {
  return appointment.status === 'realizado'
}

export const calculateNextReminderDate = (lastAppointmentDate: Date, serviceName: string): Date => {
  const rule = getServiceReminderRule(serviceName)
  const nextDate = new Date(lastAppointmentDate)
  nextDate.setDate(nextDate.getDate() + rule.reminderDays)
  return nextDate
}

// Função para calcular todos os horários ocupados por um agendamento (considerando duração)
export const getOccupiedTimeSlots = (startTime: string, durationMinutes: number): string[] => {
  const occupiedSlots: string[] = []
  const [startHour, startMinute] = startTime.split(':').map(Number)
  
  let currentMinutes = startHour * 60 + startMinute
  const endMinutes = currentMinutes + durationMinutes
  
  // Gerar todos os slots de 30 minutos ocupados
  while (currentMinutes < endMinutes) {
    const hour = Math.floor(currentMinutes / 60)
    const minute = currentMinutes % 60
    occupiedSlots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
    currentMinutes += 30
  }
  
  return occupiedSlots
}

// Verificar se um horário está disponível considerando duração do serviço
export const isTimeSlotAvailable = (
  date: Date,
  startTime: string,
  durationMinutes: number,
  existingAppointments: any[]
): { available: boolean; reason?: string } => {
  const requestedSlots = getOccupiedTimeSlots(startTime, durationMinutes)
  
  // Verificar conflitos com agendamentos existentes
  for (const appointment of existingAppointments) {
    const aptDate = new Date(appointment.date)
    if (format(aptDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')) {
      const aptSlots = getOccupiedTimeSlots(appointment.time, appointment.duration)
      
      // Verificar se há interseção
      const hasConflict = requestedSlots.some(slot => aptSlots.includes(slot))
      if (hasConflict) {
        return {
          available: false,
          reason: `Conflito com agendamento de ${appointment.clientName} às ${appointment.time}`
        }
      }
    }
  }
  
  // Verificar se ultrapassa horário de funcionamento
  const [startHour] = startTime.split(':').map(Number)
  const endMinutes = (startHour * 60) + parseInt(startTime.split(':')[1]) + durationMinutes
  const endHour = Math.floor(endMinutes / 60)
  
  const dayOfWeek = date.getDay()
  const maxHour = dayOfWeek === 6 ? 20 : 18 // Sábado até 20h, outros dias até 18h
  
  if (endHour > maxHour) {
    return {
      available: false,
      reason: `Serviço ultrapassa horário de fechamento (${maxHour}:00)`
    }
  }
  
  return { available: true }
}

function format(date: Date, formatStr: string): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
