import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  PermissionsAndroid,
} from 'react-native';

import AudioRecord from 'react-native-audio-record';

type RiskLevel = 'Sin análisis' | 'Bajo' | 'Medio' | 'Alto';

export default function HomeScreen() {
      const [phoneNumber, setPhoneNumber] = React.useState('');
  const [riskLevel, setRiskLevel] = React.useState<RiskLevel>('Sin análisis');
  const [riskReason, setRiskReason] = React.useState('');

  const [isRecording, setIsRecording] = React.useState(false);
  const [audioPath, setAudioPath] = React.useState('');
    React.useEffect(() => {
    requestPermissions();
    initAudio();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
          PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        ]);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const initAudio = () => {
    AudioRecord.init({
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      wavFile: 'callshield_audio.wav',
    });
  };
    const analyzeNumber = () => {
    const number = phoneNumber.replace(/\s/g, '').replace(/-/g, '');

    let score = 0;
    const reasons: string[] = [];

    if (!number) {
      setRiskLevel('Sin análisis');
      setRiskReason('Ingresa un número.');
      return;
    }

    if (number.length < 9 || number.length > 13) {
      score += 20;
      reasons.push('Longitud sospechosa.');
    }

    if (number.startsWith('+') && !number.startsWith('+593')) {
      score += 25;
      reasons.push('Número internacional.');
    }

    if (number.startsWith('1800')) {
      score += 15;
      reasons.push('Posible call center.');
    }

    if (score >= 60) setRiskLevel('Alto');
    else if (score >= 25) setRiskLevel('Medio');
    else setRiskLevel('Bajo');

    setRiskReason(reasons.join('\n'));
  };
    const startRecording = () => {
    AudioRecord.start();
    setIsRecording(true);
  };

  const stopRecording = async () => {
    const audioFile = await AudioRecord.stop();
    setIsRecording(false);
    setAudioPath(audioFile);

    console.log('Audio guardado:', audioFile);
  };
    return (
    <SafeAreaView style={styles.container}>

      <Text style={styles.title}>CallShieldAI</Text>

      <TextInput
        placeholder="Ingresa número"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={analyzeNumber}>
        <Text style={styles.buttonText}>Analizar número</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Riesgo: {riskLevel}</Text>
      <Text style={styles.reason}>{riskReason}</Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: isRecording ? 'red' : 'green' }]}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <Text style={styles.buttonText}>
          {isRecording ? 'Detener grabación' : 'Iniciar grabación'}
        </Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  label: {
    marginTop: 15,
    fontSize: 16,
  },
  reason: {
    marginTop: 5,
    color: '#555',
  },
});