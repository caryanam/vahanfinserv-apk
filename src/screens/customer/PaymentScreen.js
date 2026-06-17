// src/screens/customer/PaymentScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import api from '../../services/api';
import {
  READY2DRIVE_TOTAL_AMOUNT,
  READY2DRIVE_BASE_AMOUNT,
  READY2DRIVE_GST_AMOUNT,
  READY2DRIVE_FEE_LABEL,
  READY2DRIVE_GST_LABEL,
  formatINR,
} from '../../constants/payment';

// Admin user ID — notifications are sent TO this receiver
const ADMIN_USER_ID = 1;

const PaymentScreen = ({ navigation, route }) => {
  const { applicationNumber, userId, userName } = route.params || {};
  const [loading, setLoading] = useState(false);

  // ── CHANGED: use POST /notifications/send instead of payment-confirm ──────
  const confirmPayment = async () => {
    if (!userId) {
      Toast.show({ type: 'error', text1: 'User ID missing' });
      return;
    }

    setLoading(true);

    try {
      const resolvedName = userName || `User ${userId}`;

      // Step 1 — notify the user's own record with PAYMENT_VERIFICATION_PENDING status
      await api.post('/notifications/send', {
        senderId:   Number(userId),
        receiverId: Number(userId),
        message:    'PAYMENT_STATUS:PAYMENT_VERIFICATION_PENDING',
      });

      // Step 2 — notify admin (receiverId: 1) so it appears in admin payments list
      await api.post('/notifications/send', {
        senderId:   Number(userId),
        receiverId: ADMIN_USER_ID,
        message:    `${resolvedName} has submitted documents for payment verification.`,
      });

      // Persist payment status locally so LoanStatusScreen timeline reflects it
      await AsyncStorage.setItem(
        `customer_payment_status_${userId}`,
        'PAYMENT_VERIFICATION_PENDING',
      );

      Toast.show({
        type:  'success',
        text1: 'Payment request submitted!',
        text2: 'Awaiting admin verification.',
      });

      navigation.navigate('LoanStatus', {
        applicationNumber: applicationNumber || `USER-${userId}`,
        userId,
      });
    } catch (e) {
      console.log('PAYMENT NOTIFICATION ERROR =>', e?.response?.status, e?.response?.data || e?.message);
      Toast.show({
        type:  'error',
        text1: 'Payment submission failed',
        text2: e?.response?.data?.message || e?.message || 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>

        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>PAYMENT</Text>
        </View>

        <Text style={styles.title}>Payment</Text>
        <Text style={styles.subtitle}>
          Application No: {applicationNumber || `USER-${userId}`}
        </Text>

        {/* ── Package card ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚀  Ready2Drive Package</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Application No</Text>
            <Text style={styles.metaValue}>{applicationNumber || `USER-${userId}`}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>User ID</Text>
            <Text style={styles.metaValue}>{userId || '—'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.rowLabel}>{READY2DRIVE_FEE_LABEL}</Text>
            <Text style={styles.rowValue}>{formatINR(READY2DRIVE_BASE_AMOUNT)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{READY2DRIVE_GST_LABEL}</Text>
            <Text style={styles.rowValue}>{formatINR(READY2DRIVE_GST_AMOUNT)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>{formatINR(READY2DRIVE_TOTAL_AMOUNT)}</Text>
          </View>
        </View>

        {/* ── Info box ── */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Your payment request will be submitted for admin verification.
            You will be notified once it is approved.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
          onPress={confirmPayment}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={COLORS.white} />
            : <Text style={styles.primaryBtnText}>Pay Now →</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Previous</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SPACING.md, paddingBottom: SPACING.xxl },

  headerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accent + '22',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: SPACING.sm,
  },
  headerBadgeText: { fontSize: 11, fontWeight: '700', color: COLORS.accentDark, letterSpacing: 1 },

  title:    { fontSize: 24, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4, marginBottom: SPACING.md },

  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    padding: SPACING.lg, marginBottom: SPACING.md,
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  cardTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.md },

  metaRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  metaLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  metaValue: { fontSize: 13, color: COLORS.text, fontWeight: '700' },

  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.md },

  row:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  rowLabel: { fontSize: 14, color: COLORS.textSecondary, flex: 1 },
  rowValue: { fontSize: 14, color: COLORS.text, fontWeight: '700' },

  totalRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  totalValue: { fontSize: 20, fontWeight: '900', color: COLORS.accentDark },

  infoBox: {
    backgroundColor: COLORS.accent + '15',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
  },
  infoText: { fontSize: 13, color: COLORS.text, lineHeight: 20 },

  primaryBtn:         { backgroundColor: COLORS.primary, padding: 16, borderRadius: RADIUS.sm, alignItems: 'center', marginTop: SPACING.sm },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText:     { color: COLORS.white, fontWeight: '800', fontSize: 15 },

  backBtn:     { padding: 14, alignItems: 'center' },
  backBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
});
