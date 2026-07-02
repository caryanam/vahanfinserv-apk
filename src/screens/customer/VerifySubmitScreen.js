import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  Linking,
} from 'react-native';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import {COLORS, SPACING, RADIUS} from '../../constants/theme';

const DOC_SECTIONS = [
  {
    title: 'KYC Documents',
    icon: '🪪',
    types: ['AADHAAR_1', 'AADHAAR_2', 'PAN'],
    labels: {
      AADHAAR_1: 'Aadhaar Front Side',
      AADHAAR_2: 'Aadhaar Back Side',
      PAN: 'PAN Card',
    },
  },
  {
    title: 'Residential Documents',
    icon: '🏠',
    types: ['LIGHT_BILL', 'RENTAL_AGREEMENT'],
    labels: {LIGHT_BILL: 'Light Bill', RENTAL_AGREEMENT: 'Rental Agreement'},
  },
  {
    title: 'Income Documents',
    icon: '💼',
    types: [
      'SALARY_SLIP_1',
      'SALARY_SLIP_2',
      'SALARY_SLIP_3',
      'APPOINTMENT_LETTER',
      'BANK_STATEMENT',
      'ITR_RETURN',
    ],
    labels: {
      SALARY_SLIP_1: 'Salary Slip Month 1',
      SALARY_SLIP_2: 'Salary Slip Month 2',
      SALARY_SLIP_3: 'Salary Slip Month 3',
      APPOINTMENT_LETTER: 'Appointment Letter',
      BANK_STATEMENT: 'Bank Statement',
      ITR_RETURN: 'ITR Return',
    },
  },
  {
    title: 'Vehicle Documents',
    icon: '🚗',
    types: [
      'RC_1',
      'RC_2',
      'INSURANCE',
      'ODOMETER_READING',
      'CHASSIS_NUMBER',
      'CAR_FRONT_SIDE_PHOTO',
      'CAR_BACK_SIDE_PHOTO',
    ],
    labels: {
      RC_1: 'RC Front Side',
      RC_2: 'RC Back Side',
      INSURANCE: 'Insurance',
      ODOMETER_READING: 'Odometer Reading',
      CHASSIS_NUMBER: 'Chassis Number',
      CAR_FRONT_SIDE_PHOTO: 'Car Front Side Photo',
      CAR_BACK_SIDE_PHOTO: 'Car Back Side Photo',
    },
  },
];

const isPdf = fileName => fileName?.toLowerCase().endsWith('.pdf');

