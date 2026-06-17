// src/screens/admin/AdminSettingsScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator, StatusBar, Alert,
  Modal, TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import Toast from 'react-native-toast-message';

const Field = ({ label, value }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{value || '—'}</Text>
  </View>
);

const AdminSettingsScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pwModal, setPwModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    (async () => {
      // Load from cache first for instant display
      try {
        const raw = await AsyncStorage.getItem('adminData');
        if (raw) setProfile(JSON.parse(raw));
      } catch {}

      // Then try to refresh from backend
      try {
        const res = await api.get('/admin/profile');
        const d = res.data?.data ?? res.data;
        if (d && typeof d === 'object') {
          setProfile(d);
          await AsyncStorage.setItem('adminData', JSON.stringify(d));
        }
      } catch {
        // Use cached data, do not crash
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChangePassword = async () => {
    if (!newPassword.trim()) {
      Toast.show({ type: 'error', text1: 'Enter a new password' });
      return;
    }
    if (newPassword !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Passwords do not match' });
      return;
    }
    if (newPassword.length < 6) {
      Toast.show({ type: 'error', text1: 'Password must be at least 6 characters' });
      return;
    }
    const email = profile?.email;
    if (!email) {
      Toast.show({ type: 'error', text1: 'Admin email not found' });
      return;
    }
    setPwLoading(true);
    try {
      await api.post('/user/reset-password', { email, newPassword });
      Toast.show({ type: 'success', text1: 'Password changed successfully' });
      setPwModal(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      Toast.show({ type: 'error', text1: e?.response?.data?.message || 'Password change failed' });
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['token', 'role', 'adminData', 'userData', 'dealerData']);
          navigation.replace('Login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Settings</Text>
      </View>

      {loading && !profile ? (
        <ActivityIndicator size="large" color={COLORS.accent} style={styles.center} />
      ) : (
        <ScrollView style={styles.content}>
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {(profile?.name || profile?.fullName || 'A').charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.avatarName}>
              {profile?.name || profile?.fullName || 'Admin'}
            </Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{profile?.role || 'ADMIN'}</Text>
            </View>
          </View>

          {/* Profile card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Profile Information</Text>
            <Field label="Full Name" value={profile?.fullName || profile?.name} />
            <Field label="Email" value={profile?.email} />
            <Field label="Mobile" value={profile?.mobileNumber || profile?.mobile} />
            <Field label="Role" value={profile?.role} />
          </View>

          {/* App info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>App Information</Text>
            <Field label="App Name" value="Vahan Finserv" />
            <Field label="Version" value="1.0.0" />
            <Field label="Platform" value="React Native (Android)" />
          </View>

          {/* Actions */}
          <TouchableOpacity style={styles.changePasswordBtn} onPress={() => setPwModal(true)}>
            <Text style={styles.changePasswordText}>🔑  Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>🚪  Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Change Password Modal */}
      <Modal visible={pwModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <Text style={styles.inputLabel}>New Password</Text>
            <View style={styles.pwRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New password"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showPw}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.showBtn}
                onPress={() => setShowPw(s => !s)}
              >
                <Text style={styles.showBtnText}>{showPw ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry={!showPw}
              autoCapitalize="none"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => { setPwModal(false); setNewPassword(''); setConfirmPassword(''); }}
                disabled={pwLoading}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalSaveBtn]}
                onPress={handleChangePassword}
                disabled={pwLoading}
              >
                {pwLoading
                  ? <ActivityIndicator size="small" color={COLORS.primary} />
                  : <Text style={styles.modalSaveText}>Change</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.primary },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.primary, paddingHorizontal: SPACING.md,
     paddingVertical: 15,
    paddingTop: 20,gap: SPACING.sm,
  },
  backBtn: { padding: SPACING.xs },
  backBtnText: { color: COLORS.white, fontSize: 24 },
  pageTitle: { flex: 1, color: COLORS.white, fontSize: 18, fontWeight: '700' },
  content: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  avatarSection: { alignItems: 'center', paddingVertical: SPACING.lg },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  avatarText: { color: COLORS.primary, fontWeight: '800', fontSize: 32 },
  avatarName: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  roleBadge: {
    backgroundColor: '#EF444420', paddingHorizontal: SPACING.md,
    paddingVertical: 4, borderRadius: RADIUS.xl,
  },
  roleBadgeText: { color: '#EF4444', fontWeight: '700', fontSize: 12 },
  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.md, elevation: 2,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  field: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  fieldLabel: { fontSize: 13, color: COLORS.textSecondary },
  fieldValue: { fontSize: 13, fontWeight: '600', color: COLORS.text, maxWidth: '60%', textAlign: 'right' },
  changePasswordBtn: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    paddingVertical: SPACING.md, alignItems: 'center',
    marginBottom: SPACING.sm, elevation: 1,
    borderWidth: 1, borderColor: COLORS.accent,
  },
  changePasswordText: { color: COLORS.accent, fontWeight: '700', fontSize: 15 },
  logoutBtn: {
    backgroundColor: '#EF4444', borderRadius: RADIUS.md,
    paddingVertical: SPACING.md, alignItems: 'center',
    marginBottom: SPACING.xl, elevation: 2,
  },
  logoutBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: COLORS.white, borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl, padding: SPACING.lg,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  inputLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  pwRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    fontSize: 14, color: COLORS.text, marginBottom: SPACING.sm,
  },
  showBtn: { padding: SPACING.xs },
  showBtnText: { fontSize: 18 },
  modalActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs },
  modalBtn: {
    flex: 1, paddingVertical: 12, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  modalCancelBtn: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  modalCancelText: { color: COLORS.text, fontWeight: '600' },
  modalSaveBtn: { backgroundColor: COLORS.accent },
  modalSaveText: { color: COLORS.primary, fontWeight: '700' },
});

export default AdminSettingsScreen;
