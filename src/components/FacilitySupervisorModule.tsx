import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { INITIAL_CASES } from '../data/mockData';
import { ServiceCase } from '../types/cafm';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  currentUser: { name: string; email: string; initials: string; role: string; color: string };
  onLogout: () => void;
  onOpenAssistant?: () => void;
}

export default function FacilitySupervisorModule({ currentUser, onLogout, onOpenAssistant }: Props) {
  const [cases, setCases] = useState<ServiceCase[]>(INITIAL_CASES);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'triage' | 'verification' | 'technicians' | 'ppm'>('dashboard');
  const [selectedCase, setSelectedCase] = useState<ServiceCase | null>(null);

  // Verification & Rework State
  const [reworkFeedback, setReworkFeedback] = useState('');

  // Entrance Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
    ]).start();
  }, [activeTab]);

  const openCases = cases.filter(c => c.status === 'Open' || c.status === 'Under review');
  const pendingVerificationCases = cases.filter(c => c.status === 'Under review' || c.status === 'Assigned');
  const overdueCases = cases.filter(c => c.status === 'Overdue');

  function handleVerifyAndClose(id: string) {
    setCases(prev =>
      prev.map(c => (c.id === id ? { ...c, status: 'Resolved' } : c))
    );
    setSelectedCase(null);
    Alert.alert('Work Verified & Ticket Closed! ✅', `Case ${id} evidence verified. Quality report logged.`);
  }

  function handleRequestRework(id: string) {
    if (!reworkFeedback.trim()) {
      Alert.alert('Feedback Required', 'Please specify what needs correction before returning job for rework.');
      return;
    }
    setCases(prev =>
      prev.map(c => (c.id === id ? { ...c, status: 'In progress', description: c.description + `\n[SUPERVISOR REWORK NOTE]: ${reworkFeedback.trim()}` } : c))
    );
    setSelectedCase(null);
    setReworkFeedback('');
    Alert.alert('Rework Requested', `Ticket ${id} returned to assigned technician with feedback notes.`);
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoWrap}>
            <Image source={require('../../assets/nexus-emblem.png')} style={styles.emblemImg} resizeMode="contain" />
          </View>
          <View>
            <Text style={styles.brandName}>noverra<Text style={{ color: '#F59E0B' }}>.</Text></Text>
            <View style={styles.roleTagPill}>
              <Text style={styles.roleTagText}>📋 FACILITY SUPERVISOR PORTAL</Text>
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
          { id: 'dashboard', label: '📊 Supervisor Overview' },
          { id: 'triage', label: `📥 Case Triage (${openCases.length})` },
          { id: 'verification', label: `✓ Verification (${pendingVerificationCases.length})` },
          { id: 'technicians', label: '👥 Field Roster' },
          { id: 'ppm', label: '📅 Preventive Maintenance' },
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
        {/* TAB 1: SUPERVISOR DASHBOARD */}
        {activeTab === 'dashboard' && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.supervisorCard}>
              <Text style={styles.supSmall}>Site Operations Manager,</Text>
              <Text style={styles.supName}>{currentUser.name}</Text>
              <Text style={styles.supSub}>Palm Residency & Building 2 Campus</Text>
            </View>

            {/* KPI Metrics */}
            <View style={styles.kpiGrid}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiNum}>{cases.length}</Text>
                <Text style={styles.kpiLabel}>Total Cases</Text>
                <View style={[styles.kpiBar, { backgroundColor: '#0284C7' }]} />
              </View>

              <View style={styles.kpiCard}>
                <Text style={[styles.kpiNum, { color: '#F59E0B' }]}>{openCases.length}</Text>
                <Text style={styles.kpiLabel}>Triage Pending</Text>
                <View style={[styles.kpiBar, { backgroundColor: '#F59E0B' }]} />
              </View>

              <View style={styles.kpiCard}>
                <Text style={[styles.kpiNum, { color: '#DC2626' }]}>{overdueCases.length}</Text>
                <Text style={styles.kpiLabel}>SLA Overdue</Text>
                <View style={[styles.kpiBar, { backgroundColor: '#DC2626' }]} />
              </View>

              <View style={styles.kpiCard}>
                <Text style={[styles.kpiNum, { color: '#10B981' }]}>{cases.filter(c => c.status === 'Resolved').length}</Text>
                <Text style={styles.kpiLabel}>Verified Closed</Text>
                <View style={[styles.kpiBar, { backgroundColor: '#10B981' }]} />
              </View>
            </View>

            {/* OVERDUE SLA ALERTS */}
            {overdueCases.length > 0 && (
              <View style={styles.overdueAlertCard}>
                <Text style={styles.overdueTitle}>⚠️ SLA OVERDUE ESCALATIONS ({overdueCases.length})</Text>
                {overdueCases.map(c => (
                  <View key={c.id} style={styles.overdueRow}>
                    <Text style={styles.overdueTicket}>{c.id} · {c.title}</Text>
                    <Text style={styles.overdueTech}>Assigned: {c.assignedTechnician || 'Unassigned'}</Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.sectionTitle}>Cases Awaiting Triage & Technician Allocation</Text>
            <View style={styles.casesList}>
              {openCases.map(c => (
                <Pressable key={c.id} onPress={() => setSelectedCase(c)} style={styles.caseCard}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.cId}>{c.id}</Text>
                    <Text style={styles.cPri}>{c.priority} Priority</Text>
                  </View>
                  <Text style={styles.cTitle}>{c.title}</Text>
                  <Text style={styles.cLoc}>📍 {c.location || 'Block A'}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}

        {/* TAB 2: CASE TRIAGE */}
        {activeTab === 'triage' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Case Review, Prioritization & Dispatch</Text>
            {openCases.map(c => (
              <Pressable key={c.id} onPress={() => setSelectedCase(c)} style={styles.caseCard}>
                <Text style={styles.cId}>{c.id} · {c.category}</Text>
                <Text style={styles.cTitle}>{c.title}</Text>
                <Text style={styles.cLoc}>📍 {c.location}</Text>
                <Pressable onPress={() => Alert.alert('Dispatched 🚀', `Work Order created for ${c.id}. Technician allocated.`)} style={styles.dispatchBtn}>
                  <Text style={styles.dispatchBtnText}>+ Create Work Order & Dispatch ↗</Text>
                </Pressable>
              </Pressable>
            ))}
          </View>
        )}

        {/* TAB 3: VERIFICATION */}
        {activeTab === 'verification' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Completion Verification & Quality Checks</Text>
            {pendingVerificationCases.map(c => (
              <View key={c.id} style={styles.verifyCard}>
                <Text style={styles.cId}>{c.id} · {c.category}</Text>
                <Text style={styles.cTitle}>{c.title}</Text>
                <Text style={styles.cLoc}>Technician: {c.assignedTechnician}</Text>
                <View style={styles.verifyActionsRow}>
                  <Pressable onPress={() => handleRequestRework(c.id)} style={styles.reworkBtn}>
                    <Text style={styles.reworkBtnText}>↺ Request Rework</Text>
                  </Pressable>
                  <Pressable onPress={() => handleVerifyAndClose(c.id)} style={styles.verifyBtn}>
                    <Text style={styles.verifyBtnText}>✓ Verify & Close ↗</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* TAB 4: FIELD ROSTER */}
        {activeTab === 'technicians' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Field Technician & Contractor Roster</Text>
            {[
              { name: 'Ramesh Kumar', role: 'HVAC Specialist', status: 'On Duty (1 Active Job)', phone: '+91 98401 11223' },
              { name: 'Sunil Master', role: 'Master Plumber', status: 'Available', phone: '+91 98402 33445' },
              { name: 'Arun Krishnan', role: 'Senior Electrician', status: 'On Call', phone: '+91 98403 55667' },
              { name: 'Dinesh Prakash', role: 'Carpentry Tech', status: 'Available', phone: '+91 98404 77889' },
            ].map((tech, i) => (
              <View key={i} style={styles.techCard}>
                <View style={styles.rowBetween}>
                  <View>
                    <Text style={styles.techName}>{tech.name}</Text>
                    <Text style={styles.techRole}>{tech.role} · {tech.status}</Text>
                  </View>
                  <Pressable onPress={() => Linking.openURL(`tel:${tech.phone.replace(/\s+/g, '')}`)} style={styles.callBtn}>
                    <Text style={styles.callBtnText}>📞 Call</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* TAB 5: PREVENTIVE MAINTENANCE */}
        {activeTab === 'ppm' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Preventive Maintenance (PPM) Schedules</Text>
            {[
              { title: 'Semi-Annual AC AMC Filter Clean & Coil Sanitization', unit: 'Unit 101', due: '18 Nov 2026', tech: 'Ramesh Kumar' },
              { title: 'VRV Compressor Capacitors Bi-Annual Overhaul', unit: 'Penthouse 501', due: '15 Nov 2026', tech: 'Daikin Direct' },
              { title: 'Otis Passenger Elevator Safety Inspection', unit: 'Block A & Sky Tower', due: '30 Nov 2026', tech: 'Otis Elevator Co' },
            ].map((ppm, i) => (
              <View key={i} style={styles.ppmCard}>
                <Text style={styles.ppmTitle}>{ppm.title}</Text>
                <Text style={styles.ppmSub}>Location: {ppm.unit} · Target Due: {ppm.due}</Text>
                <Text style={styles.ppmTech}>Assigned: {ppm.tech}</Text>
              </View>
            ))}
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
  roleTagPill: { backgroundColor: 'rgba(245, 158, 11, 0.18)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginTop: 1 },
  roleTagText: { fontSize: 8.5, fontWeight: '900', color: '#F59E0B', letterSpacing: 0.8 },
  headerRightGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  assistantBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(240, 253, 250, 0.15)', borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.4)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14 },
  assistantBtnText: { fontSize: 11, fontWeight: '800', color: '#00F0FF' },
  logoutBtn: { backgroundColor: 'rgba(255, 255, 255, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  logoutBtnText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },

  navBar: { flexDirection: 'row', backgroundColor: '#070C12', paddingHorizontal: 10, paddingVertical: 6 },
  navItem: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 6 },
  navItemActive: { backgroundColor: '#F59E0B' },
  navItemText: { fontSize: 11, fontWeight: '700', color: '#94A3B8' },
  navItemTextActive: { color: '#070C12', fontWeight: '900' },

  scrollContent: { padding: 18, maxWidth: 680, width: '100%', alignSelf: 'center' },
  supervisorCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 14 },
  supSmall: { fontSize: 12, color: '#64748B' },
  supName: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  supSub: { fontSize: 12, color: '#0F766E', fontWeight: '700', marginTop: 2 },

  kpiGrid: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  kpiCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', position: 'relative', overflow: 'hidden' },
  kpiNum: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  kpiLabel: { fontSize: 9.5, color: '#64748B', fontWeight: '700', marginTop: 2, textAlign: 'center' },
  kpiBar: { position: 'absolute', bottom: 0, left: 8, right: 8, height: 3, borderRadius: 2 },

  overdueAlertCard: { backgroundColor: '#FFF1F2', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#FECDD3', marginBottom: 16 },
  overdueTitle: { fontSize: 11, fontWeight: '900', color: '#DC2626', letterSpacing: 1 },
  overdueRow: { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#FFE4E6' },
  overdueTicket: { fontSize: 12, fontWeight: '800', color: '#0F172A' },
  overdueTech: { fontSize: 11, color: '#BE123C' },

  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#0F172A', marginVertical: 10 },
  casesList: { gap: 10 },
  caseCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  cId: { fontSize: 11, fontWeight: '800', color: '#0284C7' },
  cPri: { fontSize: 10, fontWeight: '800', color: '#DC2626' },
  cTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginTop: 4 },
  cLoc: { fontSize: 11, color: '#64748B', marginTop: 2 },

  tabContent: { gap: 12 },
  dispatchBtn: { backgroundColor: '#0F172A', paddingVertical: 8, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  dispatchBtnText: { fontSize: 11, fontWeight: '800', color: '#00F0FF' },

  verifyCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  verifyActionsRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  reworkBtn: { flex: 1, backgroundColor: '#FEF3C7', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  reworkBtnText: { fontSize: 11, fontWeight: '800', color: '#B45309' },
  verifyBtn: { flex: 1.5, backgroundColor: '#059669', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  verifyBtnText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },

  techCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  techName: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  techRole: { fontSize: 11, color: '#64748B', marginTop: 1 },
  callBtn: { backgroundColor: '#0F766E', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  callBtnText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },

  ppmCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  ppmTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  ppmSub: { fontSize: 11, color: '#64748B', marginTop: 2 },
  ppmTech: { fontSize: 11, color: '#0F766E', fontWeight: '700', marginTop: 2 },

  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
