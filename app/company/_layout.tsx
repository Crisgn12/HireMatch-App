import { Tabs } from 'expo-router';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ProtectedLayout from '../_protected';

const CompanyLayout = () => {

  return (
    <ProtectedLayout>
        
      <Tabs
        screenOptions={{
          headerShown: true, // Oculta el encabezado en todas las pestañas
          tabBarActiveTintColor: '#005187', // Color de pestaña activa
          tabBarInactiveTintColor: 'gray', // Color de pestaña inactiva
          tabBarStyle: { backgroundColor: '#F5F5F5' }, // Estilo de la barra
        }}
      >

        <Tabs.Screen
          name="jobOffers"
          options={{
            title: 'Mis Ofertas',
            tabBarLabel: 'Inicio',
            tabBarIcon: ({ color, size }) => (
              <Icon name="cases" size={size} color={color} />
            ),
            // headerRight: () => (
            //   <TouchableOpacity
            //     onPress={() => router.push('/companyExtraViews/addJobOffer')}
            //     style={{ marginRight: 15 }}
            //   >
            //     <Icon name="add" size={30} color="#005187" />
            //   </TouchableOpacity>
            // ),
          }}
        />
        
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Mi Perfil',
            tabBarLabel: 'Perfil',
            tabBarIcon: ({ color, size }) => (
              <Icon name="person" size={size} color={color} />
            ),
          }}
        />
        {/* Añade más Tabs.Screen para otras vistas en la carpeta tabs si es necesario */}
      </Tabs>
    </ProtectedLayout>
  )
}

export default CompanyLayout