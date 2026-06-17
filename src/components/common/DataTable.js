// src/components/common/DataTable.js
/**
 * Replaces HTML <table> with FlatList-based card rows for React Native.
 *
 * Props:
 *  columns  – array of { key, label, render? }
 *  data     – array of row objects
 *  keyField – unique key field name (default 'id')
 *  emptyText – text when no data
 */
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

const DataTable = ({ columns = [], data = [], keyField = 'id', emptyText = 'No data found' }) => {
  const renderItem = ({ item, index }) => (
    <View style={[styles.row, index % 2 === 0 && styles.rowAlt]}>
      {columns.map((col) => (
        <View key={col.key} style={styles.cell}>
          <Text style={styles.cellLabel}>{col.label}</Text>
          <Text style={styles.cellValue}>
            {col.render ? col.render(item[col.key], item) : (item[col.key] ?? '—')}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(item, idx) => String(item[keyField] ?? idx)}
      renderItem={renderItem}
      ListEmptyComponent={<Text style={styles.empty}>{emptyText}</Text>}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: { paddingBottom: SPACING.md },
  row: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    elevation: 1,
    shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4,
  },
  rowAlt: { backgroundColor: '#F9FBFF' },
  cell: { marginBottom: SPACING.xs },
  cellLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600', textTransform: 'uppercase' },
  cellValue: { fontSize: 13, color: COLORS.text, fontWeight: '500', marginTop: 2 },
  empty: { textAlign: 'center', color: COLORS.textSecondary, padding: SPACING.xl },
});

export default DataTable;
