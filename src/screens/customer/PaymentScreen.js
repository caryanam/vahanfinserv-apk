// src/screens/customer/PaymentScreen.js
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import RazorpayCheckout from 'react-native-razorpay';
import {COLORS, SPACING, RADIUS} from '../../constants/theme';
import api from '../../services/api';
import {
  createRazorpayOrder,
  markPaymentSuccess,
} from '../../services/paymentService';
import {
  READY2DRIVE_TOTAL_AMOUNT,
  READY2DRIVE_BASE_AMOUNT,
  READY2DRIVE_GST_AMOUNT,
  READY2DRIVE_FEE_LABEL,
  READY2DRIVE_GST_LABEL,
  formatINR,
} from '../../constants/payment';

const RAZORPAY_KEY_ID = 'rzp_live_T7jOPcFlsFDktS';

const PaymentScreen = ({navigation, route}) => {
  const {applicationNumber, userId: routeUserId, userName} = route.params || {};
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [initializing, setInitializing] = useState(true);

  const normalize = value =>
    String(value || '')
      .toUpperCase()
      .trim();
  const isIndividualUser =
    normalize(user?.role) === 'USER' &&
    normalize(user?.registrationType) === 'INDIVIDUAL';
  const isPaymentCompleted =
    user?.paymentDone === true || normalize(user?.paymentStatus) === 'SUCCESS';
  const isDealerCreatedCustomer = Boolean(
    user?.dealerId ||
      user?.assignedDealerId ||
      user?.dealer?.id ||
      user?.dealerCode,
  );
  const shouldShowPaymentOption =
    isIndividualUser && !isPaymentCompleted && !isDealerCreatedCustomer;

  useEffect(() => {
    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserData = async () => {
    setInitializing(true);
    try {
      let loadedUser = null;
      const userId = routeUserId || null;

      if (userId) {
        const response = await api.get(`/user/${userId}`);
        loadedUser = response.data?.data || response.data || null;
      }

      if (!loadedUser) {
        const raw = await AsyncStorage.getItem('userData');
        if (raw) {
          loadedUser = JSON.parse(raw);
        }
      }

      setUser(loadedUser);

      const regType = normalize(loadedUser?.registrationType);
      const isDealerCreated = Boolean(
        loadedUser?.dealerId ||
          loadedUser?.assignedDealerId ||
          loadedUser?.dealer?.id ||
          loadedUser?.dealerCode,
      );

      // If this is a dealer or a dealer-created customer, they must bypass payment
      if (regType === 'DEALER' || isDealerCreated) {
        console.log(
          'DEALER USER DETECTED IN PAYMENT SCREEN, REDIRECTING TO DASHBOARD...',
        );
        navigation.reset({
          index: 0,
          routes: [{name: 'CustomerDashboard'}],
        });
        return;
      }

      const loadedIsIndividualUser =
        normalize(loadedUser?.role) === 'USER' && regType === 'INDIVIDUAL';
      const loadedIsPaymentCompleted =
        loadedUser?.paymentDone === true ||
        normalize(loadedUser?.paymentStatus) === 'SUCCESS';
      const loadedIsDealerCreatedCustomer = isDealerCreated;
      const loadedShouldShowPaymentOption =
        loadedIsIndividualUser &&
        !loadedIsPaymentCompleted &&
        !loadedIsDealerCreatedCustomer;

      console.log('USER PAYMENT CHECK =>', {
        userId: routeUserId,
        role: loadedUser?.role,
        registrationType: loadedUser?.registrationType,
        paymentDone: loadedUser?.paymentDone,
        paymentStatus: loadedUser?.paymentStatus,
        dealerId:
          loadedUser?.dealerId ||
          loadedUser?.assignedDealerId ||
          loadedUser?.dealer?.id ||
          loadedUser?.dealerCode,
      });
      console.log('SHOULD SHOW PAYMENT =>', loadedShouldShowPaymentOption);
    } catch (error) {
      console.log(
        'USER PAYMENT CHECK ERROR =>',
        error?.response?.data || error?.message || error,
      );
    } finally {
      setInitializing(false);
    }
  };

  const handlePayment = async () => {
    const currentUserId = routeUserId || user?.id || user?.userId;
    if (!currentUserId) {
      Toast.show({
        type: 'error',
        text1: 'Unable to determine user ID for payment',
      });
      return;
    }

    setLoading(true);
    setLoadingText('Initiating Order...');
    try {
      // 1. Create Razorpay order on the backend
      const order = await createRazorpayOrder(currentUserId);
      console.log('ORDER RESPONSE =>', order);

      if (!order || !order.orderId) {
        throw new Error(
          'Invalid Response: Order could not be created on the server.',
        );
      }

      setLoadingText('Opening Checkout...');

      // 2. Open Razorpay Checkout modal
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order?.amount,
        currency: order?.currency || 'INR',
        order_id: order?.orderId,
        name: 'VahanFinserv',
        description: 'Application Payment',
        prefill: {
          name: user?.fullName || userName || '',
          email: user?.email || '',
          contact: user?.mobileNumber || '',
        },
        theme: {color: '#0B5FFF'},
      };

      let paymentResult;
      try {
        paymentResult = await RazorpayCheckout.open(options);
        console.log('RAZORPAY SUCCESS =>', paymentResult);
      } catch (sdkError) {
        console.log('RAW SDK ERROR =>', sdkError);

        let desc = 'Payment checkout process failed.';
        let code = null;
        let reason = null;

        // Parse JSON-encoded error message if thrown by Razorpay SDK
        if (sdkError instanceof Error || (sdkError && sdkError.message)) {
          const msg = sdkError.message || '';
          try {
            const parsed = JSON.parse(msg);
            const innerError = parsed.error || parsed;
            desc = innerError.description || innerError.message || desc;
            code = innerError.code || code;
            reason = innerError.reason || reason;
          } catch {
            desc = msg || desc;
          }
        } else if (sdkError && typeof sdkError === 'object') {
          const innerError = sdkError.error || sdkError;
          desc = innerError.description || innerError.message || desc;
          code = innerError.code || code;
          reason = innerError.reason || reason;
        } else if (typeof sdkError === 'string') {
          desc = sdkError;
        }

        const err = new Error(desc);
        err.code = code;
        err.reason = reason;
        err.description = desc;
        throw err;
      }

      setLoadingText('Verifying Payment...');

      // 3. Confirm payment completion on the backend
      const successResponse = await markPaymentSuccess(
        currentUserId,
        paymentResult.razorpay_order_id,
        paymentResult.razorpay_payment_id,
      );
      console.log('PAYMENT SUCCESS API RESPONSE =>', successResponse);

      Toast.show({
        type: 'success',
        text1: 'Payment successful',
        text2: 'Your payment has been recorded.',
      });

      // 4. Navigate to CustomerDashboard (Home Screen of authenticated customer)
      navigation.reset({
        index: 0,
        routes: [{name: 'CustomerDashboard'}],
      });
    } catch (error) {
      console.log('PAYMENT ERROR =>', error);
      let errorTitle = 'Payment Failed';
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error && typeof error === 'object') {
        // Network / Timeout Errors
        if (
          error.message === 'Network Error' ||
          (!error.response && error.request)
        ) {
          errorTitle = 'Network Error';
          errorMessage = 'Please check your internet connection and try again.';
        } else if (
          error.code === 'ECONNABORTED' ||
          error.message?.toLowerCase().includes('timeout')
        ) {
          errorTitle = 'Timeout Error';
          errorMessage =
            'The request timed out. Please check your network and retry.';
        }
        // Razorpay cancellations and failures
        else if (
          error.code === 2 ||
          error.description?.toLowerCase().includes('cancelled') ||
          error.message?.toLowerCase().includes('cancelled')
        ) {
          errorTitle = 'Payment Cancelled';
          errorMessage =
            'You cancelled the payment process. You can retry whenever you are ready.';
        } else if (error.description) {
          errorTitle = 'Razorpay Error';
          errorMessage = error.description;
        }
        // API response errors
        else if (error.response) {
          errorTitle = 'API Error';
          errorMessage =
            error.response.data?.message ||
            `Server returned error status ${error.response.status}.`;
        }
        // General messages
        else if (error.message) {
          errorMessage = error.message;
        }
      }

      Toast.show({
        type: 'error',
        text1: errorTitle,
        text2: errorMessage,
        visibilityTime: 5000,
      });
    } finally {
      setLoading(false);
      setLoadingText('');
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
          Application No: {applicationNumber || `USER-${routeUserId}`}
        </Text>

        {initializing ? (
          <ActivityIndicator
            color={COLORS.primary}
            size="large"
            style={{marginTop: 40}}
          />
        ) : shouldShowPaymentOption ? (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🚀 Ready2Drive Package</Text>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Application No</Text>
                <Text style={styles.metaValue}>
                  {applicationNumber || `USER-${routeUserId}`}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>User ID</Text>
                <Text style={styles.metaValue}>
                  {routeUserId || user?.id || user?.userId || '—'}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.row}>
                <Text style={styles.rowLabel}>{READY2DRIVE_FEE_LABEL}</Text>
                <Text style={styles.rowValue}>
                  {formatINR(READY2DRIVE_BASE_AMOUNT)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>{READY2DRIVE_GST_LABEL}</Text>
                <Text style={styles.rowValue}>
                  {formatINR(READY2DRIVE_GST_AMOUNT)}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>
                  {formatINR(READY2DRIVE_TOTAL_AMOUNT)}
                </Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                💡 Your payment will be processed through Razorpay and recorded
                on successful checkout.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
              onPress={handlePayment}
              disabled={loading}>
              {loading ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <ActivityIndicator
                    color={COLORS.white}
                    style={{marginRight: 8}}
                  />
                  <Text style={styles.primaryBtnText}>
                    {loadingText || 'Processing...'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.primaryBtnText}>Pay Now →</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Payment option is not available for this account. Only individual
              users with pending payments can pay through Razorpay.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Previous</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: COLORS.background},
  container: {padding: SPACING.md, paddingBottom: SPACING.xxl},

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

  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaLabel: {fontSize: 13, color: COLORS.textSecondary, fontWeight: '600'},
  metaValue: {fontSize: 13, color: COLORS.text, fontWeight: '700'},

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  rowLabel: {fontSize: 14, color: COLORS.textSecondary, flex: 1},
  rowValue: {fontSize: 14, color: COLORS.text, fontWeight: '700'},

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {fontSize: 16, fontWeight: '800', color: COLORS.text},
  totalValue: {fontSize: 20, fontWeight: '900', color: COLORS.accentDark},

  infoBox: {
    backgroundColor: COLORS.accent + '15',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
  },
  infoText: {fontSize: 13, color: COLORS.text, lineHeight: 20},

  primaryBtn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  primaryBtnDisabled: {opacity: 0.7},
  primaryBtnText: {color: COLORS.white, fontWeight: '800', fontSize: 15},

  backBtn: {padding: 14, alignItems: 'center'},
  backBtnText: {color: COLORS.primary, fontWeight: '700', fontSize: 14},
});
