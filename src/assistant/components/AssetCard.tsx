import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { KnowledgeAsset } from '../types/assistant';

interface Props {
  asset: KnowledgeAsset;
  onInspect?: (asset: KnowledgeAsset) => void;
}

export default function AssetCard({ asset, onInspect }: Props) {
  const healthColor =
    asset.healthScore >= 85 ? '#059669' : asset.healthScore >= 70 ? '#D97706' : '#DC2626';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.catBadge}>
          <Text style={styles.catText}>{asset.category}</Text>
        </View>
        <View style={styles.healthRow}>
          <Text style={[styles.healthScoreText, { color: healthColor }]}>
            {asset.healthScore}% Health
          </Text>
        </View>
      </View>

      <Text style={styles.name}>{asset.name}</Text>
      <Text style={styles.location}>📍 {asset.location}</Text>

      {!!asset.brandModel && (
        <Text style={styles.modelText}>Model: {asset.brandModel}</Text>
      )}

      <View style={styles.metaDivider} />

      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Assigned Service Provider:</Text>
        <Text style={styles.metaVal}>{asset.assignedProvider}</Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Warranty / AMC Status:</Text>
        <Text style={[styles.metaVal, { color: asset.warrantyStatus.includes('Expired') ? '#DC2626' : '#0F766E' }]}>
          {asset.warrantyStatus}
        </Text>
      </View>

      {onInspect && (
        <Pressable
          onPress={() => onInspect(asset)}
          style={({ pressed }) => [styles.inspectBtn, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.inspectBtnText}>Inspect Asset Details ↗</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
    marginBottom: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catBadge: {
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  catText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F766E',
  },
  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthScoreText: {
    fontSize: 11,
    fontWeight: '800',
  },
  name: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 6,
  },
  location: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  modelText: {
    fontSize: 11,
    color: '#334155',
    marginTop: 4,
  },
  metaDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  metaRow: {
    marginTop: 3,
  },
  metaLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
  },
  metaVal: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  inspectBtn: {
    marginTop: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  inspectBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F766E',
  },
});
