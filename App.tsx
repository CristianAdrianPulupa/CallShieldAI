import React from 'react';
import {
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import AudioRecord from 'react-native-audio-record';

type RiskLevel = 'Sin análisis' | 'Bajo' | 'Medio' | 'Alto';

function App() {
  const [isRecording, setIsRecording] = React.useState(false);
  const [audioPath, setAudioPath] = React.useState('');

  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [riskLevel, setRiskLevel] = React.useState<RiskLevel>('Sin análisis');
  const [riskReason, setRiskReason] = React.useState('Aún no se ha analizado ningún número.');

  const reportedNumbers = [
    '+593999999999',
    '0999999999',
    '1800123456',
    '+18005550199',
  ];

  React.useEffect(() => {
    requestPermissions();
    initAudio();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
          PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const initAudio = () => {
    const options = {
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      wavFile: 'callshield_audio.wav',
    };

    AudioRecord.init(options);
  };

  const cleanNumber = (number: string) => {
    return number.replace(/\s/g, '').replace(/-/g, '');
  };

  const analyzeNumber = () => {
    const number = cleanNumber(phoneNumber);
    let score = 0;
    const reasons: string[] = [];

    if (!number) {
      setRiskLevel('Sin análisis');
      setRiskReason('Ingresa un número para analizar.');
      return;
    }

    if (reportedNumbers.includes(number)) {
      score += 60;
      reasons.push('Número reportado como sospechoso.');
    }

    if (number.startsWith('+') && !number.startsWith('+593')) {
      score += 25;
      reasons.push('Número internacional no perteneciente a Ecuador.');
    }

    if (number.length < 9 || number.length > 13) {
      score += 20;
      reasons.push('Longitud del número poco común.');
    }

    if (number.startsWith('1800')) {
      score += 15;
      reasons.push('Número tipo central/servicio, requiere verificación.');
    }

    if (number.startsWith('09') || number.startsWith('+5939')) {
      reasons.push('Número móvil ecuatoriano.');
    } else {
      score += 10;
      reasons.push('No parece un número móvil ecuatoriano común.');
    }

    if (score >= 60) {
      setRiskLevel('Alto');
    } else if (score >= 25) {
      setRiskLevel('Medio');
    } else {
      setRiskLevel('Bajo');
    }

    setRiskReason(reasons.join('\n'));
  };

  const startRecording = async () => {
    try {
      setAudioPath('');
      AudioRecord.start();
      setIsRecording(true);
      console.log('Grabando...');
    } catch (error) {
      console.log('Error al iniciar grabación:', error);
    }
  };

  const stopRecording = async () => {
    try {
      const audioFile = await AudioRecord.stop();
      setIsRecording(false);
      setAudioPath(audioFile);
      console.log('Audio guardado en:', audioFile);
    } catch (error) {
      console.log('Error al detener grabación:', error);
    }
  };

  const getRiskColor = () => {
    if (riskLevel === 'Alto') return '#EF4444';
    if (riskLevel === 'Medio') return '#FACC15';
    if (riskLevel === 'Bajo') return '#22C55E';
    return '#FACC15';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.card}>
        <Text style={styles.title}>CallShield AI</Text>
        <Text style={styles.subtitle}>
          Protección contra llamadas fraudulentas
        </Text>

        <View style={styles.statusBox}>
          <Text style={styles.statusLabel}>Estado</Text>
          <Text style={styles.statusValue}>
            {isRecording ? '🔴 Analizando voz' : '🟢 Protección activa'}
          </Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Ingresa número entrante"
          placeholderTextColor="#64748B"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />

        <TouchableOpacity style={styles.analyzeButton} onPress={analyzeNumber}>
          <Text style={styles.buttonText}>Analizar número</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.label}>Riesgo del número</Text>
          <Text style={[styles.risk, { color: getRiskColor() }]}>
            {riskLevel}
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.label}>Motivo del análisis</Text>
          <Text style={styles.reason}>{riskReason}</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, isRecording && styles.buttonStop]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Text style={styles.buttonText}>
            {isRecording ? 'Detener análisis de voz' : 'Activar análisis de voz'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.audioText}>
          {audioPath ? `Audio guardado en:\n${audioPath}` : 'Sin audio grabado'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101827',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: '#CBD5E1',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  statusBox: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  statusLabel: {
    color: '#94A3B8',
    fontSize: 13,
  },
  statusValue: {
    color: '#22C55E',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 4,
  },
  input: {
    backgroundColor: '#0F172A',
    color: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  analyzeButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  infoBox: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  label: {
    color: '#94A3B8',
    fontSize: 13,
  },
  risk: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  reason: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    padding: 15,
    marginTop: 4,
  },
  buttonStop: {
    backgroundColor: '#DC2626',
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 'bold',
  },
  audioText: {
    color: '#CBD5E1',
    marginTop: 14,
    textAlign: 'center',
    fontSize: 11,
  },
});

export default App;