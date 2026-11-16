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
import { AMC_CONTRACTS, INITIAL_CASES, VENDORS } from '../data/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  currentUser: { name: string; email: string; initials: string; role: string; color: string };
  onLogout: () => void;
  onOpenAssistant?: () => void;
}

export default function AdminModule({ currentUser, onLogout, onOpenAssistant }: Props) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'ppm' | 'inventory' | 'reports'>('dashboard');

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
            <Text style={styles.brandName}>noverra<Text style={{ color: '#8B5CF6' }}>.</Text></Text>
            <View style={styles.roleTagPill}>
              <Text style={styles.roleTagText}>⚡ SYSTEM ADMIN CONTROL PANEL</Text>
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
          { id: 'dashboard', label: '📊 Executive Control' },
          { id: 'users', label: '👥 Users & Roles' },
          { id: 'ppm', label: '📅 PPM & Assets' },
          { id: 'inventory', label: '📦 Stock & Orders' },
          { id: 'reports', label: '📈 Audit & SLA' },
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
            <View style={styles.adminCard}>
              <Text style={styles.adminSmall}>Portfolio System Administrator,</Text>
              <Text style={styles.adminName}>{currentUser.name}</Text>
              <Text style={styles.adminSub}>Full Governance & System Configuration</Text>
            </View>

            {/* KPI Overview */}
            <View style={styles.kpiGrid}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiNum}>12</Text>
                <Text style={styles.kpiLabel}>Managed Units</Text>
                <View style={[styles.kpiBar, { backgroundColor: '#8B5CF6' }]} />
              </View>

              <View style={styles.kpiCard}>
                <Text style={[styles.kpiNum, { color: '#00F0FF' }]}>16</Text>
                <Text style={styles.kpiLabel}>Total Cases</Text>
                <View style={[styles.kpiBar, { backgroundColor: '#00F0FF' }]} />
              </View>

              <View style={styles.kpiCard}>
                <Text style={[styles.kpiNum, { color: '#10B981' }]}>₹5.76L</Text>
                <Text style={styles.kpiLabel}>Monthly Rent</Text>
                <View style={[styles.kpiBar, { backgroundColor: '#10B981' }]} />
              </View>

              <View style={styles.kpiCard}>
                <Text style={[styles.kpiNum, { color: '#F59E0B' }]}>₹52.4k</Text>
                <Text style={styles.kpiLabel}>Capex Spent</Text>
                <View style={[styles.kpiBar, { backgroundColor: '#F59E0B' }]} />
              </View>
            </View>

            <Text style={styles.sectionTitle}>System Governance & Quick Administration</Text>
            <View style={styles.adminActionsStack}>
              {[
                { title: 'User & Role Permissions (RBAC)', sub: 'Manage owners, supervisors, technicians, tenants & contractors' },
                { title: 'Property & Asset Explorer', sub: 'Site ➔ Building ➔ Floor ➔ Unit ➔ Asset hierarchy' },
                { title: 'SLA & Escalation Matrix', sub: '1h Critical Emergency, 4h High SLA deadlines' },
                { title: 'Inventory & Spare Procurement', sub: 'Stock levels, re-order alerts, purchase requisitions' },
              ].map((act, i) => (
                <View key={i} style={styles.actCard}>
                  <Text style={styles.actTitle}>{act.title}</Text>
                  <Text style={styles.actSub}>{act.sub}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* TAB 2: USERS & ROLES */}
        {activeTab === 'users' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Role-Based Access Control (RBAC) & Users</Text>
            {[
              { name: 'Anto', role: 'Real Estate Asset Owner', email: 'anto@gmail.com' },
              { name: 'Rufin', role: 'Portfolio Manager & Admin', email: 'rufin@gmail.com' },
              { name: 'Victer Manuel', role: 'Facility Supervisor', email: 'victer@gmail.com' },
              { name: 'Ramesh Kumar', role: 'Field Technician', email: 'ramesh@gmail.com' },
              { name: 'Anand Varma', role: 'Tenant / Resident', email: 'anand@gmail.com' },
              { name: 'CoolAir Solutions', role: 'Contractor / Service Provider', email: 'contractor@noverra.com' },
            ].map((u, i) => (
              <View key={i} style={styles.userCard}>
                <Text style={styles.uName}>{u.name}</Text>
                <Text style={styles.uRole}>{u.role} ({u.email})</Text>
              </View>
            ))}
          </View>
        )}

        {/* TAB 3: PPM & ASSETS */}
        {activeTab === 'ppm' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Preventive Maintenance (PPM) Auto-Schedules</Text>
            {AMC_CONTRACTS.map(amc => (
              <View key={amc.id} style={styles.ppmCard}>
                <Text style={styles.ppmTitle}>{amc.title}</Text>
                <Text style={styles.ppmSub}>Vendor: {amc.vendor} · Covered: {amc.coveredUnits}</Text>
              </View>
            ))}
          </View>
        )}

        {/* TAB 4: INVENTORY */}
        {activeTab === 'inventory' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Critical Spare Parts & Stock Levels</Text>
            {[
              { name: 'Daikin AC Inverter Running Capacitor (45µF)', count: '6 pcs in stock', min: 'Min: 4' },
              { name: 'AO Smith Geyser Anode Rod & Heating Coil', count: '3 sets in stock', min: 'Min: 2' },
              { name: 'Schneider 16A Miniature Circuit Breaker (MCB)', count: '12 pcs in stock', min: 'Min: 8' },
            ].map((mat, i) => (
              <View key={i} style={styles.stockCard}>
                <Text style={styles.stockTitle}>{mat.name}</Text>
                <Text style={styles.stockSub}>{mat.count} · {mat.min}</Text>
              </View>
            ))}
          </View>
        )}

        {/* TAB 5: REPORTS & AUDIT */}
        {activeTab === 'reports' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>System Audit Logs & SLA Analytics</Text>
            <View style={styles.reportCard}>
              <Text style={styles.reportTitle}>100% SLA Compliance Verified</Text>
              <Text style={styles.reportSub}>0 Breaches in the last 30 days. Average resolution time: 2.4 hours.</Text>
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
  roleTagPill: { backgroundColor: 'rgba(139, 92, 246, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginTop: 1 },
  roleTagText: { fontSize: 8.5, fontWeight: '900', color: '#A78BFA', letterSpacing: 0.8 },
  headerRightGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  assistantBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(240, 253, 250, 0.15)', borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.4)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14 },
  assistantBtnText: { fontSize: 11, fontWeight: '800', color: '#00F0FF' },
  logoutBtn: { backgroundColor: 'rgba(255, 255, 255, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  logoutBtnText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },

  navBar: { flexDirection: 'row', backgroundColor: '#070C12', paddingHorizontal: 10, paddingVertical: 6 },
  navItem: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 6 },
  navItemActive: { backgroundColor: '#8B5CF6' },
  navItemText: { fontSize: 11, fontWeight: '700', color: '#94A3B8' },
  navItemTextActive: { color: '#FFFFFF', fontWeight: '900' },

  scrollContent: { padding: 18, maxWidth: 680, width: '100%', alignSelf: 'center' },
  adminCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 14 },
  adminSmall: { fontSize: 12, color: '#64748B' },
  adminName: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  adminSub: { fontSize: 12, color: '#8B5CF6', fontWeight: '700', marginTop: 2 },

  kpiGrid: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  kpiCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', position: 'relative', overflow: 'hidden' },
  kpiNum: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  kpiLabel: { fontSize: 9.5, color: '#64748B', fontWeight: '700', marginTop: 2, textAlign: 'center' },
  kpiBar: { position: 'absolute', bottom: 0, left: 8, right: 8, height: 3, borderRadius: 2 },

  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#0F172A', marginVertical: 10 },
  adminActionsStack: { gap: 10 },
  actCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  actTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  actSub: { fontSize: 11.5, color: '#64748B', marginTop: 2 },

  tabContent: { gap: 12 },
  userCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  uName: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  uRole: { fontSize: 11.5, color: '#64748B', marginTop: 2 },

  ppmCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  ppmTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  ppmSub: { fontSize: 11.5, color: '#64748B', marginTop: 2 },

  stockCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  stockTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  stockSub: { fontSize: 11.5, color: '#0F766E', fontWeight: '700', marginTop: 2 },

  reportCard: { backgroundColor: '#F0FDFA', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#CCFBF1' },
  reportTitle: { fontSize: 14, fontWeight: '800', color: '#0F766E' },
  reportSub: { fontSize: 12, color: '#334155', marginTop: 4 },
});
