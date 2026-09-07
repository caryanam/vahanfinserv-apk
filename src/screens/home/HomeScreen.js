import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Animated,
  Linking,
  Alert,
  Image,
} from 'react-native';
import Video from 'react-native-video';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import OfferBubble from '../../components/common/OfferBubble';

const { width: W, height: H } = Dimensions.get('window');

const SERVICES = [
  {
    icon: '🚗',
    title: 'New Car Loan',
    desc: 'Finance your dream car with competitive interest rates and flexible tenure.',
  },
  {
    icon: '🔄',
    title: 'Used Car Loan',
    desc: 'Get funds for pre-owned vehicles with minimal documentation.',
  },
  {
    icon: '💳',
    title: 'Loan Against Vehicle',
    desc: 'Unlock the value of your existing vehicle with instant funds.',
  },
  {
    icon: '🔁',
    title: 'Refinancing',
    desc: 'Transfer your existing vehicle loan to us and save on EMIs.',
  },
];

const WHY_US = [
  {
    icon: '⚡',
    title: 'Quick Approval',
    desc: 'Get loan approval within 24 hours of document submission.',
  },
  {
    icon: '📄',
    title: 'Minimal Documents',
    desc: 'Simple documentation process with easy online upload.',
  },
  {
    icon: '💰',
    title: 'Best Interest Rates',
    desc: 'Competitive loan offers from trusted finance partners.',
  },
  {
    icon: '🤝',
    title: 'Trusted Partners',
    desc: 'Connected with banks, NBFCs and dealer networks.',
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Apply Online',
    desc: 'Fill your personal and vehicle loan details.',
  },
  {
    step: '02',
    title: 'Upload Documents',
    desc: 'Upload KYC, income, residential and vehicle documents.',
  },
  {
    step: '03',
    title: 'Document Verification',
    desc: 'Admin verifies your uploaded documents.',
  },
  {
    step: '04',
    title: 'Loan Approval',
    desc: 'Get approval after successful verification.',
  },
  {
    step: '05',
    title: 'Disbursement',
    desc: 'Loan amount is processed after final approval.',
  },
];

const STATS = [
  {
    value: '10K+',
    label: 'Customers',
  },
  {
    value: '₹500Cr+',
    label: 'Loans',
  },
  {
    value: '20+',
    label: 'Partners',
  },
  {
    value: '24Hrs',
    label: 'Approval',
  },
];

