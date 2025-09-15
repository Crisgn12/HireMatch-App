import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Swiper, type SwiperCardRefType } from 'rn-swiper-list';
import UserProfileCard from '../../components/UserProfileCard';
import { createMatch, getLikesByOferta, getPerfilPublicoPorEmail, type LikeResponse, type PerfilPublicoResponse } from '../../services/api';

const { width, height } = Dimensions.get('window');

interface ApplicantProfile extends PerfilPublicoResponse {
  likeId: number;
  fechaLike: string;
  tipoLike: string;
}

const ApplicantsView = () => {
  const { ofertaId } = useLocalSearchParams() as { ofertaId: string };
  const router = useRouter();
  const swiperRef = useRef<SwiperCardRefType>(null);
  
  const [applicants, setApplicants] = useState<ApplicantProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug: Verificar que createMatch se importó correctamente
  useEffect(() => {
    console.log('createMatch function imported:', typeof createMatch);
    if (typeof createMatch !== 'function') {
      console.error('createMatch is not a function! Check the import.');
    }
  }, []);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        if (!ofertaId || typeof ofertaId !== 'string') {
          throw new Error('ID de oferta no válido');
        }

        const jobId = parseInt(ofertaId, 10);
        
        // 1. Obtener los likes de la oferta
        const likes = await getLikesByOferta(jobId);
        
        // 🔍 DEBUG: Ver la estructura exacta de los likes
        console.log('Likes received from backend:', JSON.stringify(likes, null, 2));
        console.log('Number of likes:', likes.length);
        
        // Ver el primer like para analizar su estructura
        if (likes.length > 0) {
          console.log('First like structure:', Object.keys(likes[0]));
          console.log('First like data:', likes[0]);
        }
        
        // 2. Obtener el perfil de cada usuario que dio like
        const applicantPromises = likes.map(async (like: LikeResponse, index: number) => {
          try {
            console.log(`Processing like ${index}:`, like);
            console.log(`Email for like ${index}:`, like.usuarioEmail);
            
            const profile = await getPerfilPublicoPorEmail(like.usuarioEmail);
            return {
              ...profile,
              likeId: like.likeId,
              fechaLike: like.fechaLike,
              tipoLike: like.tipoLike
            };
          } catch (error) {
            console.error(`Error getting profile for ${like.usuarioEmail}:`, error);
            return null;
          }
        });

        const applicantResults = await Promise.all(applicantPromises);
        const validApplicants = applicantResults.filter((applicant): applicant is ApplicantProfile => 
          applicant !== null
        );

        console.log('Valid applicants found:', validApplicants.length);
        setApplicants(validApplicants);
        
      } catch (err) {
        console.error('Error fetching applicants:', err);
        setError((err as Error).message || 'Error al cargar los postulantes');
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [ofertaId]);

  // Actualizado: Swipe hacia la derecha = Contactar (crear match)
  const handleSwipedRight = async (index: number) => {
    const applicant = applicants[index];
    if (!applicant) return;
    
    try {
      console.log('Creando match para candidato contactado:', applicant.email);
      await createMatch(applicant.likeId);
      
      Alert.alert(
        '¡Match creado!',
        `Se ha creado un match con ${applicant.nombreCompleto}. Podrán comunicarse próximamente.`
      );
      
      console.log('Match creado exitosamente para:', applicant.email);
    } catch (error) {
      console.error('Error creating match on swipe right:', error);
      Alert.alert(
        'Error',
        'No se pudo crear el match. El candidato ha sido marcado como contactado.'
      );
    }
    
    setCurrentIndex(index + 1);
  };

  // Sin cambios: Swipe hacia la izquierda = Descartar (sin match)
  const handleSwipedLeft = (index: number) => {
    const applicant = applicants[index];
    if (!applicant) return;
    import('../../services/api').then(({ rejectUserProfile }) => {
      rejectUserProfile(applicant.likeId)
        .then(() => {
          Alert.alert(
            'Candidato descartado',
            `${applicant.nombreCompleto} ha sido rechazado correctamente.`
          );
        })
        .catch((error) => {
          console.error('Error al rechazar candidato:', error);
          Alert.alert(
            'Error',
            'No se pudo rechazar al candidato. Inténtalo de nuevo.'
          );
        });
    });
    console.log('Candidato descartado:', applicant.email);
    setCurrentIndex(index + 1);
  };

  // Actualizado: Swipe hacia arriba = Favorito (crear match)
  const handleSwipedTop = async (index: number) => {
    const applicant = applicants[index];
    if (!applicant) return;
    
    try {
      console.log('Creando match para candidato favorito:', applicant.email);
      await createMatch(applicant.likeId);
      
      Alert.alert(
        '¡Agregado a favoritos!',
        `${applicant.nombreCompleto} ha sido agregado a tus favoritos con match creado.`
      );
      
      console.log('Match de favorito creado exitosamente para:', applicant.email);
    } catch (error) {
      console.error('Error creating favorite match on swipe top:', error);
      Alert.alert(
        'Error',
        'No se pudo crear el match. El candidato ha sido marcado como favorito.'
      );
    }
    
    setCurrentIndex(index + 1);
  };

  const handleContact = useCallback(() => {
    if (swiperRef.current && currentIndex < applicants.length) {
      swiperRef.current.swipeRight();
    }
  }, [currentIndex, applicants.length]);

  const handleFavorite = useCallback(() => {
    if (swiperRef.current && currentIndex < applicants.length) {
      swiperRef.current.swipeTop();
    }
  }, [currentIndex, applicants.length]);

  const handleReject = useCallback(() => {
    if (swiperRef.current && currentIndex < applicants.length) {
      swiperRef.current.swipeLeft();
    }
  }, [currentIndex, applicants.length]);

  // Overlays para el swiper - actualizado con colores consistentes
  const OverlayLabelRight = useCallback(() => {
    return (
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 81, 135, 0.2)', // Azul consistente
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        paddingTop: 60,
        paddingLeft: 30,
      }}>
        <View style={{
          backgroundColor: '#005187', // Azul consistente
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 10,
          transform: [{ rotate: '-30deg' }]
        }}>
          <Text style={{ 
            color: 'white', 
            fontWeight: 'bold', 
            fontSize: 20,
            textAlign: 'center'
          }}>CONTACTAR</Text>
        </View>
      </View>
    );
  }, []);

  const OverlayLabelLeft = useCallback(() => {
    return (
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 60,
        paddingRight: 30,
      }}>
        <View style={{
          backgroundColor: '#EF4444',
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 10,
          transform: [{ rotate: '30deg' }]
        }}>
          <Text style={{ 
            color: 'white', 
            fontWeight: 'bold', 
            fontSize: 20,
            textAlign: 'center'
          }}>DESCARTAR</Text>
        </View>
      </View>
    );
  }, []);

  const OverlayLabelTop = useCallback(() => {
    return (
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 120,
      }}>
        <View style={{
          backgroundColor: '#10B981',
          paddingHorizontal: 15,
          paddingVertical: 8,
          borderRadius: 10,
        }}>
          <Text style={{ 
            color: 'white', 
            fontWeight: 'bold', 
            fontSize: 18,
            textAlign: 'center'
          }}>FAVORITO</Text>
        </View>
      </View>
    );
  }, []);

  const renderCard = useCallback((applicant: ApplicantProfile, index: number) => {
    if (!applicant) {
      return (
        <View style={{
          width: width * 0.9,
          height: height * 0.65,
          backgroundColor: '#F3F4F6',
          borderRadius: 24,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Text>Cargando siguiente candidato...</Text>
        </View>
      );
    }

    return (
      <UserProfileCard
        user={applicant}
        onContact={handleContact}
        onFavorite={handleFavorite}
        onReject={handleReject}
      />
    );
  }, [handleContact, handleFavorite, handleReject]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#005187" />
        <Text className="text-gray-700 mt-2 font-poppins">Cargando postulantes...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <Icon name="error-outline" size={64} color="#EF4444" />
        <Text className="text-red-500 font-poppins text-center px-6 mt-4">{error}</Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-6 rounded-full px-6 py-3"
          style={{ backgroundColor: '#005187' }}
        >
          <Text className="text-white font-poppins-semibold">Volver</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ 
      flex: 1, 
      backgroundColor: '#F8FAFC' 
    }}
      edges={['right', 'left', 'bottom']}>
      
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'white',
        elevation: 4,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}>
        <Pressable onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#374151" />
        </Pressable>
        
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: '#374151',
          fontFamily: 'Poppins-Bold'
        }}>
          Postulantes ({applicants.length})
        </Text>
        
        <View style={{ width: 24 }} />
      </View>

      {/* Main Card Area */}
      <View style={{ 
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
      }}>
        {applicants.length > 0 && currentIndex < applicants.length ? (
          <Swiper
            ref={swiperRef}
            data={applicants}
            renderCard={renderCard}
            onSwipeRight={handleSwipedRight}
            onSwipeLeft={handleSwipedLeft}
            onSwipeTop={handleSwipedTop}
            onIndexChange={setCurrentIndex}
            OverlayLabelRight={OverlayLabelRight}
            OverlayLabelLeft={OverlayLabelLeft}
            OverlayLabelTop={OverlayLabelTop}
            cardStyle={{
              width: width * 0.9,
              height: height * 0.65,
              borderRadius: 24,
              elevation: 8,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
            }}
            overlayLabelContainerStyle={{
              borderRadius: 24,
            }}
            prerenderItems={3}
            loop={false}
            translateXRange={[-width / 2, 0, width / 2]}
            translateYRange={[-height / 2, 0, height / 2]}
            rotateInputRange={[-width / 3, 0, width / 3]}
            rotateOutputRange={[-Math.PI / 20, 0, Math.PI / 20]}
            swipeVelocityThreshold={800}
            inputOverlayLabelTopOpacityRange={[0, -height / 4]}
            outputOverlayLabelTopOpacityRange={[0, 1]}
            inputOverlayLabelRightOpacityRange={[0, width / 4]}
            outputOverlayLabelRightOpacityRange={[0, 1]}
            inputOverlayLabelLeftOpacityRange={[0, -width / 4]}
            outputOverlayLabelLeftOpacityRange={[0, 1]}
          />
        ) : applicants.length === 0 ? (
          <View style={{
            width: width * 0.9,
            height: height * 0.65,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white',
            borderRadius: 24,
          }}>
            <Icon name="people-outline" size={60} color="#9CA3AF" />
            <Text className="text-gray-600 text-center text-lg font-poppins mt-4">
              No hay postulantes aún
            </Text>
            <Text className="text-gray-500 text-center text-sm font-poppins mt-2">
              Los candidatos aparecerán aquí cuando apliquen a tu oferta
            </Text>
          </View>
        ) : (
          <View style={{
            width: width * 0.9,
            height: height * 0.65,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white',
            borderRadius: 24,
          }}>
            <Icon name="check-circle" size={60} color="#005187" />
            <Text className="text-gray-600 text-center text-lg font-poppins mt-4">
              ¡Has revisado todos los postulantes!
            </Text>
            <Text className="text-gray-500 text-center text-sm font-poppins mt-2">
              Nuevos candidatos aparecerán aquí automáticamente
            </Text>
          </View>
        )}
      </View>

      {/* Instructions */}
      <View style={{
        paddingHorizontal: 20,
        paddingBottom: 20,
      }}>
        <View style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 16,
          elevation: 4,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}>
          <Text style={{
            textAlign: 'center',
            fontSize: 12,
            color: '#6B7280',
            fontFamily: 'Poppins-Medium'
          }}>
            Desliza hacia la derecha para contactar • Hacia arriba para favoritos • Hacia la izquierda para descartar
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ApplicantsView;