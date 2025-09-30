import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { obtenerEstadisticasEmpresa } from '../services/api';

interface EstadisticaEmpresaResponse {
  empresaId: number;
  nombreEmpresa: string;
  descripcion: string;
  sitioWeb: string;
  totalOfertas: number;
  ofertasActivas: number;
  ofertasInactivas: number;
  ofertasDestacadas: number;
  totalPostulaciones: number;
  totalMatches: number;
  totalSuperlikes: number;
  totalRechazosEmpresa: number;
  totalRechazosPostulante: number;
  totalContactados: number;
  totalVistasOfertas: number;
  totalVacantesDisponibles: number;
  diasActiva: number;
  fechaRegistro: string;
  ultimaActividad: string;
  tasaAceptacion: number;
  tasaRechazoEmpresa: number;
  tasaRechazo: number;
  tasaContacto: number;
  perfilCompletado: boolean;
  porcentajePerfil: number;
  indiceEngagement: number;
  totalBadges: number;
}

const Stats = () => {
  const router = useRouter();
  const [stats, setStats] = useState<EstadisticaEmpresaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await obtenerEstadisticasEmpresa();
        setStats(data);
      } catch (err) {
        setError((err as Error).message || 'Error al cargar las estadísticas de la empresa');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-700 font-poppins-semibold text-lg">Cargando estadísticas...</Text>
      </SafeAreaView>
    );
  }

  if (error || !stats) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50 px-6">
        <Text className="text-red-500 font-poppins text-center mb-4">{error || 'No se pudieron cargar las estadísticas'}</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-blue-700 rounded-full px-6 py-3"
        >
          <Text className="text-white font-poppins-semibold">Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 60;

  // Datos para gráfico de pastel (Ofertas Activas, Inactivas, Destacadas)
  const pieData = [
    { name: 'Activas', value: stats.ofertasActivas || 0, color: '#34D399', legendFontColor: '#1F2937', legendFontSize: 12 },
    { name: 'Inactivas', value: stats.ofertasInactivas || 0, color: '#F59E0B', legendFontColor: '#1F2937', legendFontSize: 12 },
    { name: 'Destacadas', value: stats.ofertasDestacadas || 0, color: '#1E40AF', legendFontColor: '#1F2937', legendFontSize: 12 },
  ];

  // Datos para gráfico de barras (Postulaciones, Matches, Superlikes)
  const barData = {
    labels: ['Postulaciones', 'Matches', 'Superlikes'],
    datasets: [
      {
        data: [stats.totalPostulaciones || 0.1, stats.totalMatches || 0.1, stats.totalSuperlikes || 0.1],
        colors: [(opacity = 1) => `rgba(52, 211, 153, ${opacity})`, (opacity = 1) => `rgba(30, 64, 175, ${opacity})`, (opacity = 1) => `rgba(245, 158, 11, ${opacity})`],
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: '#F9FAFB',
    backgroundGradientTo: '#F9FAFB',
    color: (opacity = 1) => `rgba(30, 64, 175, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.6,
    decimalPlaces: 0,
    labelColor: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-primary pt-6 pb-8 px-6 rounded-b-3xl">
          <Text className="text-3xl font-poppins-bold text-white mb-2">Panel de Estadísticas</Text>
          <Text className="text-white font-poppins opacity-90">Mira el rendimiento de {stats.nombreEmpresa}</Text>
        </View>

        <View className="px-6 -mt-4">
          {/* Cards de Métricas Principales */}
          <View className="flex-row justify-between mb-4">
            <View className="bg-white rounded-2xl p-4 shadow-lg flex-1 mr-2">
              <Text className="text-gray-500 font-poppins text-xs mb-1">Total Ofertas</Text>
              <Text className="text-3xl font-poppins-bold text-blue-700">{stats.totalOfertas}</Text>
              <Text className="text-green-600 font-poppins-semibold text-xs mt-1">📈 Activas</Text>
            </View>

            <View className="bg-white rounded-2xl p-4 shadow-lg flex-1 ml-2">
              <Text className="text-gray-500 font-poppins text-xs mb-1">Total Postulaciones</Text>
              <Text className="text-3xl font-poppins-bold text-amber-600">{stats.totalPostulaciones}</Text>
              <Text className="text-gray-400 font-poppins text-xs mt-1">📥 Recibidas</Text>
            </View>
          </View>

          {/* Barra de progreso para Tasa de Contacto */}
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-lg">
            <Text className="text-lg font-poppins-semibold text-gray-800 mb-3">Tasa de Contacto</Text>
            <View className="bg-gray-200 h-4 rounded-full overflow-hidden">
              <View 
                className="bg-amber-500 h-full rounded-full"
                style={{ width: `${stats.tasaContacto * 100}%` }}
              />
            </View>
            <Text className="text-center mt-2 font-poppins-bold text-amber-600">{(stats.tasaContacto * 100).toFixed(0)}%</Text>
          </View>

          {/* Barra de progreso para Tasa de Aceptación */}
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-lg">
            <Text className="text-lg font-poppins-semibold text-gray-800 mb-3">Tasa de Aceptación</Text>
            <View className="bg-gray-200 h-4 rounded-full overflow-hidden">
              <View 
                className="bg-green-500 h-full rounded-full"
                style={{ width: `${stats.tasaAceptacion * 100}%` }}
              />
            </View>
            <Text className="text-center mt-2 font-poppins-bold text-green-600">{(stats.tasaAceptacion * 100).toFixed(0)}%</Text>
          </View>

          {/* Gráfico de Pastel - Estado de Ofertas */}
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-lg">
            <Text className="text-lg font-poppins-semibold text-gray-800 mb-3">Estado de Ofertas</Text>
            <PieChart
              data={pieData}
              width={chartWidth}
              height={200}
              chartConfig={chartConfig}
              accessor="value"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>

          {/* Tarjeta de Métricas Adicionales */}
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-lg">
            <Text className="text-lg font-poppins-semibold text-gray-800 mb-3">Métricas Clave</Text>
            <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
              <Text className="text-gray-600 font-poppins">Total Matches</Text>
              <Text className="text-gray-800 font-poppins-semibold">{stats.totalMatches}</Text>
            </View>
            <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
              <Text className="text-gray-600 font-poppins">Total Contactados</Text>
              <Text className="text-gray-800 font-poppins-semibold">{stats.totalContactados}</Text>
            </View>
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-gray-600 font-poppins">Total Vistas a Ofertas</Text>
              <Text className="text-gray-800 font-poppins-semibold">{stats.totalVistasOfertas}</Text>
            </View>
          </View>

          {/* Tarjeta de Rendimiento General */}
          <View className="bg-primary rounded-2xl p-5 mb-4 shadow-lg">
            <Text className="text-white font-poppins-semibold text-base mb-2">Rendimiento General</Text>
            <Text className="text-white font-poppins-bold text-2xl">Índice de Engagement: {(stats.indiceEngagement * 100).toFixed(1)}%</Text>
            <Text className="text-white font-poppins text-sm mt-1 opacity-80">Métrica de interacción</Text>
          </View>

          {/* Información de Empresa */}
          <View className="bg-white rounded-2xl p-5 mb-6 shadow-lg">
            <Text className="text-lg font-poppins-semibold text-gray-800 mb-4">Información de Empresa</Text>
            <View className="space-y-3">
              <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
                <Text className="text-gray-600 font-poppins">Fecha de Registro</Text>
                <Text className="text-gray-800 font-poppins-semibold">
                  {new Date(stats.fechaRegistro).toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-gray-600 font-poppins">Última Actividad</Text>
                <Text className="text-gray-800 font-poppins-semibold">
                  {new Date(stats.ultimaActividad).toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Stats;