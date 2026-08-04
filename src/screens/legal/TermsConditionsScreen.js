import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import {COLORS, SPACING, RADIUS} from '../../constants/theme';

const TermsConditionsScreen = ({navigation}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <Animated.ScrollView
        style={[
          styles.scrollView,
          {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
        ]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.iconCircle}>
            <Text style={styles.heroIcon}>📝</Text>
          </View>
          <Text style={styles.heroTitle}>Terms of Service</Text>
          <Text style={styles.heroSubtitle}>
            Welcome to Vahan Finserv. By using our website and applying for a
            vehicle loan, you agree to comply with these terms and conditions.
            These terms explain your responsibilities, eligibility requirements,
            and important legal disclosures.
          </Text>
        </View>

        {/* Warning Alert Box: Application Guidance Only */}
        <View style={styles.warningAlertBox}>
          <View style={styles.warningHeader}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningTitle}>IMPORTANT NOTICE</Text>
          </View>
          <Text style={styles.warningSubTitle}>Application Guidance Only</Text>
          <View style={styles.warningDivider} />

          <View style={styles.warningBulletRow}>
            <Text style={styles.warningBulletPoint}>•</Text>
            <Text style={styles.warningBulletText}>
              Vahan Finserv provides an application guidance platform only.
            </Text>
          </View>
          <View style={styles.warningBulletRow}>
            <Text style={styles.warningBulletPoint}>•</Text>
            <Text style={styles.warningBulletText}>
              We do not provide loans, credit facilities, or financial products.
            </Text>
          </View>
          <View style={styles.warningBulletRow}>
            <Text style={styles.warningBulletPoint}>•</Text>
            <Text style={styles.warningBulletText}>
              We guide users through the application process and connect them
              with partner banks.
            </Text>
          </View>
          <View style={styles.warningBulletRow}>
            <Text style={styles.warningBulletPoint}>•</Text>
            <Text style={styles.warningBulletText}>
              All loan approvals, interest rates, and loan terms are determined
              solely by partner banks.
            </Text>
          </View>
        </View>

        {/* Section: Eligibility */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🔞</Text>
            <Text style={styles.cardTitle}>Eligibility</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.cardBody}>
            You must be at least 18 years old and a resident of India to use our
            vehicle loan services. Applicants must provide accurate personal and
            financial information during registration and throughout the loan
            application process.
          </Text>
        </View>

        {/* Section: Application Process */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>⚙️</Text>
            <Text style={styles.cardTitle}>Application Process</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.bulletRow}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>
              Compare offers from partner banks.
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>We are not a lender.</Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>
              Loan approval depends entirely on partner banks.
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>Interest rates may vary.</Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>
              Submission does not guarantee approval.
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>
              Disbursement timeline is managed by the selected bank.
            </Text>
          </View>
        </View>

        {/* Section: Documents and Verification */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📂</Text>
            <Text style={styles.cardTitle}>Documents and Verification</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.bulletRow}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>
              Applicants may upload identity, address, income, and vehicle
              documents.
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>
              All submitted information must be accurate.
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>
              False information may result in rejection.
            </Text>
          </View>
        </View>

        {/* Section: Responsibility */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🛡️</Text>
            <Text style={styles.cardTitle}>Responsibility</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.cardBody}>
            Vahan Finserv is only a loan facilitation platform. We are not
            responsible for final loan approval, rejection, or loan terms
            provided by partner banks.
          </Text>
        </View>

        {/* Section: Data Retention */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🗄️</Text>
            <Text style={styles.cardTitle}>Data Retention</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.bulletRow}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>
              We retain application information for up to 7 years where required
              for legal compliance, fraud prevention, and record keeping.
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>
              Users may request deletion where legally permitted.
            </Text>
          </View>
        </View>

        {/* Section: Changes to Terms */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🔄</Text>
            <Text style={styles.cardTitle}>Changes to Terms</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.cardBody}>
            These terms may change periodically. Continued use indicates
            acceptance of updated terms.
          </Text>
        </View>

        <Text style={styles.footerNote}>Last updated: July 2026</Text>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 15,
    backgroundColor: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  heroIcon: {
    fontSize: 32,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  warningAlertBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#FEF3C7',
    elevation: 2,
    shadowColor: '#F59E0B',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 4,
  },
  warningIcon: {
    fontSize: 20,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#B45309',
    letterSpacing: 1,
  },
  warningSubTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: SPACING.sm,
  },
  warningDivider: {
    height: 1,
    backgroundColor: '#FEF3C7',
    marginBottom: SPACING.sm,
  },
  warningBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingRight: SPACING.sm,
  },
  warningBulletPoint: {
    color: '#D97706',
    fontSize: 18,
    marginRight: SPACING.sm,
    lineHeight: 20,
  },
  warningBulletText: {
    fontSize: 13.5,
    color: '#92400E',
    lineHeight: 19,
    flex: 1,
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  cardIcon: {
    fontSize: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  cardBody: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    paddingRight: SPACING.md,
  },
  bulletPoint: {
    color: COLORS.accent,
    fontSize: 18,
    marginRight: SPACING.sm,
    lineHeight: 20,
  },
  bulletText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    flex: 1,
  },
  footerNote: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});

export default TermsConditionsScreen;
