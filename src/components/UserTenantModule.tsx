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
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { RequestCategory, RequestPriority, ServiceCase } from '../types/cafm';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SAMPLE_ANNOUNCEMENTS = [
  { id: 'ann-1', title: '🚰 Scheduled Water Tank Sanitization', text: 'Water supply will be temporarily paused on Block A & B tomorrow between 10:00 AM - 01:00 PM for annual cleaning.', date: 'Today, 09:00 AM', tag: 'Maintenance' },
  { id: 'ann-2', title: '⚡ Common Area Electrical Panel Upgrade', text: 'Floor 2 to Floor 4 corridor lighting will be running on generator backup tonight during panel testing.', date: 'Yesterday', tag: 'Electrical' },
];

const INITIAL_TENANT_CASES: ServiceCase[] = [
  {
    id: 'CASE-2026-0001',
    title: 'AC unit not cooling & humming sound',
    description: 'Wall-mounted split AC in living room blowing warm air (29°C) with humming compressor vibration.',
    category: 'HVAC / AC',
    priority: 'High',
    status: 'In progress',
    building: 'Block A',
    floor: 'Floor 2',
    room: 'Unit 204',
    requesterName: 'Anand Varma',
    requesterEmail: 'anand@gmail.com',
    createdAt: 'Today, 09:15 AM',
    photos: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80'],
    assignedTechnician: 'Ramesh Kumar (HVAC Lead)',
    slaHours: 4,
  },
  {
    id: 'CASE-2026-0002',
    title: 'Water leak under pantry wash basin',
    description: 'Continuous drip from flexible braided connector valve under kitchen sink.',
    category: 'Plumbing',
    priority: 'Critical',
    status: 'Assigned',
    building: 'Block A',
    floor: 'Floor 2',
    room: 'Unit 204',
    requesterName: 'Anand Varma',
    requesterEmail: 'anand@gmail.com',
    createdAt: 'Yesterday, 04:30 PM',
    photos: ['https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&q=80'],
    assignedTechnician: 'Sunil Master (Plumber)',
    slaHours: 1,
  },
  {
    id: 'CASE-2026-0003',
    title: 'Bathroom exhaust fan blade jammed',
    description: 'Fan motor overheating when powered on.',
    category: 'Electrical',
    priority: 'Medium',
    status: 'Resolved',
    building: 'Block A',
    floor: 'Floor 2',
    room: 'Unit 204',
    requesterName: 'Anand Varma',
    requesterEmail: 'anand@gmail.com',
    createdAt: '08 Nov 2026',
    photos: [],
    assignedTechnician: 'Arun Krishnan (Electrician)',
    slaHours: 24,
  },
];

interface Props {
  currentUser: { name: string; email: string; initials: string; role: string; color: string };
  onLogout: () => void;
  onOpenAssistant?: () => void;
}

