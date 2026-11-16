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
import { AMC_CONTRACTS, VENDORS } from '../data/mockData';
import { ApartmentAsset, SubAsset } from '../types/cafm';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Demo Approvals Request Data (Feature 8)
interface ExpenseApprovalRequest {
  id: string;
  ticketId: string;
  property: string;
  subAssetName: string;
  vendor: string;
  description: string;
  quotedCost: number;
  landlordShare: number;
  tenantShare: number;
  date: string;
  status: 'Pending Owner Approval' | 'Approved' | 'Rejected';
  priority: 'Critical' | 'High' | 'Medium';
}

const INITIAL_APPROVAL_REQUESTS: ExpenseApprovalRequest[] = [
  {
    id: 'REQ-2026-88',
    ticketId: 'WO-2026-0101',
    property: 'Cyber Heights · Penthouse 501',
    subAssetName: 'Multi-Zone VRV AC System (Daikin 6HP)',
    vendor: 'Daikin Direct Certified Engineering',
    description: 'VRV Outdoor inverter PCB board capacitor replacement and R410A gas charge top-up.',
    quotedCost: 14500,
    landlordShare: 14500,
    tenantShare: 0,
    date: 'Today, 09:30 AM',
    status: 'Pending Owner Approval',
    priority: 'Critical',
  },
  {
    id: 'REQ-2026-92',
    ticketId: 'IC260031',
    property: 'Palm Residency · Unit 204',
    subAssetName: 'Mitsubishi Heavy 2.0 Ton AC Compressor',
    vendor: 'CoolAir HVAC Solutions',
    description: 'Compressor starter capacitor and fan motor bearing overhaul following cooling loss.',
    quotedCost: 8500,
    landlordShare: 6800,
    tenantShare: 1700,
    date: 'Yesterday, 04:15 PM',
    status: 'Pending Owner Approval',
    priority: 'High',
  },
  {
    id: 'REQ-2026-94',
    ticketId: 'IC260032',
    property: 'Palm Residency · Unit 204 Pantry',
    subAssetName: 'Kitchen Under-Sink Copper Valve',
    vendor: 'MasterFlow Plumbing',
    description: 'Quarter-turn copper isolation ball valve replacement due to braided line drip.',
    quotedCost: 2500,
    landlordShare: 2500,
    tenantShare: 0,
    date: '09 Nov 2026',
    status: 'Approved',
    priority: 'Critical',
  },
];

// Demo Property Inspection & Damage Audit Data (Feature 10 & 11)
interface InspectionReport {
  id: string;
  property: string;
  type: 'Move-In Audit' | 'Move-Out Inspection' | 'Annual Asset Audit';
  tenantName: string;
  date: string;
  overallScore: number;
  status: 'Passed - Healthy' | 'Minor Action Required' | 'Damage Claim Pending';
  photos: string[];
  findings: string[];
  landlordCostEstimate: number;
  tenantCostEstimate: number;
}

const INSPECTION_REPORTS: InspectionReport[] = [
  {
    id: 'AUD-2026-04',
    property: 'Palm Residency · Unit 204 (3BHK)',
    type: 'Move-In Audit',
    tenantName: 'Rahul & Priya Sharma',
    date: '15 Jan 2026',
    overallScore: 94,
    status: 'Passed - Healthy',
    photos: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    ],
    findings: [
      '✓ Living Room Mitsubishi AC cooling test: Passed (18°C output)',
      '✓ Kitchen RO Kent Purifier membrane & flow test: Passed',
      '✓ All circuit breakers and wall sockets thermal check: Passed',
    ],
    landlordCostEstimate: 0,
    tenantCostEstimate: 0,
  },
  {
    id: 'AUD-2025-11',
    property: 'Cyber Heights · Unit 302 (2BHK)',
    type: 'Annual Asset Audit',
    tenantName: 'Anand Varma',
    date: '10 Nov 2025',
    overallScore: 88,
    status: 'Minor Action Required',
    photos: ['https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&q=80'],
    findings: [
      '✓ Grundfos booster pump flow pressure: Normal (3.2 bar)',
      '⚠️ Bath 2 geyser anode rod shows mild scaling (scheduled for AMC check)',
    ],
    landlordCostEstimate: 1200,
    tenantCostEstimate: 0,
  },
];

interface Props {
  currentUser: { name: string; email: string; initials: string; role: string; color: string };
  onLogout: () => void;
  apartments: ApartmentAsset[];
  onUpdateApartments: (apartments: ApartmentAsset[]) => void;
  onOpenAssistant?: () => void;
}

