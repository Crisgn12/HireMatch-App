import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Pressable, Text, TouchableOpacity, View } from 'react-native';
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
  likes: number;
  superLikes: number;
  onLike: () => void;
  onSuperLike: () => void;
  onReject: () => void;
}

const JobOfferCard: React.FC<JobOfferCardProps> = ({ job, likes, superLikes, onLike, onSuperLike, onReject }) => {
  const router = useRouter();

  return (
    <View 
      className="bg-white rounded-3xl shadow-2xl border border-gray-100 relative overflow-hidden"
      style={{
        width: width * 0.9,
        height: height * 0.65, // Reducido de 0.70 a 0.65
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
      <View className="flex-1 p-6 pt-16 justify-between">
        {/* Header Section */}
        <View>
          {/* Company Name with Icon */}
          <View className="flex-row items-center mb-3">
            <View className="bg-blue-100 rounded-full p-2 mr-3">
              <Icon name="business" size={20} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-poppins-semibold text-gray-700">{job.empresaNombre}</Text>
              <Text className="text-xs font-poppins text-gray-500">{job.areaTrabajo || 'Tecnología'}</Text>
            </View>
          </View>

          {/* Job Title */}
          <Text className="text-2xl font-poppins-bold text-gray-900 mb-4 leading-tight">
            {job.titulo}
          </Text>

          {/* Job Details Grid */}
          <View className="bg-gray-50 rounded-2xl p-4 mb-4">
            <View className="flex-row items-center mb-3">
              <Icon name="location-on" size={18} color="#6B7280" />
              <Text className="text-sm font-poppins-medium text-gray-700 ml-3">{job.ubicacion}</Text>
            </View>
            
            <View className="flex-row items-center mb-3">
              <Icon name="work" size={18} color="#6B7280" />
              <Text className="text-sm font-poppins-medium text-gray-700 ml-3">{job.tipoTrabajo} • {job.tipoContrato}</Text>
            </View>
            
            <View className="flex-row items-center mb-3">
              <Icon name="trending-up" size={18} color="#6B7280" />
              <Text className="text-sm font-poppins-medium text-gray-700 ml-3">{job.nivelExperiencia}</Text>
            </View>

            {job.mostrarSalario && (
              <View className="flex-row items-center">
                <Icon name="attach-money" size={18} color="#059669" />
                <Text className="text-sm font-poppins-bold text-green-600 ml-3">
                  {job.salarioFormateado || 'Salario competitivo'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer Section */}
        <View>
          {/* Publication Time */}
          <View className="flex-row items-center justify-center mb-4">
            <Icon name="access-time" size={14} color="#9CA3AF" />
            <Text className="text-xs font-poppins text-gray-500 ml-2">{job.tiempoPublicacion}</Text>
          </View>
          
          {/* Details Button */}
          <TouchableOpacity
            onPress={() => router.push(`/companyExtraViews/${job.id}`)}
            style={{
              backgroundColor: 'white',
              borderRadius: 16,
              paddingVertical: 12,
              paddingHorizontal: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              elevation: 6,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.15,
              shadowRadius: 6,
              borderWidth: 1,
              borderColor: '#E5E7EB',
            }}
          >
            <Icon name="visibility" size={20} color="#374151" />
            <Text style={{
              color: '#374151',
              fontWeight: 'bold',
              fontSize: 16,
              marginLeft: 8,
              textAlign: 'center'
            }}>Ver Detalles</Text>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            paddingBottom: 8,
          }}>
            {/* Reject Button */}
            <Pressable
              onPress={onReject}
              style={{
                backgroundColor: 'white',
                borderRadius: 25,
                padding: 12,
                borderWidth: 2,
                borderColor: '#FEE2E2',
                elevation: 4,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}
            >
              <Icon name="close" size={24} color="#EF4444" />
            </Pressable>

            {/* Super Like Button */}
            <Pressable
              onPress={onSuperLike}
              disabled={superLikes === 0}
              style={{
                backgroundColor: superLikes === 0 ? '#D1D5DB' : '#F59E0B',
                borderRadius: 30,
                padding: 16,
                elevation: 8,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
              }}
            >
              <Icon name="star" size={28} color={superLikes === 0 ? 'gray' : 'white'} />
            </Pressable>

            {/* Like Button */}
            <Pressable
              onPress={onLike}
              disabled={likes === 0}
              style={{
                backgroundColor: likes === 0 ? '#D1D5DB' : 'white',
                borderRadius: 25,
                padding: 12,
                borderWidth: 2,
                borderColor: likes === 0 ? '#D1D5DB' : '#D1FAE5',
                elevation: 4,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}
            >
              <Icon name="favorite" size={24} color={likes === 0 ? 'gray' : '#10B981'} />
            </Pressable>
          </View>
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