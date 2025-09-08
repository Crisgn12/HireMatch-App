import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Dimensions, Pressable, Text, View } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import JobOfferCard from '../components/JobOfferCard';
import { getJobOffers, likeJobOffer } from '../services/api';

const { width, height } = Dimensions.get('window');

// Interfaz para una oferta de trabajo (basada en tu API)
interface JobOffer {
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
}

const Home = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const [likes, setLikes] = useState(5);
  const [superLikes, setSuperLikes] = useState(2);
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchJobOffers = async () => {
      setLoading(true);
      try {
        const response = await getJobOffers();
        setJobOffers(response.content || []); // Asumiendo que la respuesta tiene 'content' como array de ofertas
      } catch (err) {
        setError((err as Error).message || 'Error al cargar las ofertas');
      } finally {
        setLoading(false);
      }
    };
    fetchJobOffers();
  }, []);

  const handleSwipedRight = async (index: number) => {
    const job = jobOffers[index];
    try {
      await likeJobOffer(job.id);
      // Remover la oferta del array
      setJobOffers(prevOffers => prevOffers.filter((_, i) => i !== index));
      // Actualizar likes
      setLikes(prev => prev - 1);
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  };

  const handleSwipedLeft = (index: number) => {
    const job = jobOffers[index];
    console.log('Oferta descartada:', job.id);
    // Remover la oferta del array
    setJobOffers(prevOffers => prevOffers.filter((_, i) => i !== index));
  };

  const handleLike = () => {
    if (likes > 0) {
      setLikes(prev => prev - 1);
      // Aquí podrías agregar lógica para like manual si lo deseas
    }
  };

  const handleSuperLike = () => {
    if (superLikes > 0) {
      setSuperLikes(prev => prev - 1);
      // Aquí podrías agregar lógica para super like manual si lo deseas
    }
  };

  const handleReject = () => {
    if (jobOffers.length > 0) {
      setJobOffers(prevOffers => prevOffers.slice(1));
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Icon name="autorenew" size={40} color="#3B82F6" />
        <Text className="text-gray-700 text-lg font-poppins mt-2">Cargando ofertas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-red-500 font-poppins">{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ 
      flex: 1, 
      backgroundColor: '#F8FAFC' 
    }}
      edges={['right', 'left', 'bottom']}>
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

      {/* Main Card Area - Centered container */}
      <View style={{ 
        // flex: 1, 
        // justifyContent: 'center', 
        // alignItems: 'center',
        paddingHorizontal: 20,
      }}>
        {jobOffers.length > 0 ? (
          <Swiper
            cards={jobOffers}
            renderCard={(job) => (
              <JobOfferCard
                job={job}
                likes={likes}
                superLikes={superLikes}
                onLike={handleLike}
                onSuperLike={handleSuperLike}
                onReject={handleReject}
              />
            )}
            onSwipedRight={handleSwipedRight}
            onSwipedLeft={handleSwipedLeft}
            cardIndex={0}
            backgroundColor="#F8FAFC"
            stackSize={3}
            stackSeparation={15}
            animateCardOpacity
            animateOverlayLabelsOpacity
            swipeBackCard
            overlayLabels={{
              left: {
                title: 'Dislike',
                style: {
                  label: { backgroundColor: '#EF4444', color: 'white', padding: 10 },
                  wrapper: { flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-start', marginTop: 30, marginLeft: -30 },
                },
              },
              right: {
                title: 'Like',
                style: {
                  label: { backgroundColor: '#10B981', color: 'white', padding: 10 },
                  wrapper: { flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', marginTop: 30, marginLeft: 30 },
                },
              },
            }}
          />
        ) : (
          <Text className="text-gray-500 text-center">No hay ofertas disponibles</Text>
        )}
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