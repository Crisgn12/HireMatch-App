import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, Pressable, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

// Interface basada en PerfilPublicoResponse del backend
interface UserProfileCardProps {
  user: {
    perfilId: number;
    nombreCompleto: string;
    email: string;
    tipoPerfil: string;
    descripcion?: string;
    ubicacion?: string;
    habilidades?: string;
    experiencia?: string;
    educacion?: string;
    certificaciones?: string;
    intereses?: string;
    fotoUrl?: string;
  };
  onContact: () => void;
  onReject: () => void;
  onFavorite: () => void;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ 
  user, 
  onContact, 
  onReject, 
  onFavorite 
}) => {
  const router = useRouter();

  // Función para extraer las primeras habilidades para mostrar como tags
  const getSkillTags = (habilidades?: string) => {
    if (!habilidades) return [];
    return habilidades.split(',').slice(0, 3).map(skill => skill.trim());
  };

  const skillTags = getSkillTags(user.habilidades);

  return (
    <View 
      className="bg-white rounded-3xl shadow-2xl border border-gray-100 relative overflow-hidden"
      style={{
        width: width * 0.9,
        height: height * 0.65,
        elevation: 20,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      }}
    >
      {/* Background Gradient Effect */}
      <View className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-green-50 to-transparent opacity-60" />
      
      {/* Profile Type Badge */}
      <View className="absolute top-6 right-6 z-10">
        <View className="bg-gradient-to-r from-green-400 to-emerald-400 rounded-full px-4 py-2 flex-row items-center shadow-lg">
          <Icon name="person" size={16} color="black" />
          <Text className="text-black text-xs font-poppins-bold ml-1">CANDIDATO</Text>
        </View>
      </View>

      {/* Main Content Container */}
      <View className="flex-1 p-6 pt-16 justify-between">
        {/* Header Section */}
        <View>
          {/* Profile Photo and Name */}
          <View className="items-center mb-4">
            {user.fotoUrl ? (
              <Image
                source={{ uri: user.fotoUrl }}
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                style={{ backgroundColor: '#F3F4F6' }}
              />
            ) : (
              <View className="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 border-4 border-white shadow-lg items-center justify-center">
                <Icon name="person" size={40} color="#059669" />
              </View>
            )}
            <Text className="text-2xl font-poppins-bold text-gray-900 mt-3 text-center leading-tight">
              {user.nombreCompleto}
            </Text>
            <Text className="text-sm font-poppins text-gray-600 mt-1">{user.email}</Text>
          </View>

          {/* Profile Details */}
          <View className="bg-gray-50 rounded-2xl p-4 mb-4">
            {user.ubicacion && (
              <View className="flex-row items-center mb-3">
                <Icon name="location-on" size={18} color="#6B7280" />
                <Text className="text-sm font-poppins-medium text-gray-700 ml-3">{user.ubicacion}</Text>
              </View>
            )}
            
            {user.experiencia && (
              <View className="flex-row items-start mb-3">
                <Icon name="work" size={18} color="#6B7280" style={{ marginTop: 2 }} />
                <Text 
                  className="text-sm font-poppins-medium text-gray-700 ml-3 flex-1"
                  numberOfLines={2}
                >
                  {user.experiencia.length > 60 
                    ? `${user.experiencia.substring(0, 60)}...` 
                    : user.experiencia
                  }
                </Text>
              </View>
            )}
            
            {user.educacion && (
              <View className="flex-row items-start mb-3">
                <Icon name="school" size={18} color="#6B7280" style={{ marginTop: 2 }} />
                <Text 
                  className="text-sm font-poppins-medium text-gray-700 ml-3 flex-1"
                  numberOfLines={2}
                >
                  {user.educacion.length > 60 
                    ? `${user.educacion.substring(0, 60)}...` 
                    : user.educacion
                  }
                </Text>
              </View>
            )}

            {user.descripcion && (
              <View className="flex-row items-start">
                <Icon name="info" size={18} color="#6B7280" style={{ marginTop: 2 }} />
                <Text 
                  className="text-sm font-poppins-medium text-gray-700 ml-3 flex-1"
                  numberOfLines={3}
                >
                  {user.descripcion}
                </Text>
              </View>
            )}
          </View>

          {/* Skills Tags */}
          {skillTags.length > 0 && (
            <View className="flex-row flex-wrap mb-4">
              {skillTags.map((skill, index) => (
                <View key={index} className="bg-green-100 rounded-full px-3 py-1 mr-2 mb-2">
                  <Text className="text-xs font-poppins-semibold text-green-700">{skill}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Footer Section */}
        <View>
          {/* Details Button */}
          <TouchableOpacity
            onPress={() => router.push(`/userDetails/${user.email}`)}
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
            }}>Ver Perfil Completo</Text>
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

            {/* Contact/Favorite Button */}
            <Pressable
              onPress={onFavorite}
              style={{
                backgroundColor: '#F59E0B',
                borderRadius: 30,
                padding: 16,
                elevation: 8,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
              }}
            >
              <Icon name="star" size={28} color="white" />
            </Pressable>

            {/* Contact Button */}
            <Pressable
              onPress={onContact}
              style={{
                backgroundColor: 'white',
                borderRadius: 25,
                padding: 12,
                borderWidth: 2,
                borderColor: '#DBEAFE',
                elevation: 4,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}
            >
              <Icon name="email" size={24} color="#3B82F6" />
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

export default UserProfileCard;