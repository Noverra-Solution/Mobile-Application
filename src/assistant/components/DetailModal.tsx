import React from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BuildingSpace, KnowledgeAsset, KnowledgeWorkOrder } from '../types/assistant';

interface Props {
  visible: boolean;
  onClose: () => void;
  space?: BuildingSpace | null;
  asset?: KnowledgeAsset | null;
  workOrder?: KnowledgeWorkOrder | null;
}

export default function DetailModal({
  visible,
  onClose,
  space,
  asset,
  workOrder,
}: Props) {
  if (!space && !asset && !workOrder) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>
              {space ? 'SPACE INSPECTION' : asset ? 'ASSET PROFILE' : 'WORK ORDER DETAIL'}
            </Text>
            <Text style={styles.title}>
              {space?.room || asset?.name || workOrder?.title}
            </Text>
          </View>
          <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.contentPad}>
          {/* SPACE DETAILS */}
          {space && (
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>SPACE INFRASTRUCTURE & MAPPING</Text>

              <View style={styles.row}>
                <Text style={styles.label}>Space Code / Tag:</Text>
                <Text style={styles.val}>{space.spaceIdentifier}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Site Name:</Text>
                <Text style={styles.val}>{space.site}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Building & Floor:</Text>
                <Text style={styles.val}>{space.building} / {space.floor}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Room Identifier:</Text>
                <Text style={styles.val}>{space.room}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Category:</Text>
                <Text style={styles.val}>{space.category}</Text>
              </View>

              {!!space.contactPerson && (
                <View style={styles.row}>
                  <Text style={styles.label}>Escort / Contact:</Text>
                  <Text style={styles.val}>{space.contactPerson}</Text>
                </View>
              )}

              <View style={styles.divider} />
              <Text style={styles.label}>ACCESS & LOCATION DESCRIPTION:</Text>
              <Text style={styles.descText}>{space.description || 'No additional notes provided.'}</Text>
            </View>
          )}

          {/* ASSET DETAILS */}
          {asset && (
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>ASSET LIFETIME & HEALTH PROFILE</Text>

              <View style={styles.row}>
                <Text style={styles.label}>Asset Tag / ID:</Text>
                <Text style={styles.val}>{asset.id}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Asset Name:</Text>
                <Text style={styles.val}>{asset.name}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Location:</Text>
                <Text style={styles.val}>{asset.location}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Category:</Text>
                <Text style={styles.val}>{asset.category}</Text>
              </View>

              {!!asset.brandModel && (
                <View style={styles.row}>
                  <Text style={styles.label}>Brand & Model:</Text>
                  <Text style={styles.val}>{asset.brandModel}</Text>
                </View>
              )}

              <View style={styles.row}>
                <Text style={styles.label}>Health Score Rating:</Text>
                <Text style={[styles.val, { color: asset.healthScore > 80 ? '#059669' : '#D97706' }]}>
                  {asset.healthScore}% Healthy
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Warranty / AMC Status:</Text>
                <Text style={styles.val}>{asset.warrantyStatus}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Assigned Provider:</Text>
                <Text style={styles.val}>{asset.assignedProvider}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Last Service Date:</Text>
                <Text style={styles.val}>{asset.lastServiceDate}</Text>
              </View>
            </View>
          )}

          {/* WORK ORDER DETAILS */}
          {workOrder && (
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>WORK ORDER SPECIFICATION</Text>

              <View style={styles.row}>
                <Text style={styles.label}>Ticket Reference ID:</Text>
                <Text style={styles.val}>{workOrder.id}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Work Order Type:</Text>
                <Text style={styles.val}>{workOrder.type}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Current Status:</Text>
                <Text style={styles.val}>{workOrder.status}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Priority Level:</Text>
                <Text style={styles.val}>{workOrder.priority}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Location / Space:</Text>
                <Text style={styles.val}>{workOrder.apartmentOrSpace}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Assigned Technician:</Text>
                <Text style={styles.val}>{workOrder.assignedTo}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Target Due Date:</Text>
                <Text style={styles.val}>{workOrder.dueDate}</Text>
              </View>

              {workOrder.cost !== undefined && (
                <View style={styles.row}>
                  <Text style={styles.label}>Estimated Cost:</Text>
                  <Text style={[styles.val, { color: '#0F766E' }]}>₹{workOrder.cost.toLocaleString()}</Text>
                </View>
              )}
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 24 : 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  eyebrow: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#64748B',
  },
  contentPad: {
    padding: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0F766E',
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  label: {
    fontSize: 12,
    color: '#64748B',
  },
  val: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    maxWidth: '60%',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  descText: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 19,
    marginTop: 6,
  },
});
