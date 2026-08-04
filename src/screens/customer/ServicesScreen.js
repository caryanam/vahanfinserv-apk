// src/screens/customer/ServicesScreen.js
import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import api from '../../services/api';
import {COLORS, SPACING, RADIUS} from '../../constants/theme';

const normalize = value =>
  String(value || '')
    .toUpperCase()
    .trim();

const ServicesScreen = ({navigation, route}) => {
  const {userId: routeUserId, applicationNumber} = route.params || {};
  const [verifying, setVerifying] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);

  // Block hardware back so users cannot return to Payment
  useEffect(() => {
    const onBackPress = () => true; // returning true = consume event
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, []);

  const verifyPaymentStatus = useCallback(async () => {
    setVerifying(true);
    try {
      let userId = routeUserId;

      // Fallback: get userId from AsyncStorage if not passed via params
      if (!userId) {
        const raw = await AsyncStorage.getItem('userData');
        if (raw) {
          const parsed = JSON.parse(raw);
          userId = parsed.id || parsed.userId;
        }
      }

      if (!userId) {
        Toast.show({
          type: 'error',
          text1: 'Session Error',
          text2: 'Unable to determine user. Please login again.',
        });
        navigation.reset({index: 0, routes: [{name: 'Login'}]});
        return;
      }

      // Backend verification — the authoritative source of truth
      const response = await api.get(`/user/${userId}`);
      const profile = response.data?.data || response.data || {};

      const isPaidBackend =
        profile.paymentDone === true ||
        normalize(profile.paymentStatus) === 'SUCCESS';

      if (isPaidBackend) {
        setPaymentVerified(true);
      } else {
        // Also check AsyncStorage (cache) in case of __DEV__ override
        const raw = await AsyncStorage.getItem('userData');
        const cached = raw ? JSON.parse(raw) : {};
        const isPaidCache =
          cached.paymentDone === true ||
          normalize(cached.paymentStatus) === 'SUCCESS' ||
          __DEV__;

        if (isPaidCache) {
          setPaymentVerified(true);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Payment Required',
            text2: 'Please complete payment before accessing services.',
          });
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'Payment',
                params: {
                  userId,
                  applicationNumber: applicationNumber || `USER-${userId}`,
                },
              },
            ],
          });
        }
      }
    } catch (err) {
      console.log('SERVICES PAYMENT VERIFY ERROR =>', err?.message || err);

      // On network error, fallback to AsyncStorage cache
      try {
        const raw = await AsyncStorage.getItem('userData');
        const cached = raw ? JSON.parse(raw) : {};
        if (
          cached.paymentDone === true ||
          normalize(cached.paymentStatus) === 'SUCCESS' ||
          __DEV__
        ) {
          setPaymentVerified(true);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Verification Failed',
            text2: 'Could not verify payment. Please try again.',
          });
          navigation.reset({
            index: 0,
            routes: [{name: 'CustomerDashboard'}],
          });
        }
      } catch {
        navigation.reset({
          index: 0,
          routes: [{name: 'CustomerDashboard'}],
        });
      }
    } finally {
      setVerifying(false);
    }
  }, [routeUserId, applicationNumber, navigation]);

  useEffect(() => {
    verifyPaymentStatus();
  }, [verifyPaymentStatus]);

  if (verifying) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Verifying payment status...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!paymentVerified) {
    return null; // navigation.reset() already fired
  }

  const userId = routeUserId;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>SERVICES</Text>
        </View>

        <Text style={styles.title}>Vehicle Services</Text>
        <Text style={styles.subtitle}>
          Payment verified ✅ — Access your vehicle services below.
        </Text>

        {/* Success Banner */}
        <View style={styles.successBanner}>
          <Text style={styles.successEmoji}>🎉</Text>
          <View style={styles.successTextBox}>
            <Text style={styles.successTitle}>Payment Successful!</Text>
            <Text style={styles.successSub}>
              Your payment has been verified. You can now use the services
              below.
            </Text>
          </View>
        </View>

        {/* Service Cards */}
        <TouchableOpacity
          style={styles.serviceCard}
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate('RCVerification', {
              userId,
              applicationNumber,
            })
          }>
          <View style={[styles.serviceIconBox, {backgroundColor: '#27D3C322'}]}>
            <Text style={styles.serviceIcon}>📋</Text>
          </View>
          <View style={styles.serviceTextBox}>
            <Text style={styles.serviceTitle}>RC Verification</Text>
            <Text style={styles.serviceDesc}>
              Verify vehicle registration certificate details instantly.
            </Text>
          </View>
          <Text style={styles.serviceArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.serviceCard}
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate('EChallan', {
              userId,
              applicationNumber,
            })
          }>
          <View style={[styles.serviceIconBox, {backgroundColor: '#0B5FFF22'}]}>
            <Text style={styles.serviceIcon}>👮</Text>
          </View>
          <View style={styles.serviceTextBox}>
            <Text style={styles.serviceTitle}>E-Challan Check</Text>
            <Text style={styles.serviceDesc}>
              Check pending E-Challans and traffic violations for any vehicle.
            </Text>
          </View>
          <Text style={styles.serviceArrow}>→</Text>
        </TouchableOpacity>

        {/* Dashboard Link */}
        <TouchableOpacity
          style={styles.dashboardBtn}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{name: 'CustomerDashboard'}],
            })
          }>
          <Text style={styles.dashboardBtnText}>Skip to Dashboard →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ServicesScreen;

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: COLORS.background},

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  container: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },

  headerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accent + '22',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: SPACING.sm,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accentDark,
    letterSpacing: 1,
  },

  title: {fontSize: 24, fontWeight: '800', color: COLORS.text},
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: SPACING.md,
  },

  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '15',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  successEmoji: {fontSize: 36, marginRight: SPACING.md},
  successTextBox: {flex: 1},
  successTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  successSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  serviceIconBox: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  serviceIcon: {fontSize: 24},
  serviceTextBox: {flex: 1},
  serviceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  serviceDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  serviceArrow: {
    fontSize: 20,
    color: COLORS.textMuted,
    fontWeight: '800',
    marginLeft: SPACING.sm,
  },

  dashboardBtn: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.primary,
    borderWidth: 1.5,
    padding: 15,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  dashboardBtnText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 15,
  },
});