export default function PropertyOwnerModule({
  currentUser,
  onLogout,
  apartments,
  onUpdateApartments,
  onOpenAssistant,
}: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'approvals' | 'repair_vs_replace' | 'inspections' | 'documents' | 'analytics'>('overview');
  const [approvalRequests, setApprovalRequests] = useState<ExpenseApprovalRequest[]>(INITIAL_APPROVAL_REQUESTS);
  const [selectedApartment, setSelectedApartment] = useState<ApartmentAsset | null>(null);

  // Animation drivers
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Modals
  const [selectedApproval, setSelectedApproval] = useState<ExpenseApprovalRequest | null>(null);
  const [selectedInspection, setSelectedInspection] = useState<InspectionReport | null>(null);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  // Financial Portfolio Calculations
  const totalRentCollected = apartments.reduce((acc, a) => acc + a.totalRentCollected, 0);
  const totalMaintenanceSpent = apartments.reduce((acc, a) => acc + a.totalMaintenanceSpent, 0);
  const portfolioExpenseRatio = totalRentCollected > 0 ? (totalMaintenanceSpent / totalRentCollected) * 100 : 0;
  const totalMonthlyRent = apartments.reduce((acc, a) => acc + a.monthlyRent, 0);
  const annualApprovedBudget = 120000; // ₹1.2L annual maintenance budget

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      Animated.timing(progressAnim, { toValue: Math.min(portfolioExpenseRatio / 25, 1), duration: 800, useNativeDriver: false }),
    ]).start();

    // Looping pulse animation for live decision requests
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [activeTab]);

  // Handlers for Major Expense Approvals (Feature 8)
  function handleApproveRequest(id: string) {
    setApprovalRequests(prev =>
      prev.map(r => (r.id === id ? { ...r, status: 'Approved' } : r))
    );
    setSelectedApproval(null);
    Alert.alert('Quote Authorized! ✅', `Expense request ${id} approved. Work order dispatched to vendor.`);
  }

  function handleRejectRequest(id: string) {
    setApprovalRequests(prev =>
      prev.map(r => (r.id === id ? { ...r, status: 'Rejected' } : r))
    );
    setSelectedApproval(null);
    Alert.alert('Quote Rejected ✕', `Request ${id} declined. Property manager notified to request revision.`);
  }

  const pendingApprovals = approvalRequests.filter(r => r.status === 'Pending Owner Approval');

  return (
    <View style={styles.container}>
      {/* ======================================================== */}
      {/* 1. TOP CREATIVE LUXURY HEADER                            */}
      {/* ======================================================== */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoEmblem}>
            <Image source={require('../../assets/nexus-emblem.png')} style={styles.emblemImg} resizeMode="contain" />
          </View>
          <View>
            <Text style={styles.brandName}>noverra<Text style={{ color: '#00F0FF' }}>.</Text></Text>
            <View style={styles.roleTag}>
              <Text style={styles.roleTagText}>👑 REAL ESTATE OWNER & INVESTOR</Text>
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

      {/* Hero Financial Status Banner */}
      <View style={styles.statusBanner}>
        <View style={styles.bannerRow}>
          <View style={styles.bannerLeft}>
            <View style={styles.greenPulseOrb} />
            <Text style={styles.bannerTitle}>PORTFOLIO HEALTH: OPTIMAL (EXPENSE RATIO {portfolioExpenseRatio.toFixed(1)}%)</Text>
          </View>
          <Text style={styles.bannerSub}>Benchmark &lt;15% Rent</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>
        {/* ======================================================== */}
        {/* 2. PENDING APPROVALS ALERT BANNER (Feature 8, 16)        */}
        {/* ======================================================== */}
        {pendingApprovals.length > 0 && (
          <Animated.View style={[styles.approvalAlertCard, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.rowBetween}>
              <View style={styles.rowAlign}>
                <Text style={{ fontSize: 18 }}>🚨</Text>
                <View>
                  <Text style={styles.alertTitle}>{pendingApprovals.length} DECISION REQUESTS PENDING</Text>
                  <Text style={styles.alertSub}>Quotations &gt;₹5,000 awaiting your owner authorization</Text>
                </View>
              </View>
              <Pressable onPress={() => setActiveTab('approvals')} style={styles.alertActionBtn}>
                <Text style={styles.alertActionText}>Review ({pendingApprovals.length}) ↗</Text>
              </Pressable>
            </View>
          </Animated.View>
        )}

        {/* ======================================================== */}
        {/* 3. NAVIGATION TAB STRIP (Creative Modern Visuals)         */}
        {/* ======================================================== */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabNavStrip}>
          {[
            { id: 'overview', label: '📊 Dashboard Overview' },
            { id: 'approvals', label: `⚡ Approvals (${pendingApprovals.length})` },
            { id: 'repair_vs_replace', label: '⚖️ Repair vs Replace' },
            { id: 'inspections', label: '📋 Inspections & Audits' },
            { id: 'documents', label: '📑 Documents & AMC' },
            { id: 'analytics', label: '📈 Cost Analytics' },
          ].map(tab => (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id as any)}
              style={[styles.navTabPill, activeTab === tab.id && styles.navTabPillActive]}
            >
              <Text style={[styles.navTabText, activeTab === tab.id && styles.navTabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* ======================================================== */}
        {/* TAB 1: OWNER DASHBOARD OVERVIEW (Features 1, 2, 3, 5, 12) */}
        {/* ======================================================== */}
        {activeTab === 'overview' && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* 4 KPI CARDS */}
            <View style={styles.kpiGrid}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiValue}>₹{(totalMonthlyRent / 1000).toFixed(0)}k</Text>
                <Text style={styles.kpiLabel}>Monthly Rent</Text>
                <Text style={styles.kpiSub}>100% Occupancy</Text>
                <View style={[styles.kpiUnderline, { backgroundColor: '#00F0FF' }]} />
              </View>

              <View style={styles.kpiCard}>
                <Text style={[styles.kpiValue, { color: '#10B981' }]}>₹{(totalMaintenanceSpent / 1000).toFixed(0)}k</Text>
                <Text style={styles.kpiLabel}>Lifetime Maintenance</Text>
                <Text style={styles.kpiSub}>Sub-asset repairs</Text>
                <View style={[styles.kpiUnderline, { backgroundColor: '#10B981' }]} />
              </View>

              <View style={styles.kpiCard}>
                <Text style={[styles.kpiValue, { color: '#059669' }]}>{portfolioExpenseRatio.toFixed(1)}%</Text>
                <Text style={styles.kpiLabel}>Expense Ratio</Text>
                <Text style={styles.kpiSub}>Healthy Benchmark</Text>
                <View style={[styles.kpiUnderline, { backgroundColor: '#059669' }]} />
              </View>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiValue}>{apartments.length}</Text>
                <Text style={styles.kpiLabel}>Owned Units</Text>
                <Text style={styles.kpiSub}>2 Properties</Text>
                <View style={[styles.kpiUnderline, { backgroundColor: '#8B5CF6' }]} />
              </View>
            </View>

            {/* EXPENSE RATIO & BUDGET MONITORING VISUALIZATION CARD (Feature 12) */}
            <View style={styles.vizCard}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.vizCategoryTag}>BUDGET & EXPENSE MONITORING</Text>
                  <Text style={styles.vizTitle}>Rental Income vs Maintenance Spend</Text>
                </View>
                <View style={styles.healthyBadge}>
                  <Text style={styles.healthyBadgeText}>✓ HEALTHY YIELD</Text>
                </View>
              </View>

              {/* Expense Bar Visual */}
              <View style={styles.gaugeContainer}>
                <View style={styles.rowBetween}>
                  <Text style={styles.gaugeLabel}>Lifetime Maintenance Ratio ({portfolioExpenseRatio.toFixed(1)}%)</Text>
                  <Text style={styles.gaugeVal}>Max Benchmark: 15%</Text>
                </View>
                <View style={styles.gaugeTrack}>
                  <View style={[styles.gaugeFill, { width: `${Math.min(portfolioExpenseRatio * 4, 100)}%` }]} />
                </View>
              </View>

              {/* Budget Comparison Metrics */}
              <View style={styles.budgetRow}>
                <View style={styles.budgetCol}>
                  <Text style={styles.budVal}>₹{(annualApprovedBudget / 1000).toFixed(0)}k</Text>
                  <Text style={styles.budSub}>Annual Maintenance Budget</Text>
                </View>
                <View style={styles.budgetDivider} />
                <View style={styles.budgetCol}>
                  <Text style={[styles.budVal, { color: '#10B981' }]}>₹{(totalMaintenanceSpent / 1000).toFixed(1)}k</Text>
                  <Text style={styles.budSub}>Actual Maintenance Spent</Text>
                </View>
                <View style={styles.budgetDivider} />
                <View style={styles.budgetCol}>
                  <Text style={[styles.budVal, { color: '#00F0FF' }]}>
                    ₹{((annualApprovedBudget - totalMaintenanceSpent) / 1000).toFixed(1)}k
                  </Text>
                  <Text style={styles.budSub}>Remaining Budget</Text>
                </View>
              </View>
            </View>

            {/* OWNED PROPERTY PORTFOLIO LIST (Feature 2 & 3) */}
            <Text style={styles.sectionHeading}>Owned Real Estate Units & Sub-Assets</Text>

            <View style={styles.propertyStack}>
              {apartments.map(apt => {
                const ratio = apt.totalRentCollected > 0 ? (apt.totalMaintenanceSpent / apt.totalRentCollected) * 100 : 0;
                return (
                  <Pressable
                    key={apt.id}
                    onPress={() => setSelectedApartment(apt)}
                    style={({ pressed }) => [styles.aptCard, pressed && { opacity: 0.9 }]}
                  >
                    <View style={styles.rowBetween}>
                      <View style={styles.rowAlign}>
                        <View style={styles.aptIconWrap}>
                          <Text style={{ fontSize: 16 }}>🏢</Text>
                        </View>
                        <View>
                          <Text style={styles.aptUnit}>{apt.unitNumber} ({apt.type})</Text>
                          <Text style={styles.aptProp}>{apt.property} · {apt.buildingBlock}</Text>
                        </View>
                      </View>
                      <View style={styles.occupiedBadge}>
                        <Text style={styles.occupiedBadgeText}>● {apt.status}</Text>
                      </View>
                    </View>

                    <View style={styles.aptMetricsRow}>
                      <View>
                        <Text style={styles.aptLabel}>TENANT</Text>
                        <Text style={styles.aptVal}>{apt.tenantName}</Text>
                      </View>
                      <View>
                        <Text style={styles.aptLabel}>RENT</Text>
                        <Text style={styles.aptVal}>₹{(apt.monthlyRent / 1000).toFixed(0)}k/mo</Text>
                      </View>
                      <View>
                        <Text style={styles.aptLabel}>SPEND</Text>
                        <Text style={[styles.aptVal, { color: '#10B981' }]}>₹{(apt.totalMaintenanceSpent / 1000).toFixed(1)}k</Text>
                      </View>
                      <View>
                        <Text style={styles.aptLabel}>RATIO</Text>
                        <Text style={[styles.aptVal, { color: '#059669' }]}>{ratio.toFixed(1)}%</Text>
                      </View>
                    </View>

                    {/* Sub-assets Pills */}
                    <View style={styles.subAssetsStrip}>
                      <Text style={styles.subAssetCountTag}>{apt.subAssets.length} Sub-Assets Tracked:</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
                        {apt.subAssets.map(sub => (
                          <View key={sub.id} style={styles.subPill}>
                            <Text style={styles.subPillText}>{sub.name} ({sub.healthScore}%)</Text>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* ======================================================== */}
        {/* TAB 2: MAJOR EXPENSE APPROVALS WORKFLOW (Feature 8, 16)   */}
        {/* ======================================================== */}
        {activeTab === 'approvals' && (
          <View style={styles.tabContent}>
            <View style={styles.tabHeaderCard}>
              <Text style={styles.tabHeaderTitle}>Major Expense Authorizations</Text>
              <Text style={styles.tabHeaderSub}>
                Quotes above ₹5,000 require explicit owner approval before dispatching contractors.
              </Text>
            </View>

            <View style={styles.approvalsStack}>
              {approvalRequests.map(req => {
                const isPending = req.status === 'Pending Owner Approval';
                const isApproved = req.status === 'Approved';

                return (
                  <View key={req.id} style={[styles.approvalCard, isPending && styles.approvalCardPending]}>
                    <View style={styles.rowBetween}>
                      <View style={styles.rowAlign}>
                        <Text style={styles.reqId}>{req.id} · {req.ticketId}</Text>
                        <View style={[styles.priTag, req.priority === 'Critical' ? styles.bgRed : styles.bgAmber]}>
                          <Text style={[styles.priTagText, req.priority === 'Critical' ? styles.txtRed : styles.txtAmber]}>
                            {req.priority} Priority
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.apprBadge, isApproved ? styles.bgGreen : isPending ? styles.bgYellow : styles.bgGray]}>
                        <Text style={[styles.apprBadgeText, isApproved ? styles.txtGreen : isPending ? styles.txtYellow : styles.txtGray]}>
                          {req.status}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.apprTitle}>{req.subAssetName}</Text>
                    <Text style={styles.apprProperty}>📍 {req.property}</Text>
                    <Text style={styles.apprVendor}>Contractor: {req.vendor}</Text>
                    <Text style={styles.apprDesc}>{req.description}</Text>

                    {/* Cost & Landlord/Tenant Share Breakdown (Feature 9) */}
                    <View style={styles.shareBox}>
                      <View style={styles.rowBetween}>
                        <Text style={styles.shareLabel}>Total Quoted Amount:</Text>
                        <Text style={styles.shareTotal}>₹{req.quotedCost.toLocaleString()}</Text>
                      </View>
                      <View style={styles.shareDivider} />
                      <View style={styles.rowBetween}>
                        <Text style={styles.shareSubLabel}>Landlord Share (Wear & Tear):</Text>
                        <Text style={styles.shareLandlord}>₹{req.landlordShare.toLocaleString()}</Text>
                      </View>
                      {req.tenantShare > 0 && (
                        <View style={styles.rowBetween}>
                          <Text style={styles.shareSubLabel}>Tenant Share (Damage/Usage):</Text>
                          <Text style={styles.shareTenant}>₹{req.tenantShare.toLocaleString()}</Text>
                        </View>
                      )}
                    </View>

                    {/* Action Buttons for Pending Approvals */}
                    {isPending && (
                      <View style={styles.apprActionsRow}>
                        <Pressable
                          onPress={() => handleRejectRequest(req.id)}
                          style={styles.rejectBtn}
                        >
                          <Text style={styles.rejectBtnText}>✕ Decline Quote</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => handleApproveRequest(req.id)}
                          style={styles.approveBtn}
                        >
                          <Text style={styles.approveBtnText}>✓ Authorize & Approve ↗</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 3: REPAIR VS REPLACE ANALYSIS ENGINE (Feature 7)      */}
        {/* ======================================================== */}
        {activeTab === 'repair_vs_replace' && (
          <View style={styles.tabContent}>
            <View style={styles.tabHeaderCard}>
              <Text style={styles.tabHeaderTitle}>Repair vs. Replace Financial Analysis</Text>
              <Text style={styles.tabHeaderSub}>
                Calculates cumulative repairs against replacement costs to prevent over-spending on aging assets.
              </Text>
            </View>

            {apartments.flatMap(apt => apt.subAssets.map(sub => ({ ...sub, apartmentUnit: apt.unitNumber }))).map(sub => {
              const repairRatio = sub.purchaseCost > 0 ? (sub.lifetimeRepairCost / sub.purchaseCost) * 100 : 0;
              const isReplaceRecommended = repairRatio >= 50;

              return (
                <View key={sub.id} style={styles.rrCard}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.rrTag}>{sub.id} · {sub.category}</Text>
                    <View style={[styles.rrBadge, isReplaceRecommended ? styles.bgRed : styles.bgGreen]}>
                      <Text style={[styles.rrBadgeText, isReplaceRecommended ? styles.txtRed : styles.txtGreen]}>
                        {isReplaceRecommended ? '⚠️ REPLACE RECOMMENDED' : '✓ REPAIR & MAINTAIN'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.rrName}>{sub.name}</Text>
                  <Text style={styles.rrSub}>Unit: {sub.apartmentUnit} · Brand: {sub.brandModel}</Text>

                  <View style={styles.rrMetricsGrid}>
                    <View style={styles.rrCol}>
                      <Text style={styles.rrVal}>₹{sub.purchaseCost.toLocaleString()}</Text>
                      <Text style={styles.rrLabel}>Original Purchase Cost</Text>
                    </View>
                    <View style={styles.rrCol}>
                      <Text style={[styles.rrVal, { color: '#10B981' }]}>₹{sub.lifetimeRepairCost.toLocaleString()}</Text>
                      <Text style={styles.rrLabel}>Lifetime Repair Spent</Text>
                    </View>
                    <View style={styles.rrCol}>
                      <Text style={[styles.rrVal, { color: isReplaceRecommended ? '#DC2626' : '#059669' }]}>
                        {repairRatio.toFixed(1)}%
                      </Text>
                      <Text style={styles.rrLabel}>Repair/Replace Ratio</Text>
                    </View>
                  </View>

                  {/* Recommendation Analysis */}
                  <View style={styles.recomBox}>
                    <Text style={styles.recomTitle}>FINANCIAL AI RECOMMENDATION:</Text>
                    <Text style={styles.recomText}>
                      {isReplaceRecommended
                        ? `Cumulative repair cost (₹${sub.lifetimeRepairCost}) has exceeded 50% of asset purchase value. Replacing with a new energy-efficient inverter unit will reduce ongoing maintenance expenses and protect yield.`
                        : `Sub-asset repair ratio (${repairRatio.toFixed(1)}%) is healthy. Continue AMC coverage and routine coil cleaning.`}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 4: INSPECTIONS & TENANT AUDITS (Feature 10 & 11)     */}
        {/* ======================================================== */}
        {activeTab === 'inspections' && (
          <View style={styles.tabContent}>
            <View style={styles.tabHeaderCard}>
              <Text style={styles.tabHeaderTitle}>Tenant Move-In / Move-Out Audits</Text>
              <Text style={styles.tabHeaderSub}>
                Signed property condition reports, damage photo evidence, and cost allocation records.
              </Text>
            </View>

            {INSPECTION_REPORTS.map(rep => (
              <Pressable
                key={rep.id}
                onPress={() => setSelectedInspection(rep)}
                style={({ pressed }) => [styles.auditCard, pressed && { opacity: 0.9 }]}
              >
                <View style={styles.rowBetween}>
                  <Text style={styles.auditId}>{rep.id} · {rep.type}</Text>
                  <View style={styles.auditScoreBadge}>
                    <Text style={styles.auditScoreText}>{rep.overallScore}% Score</Text>
                  </View>
                </View>

                <Text style={styles.auditProperty}>{rep.property}</Text>
                <Text style={styles.auditTenant}>Tenant: {rep.tenantName} · Date: {rep.date}</Text>

                <View style={styles.findingsBox}>
                  {rep.findings.map((f, i) => (
                    <Text key={i} style={styles.findingItem}>{f}</Text>
                  ))}
                </View>

                {rep.photos.length > 0 && (
                  <View style={styles.auditPhotoStrip}>
                    {rep.photos.map((uri, idx) => (
                      <Image key={idx} source={{ uri }} style={styles.auditThumb} />
                    ))}
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 5: DOCUMENTS & AMC CONTRACTS (Feature 15, 17)        */}
        {/* ======================================================== */}
        {activeTab === 'documents' && (
          <View style={styles.tabContent}>
            <View style={styles.tabHeaderCard}>
              <Text style={styles.tabHeaderTitle}>Asset Warranties & AMC Contracts</Text>
              <Text style={styles.tabHeaderSub}>
                Operational agreements, equipment warranties, title deeds, and vendor AMC SLAs.
              </Text>
            </View>

            {AMC_CONTRACTS.map(amc => (
              <View key={amc.id} style={styles.docCard}>
                <View style={styles.rowBetween}>
                  <Text style={styles.docId}>{amc.id}</Text>
                  <View style={styles.activePill}>
                    <Text style={styles.activePillText}>● {amc.status}</Text>
                  </View>
                </View>
                <Text style={styles.docTitle}>{amc.title}</Text>
                <Text style={styles.docSub}>Vendor: {amc.vendor}</Text>
                <Text style={styles.docSub}>Covered Units: {amc.coveredUnits}</Text>
                <View style={styles.rowBetween}>
                  <Text style={styles.docFee}>₹{amc.annualFee.toLocaleString()}/yr</Text>
                  <Text style={styles.docExpiry}>Expiry: {amc.expiry}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 6: PORTFOLIO ANALYTICS (Feature 14, 18)              */}
        {/* ======================================================== */}
        {activeTab === 'analytics' && (
          <View style={styles.tabContent}>
            <View style={styles.tabHeaderCard}>
              <Text style={styles.tabHeaderTitle}>Contractor Performance & Callback Ratings</Text>
              <Text style={styles.tabHeaderSub}>
                Service quality metrics, repeat callback tracking, and vendor rating scores.
              </Text>
            </View>

            {VENDORS.map(v => (
              <View key={v.id} style={styles.vendorCard}>
                <View style={styles.rowBetween}>
                  <Text style={styles.vendorName}>{v.name}</Text>
                  <Text style={styles.vendorRating}>{v.rating}</Text>
                </View>
                <Text style={styles.vendorSub}>Specialty: {v.specialty}</Text>
                <Text style={styles.vendorSub}>Contact: {v.contact}</Text>
                <View style={styles.rowBetween}>
                  <Text style={styles.activeContractsText}>{v.activeContracts} Active Contracts</Text>
                  <Text style={{ fontSize: 11, color: '#059669', fontWeight: '800' }}>0 Repeat Callbacks</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ======================================================== */}
      {/* MODAL: INSPECT APARTMENT DETAILS                         */}
      {/* ======================================================== */}
      <Modal visible={!!selectedApartment} animationType="slide">
        {selectedApartment && (
          <View style={styles.modalView}>
            <View style={styles.modalNav}>
              <View>
                <Text style={styles.modalEyebrow}>{selectedApartment.property}</Text>
                <Text style={styles.modalHeading}>{selectedApartment.unitNumber} ({selectedApartment.type})</Text>
              </View>
              <Pressable onPress={() => setSelectedApartment(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>

            <ScrollView style={{ padding: 18 }}>
              <View style={styles.modalCard}>
                <Text style={styles.mSubTitle}>TENANT & FINANCIAL DETAILS</Text>
                <Text style={styles.mText}>Tenant: {selectedApartment.tenantName} ({selectedApartment.tenantPhone})</Text>
                <Text style={styles.mText}>Monthly Rent: ₹{selectedApartment.monthlyRent.toLocaleString()}/mo</Text>
                <Text style={styles.mText}>Total Rent Collected: ₹{selectedApartment.totalRentCollected.toLocaleString()}</Text>
                <Text style={styles.mText}>Total Maintenance Spent: ₹{selectedApartment.totalMaintenanceSpent.toLocaleString()}</Text>
              </View>

              <Text style={styles.sectionHeading}>Tracked Sub-Assets in {selectedApartment.unitNumber}</Text>
              {selectedApartment.subAssets.map(sub => (
                <View key={sub.id} style={styles.modalCard}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.subName}>{sub.name}</Text>
                    <Text style={{ fontSize: 11, color: '#059669', fontWeight: '800' }}>{sub.healthScore}% Health</Text>
                  </View>
                  <Text style={styles.mText}>Model: {sub.brandModel}</Text>
                  <Text style={styles.mText}>Purchase Cost: ₹{sub.purchaseCost.toLocaleString()}</Text>
                  <Text style={styles.mText}>Lifetime Repair Cost: ₹{sub.lifetimeRepairCost.toLocaleString()}</Text>
                  <Text style={styles.mText}>Warranty: {sub.warrantyStatus}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
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
    paddingTop: Platform.OS === 'android' ? 20 : 12,
    paddingBottom: 14,
    backgroundColor: '#0F172A',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoEmblem: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#070A0F', padding: 3, justifyContent: 'center', alignItems: 'center' },
  emblemImg: { width: '100%', height: '100%' },
  brandName: { fontSize: 24, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1 },
  roleTag: { backgroundColor: 'rgba(0, 240, 255, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginTop: 1 },
  roleTagText: { fontSize: 8.5, fontWeight: '900', color: '#00F0FF', letterSpacing: 0.8 },
  headerRightGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  assistantBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(240, 253, 250, 0.15)', borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.4)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14 },
  assistantBtnText: { fontSize: 11, fontWeight: '800', color: '#00F0FF' },
  logoutBtn: { backgroundColor: 'rgba(255, 255, 255, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  logoutBtnText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },

  statusBanner: { backgroundColor: '#070C12', paddingHorizontal: 20, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  bannerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  greenPulseOrb: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#10B981' },
  bannerTitle: { fontSize: 9.5, fontWeight: '900', color: '#A7F3D0', letterSpacing: 0.5 },
  bannerSub: { fontSize: 9.5, color: '#94A3B8' },

  scrollPad: { padding: 18, maxWidth: 680, width: '100%', alignSelf: 'center' },

  // APPROVAL ALERT CARD
  approvalAlertCard: { backgroundColor: '#FFF1F2', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#FECDD3', marginBottom: 16 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowAlign: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  alertTitle: { fontSize: 11, fontWeight: '900', color: '#DC2626', letterSpacing: 1 },
  alertSub: { fontSize: 11, color: '#BE123C', marginTop: 1 },
  alertActionBtn: { backgroundColor: '#DC2626', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  alertActionText: { fontSize: 10.5, fontWeight: '800', color: '#FFFFFF' },

  // TAB NAV STRIP
  tabNavStrip: { flexDirection: 'row', marginBottom: 16 },
  navTabPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', marginRight: 8 },
  navTabPillActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  navTabText: { fontSize: 11.5, fontWeight: '700', color: '#64748B' },
  navTabTextActive: { color: '#FFFFFF' },

  // 4 KPI CARDS
  kpiGrid: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  kpiCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', position: 'relative', overflow: 'hidden' },
  kpiValue: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  kpiLabel: { fontSize: 10, color: '#64748B', fontWeight: '700', marginTop: 2 },
  kpiSub: { fontSize: 9, color: '#94A3B8', marginTop: 1 },
  kpiUnderline: { position: 'absolute', bottom: 0, left: 8, right: 8, height: 3.5, borderRadius: 2 },

  // VIZ CARD
  vizCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 18, shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  vizCategoryTag: { fontSize: 9, fontWeight: '900', color: '#0F766E', letterSpacing: 1.2 },
  vizTitle: { fontSize: 16, fontWeight: '900', color: '#0F172A', marginTop: 2 },
  healthyBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  healthyBadgeText: { fontSize: 9.5, fontWeight: '800', color: '#15803D' },
  gaugeContainer: { marginTop: 14 },
  gaugeLabel: { fontSize: 11, fontWeight: '700', color: '#0F172A' },
  gaugeVal: { fontSize: 10, color: '#64748B' },
  gaugeTrack: { height: 7, backgroundColor: '#E2E8F0', borderRadius: 4, marginTop: 6, overflow: 'hidden' },
  gaugeFill: { height: '100%', backgroundColor: '#059669' },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  budgetCol: { alignItems: 'center', flex: 1 },
  budVal: { fontSize: 16, fontWeight: '900', color: '#0F172A' },
  budSub: { fontSize: 9.5, color: '#64748B', marginTop: 2, textAlign: 'center' },
  budgetDivider: { width: 1, height: 26, backgroundColor: '#E2E8F0' },

  sectionHeading: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginBottom: 12 },
  propertyStack: { gap: 12 },
  aptCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  aptIconWrap: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  aptUnit: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  aptProp: { fontSize: 11, color: '#64748B' },
  occupiedBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  occupiedBadgeText: { fontSize: 10, fontWeight: '800', color: '#1D4ED8' },
  aptMetricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F8FAFC' },
  aptLabel: { fontSize: 9, fontWeight: '800', color: '#94A3B8' },
  aptVal: { fontSize: 12, fontWeight: '800', color: '#0F172A', marginTop: 2 },
  subAssetsStrip: { marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F8FAFC' },
  subAssetCountTag: { fontSize: 9.5, fontWeight: '800', color: '#0F766E' },
  subPill: { backgroundColor: '#F0FDFA', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginRight: 6, borderWidth: 1, borderColor: '#CCFBF1' },
  subPillText: { fontSize: 10, fontWeight: '700', color: '#0F766E' },

  // APPROVALS TAB
  tabContent: { gap: 14 },
  tabHeaderCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  tabHeaderTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  tabHeaderSub: { fontSize: 12, color: '#64748B', marginTop: 2, lineHeight: 18 },
  approvalsStack: { gap: 12 },
  approvalCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  approvalCardPending: { borderColor: '#FDE68A', backgroundColor: '#FFFDF5' },
  reqId: { fontSize: 11, fontWeight: '800', color: '#0284C7' },
  priTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 6 },
  priTagText: { fontSize: 9, fontWeight: '800' },
  bgRed: { backgroundColor: '#FEE2E2' },
  txtRed: { color: '#DC2626' },
  bgAmber: { backgroundColor: '#FEF3C7' },
  txtAmber: { color: '#B45309' },
  bgGreen: { backgroundColor: '#DCFCE7' },
  txtGreen: { color: '#15803D' },
  bgYellow: { backgroundColor: '#FEF9C3' },
  txtYellow: { color: '#854D0E' },
  bgGray: { backgroundColor: '#F1F5F9' },
  txtGray: { color: '#64748B' },
  apprBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  apprBadgeText: { fontSize: 10, fontWeight: '800' },
  apprTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginTop: 6 },
  apprProperty: { fontSize: 11.5, fontWeight: '700', color: '#0F766E', marginTop: 2 },
  apprVendor: { fontSize: 11, color: '#64748B', marginTop: 1 },
  apprDesc: { fontSize: 12, color: '#334155', marginTop: 6, lineHeight: 18 },

  shareBox: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, marginTop: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  shareLabel: { fontSize: 11, color: '#64748B' },
  shareTotal: { fontSize: 14, fontWeight: '900', color: '#0F172A' },
  shareDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 6 },
  shareSubLabel: { fontSize: 10.5, color: '#64748B' },
  shareLandlord: { fontSize: 12, fontWeight: '800', color: '#0F766E' },
  shareTenant: { fontSize: 12, fontWeight: '800', color: '#D97706' },

  apprActionsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  rejectBtn: { flex: 1, backgroundColor: '#FEF2F2', borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: '#FECDD3' },
  rejectBtnText: { fontSize: 11.5, fontWeight: '800', color: '#DC2626' },
  approveBtn: { flex: 1.5, backgroundColor: '#0F172A', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  approveBtnText: { fontSize: 11.5, fontWeight: '800', color: '#00F0FF' },

  // REPAIR VS REPLACE
  rrCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  rrTag: { fontSize: 11, fontWeight: '800', color: '#0284C7' },
  rrBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  rrBadgeText: { fontSize: 9.5, fontWeight: '800' },
  rrName: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginTop: 6 },
  rrSub: { fontSize: 11.5, color: '#64748B', marginTop: 2 },
  rrMetricsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F8FAFC' },
  rrCol: { alignItems: 'center' },
  rrVal: { fontSize: 14, fontWeight: '900', color: '#0F172A' },
  rrLabel: { fontSize: 9.5, color: '#64748B', marginTop: 2 },
  recomBox: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, marginTop: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  recomTitle: { fontSize: 9, fontWeight: '900', color: '#0F766E', letterSpacing: 0.8 },
  recomText: { fontSize: 11.5, color: '#334155', marginTop: 3, lineHeight: 17 },

  // AUDIT CARD
  auditCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  auditId: { fontSize: 11, fontWeight: '800', color: '#0F766E' },
  auditScoreBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  auditScoreText: { fontSize: 10, fontWeight: '800', color: '#15803D' },
  auditProperty: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginTop: 4 },
  auditTenant: { fontSize: 11.5, color: '#64748B', marginTop: 2 },
  findingsBox: { marginTop: 10, gap: 4 },
  findingItem: { fontSize: 11.5, color: '#334155' },
  auditPhotoStrip: { flexDirection: 'row', gap: 8, marginTop: 10 },
  auditThumb: { width: 60, height: 60, borderRadius: 8 },

  // DOC CARD
  docCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  docId: { fontSize: 11, fontWeight: '800', color: '#0284C7' },
  activePill: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  activePillText: { fontSize: 10, fontWeight: '800', color: '#15803D' },
  docTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginTop: 4 },
  docSub: { fontSize: 11.5, color: '#64748B', marginTop: 2 },
  docFee: { fontSize: 13, fontWeight: '800', color: '#0F766E', marginTop: 8 },
  docExpiry: { fontSize: 11, color: '#64748B', marginTop: 8 },

  // VENDOR CARD
  vendorCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  vendorName: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  vendorRating: { fontSize: 12, fontWeight: '800', color: '#D97706' },
  vendorSub: { fontSize: 11.5, color: '#64748B', marginTop: 2 },
  activeContractsText: { fontSize: 11.5, color: '#0284C7', fontWeight: '700', marginTop: 6 },

  // MODAL
  modalView: { flex: 1, backgroundColor: '#F8FAF9' },
  modalNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 24 : 16, paddingBottom: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  modalEyebrow: { fontSize: 9.5, fontWeight: '800', color: '#0F766E', letterSpacing: 1.2 },
  modalHeading: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  modalClose: { fontSize: 16, fontWeight: '800', color: '#64748B' },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 },
  mSubTitle: { fontSize: 10, fontWeight: '900', color: '#0F766E', letterSpacing: 1, marginBottom: 8 },
  mText: { fontSize: 12, color: '#334155', marginTop: 3 },
  subName: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
});
