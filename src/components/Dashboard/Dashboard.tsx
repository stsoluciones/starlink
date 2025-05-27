  'use client'

  import React, { useEffect, useState, useCallback } from 'react'
  import axios from 'axios'
  import { useRouter } from 'next/navigation'
  import { getInLocalStorage } from '../../Hooks/localStorage'
  import Loading from '../Loading/Loading'
  import PedidoCard from './PedidoCard'
  import PerfilPage from '../Perfil/Perfil'

  // Constantes para estados
  const ESTADOS_ACTIVOS = ["pendiente", "pagado", "enviado"] as const
  type EstadoActivo = typeof ESTADOS_ACTIVOS[number]
  type EstadoPedido = 'entregado' | 'cancelado' | EstadoActivo

  export interface ItemPedido {
    producto: string
    cantidad: number
    precioUnitario: number
  }

  export interface Pedido {
    _id: string
    estado: EstadoPedido
    fechaPedido: string
    total: number
    items: ItemPedido[]
    usuarioUid: string
  }

  const Dashboard = () => {
    const router = useRouter()
    const [usuarioUid, setUsuarioUid] = useState<string | null>(null)
    const [pedidos, setPedidos] = useState<Pedido[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'pedidos' | 'perfil'>('pedidos')

    // Obtener datos del usuario
    useEffect(() => {
      try {
        const userData = getInLocalStorage('USER')
        if (userData?.uid) {
          setUsuarioUid(userData.uid)
        } else {
          router.push('/user/Login')
        }
      } catch (err) {
        setError('Error al cargar datos de usuario')
      }
    }, [router])

    // Obtener pedidos del usuario
    const fetchPedidos = useCallback(async (uid: string) => {
      try {
        setLoading(true)
        const { data } = await axios.get<{ pedidos: Pedido[] }>(
          `/api/obtener-pedidos?usuarioUid=${uid}`
        )
        //console.log('Pedidos obtenidos:', data.pedidos)
        setPedidos(data.pedidos)
      } catch (err) {
        console.error('Error fetching orders:', err)
        setError('No se pudieron cargar los pedidos. Intente nuevamente más tarde.')
      } finally {
        setLoading(false)
      }
    }, [])

    useEffect(() => {
      if (usuarioUid) {
        fetchPedidos(usuarioUid)
      }
    }, [usuarioUid, fetchPedidos])

    const [pedidosActivos, pedidosCompletados] = React.useMemo(() => {
      const isEstadoActivo = (estado: EstadoPedido): estado is EstadoActivo => {
        return ESTADOS_ACTIVOS.includes(estado as EstadoActivo)
      }

      return [
        pedidos.filter(p => isEstadoActivo(p.estado)),
        pedidos.filter(p => !isEstadoActivo(p.estado))
      ]
    }, [pedidos])

    // Estados de carga y error
    if (loading) return <Loading />
    if (error) return <ErrorPage message={error} />

    return (
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Mi Panel de Cliente</h1>
          <p className="text-gray-600">Administra tus pedidos y tu perfil</p>
        </header>

        {/* Pestañas */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('pedidos')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pedidos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mis Pedidos
            </button>
            <button
              onClick={() => setActiveTab('perfil')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'perfil'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mi Perfil
            </button>
          </nav>
        </div>

        {/* Contenido de las pestañas */}
        {activeTab === 'pedidos' ? (
          <>
            <section className="mb-10">
              <SectionHeader 
                title="🟢 Pedidos Activos" 
                count={pedidosActivos.length}
              />
              <PedidosList 
                pedidos={pedidosActivos} 
                emptyMessage="No tienes pedidos activos."
              />
            </section>

            <section>
              <SectionHeader 
                title="📜 Historial de Compras" 
                count={pedidosCompletados.length}
              />
              <PedidosList 
                pedidos={pedidosCompletados} 
                emptyMessage="No tienes compras anteriores."
              />
            </section>
          </>
        ) : (
          <PerfilPage usuarioUid={usuarioUid} />
        )}
      </div>
    )
  }


  const ErrorPage = ({ message }: { message: string }) => (
    <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
      <p className="font-medium">Error:</p>
      <p>{message}</p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
      >
        Reintentar
      </button>
    </div>
  )

  const SectionHeader = ({ title, count }: { title: string; count: number }) => (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
      <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
        {count} {count === 1 ? 'pedido' : 'pedidos'}
      </span>
    </div>
  )

  const PedidosList = ({ pedidos, emptyMessage }: { pedidos: Pedido[]; emptyMessage: string }) => (
    <div className="space-y-4">
      {pedidos.length > 0 ? (
        pedidos.map(pedido => <PedidoCard key={pedido._id} pedido={pedido} />)
      ) : (
        <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
          {emptyMessage}
        </div>
      )}
    </div>
  )

  export default Dashboard