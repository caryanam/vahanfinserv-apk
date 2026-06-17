// src/screens/auth/ResetPasswordScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dealerResetPassword } from '../../services/dealerService';
import { userResetPassword } from '../../services/customerService';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import Toast from 'react-native-toast-message';

const ResetPasswordScreen = ({ navigation }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('USER');

  useEffect(() => {
    (async () => {
      const e = await AsyncStorage.getItem('forgot_email');
      const r = await AsyncStorage.getItem('forgot_role');
      const verified = await AsyncStorage.getItem('forgot_otp_verified');
      if (!e || verified !== 'true') {
        navigation.navigate('ForgotPassword');
        return;
      }
      setEmail(e);
      setRole(r || 'USER');
    })();
  }, []);

  const handleSubmit = async () => {
    if (!newPassword || newPassword.length < 6) {
      Toast.show({ type: 'error', text1: 'Password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Passwords do not match.' });
      return;
    }
    setLoading(true);
    try {
      const dto = { email, newPassword };
      const message = role === 'DEALER'
        ? await dealerResetPassword(dto)
        : await userResetPassword(dto);

      await AsyncStorage.multiRemove(['forgot_email', 'forgot_role', 'forgot_otp_verified']);
      Toast.show({ type: 'success', text1: message || 'Password reset successfully' });
      navigation.replace('Login');
    } catch (err) {
      Toast.show({ type: 'error', text1: err?.response?.data || err?.message || 'Failed to reset password.' });
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
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Set a new password for {email}</Text>
          <View style={styles.divider} />

          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="New password"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry={!showPass}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity onPress={() => setShowPass((p) => !p)}>
              <Text style={{ fontSize: 16, paddingHorizontal: 8 }}>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry={!showPass}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.submitBtnText}>Reset Password</Text>}
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
  input: { flex: 1, color: COLORS.text, fontSize: 14 },
  submitBtn: {
    height: 48, borderRadius: RADIUS.sm, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', marginTop: SPACING.lg,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});

export default ResetPasswordScreen;
