// src/screens/auth/ForgotPasswordScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dealerSendOtp } from '../../services/dealerService';
import { userSendOtp } from '../../services/customerService';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import Toast from 'react-native-toast-message';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('USER');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      Toast.show({ type: 'error', text1: 'Please enter your email.' });
      return;
    }

    setLoading(true);
    try {
      const message = role === 'DEALER'
        ? await dealerSendOtp(trimmed)
        : await userSendOtp(trimmed);

      await AsyncStorage.setItem('forgot_email', trimmed);
      await AsyncStorage.setItem('forgot_role', role);
      await AsyncStorage.removeItem('forgot_otp_verified');
      Toast.show({ type: 'success', text1: message || 'OTP sent to your email' });
      navigation.navigate('VerifyOtp');
    } catch (err) {
      Toast.show({ type: 'error', text1: err?.response?.data || err?.message || 'Failed to send OTP.' });
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
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>Enter your email to receive OTP</Text>
          <View style={styles.divider} />

          <Text style={styles.label}>Account Type</Text>
          <View style={styles.roleRow}>
            {['USER', 'DEALER'].map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.roleBtn, role === r && styles.roleBtnActive]}
                onPress={() => setRole(r)}
              >
                <Text style={[styles.roleBtnText, role === r && styles.roleBtnTextActive]}>
                  {r === 'USER' ? 'User' : 'Dealer'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.submitBtnText}>Send OTP</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back to Login</Text>
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
  roleRow: { flexDirection: 'row', gap: SPACING.sm },
  roleBtn: {
    flex: 1, height: 38, borderRadius: RADIUS.sm,
    backgroundColor: '#F4F6F9', alignItems: 'center', justifyContent: 'center',
  },
  roleBtnActive: { backgroundColor: COLORS.primary },
  roleBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  roleBtnTextActive: { color: COLORS.white },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.sm, paddingHorizontal: SPACING.md, height: 46,
  },
  input: { flex: 1, color: COLORS.text, fontSize: 14 },
  submitBtn: {
    height: 48, borderRadius: RADIUS.sm, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', marginTop: SPACING.lg,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  backBtn: { marginTop: SPACING.md, alignItems: 'center' },
  backBtnText: { color: '#0047ff', fontSize: 14 },
});

export default ForgotPasswordScreen;
