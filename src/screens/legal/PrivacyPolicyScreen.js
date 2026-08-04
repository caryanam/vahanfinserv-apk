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

const PrivacyPolicyScreen = ({navigation}) => {
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
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
            <Text style={styles.heroIcon}>🛡️</Text>
          </View>
          <Text style={styles.heroTitle}>Your Privacy Matters</Text>
          <Text style={styles.heroSubtitle}>
            At Vahan Finserv, we respect your privacy and are committed to
            protecting your personal information. This policy explains how we
            collect, use, and safeguard the data you share with us.
          </Text>
        </View>

        {/* Section: Information We Collect */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📥</Text>
            <Text style={styles.cardTitle}>Information We Collect</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.cardBody}>
            We collect information that you provide during registration, loan
            application, and document upload. This may include name, contact
            details, address, income, employment, PAN, Aadhaar, and vehicle
            details.
          </Text>
        </View>

        {/* Section: How We Use Your Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>⚙️</Text>
            <Text style={styles.cardTitle}>How We Use Your Information</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.bulletRow}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>
              To verify your identity and assess loan eligibility.
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>
              To share your application with partner banks and lenders.
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>
              To send important updates about your application status.
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>
              To improve our platform and personalize your experience.
            </Text>
          </View>
        </View>

        {/* Section: Information Sharing */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🤝</Text>
            <Text style={styles.cardTitle}>Information Sharing</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.cardBody}>
            We share information only with banks and financial partners required
            to process your application. We do not sell your personal data to
            third parties. We may also disclose information to comply with legal
            requirements or protect our rights.
          </Text>
        </View>

        {/* Section: Security */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🔒</Text>
            <Text style={styles.cardTitle}>Security</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.cardBody}>
            We use industry-standard security practices to protect your data,
            including encrypted storage and secure connections. However, no
            system is completely risk-free, so we recommend keeping your account
            credentials confidential and notifying us of suspicious activity.
          </Text>
        </View>

        {/* Section: Policy Updates */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🔄</Text>
            <Text style={styles.cardTitle}>Policy Updates</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.cardBody}>
            We may update this policy from time to time. When we do, we will
            post the updated version on this page. Continued use of our services
            after updates means you accept the new policy terms.
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

export default PrivacyPolicyScreen;
