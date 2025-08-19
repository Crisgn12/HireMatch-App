// app/_protected.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { PropsWithChildren, useEffect } from 'react';

const ProtectedLayout = ({ children }: PropsWithChildren) => {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        // Redirigir a login si no hay token
        router.replace('/auth/login');
      }
    };
    checkAuth();
  }, [router]);

  return children;
};

export default ProtectedLayout;