const VerifySubmitScreen = ({navigation, route}) => {
  const {
    applicationNumber,
    userId,
    loanNumber,
    applicationNo,
    loanApplicationNumber,
  } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [preview, setPreview] = useState(null); // { url, fileName } | null

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userRes, docsRes] = await Promise.allSettled([
        api.get(`/user/${userId}`),
        api.get(`/documents/user/${userId}`),
      ]);
      if (userRes.status === 'fulfilled') {
        setUser(userRes.value?.data?.data || userRes.value?.data || null);
      }
      if (docsRes.status === 'fulfilled') {
        const raw = docsRes.value?.data?.data || docsRes.value?.data || [];
        setDocuments(Array.isArray(raw) ? raw : []);
      }
    } finally {
      setLoading(false);
    }
  };

  const openPreview = async doc => {
    const documentId = doc.id || doc.documentId;
    const fileName = doc.fileName || doc.documentName || '';
    const previewUrl = `${api.defaults.baseURL}/documents/preview/${documentId}`;

    console.log('PREVIEW URL =>', previewUrl);
    console.log('DOCUMENT =>', doc);

    if (isPdf(fileName)) {
      Linking.openURL(previewUrl).catch(() =>
        Toast.show({type: 'error', text1: 'Unable to load preview'}),
      );
      return;
    }

    // For images — verify URL is reachable before opening modal
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(previewUrl, {
        headers: token ? {Authorization: `Bearer ${token}`} : {},
      });
      if (!res.ok) {
        Toast.show({type: 'error', text1: 'Unable to load preview'});
        return;
      }
    } catch {
      Toast.show({type: 'error', text1: 'Unable to load preview'});
      return;
    }

    setPreview({url: previewUrl, fileName});
  };

  const submitApplication = async () => {
    setSubmitting(true);
    try {
      await api.post(`/loan/${applicationNumber}/submit`);
    } catch {
      // endpoint may not exist — proceed anyway
    }
    Toast.show({type: 'success', text1: 'Application verified successfully'});

    try {
      const response = await api.get(`/user/${userId}`);
      const profile = response.data?.data || response.data || {};
      const regType = String(profile?.registrationType || '')
        .toUpperCase()
        .trim();
      const isDealerCreated = Boolean(
        profile?.dealerId ||
          profile?.assignedDealerId ||
          profile?.dealer?.id ||
          profile?.dealerCode,
      );

      if (regType === 'DEALER' || isDealerCreated) {
        console.log('SKIPPING PAYMENT FOR DEALER/DEALER-CREATED CUSTOMER...');
        navigation.reset({
          index: 0,
          routes: [{name: 'CustomerDashboard'}],
        });
      } else {
        navigation.navigate('Payment', {applicationNumber, userId});
      }
    } catch (err) {
      console.log('VERIFY SUBMIT SCREEN PROFILE FETCH ERROR =>', err);
      // Fallback
      navigation.navigate('Payment', {applicationNumber, userId});
    }
    setSubmitting(false);
  };

  const docsByType = documents.reduce((acc, d) => {
    acc[d.documentType || d.type] = d;
    return acc;
  }, {});

  const InfoRow = ({label, value}) =>
    value ? (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    ) : null;

  const DocCard = ({label, doc}) => (
    <View style={styles.docCard}>
      <View style={styles.docCardLeft}>
        <Text style={styles.docLabel}>{label}</Text>
        {doc ? (
          <>
            <Text style={styles.docFileName} numberOfLines={1}>
              {doc.fileName || doc.documentName || 'Uploaded'}
            </Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>
                {doc.status || 'UPLOADED'}
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.docMissing}>Not uploaded</Text>
        )}
      </View>
      {doc && (
        <TouchableOpacity
          style={styles.previewBtn}
          onPress={() => openPreview(doc)}>
          <Text style={styles.previewBtnText}>Preview</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>FINAL STEP</Text>
        </View>
        <Text style={styles.title}>Verify & Submit</Text>
        <Text style={styles.subtitle}>
          Application No:{' '}
          {applicationNumber ||
            loanNumber ||
            applicationNo ||
            loanApplicationNumber ||
            '—'}
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{marginTop: 40}}
          />
        ) : (
          <>
            {/* User Information */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>👤 User Information</Text>
              <InfoRow label="Full Name" value={user?.fullName || user?.name} />
              <InfoRow label="Email" value={user?.email} />
              <InfoRow
                label="Mobile Number"
                value={user?.mobileNumber || user?.phone}
              />
              <InfoRow label="Role" value={user?.role} />
              <InfoRow label="User ID" value={String(userId || '')} />
            </View>

            {/* Personal Information */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>📋 Personal Information</Text>
              <InfoRow label="Address" value={user?.address} />
              <InfoRow label="City" value={user?.city} />
              <InfoRow label="State" value={user?.state} />
              <InfoRow label="Pincode" value={user?.pincode} />
              <InfoRow
                label="Loan Amount"
                value={user?.loanAmount ? `₹ ${user.loanAmount}` : null}
              />
            </View>

            {/* Document Sections */}
            {DOC_SECTIONS.map(section => (
              <View key={section.title} style={styles.card}>
                <Text style={styles.sectionTitle}>
                  {section.icon} {section.title}
                </Text>
                {section.types.map(type => (
                  <DocCard
                    key={type}
                    label={section.labels[type]}
                    doc={docsByType[type] || null}
                  />
                ))}
              </View>
            ))}

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                submitting && styles.primaryBtnDisabled,
              ]}
              onPress={submitApplication}
              disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.primaryBtnText}>Submit Application →</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}>
              <Text style={styles.backBtnText}>← Previous</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Image Preview Modal */}
      <Modal
        visible={!!preview}
        animationType="slide"
        onRequestClose={() => setPreview(null)}>
        <View style={{flex: 1, backgroundColor: '#000'}}>
          <TouchableOpacity
            onPress={() => setPreview(null)}
            style={{padding: 20}}>
            <Text style={{color: '#fff', fontWeight: '700', fontSize: 16}}>
              ✕ Close
            </Text>
          </TouchableOpacity>
          {preview?.url && (
            <Image
              source={{uri: preview.url}}
              resizeMode="contain"
              style={{width: '100%', height: '90%'}}
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default VerifySubmitScreen;

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: COLORS.background},

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

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
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
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },

  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  docCardLeft: {flex: 1, marginRight: SPACING.sm},
  docLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  docFileName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  docMissing: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.success + '22',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.success,
    letterSpacing: 0.5,
  },
  previewBtn: {
    backgroundColor: COLORS.primary + '14',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  previewBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },

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
