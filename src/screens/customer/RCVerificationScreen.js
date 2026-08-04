// src/screens/customer/RCVerificationScreen.js
import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import api from '../../services/api';
import {validateRC} from '../../services/vehicleService';
import {downloadReportAsPdf} from '../../services/pdfGenerator';
import {COLORS, SPACING, RADIUS} from '../../constants/theme';

const normalize = value =>
  String(value || '')
    .toUpperCase()
    .trim();

const DetailItem = ({label, value, isStatus}) => {
  const displayVal = value || '—';
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      {isStatus ? (
        <View
          style={[
            styles.statusTag,
            displayVal.toUpperCase() === 'ACTIVE'
              ? styles.statusActive
              : styles.statusInactive,
          ]}>
          <Text style={styles.statusTagText}>{displayVal}</Text>
        </View>
      ) : (
        <Text style={styles.detailValue}>{displayVal}</Text>
      )}
    </View>
  );
};

const getBackendErrorMessage = (err, fallback) => {
  const data = err?.response?.data;
  if (!data) {
    return err?.message || fallback;
  }
  if (typeof data === 'string') {
    return data;
  }
  if (data.message) {
    return data.message;
  }
  if (data.error) {
    if (typeof data.error === 'string') {
      return data.error;
    }
    if (data.error.message) {
      return data.error.message;
    }
  }
  if (data.msg) {
    return data.msg;
  }
  if (data.errors) {
    if (Array.isArray(data.errors)) {
      return data.errors
        .map(e => e.message || e.msg || JSON.stringify(e))
        .join(', ');
    }
    if (typeof data.errors === 'object') {
      return Object.values(data.errors).flat().join(', ');
    }
  }
  return err?.message || fallback;
};

