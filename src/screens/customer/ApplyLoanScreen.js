import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  TextInput, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import Toast from 'react-native-toast-message';

const ApplyLoanScreen = ({ navigation }) => {
  const [loanAmount, setLoanAmount] = useState('');
  const [vehicleType, setVehicleType] = useState('CAR');
  const [loading, setLoading] = useState(false);

//   const startApplication = async () => {
//     if (!loanAmount) {
//       Toast.show({ type: 'error', text1: 'Please enter loan amount' });
//       return;
//     }

//     setLoading(true);
//     try {
//       const raw = await AsyncStorage.getItem('userData');
//       const user = raw ? JSON.parse(raw) : null;

//       if (!user?.id) {
//         Toast.show({ type: 'error', text1: 'User not found. Please login again.' });
//         return;
//       }

//       const res = await api.post(`/loan/applyByUser/${user.id}`, {
//         loanAmount: Number(loanAmount),
//         vehicleType,
//       });

//       const data = res?.data?.data || res?.data || {};
//       const applicationNumber = data.applicationNumber || data.loanNumber || data.applicationNo;

//       if (!applicationNumber) {
//         Alert.alert('Error', 'Application number not found in response');
//         return;
//       }

//       Toast.show({ type: 'success', text1: 'Application started' });

//       navigation.navigate('PersonalInfo', {
//         applicationNumber,
//         loanAmount,
//         vehicleType,
//       });
//     } catch (err) {
//       Toast.show({
//         type: 'error',
//         text1: err?.response?.data?.message || 'Failed to start application',
//       });
//     }
//      finally {
//       setLoading(false);
//     }
//   };
const startApplication = async () => {
  if (!loanAmount) {
    Toast.show({ type: 'error', text1: 'Please enter loan amount' });
    return;
  }

  setLoading(true);

  try {
    const raw = await AsyncStorage.getItem('userData');
    const user = raw ? JSON.parse(raw) : null;

    if (!user?.id) {
      Toast.show({ type: 'error', text1: 'User not found. Please login again.' });
      return;
    }

    const applicationNumber = `USER-${user.id}`;

    Toast.show({ type: 'success', text1: 'Application started' });

    navigation.navigate('PersonalInfo', {
      userId: user.id,
      applicationNumber,
      loanAmount,
      vehicleType,
    });
  } catch (err) {
    Toast.show({
      type: 'error',
      text1: err?.message || 'Failed to start application',
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Apply for Loan</Text>
        <Text style={styles.subtitle}>Start your car loan application</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Loan Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter loan amount"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="numeric"
            value={loanAmount}
            onChangeText={setLoanAmount}
          />

          <Text style={styles.label}>Vehicle Type</Text>
          <View style={styles.optionRow}>
            {['CAR', 'BIKE'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.optionBtn, vehicleType === type && styles.optionActive]}
                onPress={() => setVehicleType(type)}
              >
                <Text style={[styles.optionText, vehicleType === type && styles.optionTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={startApplication} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.primaryBtnText}>Start Application →</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ApplyLoanScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SPACING.md },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  subtitle: { color: COLORS.textSecondary, marginTop: 4, marginBottom: SPACING.md },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 8, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    height: 46,
    color: COLORS.text,
  },
  optionRow: { flexDirection: 'row', gap: 10 },
  optionBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    padding: 12,
    alignItems: 'center',
  },
  optionActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  optionText: { color: COLORS.text, fontWeight: '700' },
  optionTextActive: { color: COLORS.white },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    marginTop: 24,
  },
  primaryBtnText: { color: COLORS.white, fontWeight: '800' },
  backBtn: { padding: 14, alignItems: 'center' },
  backBtnText: { color: COLORS.primary, fontWeight: '700' },
});