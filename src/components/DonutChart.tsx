import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface DonutChartProps {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export default function DonutChart({ critical, high, medium, low }: DonutChartProps) {
  const total = critical + high + medium + low;

  // Percentage calculations
  const pCritical = total > 0 ? (critical / total) * 100 : 0;
  const pHigh = total > 0 ? (high / total) * 100 : 0;
  const pMedium = total > 0 ? (medium / total) * 100 : 0;
  const pLow = total > 0 ? (low / total) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Donut representation */}
      <View style={styles.donutRing}>
        {/* Outer segmented ring borders */}
        <View style={[styles.segmentQuarter, styles.segmentTopRight]} />
        <View style={[styles.segmentQuarter, styles.segmentBottomRight]} />
        <View style={[styles.segmentQuarter, styles.segmentBottomLeft]} />
        <View style={[styles.segmentQuarter, styles.segmentTopLeft]} />

        {/* Center cutout */}
        <View style={styles.donutHole}>
          <Text style={styles.totalNumber}>{total}</Text>
          <Text style={styles.totalLabel}>Total</Text>
        </View>
      </View>

      {/* Legend list matching the reference image */}
      <View style={styles.legendContainer}>
        <View style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: '#DC2626' }]} />
          <Text style={styles.legendLabel}>Critical</Text>
          <Text style={styles.legendCount}>{critical}</Text>
        </View>

        <View style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: '#EA580C' }]} />
          <Text style={styles.legendLabel}>High</Text>
          <Text style={styles.legendCount}>{high}</Text>
        </View>

        <View style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: '#FACC15' }]} />
          <Text style={styles.legendLabel}>Medium</Text>
          <Text style={styles.legendCount}>{medium}</Text>
        </View>

        <View style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: '#94A3B8' }]} />
          <Text style={styles.legendLabel}>Low</Text>
          <Text style={styles.legendCount}>{low}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  donutRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 14,
    borderColor: '#FACC15', // yellow dominant
    borderTopColor: '#DC2626', // red critical
    borderRightColor: '#EA580C', // orange high
    borderLeftColor: '#94A3B8', // low grey/blue
  },
  segmentQuarter: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  segmentTopRight: {},
  segmentBottomRight: {},
  segmentBottomLeft: {},
  segmentTopLeft: {},
  donutHole: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 28,
  },
  totalLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: -2,
  },
  legendContainer: {
    flex: 1,
    marginLeft: 26,
    gap: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 10,
  },
  legendLabel: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    flex: 1,
  },
  legendCount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
});