const HomeScreen = ({ navigation }) => {
  const videoRef = useRef(null);
  const [videoError, setVideoError] = useState(false);
  const [showWhatsAppCard, setShowWhatsAppCard] = useState(true);

  const tooltipFadeAnim = useRef(new Animated.Value(0)).current;
  const tooltipSlideAnim = useRef(new Animated.Value(15)).current;

  const goToApply = () => {
    navigation.navigate('Register');
  };

  const goToLogin = () => {
    navigation.navigate('Login');
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
        'Unable to open mail client. Please email support@vahanfinserv.com',
      );
    });
  };

  const handleWhatsAppPress = () => {
    const whatsappUrl =
      "https://wa.me/917887334123?text=Hi%2C%20I'm%20interested%20in%20applying%20for%20a%20vehicle%20loan.";
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert('Error', 'WhatsApp is not installed on this device.');
    });
  };

  // Entry Animations & Floating animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(45)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const contactFade = useRef(new Animated.Value(0)).current;
  const contactSlide = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Trigger WhatsApp tooltip entry animation
    Animated.sequence([
      Animated.delay(600),
      Animated.parallel([
        Animated.timing(tooltipFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(tooltipSlideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Trigger contact section animations after a short delay
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(contactFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(contactSlide, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Infinite float looping
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Infinite pulse looping
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [
    fadeAnim,
    slideAnim,
    floatAnim,
    contactFade,
    contactSlide,
    pulseAnim,
    tooltipFadeAnim,
    tooltipSlideAnim,
  ]);

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        <View style={styles.hero}>
          {!videoError ? (
            <Video
              ref={videoRef}
              // source={require('../../assets/videos/home-video.mp4')}
              source={require('../../assets/videos/hero-car-video.mp4')}
              style={styles.heroVideo}
              resizeMode="cover"
              repeat={true}
              muted={true}
              paused={false}
              playInBackground={false}
              playWhenInactive={false}
              ignoreSilentSwitch="ignore"
              onError={() => setVideoError(true)}
            />
          ) : (
            <View style={styles.heroFallback} />
          )}

          <View style={styles.heroOverlay} />

          {/* Ambient Glowing Orbs with floating transforms */}
          <Animated.View
            style={[styles.glowOrb1, { transform: [{ translateY: floatAnim }] }]}
          />
          <Animated.View
            style={[
              styles.glowOrb2,
              {
                transform: [{ translateY: Animated.multiply(floatAnim, -1.2) }],
              },
            ]}
          />

          <SafeAreaView style={styles.heroContent}>
            <View style={styles.navBar}>
              <Text style={styles.logo}>
                <Text style={styles.logoAccent}>Vahan</Text> Finserv
              </Text>

              <TouchableOpacity style={styles.loginBtn} onPress={goToLogin}>
                <Text style={styles.loginBtnText}>Login</Text>
              </TouchableOpacity>
            </View>

            <Animated.View
              style={[
                styles.heroTextBox,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: Animated.add(slideAnim, floatAnim) }],
                },
              ]}>
              <Animated.View
                style={[
                  styles.heroBadge,
                  { transform: [{ translateY: floatAnim }] },
                ]}>
                <View style={styles.heroBadgeIconWrap}>
                  <Text style={styles.heroBadgeStar}>★</Text>
                </View>
                <Text style={styles.heroBadgeText}>
                  Driving Aspirations Forward
                </Text>
              </Animated.View>

              <Text style={styles.heroTitle}>
                Drive Your{'\n'}
                <Text style={styles.heroTitleAccent}>Dream Vehicle</Text>
                {'\n'}Today
              </Text>

              <Text style={styles.heroSubtitle}>
                Fast approvals, easy documentation, trusted finance partners and
                hassle-free vehicle loan processing.
              </Text>

              <View style={styles.heroButtons}>
                <Animated.View
                  style={{ flex: 1, transform: [{ scale: pulseAnim }] }}>
                  <TouchableOpacity
                    style={[styles.applyBtn, { width: '100%' }]}
                    onPress={goToApply}
                    activeOpacity={0.85}>
                    <Text style={styles.applyBtnText}>Apply Now →</Text>
                  </TouchableOpacity>
                </Animated.View>

                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={goToLogin}
                  activeOpacity={0.85}>
                  <Text style={styles.secondaryBtnText}>Login</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </SafeAreaView>
        </View>

        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.statsBar}>
            {STATS.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.statItem,
                  index < STATS.length - 1 && styles.statBorder,
                ]}>
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>WHO WE ARE</Text>
            </View>

            <Text style={styles.sectionTitle}>About Vahan Finserv</Text>

            <Text style={styles.sectionText}>
              Vahan Finserv helps customers get vehicle loans with simple
              documentation, fast approval and transparent processing.
            </Text>

            <Text style={styles.sectionText}>
              Whether you are purchasing a new car or used car, our platform
              makes the loan journey smooth from application to approval.
            </Text>
          </View>

          <View style={[styles.section, styles.sectionAlt]}>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>WHAT WE OFFER</Text>
            </View>

            <Text style={styles.sectionTitle}>Vehicle Loan Services</Text>

            <Text style={styles.sectionSubtitle}>
              Choose the right finance solution for your vehicle.
            </Text>

            <View style={styles.grid}>
              {SERVICES.map((item, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.serviceCard,
                    { transform: [{ translateY: floatAnim }] },
                  ]}>
                  <Text style={styles.serviceIcon}>{item.icon}</Text>
                  <Text style={styles.serviceTitle}>{item.title}</Text>
                  <Text style={styles.serviceDesc}>{item.desc}</Text>
                </Animated.View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>WHY CHOOSE US</Text>
            </View>

            <Text style={styles.sectionTitle}>Simple, Fast & Reliable</Text>

            {WHY_US.map((item, index) => (
              <View key={index} style={styles.whyRow}>
                <View style={styles.whyIconBox}>
                  <Text style={styles.whyIcon}>{item.icon}</Text>
                </View>

                <View style={styles.whyContent}>
                  <Text style={styles.whyTitle}>{item.title}</Text>
                  <Text style={styles.whyDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.section, styles.darkSection]}>
            <View style={styles.darkBadge}>
              <Text style={styles.darkBadgeText}>HOW IT WORKS</Text>
            </View>

            <Text style={styles.darkTitle}>Loan Process</Text>

            <Text style={styles.darkSubtitle}>
              Complete your vehicle loan application in 5 simple steps.
            </Text>

            {STEPS.map((item, index) => (
              <View key={index} style={styles.stepRow}>
                <View style={styles.stepLeft}>
                  <View style={styles.stepCircle}>
                    <Text style={styles.stepNumber}>{item.step}</Text>
                  </View>

                  {index < STEPS.length - 1 && <View style={styles.stepLine} />}
                </View>

                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{item.title}</Text>
                  <Text style={styles.stepDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.ctaSection}>
            <View style={styles.ctaGlow} />
            <Text style={styles.ctaTitle}>Ready to Get Started?</Text>

            <Text style={styles.ctaText}>
              Apply online and track your complete loan application from your
              mobile.
            </Text>

            <Animated.View
              style={{ width: '100%', transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={styles.ctaBtn}
                onPress={goToApply}
                activeOpacity={0.8}>
                <Text style={styles.ctaBtnText}>Apply for Loan →</Text>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity style={styles.ctaLoginLink} onPress={goToLogin}>
              <Text style={styles.ctaLoginText}>
                Already have an account? Login
              </Text>
            </TouchableOpacity>
          </View>

          <Animated.View
            style={[
              styles.section,
              styles.sectionAlt,
              {
                opacity: contactFade,
                transform: [{ translateY: contactSlide }],
              },
            ]}>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>CONTACT</Text>
            </View>

            <Text style={styles.sectionTitle}>Get in Touch</Text>

            <TouchableOpacity
              style={styles.contactCard}
              onPress={handlePhonePress}
              activeOpacity={0.75}>
              <View
                style={[
                  styles.contactIconCircle,
                  { backgroundColor: '#3B82F618' },
                ]}>
                <Text style={[styles.contactIcon, { color: '#3B82F6' }]}>📞</Text>
              </View>
              <View style={styles.contactTextContainer}>
                <Text style={styles.contactLabel}>Call Us</Text>
                <Text style={styles.contactValue}>+91 84830 79733</Text>
                <Text style={styles.contactSubText}>
                  Mon-Sat, 9:00 AM - 6:00 PM
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactCard}
              onPress={handleEmailPress}
              activeOpacity={0.75}>
              <View
                style={[
                  styles.contactIconCircle,
                  { backgroundColor: '#10B98118' },
                ]}>
                <Text style={[styles.contactIcon, { color: '#10B981' }]}>✉️</Text>
              </View>
              <View style={styles.contactTextContainer}>
                <Text style={styles.contactLabel}>Email Support</Text>
                <Text style={styles.contactValue}>
                  support@vahanfinserv.com
                </Text>
                <Text style={styles.contactSubText}>
                  Response within 24 business hours
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.footer}>
            <Text style={styles.footerLogo}>
              <Text style={{ color: COLORS.accent }}>Vahan</Text> Finserv
            </Text>

            <Text style={styles.footerText}>
              Driving Dreams. Financing Futures.
            </Text>

            {/* Legal Compliance Links */}
            <View style={styles.footerLinks}>
              <TouchableOpacity
                onPress={() => navigation.navigate('PrivacyPolicy')}>
                <Text style={styles.footerLinkText}>Privacy Policy</Text>
              </TouchableOpacity>
              <Text style={styles.footerLinkDivider}>|</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('TermsConditions')}>
                <Text style={styles.footerLinkText}>Terms & Conditions</Text>
              </TouchableOpacity>
              <Text style={styles.footerLinkDivider}>|</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('RefundPolicy')}>
                <Text style={styles.footerLinkText}>No Refund Policy</Text>
              </TouchableOpacity>
              <Text style={styles.footerLinkDivider}>|</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('ContactUs')}>
                <Text style={styles.footerLinkText}>Contact Us</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.footerCopy}>
              © {new Date().getFullYear()} Vahan Finserv. All rights reserved.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Floating WhatsApp Widget */}
      {showWhatsAppCard && (
        <Animated.View
          style={[
            styles.whatsAppCardContainer,
            {
              opacity: tooltipFadeAnim,
              transform: [{ translateY: tooltipSlideAnim }],
            },
          ]}>
          <TouchableOpacity
            style={styles.whatsAppCard}
            onPress={handleWhatsAppPress}
            activeOpacity={0.95}>
            {/* Close button */}
            <TouchableOpacity
              style={styles.whatsAppCardClose}
              onPress={() => setShowWhatsAppCard(false)}
              activeOpacity={0.7}>
              <Text style={styles.whatsAppCardCloseText}>×</Text>
            </TouchableOpacity>

            {/* Badge */}
            <View style={styles.whatsAppCardBadge}>
              <Text style={styles.whatsAppCardBadgeText}>
                ⚡ QUICK LOAN OFFER
              </Text>
            </View>

            {/* Title */}
            <Text style={styles.whatsAppCardTitle}>
              Know Your Loan Status{'\n'}in{' '}
              <Text style={styles.whatsAppCardTitleHighlight}>10 Minutes</Text>
            </Text>

            {/* List items */}
            <View style={styles.whatsAppCardRow}>
              <Text style={styles.whatsAppCardRowIcon}>⚡</Text>
              <Text style={styles.whatsAppCardRowText}>Fast Approval</Text>
            </View>
            <View style={styles.whatsAppCardRow}>
              <Text style={styles.whatsAppCardRowIcon}>🔒</Text>
              <Text style={styles.whatsAppCardRowText}>Secure Process</Text>
            </View>
            <View style={styles.whatsAppCardRow}>
              <Text style={styles.whatsAppCardRowIcon}>👇</Text>
              <Text
                style={[
                  styles.whatsAppCardRowText,
                  styles.whatsAppCardRowTextMuted,
                ]}>
                Tap WhatsApp
              </Text>
            </View>
          </TouchableOpacity>

          {/* Bubble tail pointing to the button */}
          <View style={styles.whatsAppCardTail} />
        </Animated.View>
      )}

      <TouchableOpacity
        style={styles.whatsAppButton}
        onPress={handleWhatsAppPress}
        activeOpacity={0.9}>
        <Image
          source={require('../../assets/whatsapp.png')}
          style={styles.whatsAppButtonIcon}
        />
      </TouchableOpacity>

      {/* Floating Offer Bubble Component */}
      <OfferBubble />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  hero: {
    width: W,
    height: H,
    position: 'relative',
    backgroundColor: COLORS.primary,
  },

  heroVideo: {
    ...StyleSheet.absoluteFillObject,
  },

  heroFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primary,
  },

  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4, 18, 44, 0.62)',
  },

  heroContent: {
    flex: 1,
  },

  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: 50,
    paddingBottom: SPACING.md,
  },

  logo: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.white,
  },

  logoAccent: {
    color: COLORS.accent,
  },

  loginBtn: {
    borderWidth: 1.4,
    borderColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },

  loginBtnText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '800',
  },

  heroTextBox: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(30, 207, 195, 0.18)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: 'rgba(30, 207, 195, 0.45)',
    shadowColor: '#1ECFC3',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  heroBadgeIconWrap: {
    marginRight: 6,
  },

  heroBadgeStar: {
    color: '#1ECFC3',
    fontSize: 12,
  },

  heroBadgeText: {
    color: '#1ECFC3',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  heroTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.accent,
    lineHeight: 50,
    letterSpacing: -1,
  },

  heroTitleAccent: {
    color: COLORS.white,
  },

  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.86)',
    lineHeight: 25,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },

  heroButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },

  applyBtn: {
    flex: 1,
    backgroundColor: COLORS.accent,
    paddingVertical: 15,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },

  applyBtnText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '900',
  },

  secondaryBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: COLORS.white,
    paddingVertical: 15,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },

  secondaryBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },

  statsBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },

  statBorder: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.16)',
  },

  statValue: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.accent,
  },

  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    textAlign: 'center',
  },

  section: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },

  sectionAlt: {
    backgroundColor: COLORS.background,
  },

  sectionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accent + '22',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.sm,
  },

  sectionBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.accentDark,
    letterSpacing: 1,
  },

  sectionTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },

  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },

  sectionText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: SPACING.md,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },

  serviceCard: {
    width: (W - SPACING.lg * 2 - SPACING.sm) / 2,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    elevation: 3,
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  serviceIcon: {
    fontSize: 28,
    marginBottom: 8,
  },

  serviceTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 4,
  },

  serviceDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  whyRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },

  whyIconBox: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.accent + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },

  whyIcon: {
    fontSize: 22,
  },

  whyContent: {
    flex: 1,
  },

  whyTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 3,
  },

  whyDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  darkSection: {
    backgroundColor: COLORS.primary,
  },

  darkBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accent + '22',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.sm,
  },

  darkBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.accent,
    letterSpacing: 1,
  },

  darkTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },

  darkSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },

  stepRow: {
    flexDirection: 'row',
  },

  stepLeft: {
    alignItems: 'center',
    width: 50,
    marginRight: SPACING.md,
  },

  stepCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stepNumber: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '900',
  },

  stepLine: {
    width: 2,
    flex: 1,
    minHeight: 34,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 4,
  },

  stepContent: {
    flex: 1,
    paddingTop: 9,
    paddingBottom: SPACING.lg,
  },

  stepTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
  },

  stepDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    lineHeight: 20,
  },

  glowOrb1: {
    position: 'absolute',
    top: '5%',
    left: '-20%',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: COLORS.accent,
    opacity: 0.12,
  },

  glowOrb2: {
    position: 'absolute',
    bottom: '15%',
    right: '-25%',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#0047d9',
    opacity: 0.14,
  },

  ctaSection: {
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },

  ctaGlow: {
    position: 'absolute',
    top: '-50%',
    right: '-30%',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.accent,
    opacity: 0.14,
  },

  ctaTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.white,
    textAlign: 'center',
  },

  ctaText: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.82,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },

  ctaBtn: {
    width: '100%',
    backgroundColor: COLORS.accent,
    paddingVertical: 15,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    elevation: 2,
  },

  ctaBtnText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '900',
  },

  ctaLoginLink: {
    marginTop: SPACING.md,
  },

  ctaLoginText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '700',
  },

  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },

  contactIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },

  contactIcon: {
    fontSize: 20,
  },

  contactTextContainer: {
    flex: 1,
  },

  contactLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 2,
  },

  contactValue: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
  },

  contactSubText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  footer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },

  footerLogo: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },

  footerText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: SPACING.md,
  },

  footerLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
    marginBottom: SPACING.lg,
  },

  footerLinkText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '600',
  },

  footerLinkDivider: {
    color: 'rgba(255, 255, 255, 0.2)',
    fontSize: 12,
  },

  footerCopy: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
  },

  // WhatsApp Floating Button & Tooltip Card
  whatsAppButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    zIndex: 9999,
  },

  whatsAppButtonIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  whatsAppCardContainer: {
    position: 'absolute',
    bottom: 96,
    right: 24,
    width: 270,
    zIndex: 9999,
  },

  whatsAppCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },

  whatsAppCardClose: {
    position: 'absolute',
    top: 10,
    right: 12,
    zIndex: 10,
    padding: 4,
  },

  whatsAppCardCloseText: {
    fontSize: 22,
    color: '#98A2B3',
    fontWeight: 'bold',
    lineHeight: 20,
  },

  whatsAppCardBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#0B2A4A',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },

  whatsAppCardBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  whatsAppCardTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#061842',
    lineHeight: 22,
    marginBottom: 12,
  },

  whatsAppCardTitleHighlight: {
    color: '#27D3C3',
  },

  whatsAppCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  whatsAppCardRowIcon: {
    fontSize: 14,
    marginRight: 8,
  },

  whatsAppCardRowText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#344054',
  },

  whatsAppCardRowTextMuted: {
    color: '#98A2B3',
    fontWeight: '500',
  },

  whatsAppCardTail: {
    position: 'absolute',
    bottom: -7,
    right: 22,
    width: 14,
    height: 14,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
});

export default HomeScreen;
