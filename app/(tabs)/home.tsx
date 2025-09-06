import { useNavigation, useRouter } from 'expo-router';
import React, { useLayoutEffect, useState } from 'react';
import { Dimensions, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import JobOfferCard from '../components/JobOfferCard';

const { width, height } = Dimensions.get('window');

// Mock data for testing (single job)
const mockJob = {
  id: 1,
  titulo: 'Desarrollador Full Stack',
  empresaNombre: 'Tech Corp',
  ubicacion: 'San José, Costa Rica',
  tipoTrabajo: 'REMOTO',
  tipoContrato: 'TIEMPO_COMPLETO',
  nivelExperiencia: 'SEMI_SENIOR',
  salarioFormateado: '$2000 - $3000',
  tiempoPublicacion: 'Hace 3 días',
  etiquetas: ['startup', 'tecnología', 'crecimiento'],
  urgente: true,
  destacada: false,
  mostrarSalario: true,
  areaTrabajo: 'Desarrollo',
};

const Home = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const [likes, setLikes] = useState(5);
  const [superLikes, setSuperLikes] = useState(2);

  // Configurar el header dinámicamente
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "HireMatch",
      headerTitleStyle: {
        fontFamily: "Poppins-Bold",
        fontSize: 22,
        color: "#1F2937",
      },
      headerTitleAlign: 'center',
      headerStyle: {
        backgroundColor: '#ffffff',
        elevation: 4,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      headerLeft: () => (
        <View style={{ marginLeft: 16 }}>
          <Pressable
            /*onPress={() => router.push("/store")}*/
            style={{
              backgroundColor: '#10B981',
              borderRadius: 25,
              paddingHorizontal: 12,
              paddingVertical: 6,
              flexDirection: 'row',
              alignItems: 'center',
              elevation: 6,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
            }}
          >
            <Icon name="store" size={18} color="white" />
            <Text style={{
              color: 'white',
              fontSize: 12,
              fontWeight: 'bold',
              marginLeft: 4
            }}>Tienda</Text>
          </Pressable>
        </View>
      ),
      headerRight: () => (
        <View style={{ 
          flexDirection: 'row', 
          marginRight: 8,
          gap: 8
        }}>
          {/* Likes */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 20,
            paddingHorizontal: 10,
            paddingVertical: 6,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: '#FEE2E2',
            elevation: 4,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            minWidth: 55,
            justifyContent: 'center',
          }}>
            <Icon name="favorite" size={14} color="#EF4444" />
            <Text style={{
              marginLeft: 4,
              fontSize: 12,
              fontWeight: 'bold',
              color: '#374151'
            }}>{likes}</Text>
          </View>
          
          {/* Super Likes */}
          <View style={{
            backgroundColor: '#F59E0B',
            borderRadius: 20,
            paddingHorizontal: 10,
            paddingVertical: 6,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: '#FEF3C7',
            elevation: 4,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            minWidth: 55,
            justifyContent: 'center',
          }}>
            <Icon name="star" size={14} color="white" />
            <Text style={{
              marginLeft: 3,
              fontSize: 12,
              fontWeight: 'bold',
              color: 'white'
            }}>{superLikes}</Text>
          </View>
        </View>
      ),
    });
  }, [navigation, likes, superLikes, router]);

  return (
    <SafeAreaView style={{ 
      flex: 1, 
      backgroundColor: '#F8FAFC' 
    }}>
      {/* Low Balance Warning - Fixed positioning */}
      {(likes === 0 && superLikes === 0) && (
        <View style={{
          position: 'absolute',
          top: 10,
          left: 16,
          right: 16,
          backgroundColor: '#FEE2E2',
          borderWidth: 2,
          borderColor: '#FCA5A5',
          borderRadius: 16,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          zIndex: 30,
          elevation: 12,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
        }}>
          <View style={{
            backgroundColor: '#EF4444',
            borderRadius: 20,
            padding: 8,
            marginRight: 12
          }}>
            <Icon name="warning" size={20} color="white" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{
              color: '#991B1B',
              fontWeight: 'bold',
              fontSize: 14
            }}>
              ¡Se te acabaron los likes!
            </Text>
            <Text style={{
              color: '#DC2626',
              fontSize: 12,
              marginTop: 4
            }}>
              Visita la tienda para comprar más y seguir aplicando
            </Text>
          </View>
          <Pressable 
            /*onPress={() => router.push("/store")}*/
            style={{
              backgroundColor: '#EF4444',
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 4
            }}
          >
            <Text style={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: 12
            }}>Ir</Text>
          </Pressable>
        </View>
      )}

      {/* Main Card Area - Fixed container */}
      <View style={{ 
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingTop: (likes === 0 && superLikes === 0) ? 80 : 20,
        paddingBottom: 20
      }}>
        <View style={{ 
          height: height * 0.60, 
          width: Math.min(width * 0.90, 400), // Max width constraint
          maxHeight: 650 // Max height constraint
        }}>
          <JobOfferCard job={mockJob} />
        </View>
      </View>

      {/* Action Buttons - Fixed positioning and spacing */}
      <View style={{
        paddingHorizontal: 24,
        paddingBottom: 0,
        paddingTop: 40
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 24,
          paddingVertical: 20,
          paddingHorizontal: 16,
          elevation: 8,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          gap: 32 // Fixed spacing between buttons
        }}>
          {/* Reject Button */}
          <Pressable
            style={{
              backgroundColor: 'white',
              borderRadius: 30,
              padding: 16,
              borderWidth: 2,
              borderColor: '#FEE2E2',
              elevation: 6,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
            }}
          >
            <Icon name="close" size={28} color="#EF4444" />
          </Pressable>

          {/* Super Like Button */}
          <Pressable
            onPress={() => {
              if (superLikes > 0) setSuperLikes(prev => prev - 1);
            }}
            style={{
              backgroundColor: '#F59E0B',
              borderRadius: 35,
              padding: 20,
              elevation: 10,
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
            }}
          >
            <Icon name="star" size={32} color="white" />
          </Pressable>

          {/* Like Button */}
          <Pressable
            onPress={() => {
              if (likes > 0) setLikes(prev => prev - 1);
            }}
            style={{
              backgroundColor: 'white',
              borderRadius: 30,
              padding: 16,
              borderWidth: 2,
              borderColor: '#D1FAE5',
              elevation: 6,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
            }}
          >
            <Icon name="favorite" size={28} color="#10B981" />
          </Pressable>
        </View>
      </View>

      {/* Achievement/Match Notification Area */}
      <View style={{
        position: 'absolute',
        top: 80,
        left: 16,
        right: 16,
        pointerEvents: 'none',
        zIndex: 20
      }}>
        {/* Placeholder for match notifications, achievements, etc. */}
      </View>
    </SafeAreaView>
  );
};

export default Home;