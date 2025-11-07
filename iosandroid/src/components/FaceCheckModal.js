import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { faceCheckAPI } from '../services/api';
import { useAuth } from '../store/authContext';
import CameraScreen from '../screens/CameraScreen';

const FaceCheckModal = ({ visible, onClose, checkId, deadlineIso }) => {
  const [step, setStep] = useState('instructions'); // 'instructions', 'camera', 'processing', 'result'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { user } = useAuth();

  const handlePhotoTaken = async (photo) => {
    setStep('processing');
    setLoading(true);

    try {
      // Отправка фото на верификацию
      const verifyResponse = await faceCheckAPI.verifyFace(user.name, photo);
      const { ok, message, distance } = verifyResponse.data;

      // Отправка результата на бэкенд
      await faceCheckAPI.sendResult({
        user_id: user.name,
        device_id: user.name,
        check_id: checkId,
        outcome: ok ? 'ok' : 'failed',
        taken_at: Date.now(),
        distance: distance,
        deadline_iso: deadlineIso,
        app_version: '1.0.0',
      });

      setResult({
        success: ok,
        message: message,
        distance: distance,
      });
      setStep('result');

    } catch (error) {
      console.log('Face check error:', error);
      Alert.alert('Ошибка', 'Не удалось выполнить проверку');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const startFaceCheck = () => {
    setStep('camera');
  };

  const handleClose = () => {
    setStep('instructions');
    setResult(null);
    onClose();
  };

  const renderInstructions = () => (
    <View style={styles.content}>
      <Text style={styles.title}>Проверка Face-ID</Text>
      
      {deadlineIso && (
        <Text style={styles.deadline}>
          Срок проверки: {new Date(deadlineIso).toLocaleString()}
        </Text>
      )}

      <View style={styles.instructions}>
        <Text style={styles.instructionText}>• Убедитесь, что освещение хорошее</Text>
        <Text style={styles.instructionText}>• Снимите очки и головной убор</Text>
        <Text style={styles.instructionText}>• Расположите лицо в рамке</Text>
        <Text style={styles.instructionText}>• Смотрите прямо в камеру</Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.startButton} onPress={startFaceCheck}>
          <Text style={styles.startButtonText}>Начать проверку</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
          <Text style={styles.cancelButtonText}>Отмена</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCamera = () => (
    <CameraScreen
      onPhotoTaken={handlePhotoTaken}
      onCancel={() => setStep('instructions')}
      mode="front"
    />
  );

  const renderProcessing = () => (
    <View style={styles.content}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.processingText}>Проверяем ваше фото...</Text>
    </View>
  );

  const renderResult = () => (
    <View style={styles.content}>
      <View style={[
        styles.resultIcon,
        result.success ? styles.successIcon : styles.errorIcon
      ]}>
        <Text style={styles.resultIconText}>
          {result.success ? '✓' : '✕'}
        </Text>
      </View>
      
      <Text style={styles.resultTitle}>
        {result.success ? 'Проверка пройдена' : 'Проверка не пройдена'}
      </Text>
      
      <Text style={styles.resultMessage}>
        {result.message}
      </Text>
      
      {result.distance && (
        <Text style={styles.distance}>
          Точность: {(1 - result.distance).toFixed(4)}
        </Text>
      )}

      <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
        <Text style={styles.doneButtonText}>Готово</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {step === 'instructions' && renderInstructions()}
        {step === 'camera' && renderCamera()}
        {step === 'processing' && renderProcessing()}
        {step === 'result' && renderResult()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  deadline: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  instructions: {
    marginBottom: 40,
    alignItems: 'flex-start',
  },
  instructionText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  buttons: {
    width: '100%',
  },
  startButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  processingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  resultIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successIcon: {
    backgroundColor: '#4CAF50',
  },
  errorIcon: {
    backgroundColor: '#F44336',
  },
  resultIconText: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  resultMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 22,
  },
  distance: {
    fontSize: 14,
    color: '#999',
    marginBottom: 30,
  },
  doneButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FaceCheckModal;