// (tabs)/splash.tsx
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, View } from 'react-native';

const Splash = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/welcome');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View 
      className='bg-primary flex-1 justify-center items-center'
      >
      <Image
        source={require('../assets/images/logo-splash.png')}
        className='size-60'
        resizeMode="contain"
      />
    </View>
  );
};

export default Splash;