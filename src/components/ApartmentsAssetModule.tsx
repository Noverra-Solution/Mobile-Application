import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ApartmentAsset, SubAsset } from '../types/cafm';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  apartments: ApartmentAsset[];
  onUpdateApartments: (apartments: ApartmentAsset[]) => void;
  onOpenCaseForm?: (apartmentId: string, subAssetName: string) => void;
}

export default function ApartmentsAssetModule({
  apartments,
  onUpdateApartments,
  onOpenCaseForm,
}: Props) {
  const [selectedProperty, setSelectedProperty] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApartment, setSelectedApartment] = useState<ApartmentAsset | null>(null);

  // Modals for adding expense or adding sub-asset
  const [isAddExpenseVisible, setIsAddExpenseVisible] = useState(false);
  const [expenseSubAssetId, setExpenseSubAssetId] = useState('');
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCost, setExpenseCost] = useState('');
  const [expenseTech, setExpenseTech] = useState('Authorized Technician');

  const [isAddSubAssetVisible, setIsAddSubAssetVisible] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubCategory, setNewSubCategory] = useState<'HVAC' | 'Plumbing' | 'Electrical' | 'Appliance' | 'Carpentry'>('HVAC');
  const [newSubBrand, setNewSubBrand] = useState('');
  const [newSubCost, setNewSubCost] = useState('');

  // Portfolio calculations
  const totalRentCollected = apartments.reduce((acc, a) => acc + a.totalRentCollected, 0);
  const totalMaintenanceSpent = apartments.reduce((acc, a) => acc + a.totalMaintenanceSpent, 0);
  const portfolioExpenseRatio = totalRentCollected > 0 ? (totalMaintenanceSpent / totalRentCollected) * 100 : 0;
  const totalMonthlyRent = apartments.reduce((acc, a) => acc + a.monthlyRent, 0);

  // Filter apartments
  const filteredApartments = apartments.filter(apt => {
    const matchesProperty = selectedProperty === 'All' || apt.property === selectedProperty;
    const matchesSearch =
      apt.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.property.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProperty && matchesSearch;
  });

  // Handler: Log new repair/maintenance expense
  function handleAddExpense() {
    if (!selectedApartment) return;
    const costNum = parseFloat(expenseCost);
    if (isNaN(costNum) || costNum <= 0) {
      Alert.alert('Invalid Cost', 'Please enter a valid expense amount in ₹.');
      return;
    }
    if (!expenseTitle.trim()) {
      Alert.alert('Title Required', 'Please provide a repair or service description.');
      return;
    }

    const updatedSubAssets = selectedApartment.subAssets.map(sub => {
      if (sub.id === expenseSubAssetId || (!expenseSubAssetId && sub.category === 'HVAC')) {
        return {
          ...sub,
          lifetimeRepairCost: sub.lifetimeRepairCost + costNum,
          lastServiceDate: 'Today',
          repairLogs: [
            {
              id: `LOG-${Date.now()}`,
              date: 'Today',
              title: expenseTitle.trim(),
              cost: costNum,
              technician: expenseTech.trim(),
            },
            ...sub.repairLogs,
          ],
        };
      }
      return sub;
    });

    const updatedApartment: ApartmentAsset = {
      ...selectedApartment,
      totalMaintenanceSpent: selectedApartment.totalMaintenanceSpent + costNum,
      subAssets: updatedSubAssets,
    };

    const updatedList = apartments.map(apt => (apt.id === updatedApartment.id ? updatedApartment : apt));
    onUpdateApartments(updatedList);
    setSelectedApartment(updatedApartment);
    setIsAddExpenseVisible(false);
    setExpenseTitle('');
    setExpenseCost('');

    Alert.alert(
      'Expense Recorded! 📈',
      `₹${costNum.toLocaleString()} logged for ${selectedApartment.unitNumber}. Lifetime maintenance and expense ratio updated.`
    );
  }

  // Handler: Add new sub-asset into apartment
  function handleAddSubAsset() {
    if (!selectedApartment) return;
    if (!newSubName.trim()) {
      Alert.alert('Name Required', 'Please enter sub-asset name (e.g. Master Bedroom AC).');
      return;
    }
    const costNum = parseFloat(newSubCost) || 25000;

    const newSub: SubAsset = {
      id: `SUB-${Date.now()}`,
      name: newSubName.trim(),
      category: newSubCategory,
      brandModel: newSubBrand.trim() || 'Standard Commercial Grade',
      purchaseCost: costNum,
      installDate: 'Nov 2026',
      lifetimeRepairCost: 0,
      lastServiceDate: 'Nov 2026',
      warrantyStatus: 'Under Warranty',
      healthScore: 100,
      repairLogs: [],
    };

    const updatedApartment: ApartmentAsset = {
      ...selectedApartment,
      subAssets: [...selectedApartment.subAssets, newSub],
    };

    const updatedList = apartments.map(apt => (apt.id === updatedApartment.id ? updatedApartment : apt));
    onUpdateApartments(updatedList);
    setSelectedApartment(updatedApartment);
    setIsAddSubAssetVisible(false);
    setNewSubName('');
    setNewSubBrand('');
    setNewSubCost('');

    Alert.alert('Sub-Asset Added', `${newSub.name} registered inside ${selectedApartment.unitNumber}.`);
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>
        {/* Header Title */}
        <View style={styles.pageHeader}>
          <Text style={styles.headerSubtitle}>REAL ESTATE OWNER PORTFOLIO</Text>
          <Text style={styles.headerTitle}>Apartments & Sub-Assets</Text>
          <Text style={styles.headerExplainer}>
            Each apartment is a primary revenue asset. Track sub-assets (ACs, geysers, appliances) to analyze lifetime maintenance spend and net expense ratios.
          </Text>
        </View>

        {/* Portfolio Executive KPI Cards */}
        <View style={styles.portfolioCard}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.pCardLabel}>PORTFOLIO EXPENSE RATIO</Text>
              <View style={styles.ratioRow}>
                <Text style={styles.pRatioBig}>{portfolioExpenseRatio.toFixed(1)}%</Text>
                <View style={styles.healthTag}>
                  <Text style={styles.healthTagText}>🟢 Healthy (&lt;15%)</Text>
                </View>
              </View>
            </View>
            <View style={styles.pUnitsBadge}>
              <Text style={styles.pUnitsNum}>{apartments.length}</Text>
              <Text style={styles.pUnitsLabel}>Apartments</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(portfolioExpenseRatio * 4, 100)}%` }]} />
          </View>

          <View style={styles.portfolioStatsRow}>
            <View style={styles.pStatItem}>
              <Text style={styles.pStatVal}>₹{(totalMonthlyRent / 1000).toFixed(0)}k/mo</Text>
              <Text style={styles.pStatSub}>Active Monthly Rent</Text>
            </View>
            <View style={styles.pStatDivider} />
            <View style={styles.pStatItem}>
              <Text style={styles.pStatVal}>₹{(totalRentCollected / 100000).toFixed(1)}L</Text>
              <Text style={styles.pStatSub}>Lifetime Rent Earned</Text>
            </View>
            <View style={styles.pStatDivider} />
            <View style={styles.pStatItem}>
              <Text style={[styles.pStatVal, { color: '#0F766E' }]}>₹{(totalMaintenanceSpent / 1000).toFixed(0)}k</Text>
              <Text style={styles.pStatSub}>Total Maintenance Spent</Text>
            </View>
          </View>
        </View>

        {/* Property Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {['All', 'Palm Residency', 'Cyber Heights'].map(prop => (
            <Pressable
              key={prop}
              onPress={() => setSelectedProperty(prop)}
              style={[styles.filterChip, selectedProperty === prop && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, selectedProperty === prop && styles.filterChipTextActive]}>
                {prop === 'All' ? '🏢 All Properties' : `📍 ${prop}`}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Search Bar */}
        <TextInput
          placeholder="Search by apartment unit (e.g. Unit 204), tenant, or building..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
        />

        {/* Apartments Cards List */}
        <View style={styles.apartmentsList}>
          {filteredApartments.map(apt => {
            const expenseRatio = apt.totalRentCollected > 0 ? (apt.totalMaintenanceSpent / apt.totalRentCollected) * 100 : 0;
            const isHighCost = expenseRatio > 15;
            const netCashflow = apt.totalRentCollected - apt.totalMaintenanceSpent;

            return (
              <Pressable
                key={apt.id}
                onPress={() => setSelectedApartment(apt)}
                style={({ pressed }) => [styles.aptCard, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}
              >
                {/* Unit Header */}
                <View style={styles.rowBetween}>
                  <View>
                    <View style={styles.unitBadgeRow}>
                      <Text style={styles.unitTitle}>{apt.unitNumber}</Text>
                      <View style={styles.typeTag}><Text style={styles.typeTagText}>{apt.type}</Text></View>
                    </View>
                    <Text style={styles.unitLocation}>📍 {apt.property} · {apt.buildingBlock} · {apt.floor}</Text>
                  </View>
                  <View style={[styles.expensePill, isHighCost ? styles.expensePillHigh : styles.expensePillGood]}>
                    <Text style={[styles.expensePillText, isHighCost ? styles.expenseTextHigh : styles.expenseTextGood]}>
                      {expenseRatio.toFixed(1)}% Expense Ratio
                    </Text>
                  </View>
                </View>

                {/* Tenant Banner */}
                <View style={styles.tenantBanner}>
                  <Text style={styles.tenantLabel}>TENANT</Text>
                  <Text style={styles.tenantName}>{apt.tenantName} · Rent: <Text style={{ fontWeight: '800', color: '#0F172A' }}>₹{apt.monthlyRent.toLocaleString()}/mo</Text></Text>
                </View>

                {/* Financial 3-Column Metrics */}
                <View style={styles.aptMetricsGrid}>
                  <View style={styles.aptMetricCol}>
                    <Text style={styles.aptMetricLabel}>TOTAL RENT EARNED</Text>
                    <Text style={styles.aptMetricVal}>₹{apt.totalRentCollected.toLocaleString()}</Text>
                  </View>
                  <View style={styles.aptMetricCol}>
                    <Text style={styles.aptMetricLabel}>MAINTENANCE SPENT</Text>
                    <Text style={[styles.aptMetricVal, { color: isHighCost ? '#DC2626' : '#0F766E' }]}>
                      ₹{apt.totalMaintenanceSpent.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.aptMetricCol}>
                    <Text style={styles.aptMetricLabel}>NET CASHFLOW</Text>
                    <Text style={[styles.aptMetricVal, { color: '#059669' }]}>
                      +₹{netCashflow.toLocaleString()}
                    </Text>
                  </View>
                </View>

                {/* Sub-Assets Summary Strip */}
                <View style={styles.subAssetsStrip}>
                  <Text style={styles.subAssetsCount}>{apt.subAssets.length} Sub-Assets inside this unit:</Text>
                  <View style={styles.subBadgesRow}>
                    {apt.subAssets.map(sub => (
                      <View key={sub.id} style={styles.subAssetPill}>
                        <Text style={styles.subAssetPillText}>
                          {sub.category === 'HVAC' ? '❄️' : sub.category === 'Plumbing' ? '🚰' : sub.category === 'Appliance' ? '🧺' : '⚡'} {sub.name} (₹{(sub.lifetimeRepairCost / 1000).toFixed(1)}k repairs)
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.aptCardFooter}>
                  <Text style={styles.tapPrompt}>Tap to view all sub-assets & log expenses ↗</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* ======================================================== */}
      {/* MODAL: APARTMENT SUB-ASSET LIFETIME COST DETAIL          */}
      {/* ======================================================== */}
      <Modal visible={!!selectedApartment} animationType="slide" presentationStyle="pageSheet">
        {selectedApartment && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalEyebrow}>{selectedApartment.property} · {selectedApartment.buildingBlock}</Text>
                <Text style={styles.modalTitle}>{selectedApartment.unitNumber} ({selectedApartment.type})</Text>
              </View>
              <Pressable onPress={() => setSelectedApartment(null)} hitSlop={12} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Financial Lifecycle Card */}
              <View style={styles.detailFinCard}>
                <Text style={styles.detailFinTitle}>LIFETIME REVENUE & MAINTENANCE RATIO</Text>
                <View style={styles.detailFinRow}>
                  <View>
                    <Text style={styles.detailFinNum}>₹{selectedApartment.totalRentCollected.toLocaleString()}</Text>
                    <Text style={styles.detailFinSub}>Lifetime Rent Collected</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.detailFinNum, { color: '#0F766E' }]}>
                      ₹{selectedApartment.totalMaintenanceSpent.toLocaleString()}
                    </Text>
                    <Text style={styles.detailFinSub}>Total Maintenance Spent</Text>
                  </View>
                </View>

                {/* Ratio Meter */}
                {(() => {
                  const ratio = selectedApartment.totalRentCollected > 0 ? (selectedApartment.totalMaintenanceSpent / selectedApartment.totalRentCollected) * 100 : 0;
                  return (
                    <View style={{ marginTop: 14 }}>
                      <View style={styles.rowBetween}>
                        <Text style={styles.ratioMeterText}>Expense Ratio: <Text style={{ fontWeight: '800' }}>{ratio.toFixed(1)}%</Text></Text>
                        <Text style={styles.ratioMeterStatus}>{ratio < 15 ? '🟢 Healthy Investment' : '🔴 High Expense Flag'}</Text>
                      </View>
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${Math.min(ratio * 4, 100)}%`, backgroundColor: ratio < 15 ? '#0F766E' : '#DC2626' }]} />
                      </View>
                    </View>
                  );
                })()}
              </View>

              {/* Action Buttons for this Apartment */}
              <View style={styles.modalActionsRow}>
                <Pressable
                  onPress={() => {
                    setExpenseSubAssetId(selectedApartment.subAssets[0]?.id || '');
                    setIsAddExpenseVisible(true);
                  }}
                  style={styles.actionBtnPrimary}
                >
                  <Text style={styles.actionBtnPrimaryText}>+ Log Repair / Expense</Text>
                </Pressable>

                <Pressable
                  onPress={() => setIsAddSubAssetVisible(true)}
                  style={styles.actionBtnSecondary}
                >
                  <Text style={styles.actionBtnSecondaryText}>+ Add Sub-Asset</Text>
                </Pressable>
              </View>

              {/* Sub-Assets List Header */}
              <View style={styles.sectionHeadingRow}>
                <Text style={styles.sectionHeading}>SUB-ASSETS IN THIS APARTMENT ({selectedApartment.subAssets.length})</Text>
                <Text style={styles.sectionHint}>Air conditioners, geysers & appliances</Text>
              </View>

              {/* Sub-Assets Cards */}
              <View style={styles.subAssetsList}>
                {selectedApartment.subAssets.map(sub => {
                  const subExpensePct = selectedApartment.totalMaintenanceSpent > 0 ? (sub.lifetimeRepairCost / selectedApartment.totalMaintenanceSpent) * 100 : 0;

                  return (
                    <View key={sub.id} style={styles.subCard}>
                      <View style={styles.rowBetween}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={{ fontSize: 20 }}>
                            {sub.category === 'HVAC' ? '❄️' : sub.category === 'Plumbing' ? '🚰' : sub.category === 'Appliance' ? '🧺' : '⚡'}
                          </Text>
                          <View>
                            <Text style={styles.subCardTitle}>{sub.name}</Text>
                            <Text style={styles.subCardBrand}>{sub.brandModel}</Text>
                          </View>
                        </View>
                        <View style={styles.warrantyBadge}>
                          <Text style={styles.warrantyText}>{sub.warrantyStatus}</Text>
                        </View>
                      </View>

                      {/* Sub-Asset Metrics */}
                      <View style={styles.subCardMetrics}>
                        <View style={styles.subMetric}>
                          <Text style={styles.subMetricLabel}>PURCHASE COST</Text>
                          <Text style={styles.subMetricVal}>₹{sub.purchaseCost.toLocaleString()}</Text>
                        </View>
                        <View style={styles.subMetric}>
                          <Text style={styles.subMetricLabel}>LIFETIME REPAIRS</Text>
                          <Text style={[styles.subMetricVal, { color: sub.lifetimeRepairCost > 5000 ? '#DC2626' : '#0F766E' }]}>
                            ₹{sub.lifetimeRepairCost.toLocaleString()}
                          </Text>
                        </View>
                        <View style={styles.subMetric}>
                          <Text style={styles.subMetricLabel}>% OF APT EXPENSE</Text>
                          <Text style={styles.subMetricVal}>{subExpensePct.toFixed(0)}%</Text>
                        </View>
                      </View>

                      {/* Past Repair Logs if any */}
                      {sub.repairLogs && sub.repairLogs.length > 0 && (
                        <View style={styles.repairLogsBox}>
                          <Text style={styles.repairLogHead}>REPAIR HISTORY:</Text>
                          {sub.repairLogs.map(log => (
                            <View key={log.id} style={styles.repairLogRow}>
                              <Text style={styles.repairLogTitle}>• {log.title} ({log.date})</Text>
                              <Text style={styles.repairLogCost}>₹{log.cost.toLocaleString()}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: LOG REPAIR / MAINTENANCE EXPENSE                  */}
      {/* ======================================================== */}
      <Modal visible={isAddExpenseVisible} animationType="slide" transparent>
        <View style={styles.popupOverlay}>
          <View style={styles.popupCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.popupTitle}>Log Maintenance Expense</Text>
              <Pressable onPress={() => setIsAddExpenseVisible(false)} hitSlop={10}><Text style={styles.popupClose}>✕</Text></Pressable>
            </View>
            <Text style={styles.popupSub}>This will update the apartment's lifetime cost and expense ratio.</Text>

            <Text style={styles.formLabel}>REPAIR / SERVICE TITLE</Text>
            <TextInput
              placeholder="e.g. AC compressor capacitor replacement"
              placeholderTextColor="#94A3B8"
              value={expenseTitle}
              onChangeText={setExpenseTitle}
              style={styles.formInput}
            />

            <Text style={styles.formLabel}>COST IN RUPEES (₹)</Text>
            <TextInput
              placeholder="e.g. 4500"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={expenseCost}
              onChangeText={setExpenseCost}
              style={styles.formInput}
            />

            <Text style={styles.formLabel}>TECHNICIAN / VENDOR</Text>
            <TextInput
              placeholder="e.g. Ramesh K. (CoolAir HVAC Solutions)"
              placeholderTextColor="#94A3B8"
              value={expenseTech}
              onChangeText={setExpenseTech}
              style={styles.formInput}
            />

            <Pressable onPress={handleAddExpense} style={styles.popupSubmitBtn}>
              <Text style={styles.popupSubmitText}>Save Expense & Recalculate ↗</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: ADD NEW SUB-ASSET                                 */}
      {/* ======================================================== */}
      <Modal visible={isAddSubAssetVisible} animationType="slide" transparent>
        <View style={styles.popupOverlay}>
          <View style={styles.popupCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.popupTitle}>Add Sub-Asset to Unit</Text>
              <Pressable onPress={() => setIsAddSubAssetVisible(false)} hitSlop={10}><Text style={styles.popupClose}>✕</Text></Pressable>
            </View>
            <Text style={styles.popupSub}>Register an AC, geyser, refrigerator, or smart panel.</Text>

            <Text style={styles.formLabel}>SUB-ASSET NAME</Text>
            <TextInput
              placeholder="e.g. Guest Bedroom Split AC"
              placeholderTextColor="#94A3B8"
              value={newSubName}
              onChangeText={setNewSubName}
              style={styles.formInput}
            />

            <Text style={styles.formLabel}>BRAND & MODEL</Text>
            <TextInput
              placeholder="e.g. Daikin 1.0 Ton 5-Star"
              placeholderTextColor="#94A3B8"
              value={newSubBrand}
              onChangeText={setNewSubBrand}
              style={styles.formInput}
            />

            <Text style={styles.formLabel}>PURCHASE / CAPEX COST (₹)</Text>
            <TextInput
              placeholder="e.g. 35000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={newSubCost}
              onChangeText={setNewSubCost}
              style={styles.formInput}
            />

            <Pressable onPress={handleAddSubAsset} style={styles.popupSubmitBtn}>
              <Text style={styles.popupSubmitText}>Register Sub-Asset ↗</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF9' },
  scrollPad: { padding: 18, paddingBottom: 60, maxWidth: 700, width: '100%', alignSelf: 'center' },
  pageHeader: { marginBottom: 16 },
  headerSubtitle: { fontSize: 10, letterSpacing: 1.6, fontWeight: '800', color: '#0F766E' },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#0F172A', letterSpacing: -1, marginTop: 4 },
  headerExplainer: { fontSize: 12, color: '#64748B', marginTop: 4, lineHeight: 18 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  portfolioCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  pCardLabel: { fontSize: 10, letterSpacing: 1.5, fontWeight: '900', color: '#64748B' },
  ratioRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  pRatioBig: { fontSize: 34, fontWeight: '900', color: '#0F172A', letterSpacing: -1.5 },
  healthTag: { backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  healthTagText: { fontSize: 11, fontWeight: '800', color: '#166534' },
  pUnitsBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, alignItems: 'center' },
  pUnitsNum: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  pUnitsLabel: { fontSize: 9, fontWeight: '700', color: '#64748B' },
  progressTrack: { height: 7, backgroundColor: '#E2E8F0', borderRadius: 4, marginTop: 14, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#0F766E' },
  portfolioStatsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  pStatItem: { alignItems: 'center' },
  pStatVal: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  pStatSub: { fontSize: 10, color: '#64748B', marginTop: 2 },
  pStatDivider: { width: 1, height: 26, backgroundColor: '#E2E8F0' },
  chipScroll: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  filterChipText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  filterChipTextActive: { color: '#FFFFFF' },
  searchBar: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 12,
    color: '#0F172A',
    marginBottom: 16,
  },
  apartmentsList: { gap: 14 },
  aptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  unitBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  unitTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  typeTag: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  typeTagText: { fontSize: 10, fontWeight: '800', color: '#1D4ED8' },
  unitLocation: { fontSize: 11, color: '#64748B', marginTop: 2 },
  expensePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  expensePillGood: { backgroundColor: '#DCFCE7' },
  expensePillHigh: { backgroundColor: '#FEE2E2' },
  expensePillText: { fontSize: 11, fontWeight: '800' },
  expenseTextGood: { color: '#166534' },
  expenseTextHigh: { color: '#991B1B' },
  tenantBanner: { backgroundColor: '#F8FAF9', padding: 10, borderRadius: 10, marginTop: 12 },
  tenantLabel: { fontSize: 9, letterSpacing: 1.2, fontWeight: '800', color: '#94A3B8' },
  tenantName: { fontSize: 12, color: '#334155', marginTop: 2 },
  aptMetricsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  aptMetricCol: { flex: 1 },
  aptMetricLabel: { fontSize: 9, letterSpacing: 1, fontWeight: '800', color: '#64748B' },
  aptMetricVal: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginTop: 3 },
  subAssetsStrip: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  subAssetsCount: { fontSize: 10, fontWeight: '800', color: '#64748B', marginBottom: 6 },
  subBadgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  subAssetPill: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  subAssetPillText: { fontSize: 10, color: '#334155', fontWeight: '600' },
  aptCardFooter: { marginTop: 12, alignItems: 'flex-end' },
  tapPrompt: { fontSize: 11, color: '#0F766E', fontWeight: '800' },

  // MODAL STYLING
  modalContainer: { flex: 1, backgroundColor: '#F8FAF9' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 24 : 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalEyebrow: { fontSize: 10, letterSpacing: 1.4, fontWeight: '800', color: '#64748B' },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A', marginTop: 2 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 14, color: '#475569', fontWeight: '800' },
  modalScroll: { flex: 1, padding: 20 },
  detailFinCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
  detailFinTitle: { fontSize: 10, letterSpacing: 1.5, fontWeight: '900', color: '#64748B', marginBottom: 10 },
  detailFinRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailFinNum: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  detailFinSub: { fontSize: 11, color: '#64748B', marginTop: 2 },
  ratioMeterText: { fontSize: 12, color: '#334155' },
  ratioMeterStatus: { fontSize: 11, fontWeight: '700' },
  modalActionsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  actionBtnPrimary: { flex: 1, backgroundColor: '#0F766E', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  actionBtnPrimaryText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  actionBtnSecondary: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  actionBtnSecondaryText: { color: '#334155', fontSize: 12, fontWeight: '700' },
  sectionHeadingRow: { marginBottom: 12 },
  sectionHeading: { fontSize: 11, letterSpacing: 1.4, fontWeight: '900', color: '#0F766E' },
  sectionHint: { fontSize: 11, color: '#64748B', marginTop: 2 },
  subAssetsList: { gap: 12 },
  subCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  subCardTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  subCardBrand: { fontSize: 11, color: '#64748B', marginTop: 1 },
  warrantyBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  warrantyText: { fontSize: 10, fontWeight: '800', color: '#1D4ED8' },
  subCardMetrics: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  subMetric: { flex: 1 },
  subMetricLabel: { fontSize: 8, letterSpacing: 1, fontWeight: '800', color: '#94A3B8' },
  subMetricVal: { fontSize: 13, fontWeight: '800', color: '#0F172A', marginTop: 2 },
  repairLogsBox: { marginTop: 12, backgroundColor: '#F8FAF9', padding: 10, borderRadius: 10 },
  repairLogHead: { fontSize: 9, letterSpacing: 1.2, fontWeight: '800', color: '#64748B', marginBottom: 4 },
  repairLogRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 },
  repairLogTitle: { fontSize: 11, color: '#334155', flex: 1 },
  repairLogCost: { fontSize: 11, fontWeight: '800', color: '#DC2626' },

  // POPUP MODALS
  popupOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  popupCard: { backgroundColor: '#FFFFFF', width: '100%', maxWidth: 420, borderRadius: 20, padding: 22 },
  popupTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  popupClose: { fontSize: 16, fontWeight: '800', color: '#64748B' },
  popupSub: { fontSize: 11, color: '#64748B', marginTop: 4, marginBottom: 14 },
  formLabel: { fontSize: 10, letterSpacing: 1.2, fontWeight: '800', color: '#64748B', marginTop: 10, marginBottom: 5 },
  formInput: { backgroundColor: '#F8FAF9', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, paddingHorizontal: 12, height: 44, fontSize: 13, color: '#0F172A' },
  popupSubmitBtn: { marginTop: 18, backgroundColor: '#0F766E', paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  popupSubmitText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
});