export default function UserTenantModule({ currentUser, onLogout, onOpenAssistant }: Props) {
  const [activeTab, setActiveTab] = useState<'home' | 'requests' | 'bills' | 'move_in' | 'profile'>('home');
  const [cases, setCases] = useState<ServiceCase[]>(INITIAL_TENANT_CASES);
  const [selectedCase, setSelectedCase] = useState<ServiceCase | null>(null);

  // New Service Request Form State
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [formCategory, setFormCategory] = useState<RequestCategory>('HVAC / AC');
  const [formPriority, setFormPriority] = useState<RequestPriority>('High');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPhotos, setFormPhotos] = useState<string[]>([]);
  const [isCommonArea, setIsCommonArea] = useState(false);

  // Move-in / Move-out Audit State
  const [moveInChecklist, setMoveInChecklist] = useState([
    { id: 'c1', title: 'AC Cooling & Filter Cleanliness', passed: true },
    { id: 'c2', title: 'Water Heaters & Safety Pressure Valve', passed: true },
    { id: 'c3', title: 'Distribution Panel MCB Breakers', passed: true },
    { id: 'c4', title: 'Wooden Wardrobes & Lock Alignment', passed: true },
  ]);

  // Rating & Feedback State
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');

  // Entrance Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
    ]).start();
  }, [activeTab]);

  function handleCreateRequest() {
    if (!formTitle.trim()) {
      Alert.alert('Title Required', 'Please enter a summary title for your maintenance request.');
      return;
    }
    const newId = `CASE-2026-000${cases.length + 1}`;
    const newCase: ServiceCase = {
      id: newId,
      title: formTitle.trim(),
      description: formDesc.trim() || 'No additional details.',
      category: formCategory,
      priority: formPriority,
      status: 'Under review',
      building: 'Block A',
      floor: 'Floor 2',
      room: isCommonArea ? 'Common Area Corridor' : 'Unit 204',
      requesterName: currentUser.name,
      requesterEmail: currentUser.email,
      createdAt: 'Just now',
      photos: formPhotos.length > 0 ? formPhotos : ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80'],
      assignedTechnician: 'Auto-Dispatching Specialist...',
      slaHours: formPriority === 'Critical' ? 1 : formPriority === 'High' ? 4 : 24,
    };

    setCases([newCase, ...cases]);
    setIsNewRequestOpen(false);
    setFormTitle('');
    setFormDesc('');
    setFormPhotos([]);

    Alert.alert(
      'Service Request Submitted! 🚀',
      `Case Number ${newId} generated. Facility Supervisor & Technician notified.`,
      [{ text: 'View Ticket', onPress: () => setSelectedCase(newCase) }, { text: 'Done' }]
    );
  }

  function handleReopenCase(caseId: string) {
    setCases(prev =>
      prev.map(c => (c.id === caseId ? { ...c, status: 'In progress' } : c))
    );
    if (selectedCase?.id === caseId) {
      setSelectedCase(prev => (prev ? { ...prev, status: 'In progress' } : null));
    }
    Alert.alert('Request Re-opened', `Ticket ${caseId} has been escalated to Supervisor Victer Manuel for re-work.`);
  }

  return (
    <View style={styles.container}>
      {/* ======================================================== */}
      {/* 1. VIBRANT MODERN HEADER                                 */}
      {/* ======================================================== */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoWrap}>
            <Image source={require('../../assets/nexus-emblem.png')} style={styles.emblemImg} resizeMode="contain" />
          </View>
          <View>
            <Text style={styles.brandName}>noverra<Text style={{ color: '#00F0FF' }}>.</Text></Text>
            <View style={styles.userRolePill}>
              <Text style={styles.userRoleText}>🏠 TENANT / RESIDENT PORTAL</Text>
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

      {/* Modern Horizontal Navigation Tabs */}
      <View style={styles.navBar}>
        {[
          { id: 'home', label: '🏠 Dashboard' },
          { id: 'requests', label: `📂 Requests (${cases.length})` },
          { id: 'bills', label: '💳 Bills & Receipts' },
          { id: 'move_in', label: '📋 Handover Checklist' },
          { id: 'profile', label: '👤 Profile' },
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
        {/* ======================================================== */}
        {/* TAB 1: USER DASHBOARD (Features 1, 3, 22, 23)            */}
        {/* ======================================================== */}
        {activeTab === 'home' && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* Greeting & Property Card */}
            <View style={styles.propertyBanner}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.greetingSmall}>Welcome back,</Text>
                  <Text style={styles.greetingName}>{currentUser.name}</Text>
                  <Text style={styles.propertySub}>Palm Residency · Block A · Unit 204 (3BHK)</Text>
                </View>
                <Pressable onPress={() => setIsNewRequestOpen(true)} style={styles.quickRaiseBtn}>
                  <Text style={styles.quickRaiseBtnText}>+ Raise Issue</Text>
                </Pressable>
              </View>
            </View>

            {/* KPI Stat Cards */}
            <View style={styles.kpiGrid}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiNum}>{cases.length}</Text>
                <Text style={styles.kpiLabel}>Total Tickets</Text>
                <View style={[styles.kpiBar, { backgroundColor: '#00F0FF' }]} />
              </View>
              <View style={styles.kpiCard}>
                <Text style={[styles.kpiNum, { color: '#F59E0B' }]}>
                  {cases.filter(c => c.status !== 'Resolved').length}
                </Text>
                <Text style={styles.kpiLabel}>Active Open</Text>
                <View style={[styles.kpiBar, { backgroundColor: '#F59E0B' }]} />
              </View>
              <View style={styles.kpiCard}>
                <Text style={[styles.kpiNum, { color: '#10B981' }]}>
                  {cases.filter(c => c.status === 'Resolved').length}
                </Text>
                <Text style={styles.kpiLabel}>Resolved</Text>
                <View style={[styles.kpiBar, { backgroundColor: '#10B981' }]} />
              </View>
            </View>

            {/* BUILDING ANNOUNCEMENTS (Feature 23) */}
            <Text style={styles.sectionTitle}>📢 Building Notices & Announcements</Text>
            <View style={styles.announcementsStack}>
              {SAMPLE_ANNOUNCEMENTS.map(ann => (
                <View key={ann.id} style={styles.annCard}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.annTitle}>{ann.title}</Text>
                    <Text style={styles.annDate}>{ann.date}</Text>
                  </View>
                  <Text style={styles.annText}>{ann.text}</Text>
                </View>
              ))}
            </View>

            {/* RECENT SERVICE REQUESTS (Feature 4, 5, 6) */}
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Active Service Requests</Text>
              <Pressable onPress={() => setActiveTab('requests')}>
                <Text style={styles.viewAllLink}>View All ↗</Text>
              </Pressable>
            </View>

            <View style={styles.requestsStack}>
              {cases.slice(0, 3).map(c => (
                <Pressable
                  key={c.id}
                  onPress={() => setSelectedCase(c)}
                  style={styles.requestCard}
                >
                  <View style={styles.rowBetween}>
                    <Text style={styles.caseId}>{c.id} · {c.category}</Text>
                    <View style={[styles.statusBadge, c.status === 'Resolved' ? styles.bgResolved : styles.bgOpen]}>
                      <Text style={[styles.statusText, c.status === 'Resolved' ? styles.txtResolved : styles.txtOpen]}>
                        {c.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.caseTitle}>{c.title}</Text>
                  <Text style={styles.caseMeta}>📍 {c.building} · {c.room} | Tech: {c.assignedTechnician || 'Dispatching...'}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}

        {/* ======================================================== */}
        {/* TAB 2: ALL SERVICE REQUESTS & TRACKING (Features 4-12)     */}
        {/* ======================================================== */}
        {activeTab === 'requests' && (
          <View style={styles.tabContainer}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Service Requests & Case Tracking</Text>
              <Pressable onPress={() => setIsNewRequestOpen(true)} style={styles.quickRaiseBtn}>
                <Text style={styles.quickRaiseBtnText}>+ New Complaint</Text>
              </Pressable>
            </View>

            <View style={styles.requestsStack}>
              {cases.map(c => (
                <Pressable key={c.id} onPress={() => setSelectedCase(c)} style={styles.requestCard}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.caseId}>{c.id}</Text>
                    <View style={[styles.priBadge, c.priority === 'Critical' ? styles.bgRed : styles.bgAmber]}>
                      <Text style={[styles.priText, c.priority === 'Critical' ? styles.txtRed : styles.txtAmber]}>
                        {c.priority} Priority
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.caseTitle}>{c.title}</Text>
                  <Text style={styles.caseDesc} numberOfLines={2}>{c.description}</Text>
                  <View style={styles.rowBetween}>
                    <Text style={styles.caseMeta}>Assigned: {c.assignedTechnician}</Text>
                    <Text style={styles.caseLink}>Inspect Details ↗</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 3: BILLS & PAYMENTS (Features 16 & 17)                */}
        {/* ======================================================== */}
        {activeTab === 'bills' && (
          <View style={styles.tabContainer}>
            <Text style={styles.sectionTitle}>My Maintenance Bills & Receipts</Text>
            <View style={styles.billCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.billMonth}>NOVEMBER 2026 MAINTENANCE BILL</Text>
                <View style={styles.paidBadge}><Text style={styles.paidBadgeText}>✓ PAID</Text></View>
              </View>
              <Text style={styles.billAmount}>₹4,500.00</Text>
              <Text style={styles.billSub}>Includes Water Supply, Common Corridor Lighting & Lift Maintenance</Text>
              <Pressable onPress={() => Alert.alert('Receipt Downloaded 📄', 'Receipt #REC-2026-11 saved to downloads.')} style={styles.downloadBtn}>
                <Text style={styles.downloadBtnText}>Download Official Receipt PDF 📄</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 4: HANDOVER CHECKLIST (Features 13 & 14)              */}
        {/* ======================================================== */}
        {activeTab === 'move_in' && (
          <View style={styles.tabContainer}>
            <Text style={styles.sectionTitle}>Property Move-In Handover Audit</Text>
            <Text style={styles.sectionSub}>Unit 204 Pre-Occupancy Verification & Signed Checklist</Text>

            <View style={styles.checklistStack}>
              {moveInChecklist.map(item => (
                <View key={item.id} style={styles.checkItemCard}>
                  <Text style={styles.checkTitle}>{item.title}</Text>
                  <View style={styles.passedPill}>
                    <Text style={styles.passedPillText}>✓ PASSED & VERIFIED</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 5: PROFILE & SETTINGS (Features 2, 19, 27, 28)       */}
        {/* ======================================================== */}
        {activeTab === 'profile' && (
          <View style={styles.tabContainer}>
            <View style={styles.profileCard}>
              <View style={styles.rowAlign}>
                <View style={styles.avatarOrb}>
                  <Text style={styles.avatarText}>{currentUser.initials}</Text>
                </View>
                <View>
                  <Text style={styles.profileName}>{currentUser.name}</Text>
                  <Text style={styles.profileEmail}>{currentUser.email}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Emergency Hotlines & Helpdesk</Text>
            <View style={styles.emergencyCard}>
              <Text style={styles.emgTitle}>🚨 24/7 Facility Emergency Line</Text>
              <Text style={styles.emgPhone}>+91 1800 555 9111</Text>
              <Pressable onPress={() => Linking.openURL('tel:18005559111')} style={styles.callEmgBtn}>
                <Text style={styles.callEmgBtnText}>Call Emergency Desk Now 📞</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ======================================================== */}
      {/* MODAL: RAISE NEW SERVICE REQUEST WITH PHOTOS              */}
      {/* ======================================================== */}
      <Modal visible={isNewRequestOpen} animationType="slide">
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Raise Service Request</Text>
            <Pressable onPress={() => setIsNewRequestOpen(false)}><Text style={styles.modalCloseText}>✕</Text></Pressable>
          </View>

          <ScrollView style={{ padding: 20 }}>
            <Text style={styles.formLabel}>ISSUE TITLE / SUMMARY *</Text>
            <TextInput
              placeholder="e.g. Water leak under sink / AC blowing warm air"
              value={formTitle}
              onChangeText={setFormTitle}
              style={styles.modalInput}
            />

            <Text style={[styles.formLabel, { marginTop: 14 }]}>CATEGORY</Text>
            <View style={styles.chipRow}>
              {(['HVAC / AC', 'Electrical', 'Plumbing', 'Carpentry', 'Cleaning'] as const).map(cat => (
                <Pressable
                  key={cat}
                  onPress={() => setFormCategory(cat)}
                  style={[styles.chip, formCategory === cat && styles.chipActive]}
                >
                  <Text style={[styles.chipText, formCategory === cat && styles.chipTextActive]}>{cat}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.formLabel, { marginTop: 14 }]}>IS THIS A COMMON AREA ISSUE?</Text>
            <View style={styles.rowAlign}>
              <Switch value={isCommonArea} onValueChange={setIsCommonArea} />
              <Text style={{ fontSize: 12, color: '#334155', fontWeight: '700' }}>
                {isCommonArea ? 'Yes (Lift, Corridor, Parking, Gym)' : 'No (Inside My Unit)'}
              </Text>
            </View>

            <Text style={[styles.formLabel, { marginTop: 14 }]}>DESCRIPTION</Text>
            <TextInput
              placeholder="Describe what happened, error noises, or room details..."
              value={formDesc}
              onChangeText={setFormDesc}
              multiline
              numberOfLines={3}
              style={[styles.modalInput, styles.textAreaInput]}
            />

            <Pressable onPress={handleCreateRequest} style={styles.submitBtn}>
              <Text style={styles.submitBtnText}>Submit Complaint & Generate Case # 🚀</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: INSPECT CASE DETAIL & REOPEN / RATING              */}
      {/* ======================================================== */}
      <Modal visible={!!selectedCase} animationType="slide">
        {selectedCase && (
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedCase.id}</Text>
              <Pressable onPress={() => setSelectedCase(null)}><Text style={styles.modalCloseText}>✕</Text></Pressable>
            </View>

            <ScrollView style={{ padding: 20 }}>
              <Text style={styles.caseDetailTitle}>{selectedCase.title}</Text>
              <Text style={styles.caseDetailDesc}>{selectedCase.description}</Text>
              <Text style={styles.caseDetailMeta}>Location: {selectedCase.building} · {selectedCase.room}</Text>
              <Text style={styles.caseDetailMeta}>Assigned Technician: {selectedCase.assignedTechnician}</Text>

              {selectedCase.status === 'Resolved' && (
                <View style={styles.reopenBox}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#0F172A' }}>Need further repair?</Text>
                  <Pressable onPress={() => handleReopenCase(selectedCase.id)} style={styles.reopenBtn}>
                    <Text style={styles.reopenBtnText}>↺ Reopen Complaint / Escalate</Text>
                  </Pressable>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </Modal>
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
  userRolePill: { backgroundColor: 'rgba(0, 240, 255, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginTop: 1 },
  userRoleText: { fontSize: 8.5, fontWeight: '900', color: '#00F0FF', letterSpacing: 0.8 },
  headerRightGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  assistantBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(240, 253, 250, 0.15)', borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.4)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14 },
  assistantBtnText: { fontSize: 11, fontWeight: '800', color: '#00F0FF' },
  logoutBtn: { backgroundColor: 'rgba(255, 255, 255, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  logoutBtnText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },

  navBar: { flexDirection: 'row', backgroundColor: '#070C12', paddingHorizontal: 10, paddingVertical: 6 },
  navItem: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 6 },
  navItemActive: { backgroundColor: '#00F0FF' },
  navItemText: { fontSize: 11, fontWeight: '700', color: '#94A3B8' },
  navItemTextActive: { color: '#070C12', fontWeight: '900' },

  scrollContent: { padding: 18, maxWidth: 680, width: '100%', alignSelf: 'center' },

  propertyBanner: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 14 },
  greetingSmall: { fontSize: 12, color: '#64748B' },
  greetingName: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  propertySub: { fontSize: 12, color: '#0F766E', fontWeight: '700', marginTop: 2 },
  quickRaiseBtn: { backgroundColor: '#0F766E', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  quickRaiseBtnText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },

  kpiGrid: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  kpiCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', position: 'relative', overflow: 'hidden' },
  kpiNum: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  kpiLabel: { fontSize: 10, color: '#64748B', fontWeight: '700', marginTop: 2 },
  kpiBar: { position: 'absolute', bottom: 0, left: 8, right: 8, height: 3, borderRadius: 2 },

  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#0F172A', marginVertical: 10 },
  sectionSub: { fontSize: 12, color: '#64748B', marginBottom: 10 },
  announcementsStack: { gap: 10, marginBottom: 16 },
  annCard: { backgroundColor: '#F0FDFA', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#CCFBF1' },
  annTitle: { fontSize: 13, fontWeight: '800', color: '#0F766E' },
  annDate: { fontSize: 10, color: '#64748B' },
  annText: { fontSize: 11.5, color: '#334155', marginTop: 4, lineHeight: 17 },

  requestsStack: { gap: 10 },
  requestCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  caseId: { fontSize: 11, fontWeight: '800', color: '#0284C7' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '800' },
  bgOpen: { backgroundColor: '#FEF3C7' },
  txtOpen: { color: '#B45309', fontSize: 10, fontWeight: '800' },
  bgResolved: { backgroundColor: '#DCFCE7' },
  txtResolved: { color: '#15803D', fontSize: 10, fontWeight: '800' },
  caseTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginTop: 4 },
  caseDesc: { fontSize: 12, color: '#64748B', marginTop: 2 },
  caseMeta: { fontSize: 11, color: '#64748B', marginTop: 6 },
  caseLink: { fontSize: 11, fontWeight: '800', color: '#0284C7' },
  viewAllLink: { fontSize: 12, fontWeight: '800', color: '#0284C7' },

  tabContainer: { gap: 12 },
  billCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#E2E8F0' },
  billMonth: { fontSize: 10, fontWeight: '900', color: '#0F766E', letterSpacing: 1 },
  paidBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  paidBadgeText: { fontSize: 10, fontWeight: '800', color: '#15803D' },
  billAmount: { fontSize: 24, fontWeight: '900', color: '#0F172A', marginTop: 4 },
  billSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  downloadBtn: { backgroundColor: '#0F172A', paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  downloadBtnText: { fontSize: 11, fontWeight: '800', color: '#00F0FF' },

  checklistStack: { gap: 8 },
  checkItemCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  checkTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  passedPill: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  passedPillText: { fontSize: 9.5, fontWeight: '800', color: '#15803D' },

  profileCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 },
  avatarOrb: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#D8E9F7', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  profileName: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  profileEmail: { fontSize: 12, color: '#64748B' },
  emergencyCard: { backgroundColor: '#FFF1F2', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#FECDD3' },
  emgTitle: { fontSize: 14, fontWeight: '900', color: '#DC2626' },
  emgPhone: { fontSize: 20, fontWeight: '900', color: '#0F172A', marginTop: 2 },
  callEmgBtn: { backgroundColor: '#DC2626', paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  callEmgBtnText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },

  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowAlign: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  modalView: { flex: 1, backgroundColor: '#F8FAF9' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 24 : 16, paddingBottom: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  modalCloseText: { fontSize: 16, fontWeight: '800', color: '#64748B' },
  formLabel: { fontSize: 10, fontWeight: '900', color: '#0F766E', letterSpacing: 1 },
  modalInput: { height: 44, backgroundColor: '#F8FAF9', borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 12, fontSize: 12, color: '#0F172A', marginTop: 6 },
  textAreaInput: { height: 80, textAlignVertical: 'top', paddingTop: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1' },
  chipActive: { backgroundColor: '#0F766E', borderColor: '#0F766E' },
  chipText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  chipTextActive: { color: '#FFFFFF' },
  submitBtn: { backgroundColor: '#0F172A', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  submitBtnText: { fontSize: 12, fontWeight: '800', color: '#00F0FF' },

  caseDetailTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  caseDetailDesc: { fontSize: 13, color: '#334155', marginTop: 6, lineHeight: 19 },
  caseDetailMeta: { fontSize: 12, color: '#64748B', marginTop: 4 },
  reopenBox: { marginTop: 20, padding: 16, backgroundColor: '#FFFDF5', borderRadius: 14, borderWidth: 1, borderColor: '#FDE68A' },
  reopenBtn: { backgroundColor: '#B45309', paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  reopenBtnText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },
  priBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  priText: { fontSize: 9.5, fontWeight: '800' },
  bgRed: { backgroundColor: '#FEE2E2' },
  txtRed: { color: '#DC2626' },
  bgAmber: { backgroundColor: '#FEF3C7' },
  txtAmber: { color: '#B45309' },
});
