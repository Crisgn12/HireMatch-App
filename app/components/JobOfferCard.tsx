import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

// Interface based on OfertaFeedResponse
interface JobOfferCardProps {
  job: {
    id: number;
    titulo: string;
    empresaNombre: string;
    ubicacion: string;
    tipoTrabajo: string;
    tipoContrato: string;
    nivelExperiencia: string;
    salarioFormateado: string;
    tiempoPublicacion: string;
    etiquetas?: string[];
    urgente?: boolean;
    destacada?: boolean;
    mostrarSalario?: boolean;
    areaTrabajo?: string;
  };
}

const JobOfferCard: React.FC<JobOfferCardProps> = ({ job }) => {
  const router = useRouter();

  return (
    <View 
      className="bg-white rounded-3xl shadow-2xl border border-gray-100 relative overflow-hidden"
      style={{
        width: width * 0.9,
        height: height * 0.58,
        elevation: 20,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      }}
    >
      {/* Background Gradient Effect */}
      <View className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-50 to-transparent opacity-60" />
      
      {/* Urgent or Featured Badges */}
      <View className="absolute top-6 left-6 right-6 flex-row justify-between z-10">
        {job.destacada && (
          <View className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full px-4 py-2 flex-row items-center shadow-lg">
            <Icon name="star" size={16} color="black" />
            <Text className="text-black text-xs font-poppins-bold ml-1">DESTACADA</Text>
          </View>
        )}
        {job.urgente && (
          <View className="bg-gradient-to-r from-red-500 to-pink-500 rounded-full px-4 py-2 flex-row items-center shadow-lg">
            <Icon name="schedule" size={16} color="black" />
            <Text className="text-black text-xs font-poppins-bold ml-1">URGENTE</Text>
          </View>
        )}
      </View>

      {/* Main Content Container */}
      <View className="flex-1 p-8 pt-20 justify-between">
        {/* Header Section */}
        <View>
          {/* Company Name with Icon */}
          <View className="flex-row items-center mb-4">
            <View className="bg-blue-100 rounded-full p-3 mr-3">
              <Icon name="business" size={24} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-poppins-semibold text-gray-700">{job.empresaNombre}</Text>
              <Text className="text-sm font-poppins text-gray-500">{job.areaTrabajo || 'Tecnología'}</Text>
            </View>
          </View>

          {/* Job Title */}
          <Text className="text-3xl font-poppins-bold text-gray-900 mb-6 leading-tight">
            {job.titulo}
          </Text>

          {/* Job Details Grid */}
          <View className="bg-gray-50 rounded-2xl p-5 mb-6">
            <View className="flex-row items-center mb-4">
              <Icon name="location-on" size={20} color="#6B7280" />
              <Text className="text-base font-poppins-medium text-gray-700 ml-3">{job.ubicacion}</Text>
            </View>
            
            <View className="flex-row items-center mb-4">
              <Icon name="work" size={20} color="#6B7280" />
              <Text className="text-base font-poppins-medium text-gray-700 ml-3">{job.tipoTrabajo} • {job.tipoContrato}</Text>
            </View>
            
            <View className="flex-row items-center mb-4">
              <Icon name="trending-up" size={20} color="#6B7280" />
              <Text className="text-base font-poppins-medium text-gray-700 ml-3">{job.nivelExperiencia}</Text>
            </View>

            {job.mostrarSalario && (
              <View className="flex-row items-center">
                <Icon name="attach-money" size={20} color="#059669" />
                <Text className="text-base font-poppins-bold text-green-600 ml-3">
                  {job.salarioFormateado || 'Salario competitivo'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer Section */}
        <View>
          {/* Publication Time */}
          <View className="flex-row items-center justify-center mb-6">
            <Icon name="access-time" size={16} color="#9CA3AF" />
            <Text className="text-sm font-poppins text-gray-500 ml-2">{job.tiempoPublicacion}</Text>
          </View>
          
          {/* Details Button */}
          <TouchableOpacity
            onPress={() => router.push(`/companyExtraViews/${job.id}`)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl py-4 flex-row items-center justify-center shadow-lg"
            style={{
              elevation: 8,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
            }}
          >
            <Icon name="visibility" size={24} color="black" />
            <Text className="text-black font-poppins-bold text-lg ml-3">Ver Detalles</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Swipe Hint */}
      <View className="absolute bottom-4 right-4 bg-black bg-opacity-20 rounded-full p-2">
        <Icon name="swipe" size={20} color="white" />
      </View>
    </View>
  );
};

export default JobOfferCard;