const RCVerificationScreen = ({navigation, route}) => {
  const {userId: routeUserId, applicationNumber} = route.params || {};
  const [verifyingAccess, setVerifyingAccess] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);

  const [vehicleNumber, setVehicleNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [rcDetails, setRcDetails] = useState(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Verify payment access from backend
  const verifyAccess = useCallback(async () => {
    setVerifyingAccess(true);
    try {
      let userId = routeUserId;
      if (!userId) {
        const raw = await AsyncStorage.getItem('userData');
        if (raw) {
          const parsed = JSON.parse(raw);
          userId = parsed.id || parsed.userId;
        }
      }

      if (!userId) {
        navigation.reset({index: 0, routes: [{name: 'Login'}]});
        return;
      }

      const response = await api.get(`/user/${userId}`);
      const profile = response.data?.data || response.data || {};
      const isPaid =
        profile.paymentDone === true ||
        normalize(profile.paymentStatus) === 'SUCCESS';

      if (isPaid || __DEV__) {
        setAccessGranted(true);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Payment Required',
          text2: 'Complete payment to access RC Verification.',
        });
        navigation.goBack();
      }
    } catch (err) {
      // Fallback to AsyncStorage cache
      const raw = await AsyncStorage.getItem('userData');
      const cached = raw ? JSON.parse(raw) : {};
      if (
        cached.paymentDone === true ||
        normalize(cached.paymentStatus) === 'SUCCESS' ||
        __DEV__
      ) {
        setAccessGranted(true);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Verification Failed',
          text2: 'Could not verify payment status.',
        });
        navigation.goBack();
      }
    } finally {
      setVerifyingAccess(false);
    }
  }, [routeUserId, navigation]);

  useEffect(() => {
    verifyAccess();
  }, [verifyAccess]);

  const handleCheckRC = async () => {
    const formatted = vehicleNumber.trim().replace(/[\s-]/g, '').toUpperCase();
    if (!formatted) {
      Toast.show({type: 'error', text1: 'Please enter a vehicle number'});
      return;
    }
    const regex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,3}[0-9]{4}$/i;
    if (!regex.test(formatted)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Indian vehicle number format',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await validateRC(formatted);
      const data = res.data?.data || res.data || {};
      setRcDetails(data);
    } catch (err) {
      console.log('RC check error:', err);
      console.log('RC check error response data:', err.response?.data);
      const msg = getBackendErrorMessage(err, 'Failed to validate RC');
      Toast.show({type: 'error', text1: msg});
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      const formatted = vehicleNumber
        .trim()
        .replace(/[\s-]/g, '')
        .toUpperCase();
      await downloadReportAsPdf('RC', formatted, rcDetails);

      Alert.alert(
        'Download Successful',
        'The PDF has been saved directly to your device Downloads folder.',
      );
    } catch (err) {
      console.log('PDF download error:', err);
      Alert.alert(
        'Download Error',
        err.message || 'Could not generate PDF report',
      );
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (verifyingAccess) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Verifying access...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!accessGranted) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>RC VERIFICATION</Text>
        </View>

        <Text style={styles.title}>📋 RC Verification</Text>
        <Text style={styles.subtitle}>
          Enter a vehicle registration number to verify RC details.
        </Text>

        {/* Input Card */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Vehicle Number</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter Vehicle Number (e.g. MH14LK5987)"
              placeholderTextColor={COLORS.textMuted}
              value={vehicleNumber}
              onChangeText={setVehicleNumber}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={13}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
            onPress={handleCheckRC}
            disabled={loading}>
            {loading ? (
              <View style={styles.btnRow}>
                <ActivityIndicator
                  color={COLORS.white}
                  style={{marginRight: 8}}
                />
                <Text style={styles.primaryBtnText}>Checking...</Text>
              </View>
            ) : (
              <Text style={styles.primaryBtnText}>📋 Verify RC</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* RC Results */}
        {rcDetails && (
          <View style={styles.card}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>📋 RC Details</Text>
              <Text style={styles.resultSubtitle}>
                Vehicle: {vehicleNumber.toUpperCase()}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsGrid}>
              <DetailItem
                label="Owner Name"
                value={rcDetails.owner_name || rcDetails.ownerName}
              />
              <DetailItem
                label="Model / Maker"
                value={
                  rcDetails.model ||
                  rcDetails.maker_model ||
                  rcDetails.vehicle_manufacturer_name
                }
              />
              <DetailItem
                label="Manufacturer"
                value={rcDetails.vehicle_manufacturer_name}
              />
              <DetailItem label="Vehicle Class" value={rcDetails.class} />
              <DetailItem
                label="Fuel Type"
                value={rcDetails.type || rcDetails.fuel_type}
              />
              <DetailItem
                label="Vehicle Colour"
                value={rcDetails.vehicle_colour}
              />
              <DetailItem
                label="Registration Date"
                value={rcDetails.reg_date || rcDetails.registration_date}
              />
              <DetailItem
                label="RC Expiry"
                value={rcDetails.rc_expiry_date}
              />
              <DetailItem
                label="Insurance Company"
                value={rcDetails.vehicle_insurance_company_name}
              />
              <DetailItem
                label="Insurance Expiry"
                value={
                  rcDetails.vehicle_insurance_upto ||
                  rcDetails.insurance_expiry
                }
              />
              <DetailItem
                label="Insurance Policy No."
                value={rcDetails.vehicle_insurance_policy_number}
              />
              <DetailItem label="Financer" value={rcDetails.rc_financer} />
              <DetailItem
                label="Chassis Number"
                value={rcDetails.chassis || rcDetails.chassis_no}
              />
              <DetailItem
                label="Engine Number"
                value={rcDetails.engine || rcDetails.engine_no}
              />
              <DetailItem
                label="Owner Count"
                value={rcDetails.owner_count}
              />
              <DetailItem
                label="RTO Authority"
                value={rcDetails.reg_authority}
              />
              <DetailItem
                label="RC Status"
                value={rcDetails.status || 'Active'}
                isStatus={true}
              />
            </View>

            {/* Download PDF */}
            <TouchableOpacity
              style={[
                styles.downloadBtn,
                isDownloadingPdf && {opacity: 0.7},
              ]}
              onPress={handleDownloadPdf}
              disabled={isDownloadingPdf}>
              {isDownloadingPdf ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.downloadBtnText}>
                  📥 Download Report as PDF
                </Text>
              )}
            </TouchableOpacity>

            {/* Go to Dashboard */}
            <TouchableOpacity
              style={styles.dashboardBtn}
              onPress={() =>
                navigation.reset({
                  index: 0,
                  routes: [{name: 'CustomerDashboard'}],
                })
              }>
              <Text style={styles.dashboardBtnText}>Go to Dashboard →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Back to Services */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Back to Services</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RCVerificationScreen;

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

  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },

  inputContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    height: 48,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    padding: 0,
  },

  primaryBtn: {
    backgroundColor: COLORS.accent,
    padding: 14,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  primaryBtnDisabled: {opacity: 0.7},
  primaryBtnText: {color: COLORS.primary, fontWeight: '800', fontSize: 14},

  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  resultHeader: {
    marginBottom: SPACING.sm,
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },
  resultSubtitle: {
    fontSize: 12,
    color: COLORS.accentDark,
    fontWeight: '700',
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },

  detailsGrid: {
    gap: SPACING.xs,
    paddingBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '700',
    flex: 1.5,
    textAlign: 'right',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  statusActive: {
    backgroundColor: COLORS.success + '22',
  },
  statusInactive: {
    backgroundColor: COLORS.danger + '22',
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.text,
  },

  downloadBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  downloadBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14,
  },

  dashboardBtn: {
    backgroundColor: COLORS.success,
    padding: 16,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  dashboardBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 15,
  },

  backBtn: {padding: 14, alignItems: 'center'},
  backBtnText: {color: COLORS.primary, fontWeight: '700', fontSize: 14},
});
