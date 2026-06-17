// src/screens/auth/VerifyOtpScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dealerVerifyOtp } from '../../services/dealerService';
import { userVerifyOtp } from '../../services/customerService';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import Toast from 'react-native-toast-message';

const VerifyOtpScreen = ({ navigation }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('USER');

  useEffect(() => {
    (async () => {
      const storedEmail = await AsyncStorage.getItem('forgot_email');
      const storedRole = await AsyncStorage.getItem('forgot_role');
      if (!storedEmail) {
        Toast.show({ type: 'error', text1: 'Please request OTP first.' });
        navigation.navigate('ForgotPassword');
        return;
      }
      setEmail(storedEmail);
      setRole(storedRole || 'USER');
    })();
  }, []);

  const handleSubmit = async () => {
    const clean = otp.replace(/\D/g, '');
    if (clean.length !== 6) {
      Toast.show({ type: 'error', text1: 'OTP should be 6 digits.' });
      return;
    }

    setLoading(true);
    try {
      const dto = { email, otp: clean };
      const message = role === 'DEALER' ? await dealerVerifyOtp(dto) : await userVerifyOtp(dto);
      const normalized = String(message || '').toLowerCase();
      if (!normalized.includes('verified successfully')) {
        Toast.show({ type: 'error', text1: message || 'Invalid OTP' });
        return;
      }
      await AsyncStorage.setItem('forgot_otp_verified', 'true');
      Toast.show({ type: 'success', text1: message || 'OTP verified' });
      navigation.navigate('ResetPassword');
    } catch (err) {
      Toast.show({ type: 'error', text1: err?.response?.data || err?.message || 'Failed to verify OTP.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.brandName}>Vahan <Text style={styles.accent}>Finserv</Text></Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>Enter the 6-digit OTP sent to {email || 'your email'}</Text>
          <View style={styles.divider} />

          <Text style={styles.label}>OTP</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Enter OTP"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={(v) => setOtp(v.replace(/\D/g, '').slice(0, 6))}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.submitBtnText}>Verify OTP</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Change Email</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.primary },
  scroll: { flexGrow: 1 },
  header: { padding: SPACING.lg, paddingTop: SPACING.xxl, paddingBottom: SPACING.xl },
  brandName: { color: COLORS.white, fontSize: 26, fontWeight: '700' },
  accent: { color: COLORS.accent },
  card: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    flex: 1, padding: SPACING.lg, paddingTop: SPACING.xl,
  },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginTop: 6 },
  divider: {
    width: 40, height: 2, borderRadius: 2, backgroundColor: COLORS.accentDark,
    alignSelf: 'center', marginVertical: SPACING.md,
  },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6, marginTop: SPACING.md },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.sm, paddingHorizontal: SPACING.md, height: 46,
  },
  input: { flex: 1, color: COLORS.text, fontSize: 18, letterSpacing: 8, textAlign: 'center' },
  submitBtn: {
    height: 48, borderRadius: RADIUS.sm, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', marginTop: SPACING.lg,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  backBtn: { marginTop: SPACING.md, alignItems: 'center' },
  backBtnText: { color: '#0047ff', fontSize: 14 },
});

export default VerifyOtpScreen;
