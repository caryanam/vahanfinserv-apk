// src/components/common/OfferBubble.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

const { width: W } = Dimensions.get('window');

const OfferBubble = () => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Floating gentle bounce animation
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -6,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [bounceAnim]);

  return (
    <>
      {/* Floating Left Side Offer Bubble */}
      {!isCollapsed ? (
        <Animated.View
          style={[
            styles.floatingContainer,
            { transform: [{ translateY: bounceAnim }] },
          ]}
        >
          <TouchableOpacity
            style={styles.bubblePill}
            onPress={() => setIsOpenModal(true)}
            activeOpacity={0.9}
          >
            {/* Gift Icon Badge */}
            <View style={styles.giftCircle}>
              <Text style={styles.giftIcon}>🎁</Text>
            </View>

            {/* Bubble Text */}
            <View style={styles.textWrap}>
              <View style={styles.headerTagRow}>
                <Text style={styles.carTagIcon}>🚗</Text>
                <Text style={styles.headerTagText}>VAHAN FINSERV SPECIAL!</Text>
              </View>
              <Text style={styles.offerTitle} numberOfLines={1}>
                🎁 Free Insurance Offer!
              </Text>
              <Text style={styles.offerSub} numberOfLines={1}>
                Up to 2 Yrs Free • Tap for info →
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        /* Collapsed Tab Button */
        <TouchableOpacity
          style={styles.collapsedTab}
          onPress={() => setIsOpenModal(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.collapsedGiftIcon}>🎁</Text>
          <Text style={styles.collapsedText}>Free Insurance!</Text>
        </TouchableOpacity>
      )}

      {/* Offer Details Pop-up Modal */}
      <Modal
        visible={isOpenModal}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpenModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpenModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalCard}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setIsOpenModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>

              <View style={styles.modalTagRow}>
                <Text style={styles.modalTagIcon}>🚗</Text>
                <Text style={styles.modalTagText}>VAHAN FINSERV SPECIAL OFFER</Text>
              </View>
              <Text style={styles.modalTitle}>
                🎁 Free Vehicle Insurance <Text style={styles.titleHighlight}>Premium!</Text>
              </Text>
            </View>

            {/* Content Body */}
            <View style={styles.modalBody}>
              <Text style={styles.introText}>
                Enjoy 100% free vehicle insurance premium benefits based on your vehicle category:
              </Text>

              {/* Offer 1: Non-Luxury Cars */}
              <View style={styles.offerCardStandard}>
                <View style={styles.iconBoxStandard}>
                  <Text style={styles.iconStandard}>🚗</Text>
                </View>
                <View style={styles.offerCardInfo}>
                  <Text style={styles.offerCardHeadingStandard}>
                    Non-Luxury / Standard Cars
                  </Text>
                  <Text style={styles.offerCardDesc}>
                    🎁 <Text style={styles.tealHighlight}>Last 2 Years’ Insurance FREE!</Text> Pay ₹0 premium for the final 24 months of coverage.
                  </Text>
                </View>
              </View>

              {/* Offer 2: Luxury Cars */}
              <View style={styles.offerCardLuxury}>
                <View style={styles.iconBoxLuxury}>
                  <Text style={styles.iconLuxury}>💎</Text>
                </View>
                <View style={styles.offerCardInfo}>
                  <Text style={styles.offerCardHeadingLuxury}>
                    Luxury & Premium Cars
                  </Text>
                  <Text style={styles.offerCardDesc}>
                    👑 <Text style={styles.amberHighlight}>1st Year Insurance FREE!</Text> Enjoy 1 full year of 100% complimentary insurance premium.
                  </Text>
                </View>
              </View>

              {/* Terms Note */}
              <View style={styles.termsRow}>
                <Text style={styles.checkIcon}>✓</Text>
                <Text style={styles.termsText}>
                  Applicable on new vehicle loan approvals & balance transfers processed through Vahan Finserv.
                </Text>
              </View>

              {/* Action Button */}
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => setIsOpenModal(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.actionBtnText}>Got It</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Floating Left Side Bubble
  floatingContainer: {
    position: 'absolute',
    left: 0,
    top: Platform.OS === 'ios' ? 140 : 120,
    zIndex: 9999,
  },
  bubblePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B1E3F',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    paddingLeft: 12,
    paddingRight: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderLeftWidth: 0,
    borderColor: 'rgba(30, 207, 195, 0.5)',
    width: Math.min(W * 0.75, 280),
    elevation: 10,
    shadowColor: '#1ECFC3',
    shadowOpacity: 0.35,
    shadowOffset: { width: 3, height: 5 },
    shadowRadius: 12,
  },
  giftCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1ECFC3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    elevation: 3,
  },
  giftIcon: {
    fontSize: 20,
  },
  textWrap: {
    flex: 1,
    paddingRight: 4,
  },
  headerTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  carTagIcon: {
    fontSize: 10,
  },
  headerTagText: {
    color: '#1ECFC3',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  offerTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  offerSub: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  minimizeBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  minimizeBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },

  // Collapsed Tab
  collapsedTab: {
    position: 'absolute',
    left: 0,
    top: Platform.OS === 'ios' ? 140 : 120,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B1E3F',
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: 'rgba(30, 207, 195, 0.5)',
    gap: 6,
    zIndex: 999,
    elevation: 6,
  },
  collapsedGiftIcon: {
    fontSize: 16,
  },
  collapsedText: {
    color: '#1ECFC3',
    fontSize: 11,
    fontWeight: '900',
  },

  // Modal Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
  },
  modalHeader: {
    backgroundColor: '#0B1E3F',
    paddingHorizontal: 18,
    paddingVertical: 16,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  modalTagIcon: {
    fontSize: 12,
  },
  modalTagText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 22,
  },
  titleHighlight: {
    color: '#1ECFC3',
  },

  // Modal Body
  modalBody: {
    padding: 18,
  },
  introText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
    marginBottom: 14,
    lineHeight: 18,
  },
  offerCardStandard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: 'rgba(30, 207, 195, 0.35)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  iconBoxStandard: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(30, 207, 195, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconStandard: {
    fontSize: 15,
  },
  offerCardLuxury: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    gap: 10,
  },
  iconBoxLuxury: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLuxury: {
    fontSize: 15,
  },
  offerCardInfo: {
    flex: 1,
  },
  offerCardHeadingStandard: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F294A',
    marginBottom: 2,
  },
  offerCardHeadingLuxury: {
    fontSize: 12,
    fontWeight: '900',
    color: '#78350F',
    marginBottom: 2,
  },
  offerCardDesc: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
    fontWeight: '500',
  },
  tealHighlight: {
    color: '#0D9488',
    fontWeight: '800',
  },
  amberHighlight: {
    color: '#B45309',
    fontWeight: '800',
  },

  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 16,
  },
  checkIcon: {
    color: '#1ECFC3',
    fontSize: 14,
    fontWeight: '900',
  },
  termsText: {
    flex: 1,
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },

  actionBtn: {
    backgroundColor: '#0B1E3F',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});

export default OfferBubble;
