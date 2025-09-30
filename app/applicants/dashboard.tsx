import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { obtenerEstadisticasUsuario } from '../services/api';

interface EstadisticaUsuarioResponse {
  perfilId: number;
  totalMatches: number;
  totalLikesDados: number;
  totalLikesRecibidos: number;
  totalSuperlikesDados: number;
  totalSuperlikesRecibidos: number;
  totalRechazosDados: number;
  totalRechazosRecibidos: number;
  perfilCompletado: boolean;
  porcentajePerfil: number;
  diasActivo: number;
  ultimaActividad: string;
  fechaRegistro: string;
  fechaActualizacion: string;
  tasaExito: number;
  popularidad: number;
  tasaRespuesta: number;
  totalBadges: number;
  rendimientoVsPromedio: string;
  posicionRanking: number;
}

const Dashboard = () => {
  const router = useRouter();
  const [stats, setStats] = useState<EstadisticaUsuarioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await obtenerEstadisticasUsuario();
        setStats(data);
      } catch (err) {
        setError((err as Error).message || 'Error al cargar las estadísticas');
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

  // Datos para gráfico de pastel (Likes normales y superlikes)
  const pieData = [
    { name: 'Like(s)', value: stats.totalLikesDados || 0, color: '#1E40AF', legendFontColor: '#1F2937', legendFontSize: 12 },
    { name: 'Superlike(s)', value: stats.totalSuperlikesDados || 0, color: '#34D399', legendFontColor: '#1F2937', legendFontSize: 12 },
  ];

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
          <Text className="text-3xl font-poppins-bold text-white mb-2">Panel de estadísticas</Text>
          <Text className="text-white font-poppins opacity-90">Mira tus logros y métricas</Text>
        </View>

        <View className="px-6 -mt-4">
          {/* Cards de Métricas Principales */}
          <View className="flex-row justify-between mb-4">
            <View className="bg-white rounded-2xl p-4 shadow-lg flex-1 mr-2">
              <Text className="text-gray-500 font-poppins text-xs mb-1">Total Matches</Text>
              <Text className="text-3xl font-poppins-bold text-blue-700">{stats.totalMatches}</Text>
              <Text className="text-green-600 font-poppins-semibold text-xs mt-1">🔥 Activo</Text>
            </View>

            <View className="bg-white rounded-2xl p-4 shadow-lg flex-1 ml-2">
              <Text className="text-gray-500 font-poppins text-xs mb-1">Total Badges</Text>
              <Text className="text-3xl font-poppins-bold text-amber-600">{stats.totalBadges}</Text>
              <Text className="text-gray-400 font-poppins text-xs mt-1">🏆 Logros</Text>
            </View>
          </View>

          {/* Barra de progreso para Tasa de Éxito */}
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-lg">
            <Text className="text-lg font-poppins-semibold text-gray-800 mb-3">Tasa de Éxito</Text>
            <View className="bg-gray-200 h-4 rounded-full overflow-hidden">
              <View 
                className="bg-green-500 h-full rounded-full"
                style={{ width: `${stats.tasaExito * 100}%` }}
              />
            </View>
            <Text className="text-center mt-2 font-poppins-bold text-green-600">{(stats.tasaExito * 100).toFixed(0)}%</Text>
          </View>

          {/* Barra de progreso para Tasa de Respuesta */}
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-lg">
            <Text className="text-lg font-poppins-semibold text-gray-800 mb-3">Tasa de Respuesta</Text>
            <View className="bg-gray-200 h-4 rounded-full overflow-hidden">
              <View 
                className="bg-amber-500 h-full rounded-full"
                style={{ width: `${stats.tasaRespuesta * 100}%` }}
              />
            </View>
            <Text className="text-center mt-2 font-poppins-bold text-amber-600">{(stats.tasaRespuesta * 100).toFixed(0)}%</Text>
          </View>

          {/* Gráfico de Pastel - Likes y Superlikes */}
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-lg">
            <Text className="text-lg font-poppins-semibold text-gray-800 mb-3">Likes y Superlikes Dados</Text>
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

          {/* Tarjeta de Rendimiento vs Promedio */}
          <View className="bg-primary rounded-2xl p-5 mb-4 shadow-lg">
            <Text className="text-white font-poppins-semibold text-base mb-2">Comparación</Text>
            <Text className="text-white font-poppins-bold text-2xl">{stats.rendimientoVsPromedio}</Text>
            <Text className="text-white font-poppins text-sm mt-1 opacity-80">vs promedio de usuarios</Text>
          </View>

          {/* Información de Cuenta */}
          <View className="bg-white rounded-2xl p-5 mb-6 shadow-lg">
            <Text className="text-lg font-poppins-semibold text-gray-800 mb-4">Información de Cuenta</Text>
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
                <Text className="text-gray-600 font-poppins">Última Actualización</Text>
                <Text className="text-gray-800 font-poppins-semibold">
                  {new Date(stats.fechaActualizacion).toLocaleDateString('es-ES', { 
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

export default Dashboard;