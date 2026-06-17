import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import Toast from 'react-native-toast-message';

const PersonalInfoScreen = ({ navigation, route }) => {
  const { applicationNumber, userId, loanAmount } = route.params || {};
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    address: '',
    city: '',
    state: '',
    pincode: '',
    loanAmount: loanAmount || '',
  });

  const update = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const savePersonalInfo = async () => {
    if (!form.address || !form.city || !form.state || !form.pincode || !form.loanAmount) {
      Toast.show({ type: 'error', text1: 'Please fill all fields' });
      return;
    }

    setLoading(true);

    try {
      if (!userId) {
        Toast.show({ type: 'error', text1: 'User ID not found' });
        return;
      }

      await api.post('/personal-info/save', {
        userId,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        loanAmount: Number(form.loanAmount),
      });

      await AsyncStorage.setItem(
        'currentApplicationNumber',
        applicationNumber || `USER-${userId}`
      );

      Toast.show({ type: 'success', text1: 'Personal Information Saved' });

      navigation.navigate('KycUpload', {
        applicationNumber: applicationNumber || `USER-${userId}`,
        userId,
      });
    // } catch (err) {
    //   console.log('PERSONAL INFO ERROR => ', err?.response?.data);

    //   Toast.show({
    //     type: 'error',
    //     text1: err?.response?.data?.message || 'Failed to save personal information',
    //   });
    // } finally {
    //   setLoading(false);
    // }
    } catch (err) {
  const message = err?.response?.data?.message || '';

  console.log('PERSONAL INFO ERROR => ', err?.response?.data);

  if (message === 'Personal Info Already Exists') {
    Toast.show({
      type: 'success',
      text1: 'Personal info already saved',
    });

    navigation.navigate('KycUpload', {
      applicationNumber: applicationNumber || `USER-${userId}`,
      userId,
    });

    return;
  }

  Toast.show({
    type: 'error',
    text1: message || 'Failed to save personal information',
  });
} finally {
  setLoading(false);
}
  };

  const renderInput = (label, key, keyboardType = 'default', multiline = false) => (
    <View key={key}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        placeholder={label}
        placeholderTextColor={COLORS.textMuted}
        value={form[key]}
        onChangeText={value => update(key, value)}
        keyboardType={keyboardType}
        multiline={multiline}
        blurOnSubmit={false}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Personal Information</Text>
          <Text style={styles.subtitle}>
            Application No: {applicationNumber || `USER-${userId}`}
          </Text>

          <View style={styles.card}>
            {renderInput('Address', 'address', 'default', true)}
            {renderInput('City', 'city')}
            {renderInput('State', 'state')}
            {renderInput('Pincode', 'pincode', 'numeric')}
            {renderInput('Loan Amount', 'loanAmount', 'numeric')}

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={savePersonalInfo}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.primaryBtnText}>Save & Next →</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backBtnText}>Previous</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default PersonalInfoScreen;

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
    height: 50,
    color: COLORS.text,
  },
  textArea: { height: 100, textAlignVertical: 'top', paddingTop: 12 },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    marginTop: 24,
  },
  primaryBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },
  backBtn: { padding: 14, alignItems: 'center' },
  backBtnText: { color: COLORS.primary, fontWeight: '700' },
});
