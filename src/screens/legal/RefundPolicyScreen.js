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

const RefundPolicyScreen = ({navigation}) => {
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
        <Text style={styles.headerTitle}>No Refund Policy</Text>
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
            <Text style={styles.heroIcon}>💳</Text>
          </View>
          <Text style={styles.heroTitle}>Payment Policy</Text>
          <Text style={styles.heroSubtitle}>
            Please review our refund terms carefully before completing payments
            on the Vahan Finserv platform.
          </Text>
        </View>

        {/* Main Alert Card */}
        <View style={styles.refundAlertCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>⚠️</Text>
            <Text style={styles.cardTitleText}>Key Refund Terms</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.bulletRow}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>
              All services related to vehicle loan assistance, application
              processing, and bank offer comparison are strictly non-refundable.
            </Text>
          </View>

          <View style={styles.bulletRow}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>
              Processing fees and service charges cannot be cancelled, reversed,
              or refunded once paid.
            </Text>
          </View>

          <View style={styles.bulletRow}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>
              We only provide loan facilitation and documentation support.
            </Text>
          </View>

          <View style={styles.bulletRow}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>We do not provide loans.</Text>
          </View>

          <View style={styles.bulletRow}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>
              By making payment, users agree that all charges are final and
              non-refundable.
            </Text>
          </View>

          <View style={styles.bulletRow}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>
              Exceptions apply only if required under applicable law.
            </Text>
          </View>
        </View>

        {/* Informational Callout */}
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxTitle}>💡 Need Assistance?</Text>
          <Text style={styles.infoBoxText}>
            If you experience any technical issues with your payment transaction
            or have questions regarding documents, please contact our support
            team immediately. We are here to help resolve your queries.
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
    backgroundColor: COLORS.danger + '12',
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
  refundAlertCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
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
  cardTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    paddingRight: SPACING.md,
  },
  bulletPoint: {
    color: COLORS.danger,
    fontSize: 18,
    marginRight: SPACING.sm,
    lineHeight: 20,
  },
  bulletText: {
    fontSize: 14.5,
    color: COLORS.text,
    lineHeight: 22,
    flex: 1,
  },
  infoBox: {
    backgroundColor: COLORS.primary + '08',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '18',
    marginBottom: SPACING.md,
  },
  infoBoxTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  infoBoxText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  footerNote: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});

export default RefundPolicyScreen;
