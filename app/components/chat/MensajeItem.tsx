// components/chat/MensajeItem.tsx
import React from 'react';
import { Text, View } from 'react-native';
import { MensajeResponse } from '../../services/api';

interface MensajeItemProps {
  mensaje: MensajeResponse;
  userId: number;
}

const MensajeItem: React.FC<MensajeItemProps> = ({ mensaje, userId }) => {
  const esMiMensaje = mensaje.remitenteId === userId;
  const fechaFormateada = new Date(mensaje.fechaEnvio).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <View
      className={`mb-3 max-w-[80%] ${
        esMiMensaje ? 'self-end' : 'self-start'
      }`}
    >
      <View
        className={`px-4 py-2 rounded-2xl ${
          esMiMensaje
            ? 'bg-primary rounded-br-sm'
            : 'bg-gray-200 rounded-bl-sm'
        }`}
      >
        <Text
          style={{ fontFamily: 'Poppins-Regular' }}
          className={`text-base ${
            esMiMensaje ? 'text-white' : 'text-gray-800'
          }`}
        >
          {mensaje.contenido}
        </Text>
      </View>
      <Text
        style={{ fontFamily: 'Poppins-Regular' }}
        className={`text-xs text-gray-500 mt-1 ${
          esMiMensaje ? 'text-right' : 'text-left'
        }`}
      >
        {fechaFormateada}
      </Text>
    </View>
  );
};

export default MensajeItem;