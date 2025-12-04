
import { useState, useEffect, useCallback } from 'react'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'
import { getServiceReminderRule, calculateNextReminderDate } from '../utils/businessRules'

export const useSalonData = () => {
  const [clients, setClients] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [reminders, setReminders] = useState<any[]>([])
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [combos, setCombos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    setLoading(true)
    try {
      const [clientsRes, appointmentsRes, servicesRes, remindersRes, feedbacksRes, combosRes] = await Promise.all([
        lumi.entities.clients.list({ sort: { name: 1 } }),
        lumi.entities.appointments.list({ sort: { date: -1 } }),
        lumi.entities.services.list({ sort: { category: 1, name: 1 } }),
        lumi.entities.reminders.list({ sort: { scheduledDate: 1 } }),
        lumi.entities.feedbacks.list({ sort: { createdAt: -1 } }),
        lumi.entities.combos.list({ sort: { name: 1 } })
      ])

      setClients(clientsRes.list || [])
      setAppointments(appointmentsRes.list || [])
      setServices(servicesRes.list || [])
      setReminders(remindersRes.list || [])
      setFeedbacks(feedbacksRes.list || [])
      setCombos(combosRes.list || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados do sistema')
    } finally {
      setLoading(false)
    }
  }, [])

  // Client operations
  const createClient = async (clientData: any) => {
    try {
      const newClient = await lumi.entities.clients.create({
        ...clientData,
        totalSpent: 0,
        visitCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      setClients(prev => [newClient, ...prev])
      toast.success('Cliente cadastrado com sucesso!')
      return newClient
    } catch (error) {
      console.error('Erro ao criar cliente:', error)
      toast.error('Erro ao cadastrar cliente')
      throw error
    }
  }

  const updateClient = async (clientId: string, updates: any) => {
    try {
      const updatedClient = await lumi.entities.clients.update(clientId, {
        ...updates,
        updatedAt: new Date().toISOString()
      })
      setClients(prev => prev.map(c => c._id === clientId ? updatedClient : c))
      toast.success('Cliente atualizado com sucesso!')
      return updatedClient
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error)
      toast.error('Erro ao atualizar cliente')
      throw error
    }
  }

  const deleteClient = async (clientId: string) => {
    try {
      await lumi.entities.clients.delete(clientId)
      setClients(prev => prev.filter(c => c._id !== clientId))
      toast.success('Cliente removido com sucesso!')
    } catch (error) {
      console.error('Erro ao deletar cliente:', error)
      toast.error('Erro ao remover cliente')
      throw error
    }
  }

  // Appointment operations
  const createAppointment = async (appointmentData: any) => {
    try {
      const newAppointment = await lumi.entities.appointments.create({
        ...appointmentData,
        status: 'agendado',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      setAppointments(prev => [newAppointment, ...prev])
      toast.success('Agendamento criado com sucesso!')
      return newAppointment
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
      toast.error('Erro ao criar agendamento')
      throw error
    }
  }

  const updateAppointment = async (appointmentId: string, updates: any) => {
    try {
      const updatedAppointment = await lumi.entities.appointments.update(appointmentId, {
        ...updates,
        updatedAt: new Date().toISOString()
      })
      setAppointments(prev => prev.map(a => a._id === appointmentId ? updatedAppointment : a))
      
      // Update client stats if appointment is completed
      if (updates.status === 'realizado') {
        const appointment = appointments.find(a => a._id === appointmentId)
        if (appointment) {
          const client = clients.find(c => c._id === appointment.clientId)
          if (client) {
            await updateClient(client._id, {
              totalSpent: (client.totalSpent || 0) + appointment.price,
              visitCount: (client.visitCount || 0) + 1,
              lastVisit: new Date().toISOString()
            })

            // Criar lembrete automático baseado no tipo de serviço
            const reminderRule = getServiceReminderRule(appointment.service)
            const reminderDate = calculateNextReminderDate(new Date(), appointment.service)
            
            await createReminder({
              clientId: client._id,
              clientName: client.name,
              appointmentId: appointmentId,
              type: 'manutenção',
              scheduledDate: reminderDate.toISOString(),
              message: reminderRule.message
                .replace('{cliente}', client.name)
                .replace('{servico}', appointment.service)
                .replace('{dias}', reminderRule.reminderDays.toString())
            })
            
            // Verificar se cliente atingiu 10 atendimentos (milestone)
            const newVisitCount = (client.visitCount || 0) + 1
            if (newVisitCount === 10) {
              await createReminder({
                clientId: client._id,
                clientName: client.name,
                appointmentId: appointmentId,
                type: 'milestone',
                scheduledDate: new Date().toISOString(),
                message: `🎉 Parabéns ${client.name}! Você completou 10 atendimentos! Temos um brinde especial ou desconto exclusivo esperando por você. Entre em contato para resgatar! 💝`
              })
            }
          }
        }
      }
      
      toast.success('Agendamento atualizado com sucesso!')
      return updatedAppointment
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error)
      toast.error('Erro ao atualizar agendamento')
      throw error
    }
  }

  const deleteAppointment = async (appointmentId: string) => {
    try {
      await lumi.entities.appointments.delete(appointmentId)
      setAppointments(prev => prev.filter(a => a._id !== appointmentId))
      toast.success('Agendamento removido com sucesso!')
    } catch (error) {
      console.error('Erro ao deletar agendamento:', error)
      toast.error('Erro ao remover agendamento')
      throw error
    }
  }

  // Service operations
  const createService = async (serviceData: any) => {
    try {
      const newService = await lumi.entities.services.create({
        ...serviceData,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      setServices(prev => [newService, ...prev])
      toast.success('Serviço criado com sucesso!')
      return newService
    } catch (error) {
      console.error('Erro ao criar serviço:', error)
      toast.error('Erro ao criar serviço')
      throw error
    }
  }

  const updateService = async (serviceId: string, updates: any) => {
    try {
      const updatedService = await lumi.entities.services.update(serviceId, {
        ...updates,
        updatedAt: new Date().toISOString()
      })
      setServices(prev => prev.map(s => s._id === serviceId ? updatedService : s))
      toast.success('Serviço atualizado com sucesso!')
      return updatedService
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error)
      toast.error('Erro ao atualizar serviço')
      throw error
    }
  }

  const deleteService = async (serviceId: string) => {
    try {
      await lumi.entities.services.delete(serviceId)
      setServices(prev => prev.filter(s => s._id !== serviceId))
      toast.success('Serviço removido com sucesso!')
    } catch (error) {
      console.error('Erro ao deletar serviço:', error)
      toast.error('Erro ao remover serviço')
      throw error
    }
  }

  // Reminder operations
  const sendReminder = async (reminderId: string) => {
    try {
      const reminder = reminders.find(r => r._id === reminderId)
      if (!reminder) return

      // Buscar telefone do cliente
      const client = clients.find(c => c._id === reminder.clientId)
      if (!client || !client.whatsapp) {
        toast.error('Cliente não possui telefone cadastrado!')
        return
      }

      // Limpar telefone (remover caracteres não numéricos)
      const cleanPhone = client.whatsapp.replace(/\D/g, '')
      
      // Abrir WhatsApp Web com número e mensagem
      const whatsappUrl = `https://web.whatsapp.com/send?phone=55${cleanPhone}&text=${encodeURIComponent(reminder.message)}`
      window.open(whatsappUrl, '_blank')

      // Update reminder status
      const updatedReminder = await lumi.entities.reminders.update(reminderId, {
        status: 'enviado',
        sentDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      
      setReminders(prev => prev.map(r => r._id === reminderId ? updatedReminder : r))
      toast.success('Abrindo WhatsApp Web com a mensagem!')
      return updatedReminder
    } catch (error) {
      console.error('Erro ao enviar lembrete:', error)
      toast.error('Erro ao enviar lembrete')
      throw error
    }
  }

  const createReminder = async (reminderData: any) => {
    try {
      const newReminder = await lumi.entities.reminders.create({
        ...reminderData,
        status: 'pendente',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      setReminders(prev => [newReminder, ...prev])
      if (reminderData.type !== 'milestone') {
        toast.success('Lembrete criado com sucesso!')
      }
      return newReminder
    } catch (error) {
      console.error('Erro ao criar lembrete:', error)
      toast.error('Erro ao criar lembrete')
      throw error
    }
  }

  // Feedback operations
  const createFeedback = async (feedbackData: any) => {
    try {
      const newFeedback = await lumi.entities.feedbacks.create({
        ...feedbackData,
        createdAt: new Date().toISOString()
      })
      setFeedbacks(prev => [newFeedback, ...prev])
      toast.success('Feedback enviado com sucesso!')
      return newFeedback
    } catch (error) {
      console.error('Erro ao criar feedback:', error)
      toast.error('Erro ao enviar feedback')
      throw error
    }
  }

  // Combo operations
  const createCombo = async (comboData: any) => {
    try {
      const newCombo = await lumi.entities.combos.create({
        ...comboData,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      setCombos(prev => [newCombo, ...prev])
      toast.success('Combo criado com sucesso!')
      return newCombo
    } catch (error) {
      console.error('Erro ao criar combo:', error)
      toast.error('Erro ao criar combo')
      throw error
    }
  }

  const updateCombo = async (comboId: string, updates: any) => {
    try {
      const updatedCombo = await lumi.entities.combos.update(comboId, {
        ...updates,
        updatedAt: new Date().toISOString()
      })
      setCombos(prev => prev.map(c => c._id === comboId ? updatedCombo : c))
      toast.success('Combo atualizado com sucesso!')
      return updatedCombo
    } catch (error) {
      console.error('Erro ao atualizar combo:', error)
      toast.error('Erro ao atualizar combo')
      throw error
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  return {
    // Data
    clients,
    appointments,
    services,
    reminders,
    feedbacks,
    combos,
    loading,
    
    // Actions
    fetchAllData,
    createClient,
    updateClient,
    deleteClient,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    createService,
    updateService,
    deleteService,
    sendReminder,
    createReminder,
    createFeedback,
    createCombo,
    updateCombo
  }
}
