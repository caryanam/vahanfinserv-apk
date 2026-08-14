import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

const ContactUsScreen = ({ navigation }) => {
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

  const handlePhonePress = () => {
    Linking.openURL('tel:+918483079733').catch(() => {
      Alert.alert('Error', 'Unable to open dialer. Please dial +91 84830 79733');
    });
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:support@vahanfinserv.com').catch(() => {
      Alert.alert(
        'Error',
        'Unable to open email client. Please email support@vahanfinserv.com',
      );
    });
  };

  const handleAddressPress = () => {
    Linking.openURL('geo:0,0?q=Pune, Maharashtra, India - 411001').catch(() => {
      // Fallback to web maps
      Linking.openURL(
        'https://maps.google.com/?q=Pune, Maharashtra, India - 411001',
      );
    });
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
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <Animated.ScrollView
        style={[
          styles.scrollView,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.iconCircle}>
            <Text style={styles.heroIcon}>📞</Text>
          </View>
          <Text style={styles.heroTitle}>Get In Touch</Text>
          <Text style={styles.heroSubtitle}>
            Have questions or need assistance? Our support team is here to help
            you guide through the vehicle loan application process.
          </Text>
        </View>

        {/* Contact Methods */}
        <Text style={styles.sectionHeader}>SUPPORT CHANNELS</Text>

        {/* Email Card Button */}
        <TouchableOpacity
          style={styles.contactCard}
          onPress={handleEmailPress}
          activeOpacity={0.8}>
          <View style={styles.contactIconCircle}>
            <Text style={styles.contactIcon}>✉️</Text>
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Email Us</Text>
            <Text style={styles.contactValue}>support@vahanfinserv.com</Text>
            <Text style={styles.contactHint}>Tap to send an email</Text>
          </View>
          <Text style={styles.arrowText}>→</Text>
        </TouchableOpacity>

        {/* Phone Card Button */}
        <TouchableOpacity
          style={styles.contactCard}
          onPress={handlePhonePress}
          activeOpacity={0.8}>
          <View
            style={[
              styles.contactIconCircle,
              { backgroundColor: COLORS.success + '15' },
            ]}>
            <Text style={styles.contactIcon}>📞</Text>
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Call Support</Text>
            <Text style={styles.contactValue}>+91 84830 79733</Text>
            <Text style={styles.contactHint}>Tap to make a phone call</Text>
          </View>
          <Text style={styles.arrowText}>→</Text>
        </TouchableOpacity>

        {/* Address Card */}
        <TouchableOpacity
          style={styles.contactCard}
          onPress={handleAddressPress}
          activeOpacity={0.8}>
          <View
            style={[
              styles.contactIconCircle,
              { backgroundColor: COLORS.info + '15' },
            ]}>
            <Text style={styles.contactIcon}>📍</Text>
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Our Address</Text>
            <Text style={styles.contactValue}>
              Pune, Maharashtra, India - 411001
            </Text>
            <Text style={styles.contactHint}>Tap to view on map</Text>
          </View>
          <Text style={styles.arrowText}>→</Text>
        </TouchableOpacity>

        {/* Availability Card */}
        <View style={styles.availabilityCard}>
          <Text style={styles.availabilityTitle}>🕒 Business Hours</Text>
          <Text style={styles.availabilityBody}>
            Monday – Saturday: 9:00 AM – 7:00 PM{'\n'}
            Sunday: Closed
          </Text>
        </View>

        <Text style={styles.footerNote}>© Vahan Finserv. Support Team.</Text>
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
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.accent + '12',
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
  sectionHeader: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
    paddingLeft: 4,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  contactIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  contactIcon: {
    fontSize: 20,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  contactValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 2,
  },
  contactHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  arrowText: {
    fontSize: 18,
    color: COLORS.textMuted,
    fontWeight: '800',
    paddingHorizontal: 4,
  },
  availabilityCard: {
    backgroundColor: COLORS.primary + '08',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '18',
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  availabilityTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  availabilityBody: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  footerNote: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});

export default ContactUsScreen;
