import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { KnowledgeWorkOrder } from '../types/assistant';

interface Props {
  workOrder: KnowledgeWorkOrder;
  onInspect?: (workOrder: KnowledgeWorkOrder) => void;
}

export default function WorkOrderCard({ workOrder, onInspect }: Props) {
  const isDone = workOrder.status === 'Completed';

  const priorityColor =
    workOrder.priority === 'Critical'
      ? '#DC2626'
      : workOrder.priority === 'High'
      ? '#EA580C'
      : workOrder.priority === 'Medium'
      ? '#D97706'
      : '#166534';

  return (
    <View style={[styles.card, isDone && styles.cardDone]}>
      <View style={styles.topRow}>
        <Text style={styles.woId}>{workOrder.id} · {workOrder.type}</Text>
        <View style={[styles.statusBadge, isDone ? styles.bgDone : styles.bgActive]}>
          <Text style={[styles.statusText, isDone && { color: '#059669' }]}>
            {workOrder.status}
          </Text>
        </View>
      </View>

      <Text style={[styles.title, isDone && styles.textLineThrough]}>
        {workOrder.title}
      </Text>

      <Text style={styles.location}>📍 {workOrder.apartmentOrSpace}</Text>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Assigned Technician:</Text>
        <Text style={styles.infoVal}>{workOrder.assignedTo}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Priority & SLA Due:</Text>
        <Text style={[styles.infoVal, { color: priorityColor }]}>
          {workOrder.priority} Priority · Due {workOrder.dueDate}
        </Text>
      </View>

      {onInspect && (
        <Pressable
          onPress={() => onInspect(workOrder)}
          style={({ pressed }) => [styles.inspectBtn, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.inspectBtnText}>Inspect Work Order Details ↗</Text>
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
  cardDone: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  woId: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bgActive: { backgroundColor: '#EFF6FF' },
  bgDone: { backgroundColor: '#DCFCE7' },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  title: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 6,
  },
  textLineThrough: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  location: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  infoLabel: {
    fontSize: 10.5,
    color: '#94A3B8',
  },
  infoVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  inspectBtn: {
    marginTop: 10,
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
