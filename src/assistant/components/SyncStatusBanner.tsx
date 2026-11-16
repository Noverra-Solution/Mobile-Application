import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  lastSyncTime?: string;
  isOffline?: boolean;
}

export default function SyncStatusBanner({
  lastSyncTime = '12 Nov 2026, 08:30 AM',
  isOffline = true,
}: Props) {
  return (
    <View style={styles.bannerContainer}>
      <View style={styles.leftGroup}>
        <View style={styles.statusDot} />
        <Text style={styles.statusTitle}>
          {isOffline ? 'OFFLINE KNOWLEDGE ACTIVE' : 'ONLINE SYNC ACTIVE'}
        </Text>
      </View>
      <Text style={styles.syncMeta}>
        Local DB · Last sync: <Text style={{ fontWeight: '700' }}>{lastSyncTime}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: '#F0FDF4',
    borderBottomWidth: 1,
    borderBottomColor: '#DCFCE7',
    paddingHorizontal: 16,
    paddingVertical: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  statusTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.8,
  },
  syncMeta: {
    fontSize: 10,
    color: '#166534',
  },
});
