// src/components/common/StatCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

const StatCard = ({ label, value, emoji, color = COLORS.primary, sub }) => (
  <View style={[styles.card, { borderLeftColor: color }]}>
    <View style={styles.row}>
      <Text style={styles.emoji}>{emoji}</Text>
      <View style={styles.textGroup}>
        <Text style={styles.value}>{value ?? '—'}</Text>
        <Text style={styles.label}>{label}</Text>
        {sub ? <Text style={styles.sub}>{sub}</Text> : null}
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 4,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  emoji: { fontSize: 28 },
  textGroup: { flex: 1 },
  value: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  label: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  sub: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
});

export default StatCard;
