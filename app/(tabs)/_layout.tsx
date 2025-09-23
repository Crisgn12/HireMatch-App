import { Tabs } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Importar MaterialIcons
import ProtectedLayout from '../_protected';

export default function TabsLayout() {
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
          name="home"
          options={{
            title: 'Bienvenido',
            tabBarLabel: 'Empleos',
            tabBarIcon: ({ color, size }) => (
              <Icon name="cases" size={size} color={color} />
            ),
          }}
        />
        
        <Tabs.Screen
          name="applications"
          options={{
            title: 'Mis Postulaciones',
            tabBarLabel: 'Postulaciones',
            tabBarIcon: ({ color, size }) => (
              <Icon name="favorite" size={size} color={color} />
            ),
          }}
        />
        
          <Tabs.Screen
          name="chats"
          options={{
            title: 'Mis Chats',
            tabBarLabel: 'Chats',
            tabBarIcon: ({ color, size }) => (
              <Icon name="chat" size={size} color={color} />
            ),
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
  );
}