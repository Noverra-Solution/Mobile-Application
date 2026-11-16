import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BuildingSpace } from '../types/assistant';

interface Props {
  space: BuildingSpace;
  onInspect?: (space: BuildingSpace) => void;
}

export default function SpaceCard({ space, onInspect }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.tagWrap}>
          <Text style={styles.tagText}>🏢 {space.spaceIdentifier}</Text>
        </View>
        <Text style={styles.categoryBadge}>{space.category}</Text>
      </View>

      <Text style={styles.title}>
        {space.building} · {space.floor} · {space.room}
      </Text>
      <Text style={styles.siteSub}>Site: {space.site}</Text>

      {!!space.description && (
        <Text style={styles.descText} numberOfLines={2}>
          {space.description}
        </Text>
      )}

      {!!space.contactPerson && (
        <Text style={styles.contactSub}>
          Escort / Contact: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{space.contactPerson}</Text>
        </Text>
      )}

      {onInspect && (
        <Pressable
          onPress={() => onInspect(space)}
          style={({ pressed }) => [styles.inspectBtn, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.inspectBtnText}>Inspect Space Details ↗</Text>
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
  tagWrap: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 6,
  },
  siteSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  descText: {
    fontSize: 12,
    color: '#334155',
    marginTop: 8,
    lineHeight: 17,
  },
  contactSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 6,
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
    color: '#0284C7',
  },
});
