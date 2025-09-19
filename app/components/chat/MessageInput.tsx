// components/chat/MessageInput.tsx
import React, { useState } from 'react';
import { Alert, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface MessageInputProps {
  onSendMessage: (contenido: string) => void;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled = false }) => {
  const [mensaje, setMensaje] = useState('');

  const handleSend = () => {
    const mensajeTrimmed = mensaje.trim();
    if (!mensajeTrimmed) {
      Alert.alert('Error', 'Por favor escribe un mensaje');
      return;
    }

    if (mensajeTrimmed.length > 1000) {
      Alert.alert('Error', 'El mensaje no puede exceder 1000 caracteres');
      return;
    }

    onSendMessage(mensajeTrimmed);
    setMensaje('');
  };

  return (
    <View className="flex-row items-center p-3 bg-white border-t border-gray-200">
      <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-2 mr-3">
        <TextInput
          style={{ fontFamily: 'Poppins-Regular' }}
          className="flex-1 text-base"
          placeholder="Escribe un mensaje..."
          placeholderTextColor="#9CA3AF"
          value={mensaje}
          onChangeText={setMensaje}
          multiline
          maxLength={1000}
          editable={!disabled}
        />
      </View>
      <TouchableOpacity
        onPress={handleSend}
        disabled={disabled || !mensaje.trim()}
        className={`w-10 h-10 rounded-full items-center justify-center ${
          disabled || !mensaje.trim() ? 'bg-gray-300' : 'bg-primary'
        }`}
      >
        <Icon
          name="send"
          size={18}
          color={disabled || !mensaje.trim() ? '#9CA3AF' : 'white'}
        />
      </TouchableOpacity>
    </View>
  );
};

export default MessageInput;