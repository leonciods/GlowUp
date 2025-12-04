import { lumi } from '../lib/lumi'

// Script para popular dados de novembro 2024
export const seedNovemberData = async () => {
  try {
    console.log('🌱 Iniciando população de dados de novembro...')

    // Buscar clientes e serviços existentes
    const clientsRes = await lumi.entities.clients.list()
    const servicesRes = await lumi.entities.services.list()
    
    const clients = clientsRes.list || []
    const services = servicesRes.list || []

    if (clients.length === 0 || services.length === 0) {
      console.error('❌ Necessário ter clientes e serviços cadastrados primeiro!')
      return
    }

    // Serviços disponíveis
    const availableServices = [
      { name: 'Corte Feminino', price: 80, duration: 60 },
      { name: 'Escova Modeladora', price: 60, duration: 45 },
      { name: 'Coloração Completa', price: 250, duration: 180 },
      { name: 'Hidratação Profunda', price: 120, duration: 90 },
      { name: 'Escova Progressiva', price: 300, duration: 240 },
      { name: 'Luzes/Mechas', price: 180, duration: 150 },
      { name: 'Penteado Festa', price: 150, duration: 90 },
      { name: 'Reconstrução Capilar', price: 140, duration: 120 }
    ]

    // Horários de atendimento
    const timeSlots = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00', '18:30']

    const appointments = []

    // Criar agendamentos de 01/11 até 26/11 (26 dias)
    for (let day = 1; day <= 26; day++) {
      const date = new Date(2024, 10, day) // Mês 10 = novembro
      
      // 5-7 agendamentos por dia
      const numAppointments = Math.floor(Math.random() * 3) + 5
      
      for (let i = 0; i < numAppointments && i < timeSlots.length; i++) {
        const randomClient = clients[Math.floor(Math.random() * clients.length)]
        const randomService = availableServices[Math.floor(Math.random() * availableServices.length)]
        
        // Status baseado na data
        let status = 'realizado'
        const today = new Date()
        if (date > today) {
          status = Math.random() > 0.3 ? 'agendado' : 'confirmado'
        } else {
          // Dados históricos: 85% realizados, 10% cancelados, 5% não compareceu
          const rand = Math.random()
          if (rand > 0.85) {
            status = 'cancelado'
          }
        }

        appointments.push({
          clientId: randomClient._id,
          clientName: randomClient.name,
          service: randomService.name,
          date: date.toISOString(),
          time: timeSlots[i],
          price: randomService.price,
          duration: randomService.duration,
          status: status,
          products: status === 'realizado' ? 'Produtos profissionais' : '',
          notes: status === 'cancelado' ? 'Cliente cancelou' : '',
          createdAt: new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias antes
          updatedAt: date.toISOString()
        })
      }
    }

    console.log(`📅 Criando ${appointments.length} agendamentos de novembro...`)

    // Inserir todos os agendamentos
    await lumi.entities.appointments.createMany(appointments)

    console.log('✅ Agendamentos de novembro criados com sucesso!')

    // Atualizar estatísticas dos clientes
    console.log('📊 Atualizando estatísticas dos clientes...')
    
    const clientStats = new Map()
    
    appointments.forEach(apt => {
      if (apt.status === 'realizado') {
        const current = clientStats.get(apt.clientId) || { totalSpent: 0, visitCount: 0 }
        current.totalSpent += apt.price
        current.visitCount += 1
        clientStats.set(apt.clientId, current)
      }
    })

    // Atualizar cada cliente
    for (const [clientId, stats] of clientStats.entries()) {
      const client = clients.find(c => c._id === clientId)
      if (client) {
        await lumi.entities.clients.update(clientId, {
          totalSpent: (client.totalSpent || 0) + stats.totalSpent,
          visitCount: (client.visitCount || 0) + stats.visitCount,
          lastVisit: new Date().toISOString()
        })
      }
    }

    console.log('✅ Estatísticas dos clientes atualizadas!')
    console.log('🎉 População de dados concluída com sucesso!')

    return {
      success: true,
      appointmentsCreated: appointments.length,
      clientsUpdated: clientStats.size
    }

  } catch (error) {
    console.error('❌ Erro ao popular dados:', error)
    throw error
  }
}
