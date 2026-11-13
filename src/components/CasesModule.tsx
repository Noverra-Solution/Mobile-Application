import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
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
import * as ImagePicker from 'expo-image-picker';
import { ApartmentAsset, RequestCategory, RequestPriority, RequestStatus, ServiceCase } from '../types/cafm';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  cases: ServiceCase[];
  apartments: ApartmentAsset[];
  onUpdateCases: (cases: ServiceCase[]) => void;
  currentUser: { name: string; email: string };
  initialFilter?: 'All' | 'Open' | 'Overdue' | 'Resolved';
}

export default function CasesModule({
  cases,
  apartments,
  onUpdateCases,
  currentUser,
  initialFilter = 'All',
}: Props) {
  const [activeTab, setActiveTab] = useState<'All' | 'Open' | 'Overdue' | 'Resolved'>(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState<ServiceCase | null>(null);

  // Modal: Raise a new case
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPriority, setFormPriority] = useState<RequestPriority>('High');
  const [formCategory, setFormCategory] = useState<RequestCategory>('HVAC / AC');
  const [formApartmentId, setFormApartmentId] = useState(apartments[0]?.id || 'APT-101');
  const [formSubAssetName, setFormSubAssetName] = useState('Living Room Split AC');
  const [formEstimatedCost, setFormEstimatedCost] = useState('2500');
  const [formPhotos, setFormPhotos] = useState<string[]>([]);

  // Tab counts
  const totalCount = cases.length;
  const openCount = cases.filter(c => c.status === 'Open').length;
  const overdueCount = cases.filter(c => c.status === 'Overdue').length;
  const resolvedCount = cases.filter(c => c.status === 'Resolved').length;

  // Filtered cases
  const filteredCases = cases.filter(c => {
    let matchesTab = true;
    if (activeTab === 'Open') matchesTab = c.status === 'Open';
    else if (activeTab === 'Overdue') matchesTab = c.status === 'Overdue';
    else if (activeTab === 'Resolved') matchesTab = c.status === 'Resolved';

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.title.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      (c.location && c.location.toLowerCase().includes(q)) ||
      (c.subAssetName && c.subAssetName.toLowerCase().includes(q));

    return matchesTab && matchesSearch;
  });

  // Priority color helper
  function getPriorityColor(priority: RequestPriority) {
    switch (priority) {
      case 'Critical':
        return '#DC2626'; // red
      case 'High':
        return '#EA580C'; // orange
      case 'Medium':
        return '#FACC15'; // yellow
      case 'Low':
        return '#94A3B8'; // grey-blue
      default:
        return '#94A3B8';
    }
  }

  // Camera capture
  async function handleLaunchCamera() {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert(
          'Camera Access Required',
          'Camera permission is required to capture photos. Would you like to attach a sample maintenance photo?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Attach Sample',
              onPress: () =>
                setFormPhotos(prev => [
                  ...prev,
                  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80',
                ]),
            },
          ]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFormPhotos(prev => [...prev, result.assets[0].uri]);
      }
    } catch (e) {
      console.warn('Camera fallback to sample:', e);
      setFormPhotos(prev => [
        ...prev,
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80',
      ]);
    }
  }

  function handleCreateCase() {
    if (!formTitle.trim()) {
      Alert.alert('Title Required', 'Please enter a description or case title.');
      return;
    }

    const apt = apartments.find(a => a.id === formApartmentId) || apartments[0];
    const newId = `IC2600${Math.floor(40 + Math.random() * 50)}`;

    const newCase: ServiceCase = {
      id: newId,
      title: formTitle.trim(),
      description: formDescription.trim() || 'No detailed notes provided.',
      priority: formPriority,
      status: 'Open',
      category: formCategory,
      location: `${apt.buildingBlock} · ${apt.unitNumber}`,
      apartmentId: apt.id,
      subAssetName: formSubAssetName,
      reportedBy: currentUser.name,
      createdAt: 'Just now',
      estimatedCost: parseFloat(formEstimatedCost) || 2000,
      photos:
        formPhotos.length > 0
          ? formPhotos
          : ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80'],
      assignedTechnician: 'Dispatching On-Call Engineer...',
    };

    onUpdateCases([newCase, ...cases]);
    setIsCreateModalVisible(false);
    setFormTitle('');
    setFormDescription('');
    setFormPhotos([]);

    Alert.alert(
      'Case Raised! 🚀',
      `Ticket ${newId} logged for ${apt.unitNumber} (${formSubAssetName}). Added to active cases list.`
    );
  }

  function toggleCaseStatus(caseId: string) {
    const updated = cases.map(c => {
      if (c.id === caseId) {
        const isResolved = c.status === 'Resolved';
        const newStatus: RequestStatus = isResolved ? 'Open' : 'Resolved';
        const mod = { ...c, status: newStatus };
        if (selectedCase?.id === caseId) setSelectedCase(mod);
        return mod;
      }
      return c;
    });
    onUpdateCases(updated);
  }

  return (
    <View style={styles.container}>
      {/* Top Header matching Image 4 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cases</Text>
        <View style={styles.headerIcons}>
          <Pressable onPress={() => setIsCreateModalVisible(true)} style={styles.raiseBtnHeader}>
            <Text style={styles.raiseBtnHeaderText}>+ Raise a Case</Text>
          </Pressable>
        </View>
      </View>

      {/* Horizontal Filter Tabs with active blue underline */}
      <View style={styles.tabsRow}>
        <Pressable onPress={() => setActiveTab('All')} style={[styles.tabItem, activeTab === 'All' && styles.tabItemActive]}>
          <Text style={[styles.tabText, activeTab === 'All' && styles.tabTextActive]}>All {totalCount}</Text>
          {activeTab === 'All' && <View style={styles.activeUnderline} />}
        </Pressable>

        <Pressable onPress={() => setActiveTab('Open')} style={[styles.tabItem, activeTab === 'Open' && styles.tabItemActive]}>
          <Text style={[styles.tabText, activeTab === 'Open' && styles.tabTextActive]}>Open {openCount}</Text>
          {activeTab === 'Open' && <View style={styles.activeUnderline} />}
        </Pressable>

        <Pressable onPress={() => setActiveTab('Overdue')} style={[styles.tabItem, activeTab === 'Overdue' && styles.tabItemActive]}>
          <Text style={[styles.tabText, activeTab === 'Overdue' && styles.tabTextActive]}>Overdue {overdueCount}</Text>
          {activeTab === 'Overdue' && <View style={styles.activeUnderline} />}
        </Pressable>

        <Pressable onPress={() => setActiveTab('Resolved')} style={[styles.tabItem, activeTab === 'Resolved' && styles.tabItemActive]}>
          <Text style={[styles.tabText, activeTab === 'Resolved' && styles.tabTextActive]}>Resolved {resolvedCount}</Text>
          {activeTab === 'Resolved' && <View style={styles.activeUnderline} />}
        </Pressable>
      </View>

      {/* Search Bar matching Image 4 */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search cases, location or ID"
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={10}>
              <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '700' }}>✕</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Cases List */}
      <ScrollView contentContainerStyle={styles.listPad} showsVerticalScrollIndicator={false}>
        <View style={styles.cardsStack}>
          {filteredCases.map(item => {
            const dotColor = getPriorityColor(item.priority);
            const isDone = item.status === 'Resolved';

            return (
              <Pressable
                key={item.id}
                onPress={() => setSelectedCase(item)}
                style={({ pressed }) => [styles.caseCard, pressed && { backgroundColor: '#F8FAFC' }]}
              >
                <View style={styles.cardContent}>
                  {/* Colored priority dot */}
                  <View style={[styles.priorityDot, { backgroundColor: dotColor }]} />

                  {/* Case Info */}
                  <View style={styles.cardTextCol}>
                    <Text style={[styles.caseTitle, isDone && styles.caseTitleDone]} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <View style={styles.caseSubRow}>
                      <Text style={styles.caseId}>{item.id}</Text>
                      <Text style={styles.caseLocation}>📍 {item.location}</Text>
                      {item.subAssetName && (
                        <Text style={styles.caseSubAsset}>· {item.subAssetName}</Text>
                      )}
                    </View>
                  </View>

                  {/* Right chevron */}
                  <Text style={styles.chevron}>›</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
        <View style={{ height: 50 }} />
      </ScrollView>

      {/* ======================================================== */}
      {/* MODAL: CASE DETAIL & RESOLUTION                          */}
      {/* ======================================================== */}
      <Modal visible={!!selectedCase} animationType="slide" presentationStyle="pageSheet">
        {selectedCase && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalId}>{selectedCase.id}</Text>
                <Text style={styles.modalHeaderCat}>{selectedCase.category}</Text>
              </View>
              <Pressable onPress={() => setSelectedCase(null)} hitSlop={12} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.badgeRow}>
                <View style={[styles.pillBadge, { backgroundColor: getPriorityColor(selectedCase.priority) + '20' }]}>
                  <Text style={[styles.pillText, { color: getPriorityColor(selectedCase.priority) }]}>
                    {selectedCase.priority} Priority
                  </Text>
                </View>
                <View style={[styles.pillBadge, selectedCase.status === 'Resolved' ? styles.statusGreen : styles.statusAmber]}>
                  <Text style={[styles.pillText, selectedCase.status === 'Resolved' ? { color: '#059669' } : { color: '#B45309' }]}>
                    {selectedCase.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.detailTitle}>{selectedCase.title}</Text>
              <Text style={styles.detailDesc}>{selectedCase.description}</Text>

              {/* Photo Evidence */}
              {selectedCase.photos && selectedCase.photos.length > 0 && (
                <View style={styles.photoBox}>
                  <Text style={styles.photoHeader}>ATTACHED PHOTO EVIDENCE (CAMERA):</Text>
                  {selectedCase.photos.map((uri, idx) => (
                    <View key={idx} style={styles.photoWrap}>
                      <Image source={{ uri }} style={styles.photoImg} resizeMode="cover" />
                      <View style={styles.photoTag}>
                        <Text style={styles.photoTagText}>📍 {selectedCase.location} · {selectedCase.createdAt}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Asset & Cost Info */}
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>LOCATION / APARTMENT</Text>
                <Text style={styles.infoVal}>{selectedCase.location}</Text>

                {selectedCase.subAssetName && (
                  <>
                    <Text style={[styles.infoLabel, { marginTop: 12 }]}>AFFECTED SUB-ASSET</Text>
                    <Text style={styles.infoVal}>{selectedCase.subAssetName}</Text>
                  </>
                )}

                <Text style={[styles.infoLabel, { marginTop: 12 }]}>ESTIMATED REPAIR COST</Text>
                <Text style={[styles.infoVal, { color: '#0F766E' }]}>
                  ₹{(selectedCase.estimatedCost || 0).toLocaleString()}
                </Text>

                <Text style={[styles.infoLabel, { marginTop: 12 }]}>ASSIGNED TECHNICIAN</Text>
                <Text style={styles.infoVal}>{selectedCase.assignedTechnician || 'Auto-dispatching...'}</Text>
              </View>

              {/* Toggle Status Button */}
              <Pressable
                onPress={() => toggleCaseStatus(selectedCase.id)}
                style={[
                  styles.resolveBtn,
                  selectedCase.status === 'Resolved' && { backgroundColor: '#1E293B' },
                ]}
              >
                <Text style={styles.resolveBtnText}>
                  {selectedCase.status === 'Resolved' ? '↺ Re-open Case' : '✓ Mark as Resolved'}
                </Text>
              </Pressable>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: RAISE A NEW CASE WITH CAMERA                      */}
      {/* ======================================================== */}
      <Modal visible={isCreateModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalId}>NEW SERVICE TICKET</Text>
              <Text style={styles.modalHeaderCat}>Raise a Case</Text>
            </View>
            <Pressable onPress={() => setIsCreateModalVisible(false)} hitSlop={12} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {/* Apartment Selector */}
            <Text style={styles.formSection}>1. SELECT APARTMENT (MAIN ASSET)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              {apartments.map(apt => (
                <Pressable
                  key={apt.id}
                  onPress={() => {
                    setFormApartmentId(apt.id);
                    setFormSubAssetName(apt.subAssets[0]?.name || 'Split AC');
                  }}
                  style={[styles.aptChip, formApartmentId === apt.id && styles.aptChipActive]}
                >
                  <Text style={[styles.aptChipText, formApartmentId === apt.id && styles.aptChipTextActive]}>
                    {apt.unitNumber} ({apt.property})
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Sub-Asset Target */}
            <Text style={styles.formSection}>2. TARGET SUB-ASSET (EQUIPMENT)</Text>
            <TextInput
              placeholder="e.g. Living Room AC, Kitchen Geyser, Door closer"
              placeholderTextColor="#94A3B8"
              value={formSubAssetName}
              onChangeText={setFormSubAssetName}
              style={styles.modalInput}
            />

            {/* Priority Selector */}
            <Text style={styles.formSection}>3. PRIORITY LEVEL</Text>
            <View style={styles.prioritySelectorRow}>
              {(['Low', 'Medium', 'High', 'Critical'] as const).map(p => (
                <Pressable
                  key={p}
                  onPress={() => setFormPriority(p)}
                  style={[
                    styles.priOption,
                    formPriority === p && { backgroundColor: getPriorityColor(p) + '25', borderColor: getPriorityColor(p) },
                  ]}
                >
                  <View style={[styles.priDot, { backgroundColor: getPriorityColor(p) }]} />
                  <Text style={[styles.priLabel, formPriority === p && { color: getPriorityColor(p), fontWeight: '800' }]}>{p}</Text>
                </Pressable>
              ))}
            </View>

            {/* Case Title */}
            <Text style={styles.formSection}>4. ISSUE TITLE *</Text>
            <TextInput
              placeholder="e.g. AC not cooling in master bedroom"
              placeholderTextColor="#94A3B8"
              value={formTitle}
              onChangeText={setFormTitle}
              style={styles.modalInput}
            />

            {/* Description */}
            <Text style={styles.formSection}>5. DETAILS & SYMPTOMS</Text>
            <TextInput
              placeholder="Describe symptoms, noise, water drip, or parts needed..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              value={formDescription}
              onChangeText={setFormDescription}
              style={[styles.modalInput, { height: 80, paddingTop: 10, textAlignVertical: 'top' }]}
            />

            {/* Photo Evidence with Camera */}
            <Text style={styles.formSection}>6. PHOTO EVIDENCE (CAMERA)</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
              <Pressable onPress={handleLaunchCamera} style={styles.cameraBtn}>
                <Text style={styles.cameraBtnIcon}>📷</Text>
                <Text style={styles.cameraBtnText}>Take Photo</Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  setFormPhotos(prev => [
                    ...prev,
                    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80',
                  ])
                }
                style={styles.sampleBtn}
              >
                <Text style={styles.sampleBtnText}>+ Sample Photo</Text>
              </Pressable>
            </View>

            {/* Photo Previews */}
            {formPhotos.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                {formPhotos.map((uri, idx) => (
                  <View key={idx} style={styles.previewBox}>
                    <Image source={{ uri }} style={{ width: '100%', height: '100%', borderRadius: 10 }} resizeMode="cover" />
                    <Pressable
                      onPress={() => setFormPhotos(prev => prev.filter((_, i) => i !== idx))}
                      style={styles.removePhoto}
                    >
                      <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>✕</Text>
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* Submit Button */}
            <Pressable onPress={handleCreateCase} style={styles.submitCaseBtn}>
              <Text style={styles.submitCaseBtnText}>Dispatch Case ↗</Text>
            </Pressable>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  raiseBtnHeader: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  raiseBtnHeaderText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
  },
  tabItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    position: 'relative',
    marginRight: 8,
  },
  tabItemActive: {},
  tabText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  tabTextActive: { color: '#0284C7', fontWeight: '800' },
  activeUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 8,
    right: 8,
    height: 2.5,
    backgroundColor: '#0284C7',
    borderRadius: 2,
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 13, color: '#0F172A' },
  listPad: { paddingBottom: 60 },
  cardsStack: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  caseCard: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 14,
  },
  cardTextCol: {
    flex: 1,
  },
  caseTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
  },
  caseTitleDone: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  caseSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  caseId: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  caseLocation: {
    fontSize: 11,
    color: '#64748B',
  },
  caseSubAsset: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '600',
  },
  chevron: {
    fontSize: 20,
    color: '#CBD5E1',
    marginLeft: 8,
  },

  // MODAL STYLING
  modalContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 24 : 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalId: { fontSize: 10, letterSpacing: 1.4, fontWeight: '800', color: '#64748B' },
  modalHeaderCat: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  modalCloseText: { fontSize: 14, color: '#475569', fontWeight: '800' },
  modalScroll: { flex: 1, padding: 20 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  pillBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  pillText: { fontSize: 11, fontWeight: '800' },
  statusGreen: { backgroundColor: '#DCFCE7' },
  statusAmber: { backgroundColor: '#FEF9C3' },
  detailTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A', lineHeight: 26 },
  detailDesc: { fontSize: 13, color: '#475569', lineHeight: 20, marginTop: 8 },
  photoBox: { marginTop: 18 },
  photoHeader: { fontSize: 9, letterSpacing: 1.2, fontWeight: '900', color: '#64748B', marginBottom: 8 },
  photoWrap: { width: '100%', height: 210, borderRadius: 14, overflow: 'hidden', position: 'relative', backgroundColor: '#0F172A' },
  photoImg: { width: '100%', height: '100%' },
  photoTag: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.65)', padding: 8 },
  photoTagText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  infoBox: { backgroundColor: '#F8FAFC', borderRadius: 14, padding: 16, marginTop: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  infoLabel: { fontSize: 9, letterSpacing: 1.2, fontWeight: '800', color: '#94A3B8' },
  infoVal: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginTop: 2 },
  resolveBtn: { marginTop: 22, backgroundColor: '#059669', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  resolveBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },

  // CREATE CASE FORM
  formSection: { fontSize: 10, letterSpacing: 1.2, fontWeight: '900', color: '#0284C7', marginTop: 16, marginBottom: 6 },
  aptChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0', marginRight: 8 },
  aptChipActive: { backgroundColor: '#0284C7', borderColor: '#0284C7' },
  aptChipText: { fontSize: 11, fontWeight: '700', color: '#334155' },
  aptChipTextActive: { color: '#FFFFFF' },
  modalInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, paddingHorizontal: 12, height: 46, fontSize: 13, color: '#0F172A' },
  prioritySelectorRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  priOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  priDot: { width: 8, height: 8, borderRadius: 4 },
  priLabel: { fontSize: 11, fontWeight: '700', color: '#334155' },
  cameraBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#0284C7', paddingVertical: 12, borderRadius: 12 },
  cameraBtnIcon: { fontSize: 15 },
  cameraBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  sampleBtn: { paddingHorizontal: 14, justifyContent: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, borderWidth: 1, borderColor: '#CBD5E1' },
  sampleBtnText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  previewBox: { width: 80, height: 80, borderRadius: 10, position: 'relative', marginRight: 8 },
  removePhoto: { position: 'absolute', top: 3, right: 3, backgroundColor: 'rgba(0,0,0,0.7)', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  submitCaseBtn: { marginTop: 22, backgroundColor: '#0284C7', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  submitCaseBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
});
