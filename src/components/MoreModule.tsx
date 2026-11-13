import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { AMC_CONTRACTS, INITIAL_WORK_ORDERS, VENDORS } from '../data/mockData';
import { WorkOrder } from '../types/cafm';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  currentUser: { name: string; email: string; initials: string; role: string; color: string };
  onLogout: () => void;
  onRaiseCase: () => void;
}

export default function MoreModule({
  currentUser,
  onLogout,
  onRaiseCase,
}: Props) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [twoFactor, setTwoFactor] = useState(false);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);

  function toggleWorkOrderStatus(id: string) {
    setWorkOrders(prev =>
      prev.map(wo =>
        wo.id === id ? { ...wo, status: wo.status === 'Completed' ? 'In Progress' : 'Completed' } : wo
      )
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Header matching Image 2 & 3 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>More</Text>
        <View style={styles.headerRightIcons}>
          <View style={styles.bellWrap}>
            <Text style={{ fontSize: 18 }}>🔔</Text>
            <View style={styles.bellBadge} />
          </View>
          <Text style={{ fontSize: 18 }}>☀️</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>
        {/* Profile Card matching Image 3 */}
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={[styles.avatarCircle, { backgroundColor: currentUser.color || '#D8E9F7' }]}>
              <Text style={styles.avatarLetter}>{currentUser.initials || 'S'}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.profileName}>{currentUser.name}</Text>
              <Text style={styles.profileRole}>Account owner · Asset Investor</Text>
            </View>
          </View>

          <View style={styles.profileMetaList}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Email</Text>
              <Text style={styles.metaValue}>{currentUser.email}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Employee / ID</Text>
              <Text style={styles.metaValue}>TOPMANAGER-100</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionSubtitle}>Ask an administrator to correct any of these.</Text>

        {/* Menu Items List matching Image 2 & 3 */}
        <View style={styles.menuStack}>
          {/* Work Orders */}
          <Pressable
            onPress={() => setActiveModal('workOrders')}
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
          >
            <Text style={styles.menuIcon}>🔧</Text>
            <Text style={styles.menuTitle}>Work Orders</Text>
            <Text style={styles.menuChevron}>›</Text>
          </Pressable>

          {/* Materials */}
          <Pressable
            onPress={() => setActiveModal('materials')}
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
          >
            <Text style={styles.menuIcon}>📦</Text>
            <Text style={styles.menuTitle}>Materials & Inventory</Text>
            <Text style={styles.menuChevron}>›</Text>
          </Pressable>

          {/* Inspections */}
          <Pressable
            onPress={() => setActiveModal('inspections')}
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
          >
            <Text style={styles.menuIcon}>📋</Text>
            <Text style={styles.menuTitle}>Inspections</Text>
            <Text style={styles.menuChevron}>›</Text>
          </Pressable>

          {/* Maintenance Plans & AMC Contracts */}
          <Pressable
            onPress={() => setActiveModal('amc')}
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
          >
            <Text style={styles.menuIcon}>📅</Text>
            <Text style={styles.menuTitle}>AMC contracts & Maintenance plans</Text>
            <Text style={styles.menuChevron}>›</Text>
          </Pressable>

          {/* Vendors */}
          <Pressable
            onPress={() => setActiveModal('vendors')}
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
          >
            <Text style={styles.menuIcon}>🏢</Text>
            <Text style={styles.menuTitle}>Vendors & Contractors</Text>
            <Text style={styles.menuChevron}>›</Text>
          </Pressable>

          {/* Raise a case */}
          <Pressable
            onPress={onRaiseCase}
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
          >
            <Text style={styles.menuIcon}>➕</Text>
            <Text style={styles.menuTitle}>Raise a case</Text>
            <Text style={styles.menuChevron}>›</Text>
          </Pressable>

          {/* Notifications */}
          <Pressable
            onPress={() => Alert.alert('Notifications', 'All automated alerts for SLA warnings and expense alerts are active.')}
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
          >
            <Text style={styles.menuIcon}>🔔</Text>
            <Text style={styles.menuTitle}>Notifications</Text>
            <Text style={styles.menuChevron}>›</Text>
          </Pressable>

          {/* Two-Factor Sign-In */}
          <View style={styles.menuItem}>
            <Text style={styles.menuIcon}>🛡️</Text>
            <Text style={styles.menuTitle}>Two-factor sign-in</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 12, color: twoFactor ? '#059669' : '#64748B', fontWeight: '700' }}>
                {twoFactor ? 'On' : 'Off'}
              </Text>
              <Switch value={twoFactor} onValueChange={setTwoFactor} />
            </View>
          </View>

          {/* Sign Out */}
          <Pressable
            onPress={onLogout}
            style={({ pressed }) => [styles.menuItem, styles.signOutItem, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.signOutIcon}>🚪</Text>
            <Text style={styles.signOutTitle}>Sign out</Text>
            <Text style={styles.menuChevron}>›</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* ======================================================== */}
      {/* MODAL: WORK ORDERS                                       */}
      {/* ======================================================== */}
      <Modal visible={activeModal === 'workOrders'} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalView}>
          <View style={styles.modalNav}>
            <Text style={styles.modalHeading}>Active Work Orders</Text>
            <Pressable onPress={() => setActiveModal(null)}><Text style={styles.modalClose}>✕</Text></Pressable>
          </View>
          <ScrollView style={{ padding: 18 }}>
            {workOrders.map(wo => {
              const isDone = wo.status === 'Completed';
              return (
                <Pressable
                  key={wo.id}
                  onPress={() => toggleWorkOrderStatus(wo.id)}
                  style={[styles.modalCard, isDone && { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}
                >
                  <View style={styles.rowBetween}>
                    <Text style={styles.mTag}>{wo.id} · {wo.type}</Text>
                    <View style={[styles.mBadge, isDone ? styles.mBadgeDone : styles.mBadgeActive]}>
                      <Text style={[styles.mBadgeText, isDone && { color: '#059669' }]}>{wo.status}</Text>
                    </View>
                  </View>
                  <Text style={[styles.mTitle, isDone && { textDecorationLine: 'line-through', color: '#64748B' }]}>{wo.title}</Text>
                  <Text style={styles.mSub}>📍 {wo.apartment} · {wo.assetName}</Text>
                  <View style={styles.rowBetween}>
                    <Text style={styles.mSub}>Assigned: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{wo.assignedTo}</Text></Text>
                    <Text style={styles.mToggle}>{isDone ? '↺ Re-open' : '✓ Mark Complete'}</Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: AMC CONTRACTS                                     */}
      {/* ======================================================== */}
      <Modal visible={activeModal === 'amc'} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalView}>
          <View style={styles.modalNav}>
            <Text style={styles.modalHeading}>AMC Contracts</Text>
            <Pressable onPress={() => setActiveModal(null)}><Text style={styles.modalClose}>✕</Text></Pressable>
          </View>
          <ScrollView style={{ padding: 18 }}>
            <Text style={styles.amcIntro}>Annual Maintenance Contracts protect sub-assets (ACs, Lifts, RO plants) against major breakdown expenses.</Text>
            {AMC_CONTRACTS.map(amc => (
              <View key={amc.id} style={styles.modalCard}>
                <View style={styles.rowBetween}>
                  <Text style={styles.mTag}>{amc.id}</Text>
                  <View style={[styles.mBadge, styles.mBadgeDone]}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#059669' }}>{amc.status}</Text>
                  </View>
                </View>
                <Text style={styles.mTitle}>{amc.title}</Text>
                <Text style={styles.mSub}>Vendor: {amc.vendor}</Text>
                <Text style={styles.mSub}>Covered Units: {amc.coveredUnits}</Text>
                <View style={styles.rowBetween}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#0F766E' }}>₹{amc.annualFee.toLocaleString()}/yr</Text>
                  <Text style={{ fontSize: 11, color: '#64748B' }}>Expiry: {amc.expiry}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: VENDORS                                           */}
      {/* ======================================================== */}
      <Modal visible={activeModal === 'vendors'} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalView}>
          <View style={styles.modalNav}>
            <Text style={styles.modalHeading}>Contractor & Vendor Roster</Text>
            <Pressable onPress={() => setActiveModal(null)}><Text style={styles.modalClose}>✕</Text></Pressable>
          </View>
          <ScrollView style={{ padding: 18 }}>
            {VENDORS.map(v => (
              <View key={v.id} style={styles.modalCard}>
                <View style={styles.rowBetween}>
                  <Text style={styles.mTitle}>{v.name}</Text>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#D97706' }}>{v.rating}</Text>
                </View>
                <Text style={styles.mSub}>Specialty: {v.specialty}</Text>
                <Text style={styles.mSub}>Phone: {v.contact}</Text>
                <Text style={{ fontSize: 11, color: '#0284C7', fontWeight: '700', marginTop: 4 }}>{v.activeContracts} Active Contracts</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: MATERIALS                                         */}
      {/* ======================================================== */}
      <Modal visible={activeModal === 'materials'} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalView}>
          <View style={styles.modalNav}>
            <Text style={styles.modalHeading}>Materials & Spare Parts</Text>
            <Pressable onPress={() => setActiveModal(null)}><Text style={styles.modalClose}>✕</Text></Pressable>
          </View>
          <ScrollView style={{ padding: 18 }}>
            <Text style={styles.amcIntro}>Critical spare inventory maintained on-site to minimize equipment downtime.</Text>
            {[
              { name: 'Daikin AC Inverter Running Capacitor (45µF)', count: '6 pcs in stock', min: 'Min: 4' },
              { name: 'AO Smith Geyser Anode Rod & Heating Coil', count: '3 sets in stock', min: 'Min: 2' },
              { name: 'Schneider 16A Miniature Circuit Breaker (MCB)', count: '12 pcs in stock', min: 'Min: 8' },
              { name: 'Quarter-Turn Brass Ball Valve 1-inch', count: '8 pcs in stock', min: 'Min: 5' },
            ].map((mat, i) => (
              <View key={i} style={styles.modalCard}>
                <Text style={styles.mTitle}>{mat.name}</Text>
                <View style={styles.rowBetween}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#0F766E' }}>{mat.count}</Text>
                  <Text style={{ fontSize: 11, color: '#64748B' }}>{mat.min}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: INSPECTIONS                                       */}
      {/* ======================================================== */}
      <Modal visible={activeModal === 'inspections'} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalView}>
          <View style={styles.modalNav}>
            <Text style={styles.modalHeading}>Tenant Handover Audits</Text>
            <Pressable onPress={() => setActiveModal(null)}><Text style={styles.modalClose}>✕</Text></Pressable>
          </View>
          <ScrollView style={{ padding: 18 }}>
            <View style={styles.modalCard}>
              <Text style={styles.mTitle}>Unit 204 Pre-Handover Checklist</Text>
              <Text style={styles.mSub}>Tenant: Rahul Sharma · Palm Residency</Text>
              <View style={{ marginTop: 8, gap: 4 }}>
                <Text style={{ fontSize: 12, color: '#059669' }}>✓ All 3 ACs cooling test: Passed (19°C)</Text>
                <Text style={{ fontSize: 12, color: '#059669' }}>✓ Geyser thermal safety cutoff: Passed</Text>
                <Text style={{ fontSize: 12, color: '#059669' }}>✓ Wall paint & wooden door seals: Passed</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF9' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 14,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 },
  headerRightIcons: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  bellWrap: { position: 'relative' },
  bellBadge: { position: 'absolute', top: 0, right: 0, width: 7, height: 7, borderRadius: 4, backgroundColor: '#EF4444' },
  scrollPad: { padding: 18, paddingBottom: 60, maxWidth: 650, width: '100%', alignSelf: 'center' },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 12,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  profileName: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  profileRole: { fontSize: 12, color: '#64748B', marginTop: 2 },
  profileMetaList: { marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9', gap: 8 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metaLabel: { fontSize: 12, color: '#64748B' },
  metaValue: { fontSize: 12, fontWeight: '700', color: '#0F172A' },
  sectionSubtitle: { fontSize: 11, color: '#94A3B8', marginBottom: 16, paddingHorizontal: 4 },
  menuStack: { backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuItemPressed: { backgroundColor: '#F8FAFC' },
  menuIcon: { fontSize: 16, marginRight: 14 },
  menuTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: '#0F172A' },
  menuChevron: { fontSize: 18, color: '#CBD5E1' },
  signOutItem: { borderBottomWidth: 0 },
  signOutIcon: { fontSize: 16, marginRight: 14 },
  signOutTitle: { flex: 1, fontSize: 14, fontWeight: '800', color: '#DC2626' },

  // MODAL STYLING
  modalView: { flex: 1, backgroundColor: '#F8FAF9' },
  modalNav: {
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
  modalHeading: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  modalClose: { fontSize: 16, fontWeight: '800', color: '#64748B' },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 },
  mTag: { fontSize: 11, fontWeight: '800', color: '#0284C7' },
  mBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  mBadgeActive: { backgroundColor: '#EFF6FF' },
  mBadgeDone: { backgroundColor: '#DCFCE7' },
  mBadgeText: { fontSize: 10, fontWeight: '800', color: '#1D4ED8' },
  mTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginTop: 4 },
  mSub: { fontSize: 11, color: '#64748B', marginTop: 2 },
  mToggle: { fontSize: 11, color: '#0F766E', fontWeight: '800' },
  amcIntro: { fontSize: 12, color: '#64748B', marginBottom: 14, lineHeight: 18 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
});

