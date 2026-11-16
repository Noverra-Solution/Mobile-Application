import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  currentUser: { name: string; email: string; initials: string; role: string; color: string };
  onLogout: () => void;
  onOpenAssistant?: () => void;
}

export default function ServiceProviderModule({ currentUser, onLogout, onOpenAssistant }: Props) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'jobs' | 'quotes' | 'invoices'>('dashboard');

  // Entrance Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
    ]).start();
  }, [activeTab]);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoWrap}>
            <Image source={require('../../assets/nexus-emblem.png')} style={styles.emblemImg} resizeMode="contain" />
          </View>
          <View>
            <Text style={styles.brandName}>noverra<Text style={{ color: '#06B6D4' }}>.</Text></Text>
            <View style={styles.roleTagPill}>
              <Text style={styles.roleTagText}>🏢 CONTRACTOR & SERVICE PROVIDER PORTAL</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerRightGroup}>
          {onOpenAssistant && (
            <Pressable onPress={onOpenAssistant} style={styles.assistantBtn}>
              <Text style={{ fontSize: 13 }}>🤖</Text>
              <Text style={styles.assistantBtnText}>AI Assistant</Text>
            </Pressable>
          )}

          <Pressable onPress={onLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutBtnText}>Sign out 🚪</Text>
          </Pressable>
        </View>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.navBar}>
        {[
          { id: 'dashboard', label: '📊 Contractor Dashboard' },
          { id: 'jobs', label: '🔧 Assigned Jobs (3)' },
          { id: 'quotes', label: '📑 Quotations & Approvals' },
          { id: 'invoices', label: '💳 Invoices & Payments' },
        ].map(t => (
          <Pressable
            key={t.id}
            onPress={() => setActiveTab(t.id as any)}
            style={[styles.navItem, activeTab === t.id && styles.navItemActive]}
          >
            <Text style={[styles.navItemText, activeTab === t.id && styles.navItemTextActive]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'dashboard' && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.vendorCard}>
              <Text style={styles.vendorSmall}>Authorized Service Provider Organization,</Text>
              <Text style={styles.vendorName}>CoolAir HVAC Solutions (4.9 ★)</Text>
              <Text style={styles.vendorSub}>Primary HVAC & Airconditioning Maintenance Contractor</Text>
            </View>

            {/* KPI Overview */}
            <View style={styles.kpiGrid}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiNum}>3</Text>
                <Text style={styles.kpiLabel}>Active Contracts</Text>
                <View style={[styles.kpiBar, { backgroundColor: '#06B6D4' }]} />
              </View>

              <View style={styles.kpiCard}>
                <Text style={[styles.kpiNum, { color: '#10B981' }]}>100%</Text>
                <Text style={styles.kpiLabel}>SLA Performance</Text>
                <View style={[styles.kpiBar, { backgroundColor: '#10B981' }]} />
              </View>

              <View style={styles.kpiCard}>
                <Text style={[styles.kpiNum, { color: '#F59E0B' }]}>₹48.0k</Text>
                <Text style={styles.kpiLabel}>Annual AMC Fee</Text>
                <View style={[styles.kpiBar, { backgroundColor: '#F59E0B' }]} />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Allocated Maintenance Jobs</Text>
            {[
              { id: 'WO-2026-0101', title: 'VRV Multi-Split Compressor Capacitors Overhaul', loc: 'Penthouse 501', status: 'In Progress' },
              { id: 'WO-2026-0103', title: 'Semi-Annual AC AMC Filter Clean & Coil Sanitization', loc: 'Unit 101', status: 'In Progress' },
            ].map((j, i) => (
              <View key={i} style={styles.jobCard}>
                <Text style={styles.jId}>{j.id} · {j.loc}</Text>
                <Text style={styles.jTitle}>{j.title}</Text>
                <Text style={styles.jStatus}>Status: {j.status}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* TAB 2: ASSIGNED JOBS */}
        {activeTab === 'jobs' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Work Orders Allocated to Contractor</Text>
            {[
              { id: 'WO-2026-0101', title: 'VRV Multi-Split Compressor Capacitors Overhaul', loc: 'Penthouse 501', status: 'In Progress' },
              { id: 'WO-2026-0103', title: 'Semi-Annual AC AMC Filter Clean & Coil Sanitization', loc: 'Unit 101', status: 'In Progress' },
            ].map((j, i) => (
              <View key={i} style={styles.jobCard}>
                <Text style={styles.jId}>{j.id} · {j.loc}</Text>
                <Text style={styles.jTitle}>{j.title}</Text>
                <Pressable onPress={() => Alert.alert('Check-In Recorded 📍', `On-Site Check-In logged for ${j.id}.`)} style={styles.checkInBtn}>
                  <Text style={styles.checkInBtnText}>📍 On-Site Check-In</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* TAB 3: QUOTATIONS */}
        {activeTab === 'quotes' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Submitted Quotations & Scope Approvals</Text>
            <View style={styles.quoteCard}>
              <Text style={styles.qTitle}>Quote #REQ-2026-88: VRV Outdoor PCB Overhaul</Text>
              <Text style={styles.qCost}>Quoted Amount: ₹14,500.00</Text>
              <Text style={styles.qStatus}>Status: Pending Owner Sign-off</Text>
            </View>
          </View>
        )}

        {/* TAB 4: INVOICES */}
        {activeTab === 'invoices' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Contractor Invoices & Payment Status</Text>
            <View style={styles.invoiceCard}>
              <Text style={styles.invTitle}>Invoice #INV-2026-1104 (AMC Q3 Billing)</Text>
              <Text style={styles.invAmount}>₹24,000.00</Text>
              <Text style={styles.invStatus}>Status: Approved for Disbursement</Text>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingTop: Platform.OS === 'android' ? 18 : 10, paddingBottom: 12, backgroundColor: '#0F172A' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoWrap: { width: 32, height: 32, borderRadius: 9, backgroundColor: '#070A0F', padding: 2, justifyContent: 'center', alignItems: 'center' },
  emblemImg: { width: '100%', height: '100%' },
  brandName: { fontSize: 22, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.8 },
  roleTagPill: { backgroundColor: 'rgba(6, 182, 212, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginTop: 1 },
  roleTagText: { fontSize: 8.5, fontWeight: '900', color: '#06B6D4', letterSpacing: 0.8 },
  headerRightGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  assistantBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(240, 253, 250, 0.15)', borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.4)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14 },
  assistantBtnText: { fontSize: 11, fontWeight: '800', color: '#00F0FF' },
  logoutBtn: { backgroundColor: 'rgba(255, 255, 255, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  logoutBtnText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },

  navBar: { flexDirection: 'row', backgroundColor: '#070C12', paddingHorizontal: 10, paddingVertical: 6 },
  navItem: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 6 },
  navItemActive: { backgroundColor: '#06B6D4' },
  navItemText: { fontSize: 11, fontWeight: '700', color: '#94A3B8' },
  navItemTextActive: { color: '#070C12', fontWeight: '900' },

  scrollContent: { padding: 18, maxWidth: 680, width: '100%', alignSelf: 'center' },
  vendorCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 14 },
  vendorSmall: { fontSize: 12, color: '#64748B' },
  vendorName: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  vendorSub: { fontSize: 12, color: '#06B6D4', fontWeight: '700', marginTop: 2 },

  kpiGrid: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  kpiCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', position: 'relative', overflow: 'hidden' },
  kpiNum: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  kpiLabel: { fontSize: 9.5, color: '#64748B', fontWeight: '700', marginTop: 2, textAlign: 'center' },
  kpiBar: { position: 'absolute', bottom: 0, left: 8, right: 8, height: 3, borderRadius: 2 },

  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#0F172A', marginVertical: 10 },
  jobCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 10 },
  jId: { fontSize: 11, fontWeight: '800', color: '#0284C7' },
  jTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginTop: 4 },
  jStatus: { fontSize: 11, color: '#0F766E', fontWeight: '700', marginTop: 2 },
  checkInBtn: { backgroundColor: '#0F766E', paddingVertical: 8, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  checkInBtnText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },

  tabContent: { gap: 12 },
  quoteCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  qTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  qCost: { fontSize: 13, fontWeight: '900', color: '#0F766E', marginTop: 4 },
  qStatus: { fontSize: 11, color: '#D97706', fontWeight: '700', marginTop: 2 },

  invoiceCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  invTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  invAmount: { fontSize: 20, fontWeight: '900', color: '#10B981', marginTop: 4 },
  invStatus: { fontSize: 11, color: '#059669', fontWeight: '700', marginTop: 2 },
});
