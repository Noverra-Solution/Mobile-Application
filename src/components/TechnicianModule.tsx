import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
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
import {
  ApartmentAsset,
  ChecklistItem,
  MaterialConsumption,
  RequestPriority,
  SafetyHazardReport,
  SparePartRequest,
  SubAsset,
  TechnicianJob,
} from '../types/cafm';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Initial Fictional Demo Work Orders for Ramesh Kumar (HVAC Lead / Field Technician)
const INITIAL_TECHNICIAN_JOBS: TechnicianJob[] = [
  {
    id: 'WO-2026-0103',
    title: 'Semi-Annual AC AMC Filter Clean & Coil Sanitization',
    description: 'Perform bi-annual preventive maintenance, coil chemical wash, and refrigerant pressure check on Daikin Split AC.',
    type: 'Predictive',
    priority: 'Medium',
    status: 'In Progress',
    category: 'HVAC / AC',
    location: 'Block A · Unit 101 Living Room',
    building: 'Block A',
    floor: 'Floor 1',
    room: 'Unit 101',
    assetId: 'SUB-101-AC1',
    assetName: 'Living Room Split AC (Daikin 1.5T)',
    assignedTechnician: 'Ramesh Kumar (HVAC Lead)',
    dueDate: 'Today, 05:00 PM',
    slaHours: 24,
    checklist: [
      { id: 'c1', label: '1. Isolate main power supply at distribution panel', done: true },
      { id: 'c2', label: '2. Remove washable front mesh filters & clean with water jet', done: true },
      { id: 'c3', label: '3. Spray antibacterial coil sanitizing agent', done: false },
      { id: 'c4', label: '4. Check suction & discharge gas pressure (R32 / R410A)', done: false },
      { id: 'c5', label: '5. Verify condensate drain pipe flow & anti-clogging check', done: false },
    ],
    beforePhotos: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80'],
    afterPhotos: [],
    workNotes: 'Initial inspection completed. Evaporator coil dust buildup cleared. Proceeding with chemical wash.',
    materialsUsed: [
      { id: 'm1', name: 'Coil Sanitizer Spray 500ml', quantity: 1, unitCost: 450 },
    ],
    timeSpentMinutes: 45,
    isClockRunning: true,
  },
  {
    id: 'IC260031',
    title: 'AC not cooling in meeting room & warm air blower',
    description: 'Living room split AC blowing ambient warm air (29°C). Outdoor compressor trips after 4 minutes of start.',
    type: 'Reactive',
    priority: 'High',
    status: 'Assigned',
    category: 'HVAC / AC',
    location: 'Block A · Unit 204 Living Room',
    building: 'Block A',
    floor: 'Floor 2',
    room: 'Unit 204',
    assetId: 'SUB-204-AC1',
    assetName: 'Mitsubishi Heavy 2.0 Ton AC',
    assignedTechnician: 'Ramesh Kumar (HVAC Lead)',
    dueDate: 'Today, 02:00 PM',
    slaHours: 4,
    checklist: [
      { id: 'c1', label: '1. Check remote controller error codes & LED flash pattern', done: false },
      { id: 'c2', label: '2. Inspect outdoor compressor dual running capacitor (45µF)', done: false },
      { id: 'c3', label: '3. Measure compressor winding resistance & insulation test', done: false },
      { id: 'c4', label: '4. Replace blown capacitor or PCB relay if shorted', done: false },
    ],
    beforePhotos: [],
    afterPhotos: [],
    workNotes: '',
    materialsUsed: [],
    timeSpentMinutes: 0,
    isClockRunning: false,
  },
  {
    id: 'WO-2026-0101',
    title: 'VRV Multi-Split Compressor Capacitors Overhaul',
    description: 'Outdoor VRV controller reporting Error Code U4 (Transmission error between indoor and outdoor unit).',
    type: 'Reactive',
    priority: 'Critical',
    status: 'Assigned',
    category: 'HVAC / AC',
    location: 'Tower Sky · Penthouse 501 Suite',
    building: 'Tower Sky',
    floor: 'Floor 5',
    room: 'Penthouse 501',
    assetId: 'SUB-501-VRV',
    assetName: 'Daikin VRV Home 6HP System',
    assignedTechnician: 'Ramesh Kumar (HVAC Lead)',
    dueDate: 'Today, 11:30 AM',
    slaHours: 1,
    checklist: [
      { id: 'c1', label: '1. Check RS485 communication line voltage (F1/F2 terminals)', done: false },
      { id: 'c2', label: '2. Inspect expansion valve electronic actuator coils', done: false },
      { id: 'c3', label: '3. Run Daikin Service Checker diagnostic tool', done: false },
    ],
    beforePhotos: [],
    afterPhotos: [],
    workNotes: '',
    materialsUsed: [],
    timeSpentMinutes: 0,
    isClockRunning: false,
    reworkNote: 'Supervisor Victer: Re-check gas pressure test reading on Zone 2 circuit before final sign-off.',
  },
  {
    id: 'WO-2026-0098',
    title: 'Bathroom Exhaust Fan Jammed & Humming Motor Repair',
    description: 'Exhaust fan motor overheats. Bearings require lubrication and dust clearing.',
    type: 'Corrective',
    priority: 'Medium',
    status: 'Pending Verification',
    category: 'Electrical',
    location: 'Block B · Unit 302 Bath',
    building: 'Block B',
    floor: 'Floor 3',
    room: 'Unit 302',
    assetId: 'SUB-302-FAN',
    assetName: 'Havells 200mm Exhaust Fan',
    assignedTechnician: 'Ramesh Kumar (HVAC Lead)',
    dueDate: 'Yesterday',
    slaHours: 24,
    checklist: [
      { id: 'c1', label: '1. Disassemble front grill and fan impeller', done: true },
      { id: 'c2', label: '2. Lubricate sleeve bearings with synthetic oil', done: true },
      { id: 'c3', label: '3. Test continuous run for 15 minutes: Passed', done: true },
    ],
    beforePhotos: ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80'],
    afterPhotos: ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80'],
    workNotes: 'Fan impeller cleaned and re-greased. Motor noise eliminated. Submitted for Supervisor verification.',
    materialsUsed: [
      { id: 'm1', name: 'Bearing Lubricant Spray', quantity: 1, unitCost: 250 },
    ],
    timeSpentMinutes: 35,
    supervisorVerifier: 'Victer Manuel (Facility Supervisor)',
  },
];

interface Props {
  currentUser: { name: string; email: string; initials: string; role: string; color: string };
  onLogout: () => void;
  apartments: ApartmentAsset[];
}

export default function TechnicianModule({ currentUser, onLogout, apartments }: Props) {
  const [jobs, setJobs] = useState<TechnicianJob[]>(INITIAL_TECHNICIAN_JOBS);
  const [activeTab, setActiveTab] = useState<'assigned' | 'in_progress' | 'history' | 'spaces'>('assigned');
  const [filterPriority, setFilterPriority] = useState<'All' | 'Critical' | 'High' | 'In Progress' | 'Pending Verification'>('All');
  const [selectedJob, setSelectedJob] = useState<TechnicianJob | null>(null);

  // Modals
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [scannedAsset, setScannedAsset] = useState<SubAsset | null>(null);
  const [isSpareRequestOpen, setIsSpareRequestOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [isTeamDirectoryOpen, setIsTeamDirectoryOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
  const [holdReason, setHoldReason] = useState('');

  // Form State inside Job Execution Modal
  const [newWorkNote, setNewWorkNote] = useState('');
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newMaterialQty, setNewMaterialQty] = useState('1');
  const [newMaterialCost, setNewMaterialCost] = useState('500');

  // Spare Part Request Form State
  const [partName, setPartName] = useState('');
  const [partQty, setPartQty] = useState('1');
  const [partReason, setPartReason] = useState('');

  // Safety Hazard Form State
  const [hazardLocation, setHazardLocation] = useState('Block A · Unit 101');
  const [hazardType, setHazardType] = useState<'Electrical' | 'Gas Leak' | 'Structural' | 'Flooding' | 'Chemical'>('Electrical');
  const [hazardDesc, setHazardDesc] = useState('');

  // Time clock ticker simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setJobs(prevJobs =>
        prevJobs.map(job => {
          if (job.isClockRunning && job.status === 'In Progress') {
            return { ...job, timeSpentMinutes: job.timeSpentMinutes + 1 };
          }
          return job;
        })
      );
    }, 60000); // Increment minute counter
    return () => clearInterval(timer);
  }, []);

  // Filtered jobs list
  const filteredJobs = jobs.filter(j => {
    if (filterPriority === 'Critical') return j.priority === 'Critical';
    if (filterPriority === 'High') return j.priority === 'High';
    if (filterPriority === 'In Progress') return j.status === 'In Progress';
    if (filterPriority === 'Pending Verification') return j.status === 'Pending Verification';
    return true;
  });

  const activeRunningJob = jobs.find(j => j.status === 'In Progress');
  const urgentCount = jobs.filter(j => j.priority === 'Critical' || j.priority === 'High').length;
  const pendingVerificationCount = jobs.filter(j => j.status === 'Pending Verification').length;

  // -------------------------------------------------------------------------
  // JOB EXECUTION HANDLERS
  // -------------------------------------------------------------------------

  function handleAcceptAndStart(jobId: string) {
    setJobs(prev =>
      prev.map(j => {
        if (j.id === jobId) {
          return {
            ...j,
            status: 'In Progress',
            isClockRunning: true,
          };
        }
        return j;
      })
    );
    const target = jobs.find(j => j.id === jobId);
    if (target) {
      setSelectedJob({ ...target, status: 'In Progress', isClockRunning: true });
    }
    Alert.alert('Job Started! 🛠️', `Timer started for Ticket ${jobId}. Work status set to 'In Progress'.`);
  }

  function handleToggleClock(jobId: string) {
    setJobs(prev =>
      prev.map(j => {
        if (j.id === jobId) {
          const nextState = !j.isClockRunning;
          return { ...j, isClockRunning: nextState };
        }
        return j;
      })
    );
    if (selectedJob?.id === jobId) {
      setSelectedJob(prev => prev ? { ...prev, isClockRunning: !prev.isClockRunning } : null);
    }
  }

  function handleToggleChecklist(jobId: string, itemId: string) {
    setJobs(prev =>
      prev.map(j => {
        if (j.id === jobId) {
          const updatedChecklist = j.checklist.map(c => (c.id === itemId ? { ...c, done: !c.done } : c));
          return { ...j, checklist: updatedChecklist };
        }
        return j;
      })
    );
    if (selectedJob?.id === jobId) {
      setSelectedJob(prev => {
        if (!prev) return null;
        return {
          ...prev,
          checklist: prev.checklist.map(c => (c.id === itemId ? { ...c, done: !c.done } : c)),
        };
      });
    }
  }

  function handleAddMaterial(jobId: string) {
    if (!newMaterialName.trim()) {
      Alert.alert('Material Name Required', 'Please enter spare part or material name.');
      return;
    }
    const mat: MaterialConsumption = {
      id: `mat-${Date.now()}`,
      name: newMaterialName.trim(),
      quantity: parseInt(newMaterialQty, 10) || 1,
      unitCost: parseFloat(newMaterialCost) || 0,
    };

    setJobs(prev =>
      prev.map(j => {
        if (j.id === jobId) {
          return { ...j, materialsUsed: [...j.materialsUsed, mat] };
        }
        return j;
      })
    );

    if (selectedJob?.id === jobId) {
      setSelectedJob(prev => (prev ? { ...prev, materialsUsed: [...prev.materialsUsed, mat] } : null));
    }

    setNewMaterialName('');
    setNewMaterialQty('1');
    setNewMaterialCost('500');
  }

  // Camera & Photo evidence picker
  async function handleAddPhotoEvidence(type: 'before' | 'after') {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert(
          'Camera Access',
          'Camera permission is required to capture before/after evidence photos. Would you like to use sample photo?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Attach Sample', onPress: () => attachSamplePhoto(type) },
          ]
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        appendPhotoToSelectedJob(type, uri);
      }
    } catch (e) {
      attachSamplePhoto(type);
    }
  }

  function attachSamplePhoto(type: 'before' | 'after') {
    const sample =
      type === 'before'
        ? 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80'
        : 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80';
    appendPhotoToSelectedJob(type, sample);
  }

  function appendPhotoToSelectedJob(type: 'before' | 'after', uri: string) {
    if (!selectedJob) return;
    setJobs(prev =>
      prev.map(j => {
        if (j.id === selectedJob.id) {
          return type === 'before'
            ? { ...j, beforePhotos: [...j.beforePhotos, uri] }
            : { ...j, afterPhotos: [...j.afterPhotos, uri] };
        }
        return j;
      })
    );
    setSelectedJob(prev => {
      if (!prev) return null;
      return type === 'before'
        ? { ...prev, beforePhotos: [...prev.beforePhotos, uri] }
        : { ...prev, afterPhotos: [...prev.afterPhotos, uri] };
    });
  }

  function handleSubmitForVerification(jobId: string) {
    setJobs(prev =>
      prev.map(j => {
        if (j.id === jobId) {
          return {
            ...j,
            status: 'Pending Verification',
            isClockRunning: false,
            supervisorVerifier: 'Victer Manuel (Facility Supervisor)',
            reworkNote: undefined,
          };
        }
        return j;
      })
    );
    setSelectedJob(null);
    Alert.alert(
      'Work Submitted for Verification! 🚀',
      `Job ${jobId} has been sent to Supervisor Victer Manuel with complete repair notes, checklist, and photo evidence.`,
      [{ text: 'OK' }]
    );
  }

  function handlePutOnHold(jobId: string) {
    if (!holdReason.trim()) {
      Alert.alert('Reason Required', 'Please enter a reason for putting job on hold.');
      return;
    }
    setJobs(prev =>
      prev.map(j => {
        if (j.id === jobId) {
          return {
            ...j,
            status: 'On Hold',
            isClockRunning: false,
            workNotes: j.workNotes + `\n[ON HOLD REASON]: ${holdReason.trim()}`,
          };
        }
        return j;
      })
    );
    setIsHoldModalOpen(false);
    setHoldReason('');
    setSelectedJob(null);
    Alert.alert('Job Placed On Hold', `Job status updated. Supervisor notified.`);
  }

  // QR Code Scanner Simulation
  function handleSimulateQrScan(assetIdTag: string) {
    const allSubAssets = apartments.flatMap(a => a.subAssets);
    const found = allSubAssets.find(s => s.id === assetIdTag) || allSubAssets[0];
    setScannedAsset(found);
    setIsQrScannerOpen(true);
  }

  // Submit Spare Part Request
  function handleSubmitSpareRequest() {
    if (!partName.trim()) {
      Alert.alert('Part Name Required', 'Please enter requested spare part name.');
      return;
    }
    setIsSpareRequestOpen(false);
    Alert.alert(
      'Spare Part Request Submitted! 📦',
      `Request for ${partQty}x ${partName} sent to Central Inventory Store & Supervisor Victer Manuel.`,
      [{ text: 'Done' }]
    );
    setPartName('');
    setPartQty('1');
    setPartReason('');
  }

  // Submit Safety Hazard Alert
  function handleSubmitSafetyHazard() {
    if (!hazardDesc.trim()) {
      Alert.alert('Hazard Description Required', 'Please describe the safety risk observed.');
      return;
    }
    setIsSafetyModalOpen(false);
    Alert.alert(
      '🚨 SAFETY HAZARD ESCALATED!',
      `Emergency dispatch ticket created for ${hazardType} hazard at ${hazardLocation}. Supervisor Victer Manuel & Command Desk notified.`,
      [{ text: 'Acknowledged' }]
    );
    setHazardDesc('');
  }

  return (
    <View style={styles.container}>
      {/* ======================================================== */}
      {/* 1. TOP TECHNICIAN HEADER                                 */}
      {/* ======================================================== */}
      <View style={styles.header}>
        <View style={styles.headerBrandGroup}>
          <View style={styles.emblemWrap}>
            <Image source={require('../../assets/nexus-emblem.png')} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
          </View>
          <View>
            <Text style={styles.brandTitle}>noverra<Text style={{ color: '#10B981' }}>.</Text></Text>
            <View style={styles.roleBadgePill}>
              <Text style={styles.roleBadgeText}>🛠️ FIELD TECHNICIAN PORTAL</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          <Pressable onPress={() => setIsNotificationsOpen(true)} style={styles.iconBtn}>
            <Text style={{ fontSize: 18 }}>🔔</Text>
            <View style={styles.notifBadgeDot} />
          </Pressable>

          <Pressable onPress={onLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutBtnText}>Sign out 🚪</Text>
          </Pressable>
        </View>
      </View>

      {/* Offline Status & Cache Bar (Feature 20) */}
      <View style={styles.offlineStatusBar}>
        <View style={styles.rowAlign}>
          <View style={styles.greenPulseDot} />
          <Text style={styles.offlineStatusText}>
            OFFLINE CACHE ACTIVE · <Text style={{ fontWeight: '800' }}>{jobs.length} Jobs Cached</Text>
          </Text>
        </View>
        <Text style={styles.lastSyncText}>Last Sync: Today, 08:30 AM</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ======================================================== */}
        {/* 2. REWORK NOTIFICATION BANNER (Feature 18)               */}
        {/* ======================================================== */}
        {jobs.some(j => j.reworkNote) && (
          <View style={styles.reworkBannerCard}>
            <View style={styles.rowAlign}>
              <Text style={{ fontSize: 16 }}>⚠️</Text>
              <Text style={styles.reworkBannerTitle}>SUPERVISOR REWORK FEEDBACK</Text>
            </View>
            {jobs.filter(j => j.reworkNote).map(j => (
              <View key={j.id} style={styles.reworkBox}>
                <Text style={styles.reworkTicketId}>{j.id} · {j.title}</Text>
                <Text style={styles.reworkText}>{j.reworkNote}</Text>
                <Pressable
                  onPress={() => setSelectedJob(j)}
                  style={styles.reworkActionBtn}
                >
                  <Text style={styles.reworkActionBtnText}>Re-open & Correct Job ↗</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* ======================================================== */}
        {/* 3. MY JOBS DASHBOARD METRICS (Feature 1 & 2)             */}
        {/* ======================================================== */}
        <View style={styles.greetingBanner}>
          <Text style={styles.greetingSmall}>On-Duty Maintenance Specialist,</Text>
          <Text style={styles.greetingName}>{currentUser.name}</Text>
          <Text style={styles.greetingSub}>HVAC & Field Infrastructure Engineering</Text>
        </View>

        {/* 4 Metrics Cards */}
        <View style={styles.kpiGrid}>
          <Pressable onPress={() => setFilterPriority('All')} style={styles.kpiCard}>
            <Text style={styles.kpiNumber}>{jobs.length}</Text>
            <Text style={styles.kpiLabel}>Total Assigned</Text>
            <View style={[styles.kpiBar, { backgroundColor: '#0284C7' }]} />
          </Pressable>

          <Pressable onPress={() => setFilterPriority('Critical')} style={styles.kpiCard}>
            <Text style={[styles.kpiNumber, { color: '#DC2626' }]}>{urgentCount}</Text>
            <Text style={styles.kpiLabel}>Urgent / SLA</Text>
            <View style={[styles.kpiBar, { backgroundColor: '#DC2626' }]} />
          </Pressable>

          <Pressable onPress={() => setFilterPriority('In Progress')} style={styles.kpiCard}>
            <Text style={[styles.kpiNumber, { color: '#059669' }]}>
              {jobs.filter(j => j.status === 'In Progress').length}
            </Text>
            <Text style={styles.kpiLabel}>In Progress</Text>
            <View style={[styles.kpiBar, { backgroundColor: '#059669' }]} />
          </Pressable>

          <Pressable onPress={() => setFilterPriority('Pending Verification')} style={styles.kpiCard}>
            <Text style={[styles.kpiNumber, { color: '#D97706' }]}>{pendingVerificationCount}</Text>
            <Text style={styles.kpiLabel}>Pending Review</Text>
            <View style={[styles.kpiBar, { backgroundColor: '#D97706' }]} />
          </Pressable>
        </View>

        {/* ======================================================== */}
        {/* 4. ACTIVE TIME & ATTENDANCE CLOCK WIDGET (Feature 13)    */}
        {/* ======================================================== */}
        {activeRunningJob && (
          <View style={styles.timeClockCard}>
            <View style={styles.rowBetween}>
              <View style={styles.rowAlign}>
                <View style={styles.pulseGreenOrb} />
                <Text style={styles.timeClockTitle}>ACTIVE SITE VISIT CLOCK</Text>
              </View>
              <Text style={styles.timerDigits}>
                {Math.floor(activeRunningJob.timeSpentMinutes / 60).toString().padStart(2, '0')}:
                {(activeRunningJob.timeSpentMinutes % 60).toString().padStart(2, '0')}:00
              </Text>
            </View>
            <Text style={styles.timeClockSub} numberOfLines={1}>
              Ticket {activeRunningJob.id} · {activeRunningJob.title}
            </Text>

            <View style={styles.timeClockActionsRow}>
              <Pressable
                onPress={() => handleToggleClock(activeRunningJob.id)}
                style={[
                  styles.timeClockBtn,
                  activeRunningJob.isClockRunning ? styles.bgAmberBtn : styles.bgGreenBtn,
                ]}
              >
                <Text style={styles.timeClockBtnText}>
                  {activeRunningJob.isClockRunning ? '⏸ Pause Timer' : '▶ Resume Timer'}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setSelectedJob(activeRunningJob)}
                style={[styles.timeClockBtn, styles.bgDarkBtn]}
              >
                <Text style={styles.timeClockBtnText}>Execute Job Details ↗</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ======================================================== */}
        {/* 5. QUICK TOOLBAR (QR, Safety, Spares, Directory)         */}
        {/* ======================================================== */}
        <View style={styles.quickToolbarRow}>
          <Pressable
            onPress={() => handleSimulateQrScan('SUB-101-AC1')}
            style={styles.toolBtn}
          >
            <Text style={styles.toolIcon}>📷</Text>
            <Text style={styles.toolText}>QR Scan Asset</Text>
          </Pressable>

          <Pressable
            onPress={() => setIsSafetyModalOpen(true)}
            style={[styles.toolBtn, styles.toolBtnDanger]}
          >
            <Text style={styles.toolIcon}>🚨</Text>
            <Text style={[styles.toolText, { color: '#DC2626' }]}>Flag Safety</Text>
          </Pressable>

          <Pressable
            onPress={() => setIsSpareRequestOpen(true)}
            style={styles.toolBtn}
          >
            <Text style={styles.toolIcon}>📦</Text>
            <Text style={styles.toolText}>Request Parts</Text>
          </Pressable>

          <Pressable
            onPress={() => setIsTeamDirectoryOpen(true)}
            style={styles.toolBtn}
          >
            <Text style={styles.toolIcon}>📞</Text>
            <Text style={styles.toolText}>Team Directory</Text>
          </Pressable>
        </View>

        {/* ======================================================== */}
        {/* 6. ASSIGNED WORK ORDERS LIST (Features 2, 3, 4, 5)       */}
        {/* ======================================================== */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Assigned Work Orders</Text>
          <Text style={styles.sectionCount}>{filteredJobs.length} Jobs</Text>
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterStrip}>
          {(['All', 'Critical', 'High', 'In Progress', 'Pending Verification'] as const).map(tab => (
            <Pressable
              key={tab}
              onPress={() => setFilterPriority(tab)}
              style={[styles.filterChip, filterPriority === tab && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, filterPriority === tab && styles.filterChipTextActive]}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Work Order Cards List */}
        <View style={styles.jobsList}>
          {filteredJobs.map(job => {
            const isCritical = job.priority === 'Critical';
            const isHigh = job.priority === 'High';
            const isPendingVerification = job.status === 'Pending Verification';
            const isInProgress = job.status === 'In Progress';

            const priBg = isCritical ? '#FEE2E2' : isHigh ? '#FFEDD5' : '#FEF9C3';
            const priColor = isCritical ? '#DC2626' : isHigh ? '#C2410C' : '#854D0E';

            return (
              <View key={job.id} style={[styles.jobCard, isInProgress && styles.jobCardActive]}>
                <View style={styles.rowBetween}>
                  <View style={styles.rowAlign}>
                    <Text style={styles.jobId}>{job.id}</Text>
                    <View style={[styles.priorityBadge, { backgroundColor: priBg }]}>
                      <Text style={[styles.priorityBadgeText, { color: priColor }]}>
                        {job.priority} · {job.slaHours}h SLA
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.statusBadge, isPendingVerification ? styles.bgPending : isInProgress ? styles.bgProgress : styles.bgAssigned]}>
                    <Text style={[styles.statusBadgeText, isPendingVerification ? styles.txtPending : isInProgress ? styles.txtProgress : styles.txtAssigned]}>
                      {job.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.jobDesc} numberOfLines={2}>{job.description}</Text>

                <View style={styles.metaRow}>
                  <Text style={styles.metaLocation}>📍 {job.location}</Text>
                  <Text style={styles.metaAsset}>⚙️ {job.assetName}</Text>
                </View>

                {/* Progress bar for checklist items */}
                {job.checklist.length > 0 && (
                  <View style={styles.progressSection}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.progressLabel}>REPAIR CHECKLIST PROGRESS</Text>
                      <Text style={styles.progressPercent}>
                        {job.checklist.filter(c => c.done).length} / {job.checklist.length} Done
                      </Text>
                    </View>
                    <View style={styles.progressBarTrack}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${(job.checklist.filter(c => c.done).length / job.checklist.length) * 100}%` },
                        ]}
                      />
                    </View>
                  </View>
                )}

                {/* Card Bottom Actions */}
                <View style={styles.cardActionsRow}>
                  {job.status === 'Assigned' ? (
                    <Pressable
                      onPress={() => handleAcceptAndStart(job.id)}
                      style={styles.startBtn}
                    >
                      <Text style={styles.startBtnText}>▶ Accept & Start Work</Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() => setSelectedJob(job)}
                      style={styles.executeBtn}
                    >
                      <Text style={styles.executeBtnText}>Execute Repair & Log Evidence ↗</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ======================================================== */}
      {/* 7. MODAL: JOB EXECUTION & WORK VERIFICATION (All 21 Features) */}
      {/* ======================================================== */}
      <Modal visible={!!selectedJob} animationType="slide" presentationStyle="pageSheet">
        {selectedJob && (
          <View style={styles.modalView}>
            {/* Nav Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalEyebrow}>{selectedJob.id} · {selectedJob.category}</Text>
                <Text style={styles.modalTitle} numberOfLines={1}>{selectedJob.title}</Text>
              </View>
              <Pressable onPress={() => setSelectedJob(null)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
              {/* Complaint & Asset Banner */}
              <View style={styles.jobDetailCard}>
                <Text style={styles.subLabel}>LOCATION & EQUIPMENT</Text>
                <Text style={styles.jobDetailVal}>📍 {selectedJob.location}</Text>
                <Text style={styles.jobDetailVal}>⚙️ {selectedJob.assetName}</Text>

                <Text style={[styles.subLabel, { marginTop: 10 }]}>COMPLAINT DESCRIPTION</Text>
                <Text style={styles.jobDetailDesc}>{selectedJob.description}</Text>
              </View>

              {/* 1. Interactive Time Clock Logging (Feature 13) */}
              <Text style={styles.formSectionHeader}>1. TIME & ATTENDANCE LOGGING</Text>
              <View style={styles.clockControlRow}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#0F172A' }}>
                  Total Visit Time: {selectedJob.timeSpentMinutes} mins
                </Text>
                <Pressable
                  onPress={() => handleToggleClock(selectedJob.id)}
                  style={[styles.clockToggleBtn, selectedJob.isClockRunning ? styles.bgAmberBtn : styles.bgGreenBtn]}
                >
                  <Text style={styles.clockToggleBtnText}>
                    {selectedJob.isClockRunning ? '⏸ Pause Timer' : '▶ Start Timer'}
                  </Text>
                </Pressable>
              </View>

              {/* 2. Step-by-Step Repair Checklist (Feature 9 & 10) */}
              <Text style={styles.formSectionHeader}>2. REPAIR & SAFETY CHECKLIST</Text>
              <View style={styles.checklistCard}>
                {selectedJob.checklist.map(item => (
                  <Pressable
                    key={item.id}
                    onPress={() => handleToggleChecklist(selectedJob.id, item.id)}
                    style={styles.checkRow}
                  >
                    <View style={[styles.checkSquare, item.done && styles.checkSquareDone]}>
                      <Text style={styles.checkMark}>{item.done ? '✓' : ''}</Text>
                    </View>
                    <Text style={[styles.checkText, item.done && styles.checkTextDone]}>
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* 3. Photo & Video Evidence Attachment (Feature 11) */}
              <Text style={styles.formSectionHeader}>3. PHOTO EVIDENCE (BEFORE & AFTER)</Text>
              <View style={styles.photoStripSection}>
                {/* Before Photos */}
                <Text style={styles.photoStripTitle}>BEFORE REPAIR PHOTOS:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoStrip}>
                  {selectedJob.beforePhotos.map((uri, idx) => (
                    <Image key={idx} source={{ uri }} style={styles.evidenceThumb} />
                  ))}
                  <Pressable onPress={() => handleAddPhotoEvidence('before')} style={styles.addPhotoBtn}>
                    <Text style={{ fontSize: 18 }}>📷</Text>
                    <Text style={styles.addPhotoText}>+ Before</Text>
                  </Pressable>
                </ScrollView>

                {/* After Photos */}
                <Text style={[styles.photoStripTitle, { marginTop: 12 }]}>AFTER REPAIR PHOTOS:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoStrip}>
                  {selectedJob.afterPhotos.map((uri, idx) => (
                    <Image key={idx} source={{ uri }} style={styles.evidenceThumb} />
                  ))}
                  <Pressable onPress={() => handleAddPhotoEvidence('after')} style={styles.addPhotoBtn}>
                    <Text style={{ fontSize: 18 }}>📸</Text>
                    <Text style={styles.addPhotoText}>+ After</Text>
                  </Pressable>
                </ScrollView>
              </View>

              {/* 4. Materials & Spare Parts Consumed (Feature 14) */}
              <Text style={styles.formSectionHeader}>4. MATERIALS USED & SPARE CONSUMPTION</Text>
              <View style={styles.materialsCard}>
                {selectedJob.materialsUsed.map(m => (
                  <View key={m.id} style={styles.matRow}>
                    <Text style={styles.matName}>{m.name} (x{m.quantity})</Text>
                    <Text style={styles.matCost}>₹{m.quantity * m.unitCost}</Text>
                  </View>
                ))}

                {/* Add Material Inputs */}
                <View style={styles.addMatInputsRow}>
                  <TextInput
                    placeholder="Material name (e.g. Capacitor 45µF)"
                    value={newMaterialName}
                    onChangeText={setNewMaterialName}
                    style={[styles.modalInput, { flex: 2 }]}
                  />
                  <TextInput
                    placeholder="Qty"
                    keyboardType="numeric"
                    value={newMaterialQty}
                    onChangeText={setNewMaterialQty}
                    style={[styles.modalInput, { flex: 0.8 }]}
                  />
                  <Pressable onPress={() => handleAddMaterial(selectedJob.id)} style={styles.addMatBtn}>
                    <Text style={styles.addMatBtnText}>+ Add</Text>
                  </Pressable>
                </View>
              </View>

              {/* 5. Work Notes & Diagnostic Findings (Feature 12) */}
              <Text style={styles.formSectionHeader}>5. WORK NOTES & DIAGNOSTIC FINDINGS</Text>
              <TextInput
                placeholder="Record diagnosis, actions taken, test readings (gas pressure, voltage, temp) and recommendations..."
                value={selectedJob.workNotes}
                onChangeText={txt => {
                  setSelectedJob({ ...selectedJob, workNotes: txt });
                  setJobs(prev => prev.map(j => (j.id === selectedJob.id ? { ...j, workNotes: txt } : j)));
                }}
                multiline
                numberOfLines={4}
                style={[styles.modalInput, styles.textAreaInput]}
              />

              {/* 6. Hold or Verification Submit Buttons (Feature 5, 17) */}
              <View style={styles.submitActionsRow}>
                <Pressable
                  onPress={() => setIsHoldModalOpen(true)}
                  style={styles.holdActionBtn}
                >
                  <Text style={styles.holdActionBtnText}>⏸ Place On Hold</Text>
                </Pressable>

                <Pressable
                  onPress={() => handleSubmitForVerification(selectedJob.id)}
                  style={styles.submitVerifyBtn}
                >
                  <Text style={styles.submitVerifyBtnText}>Submit for Verification ↗</Text>
                </Pressable>
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* ======================================================== */}
      {/* 8. MODAL: QR CODE SCANNER SIMULATOR (Feature 6)          */}
      {/* ======================================================== */}
      <Modal visible={isQrScannerOpen} animationType="slide">
        <View style={styles.fullScreenModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Asset QR Scanner</Text>
            <Pressable onPress={() => setIsQrScannerOpen(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.qrScannerView}>
            <View style={styles.cameraTargetBox}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              <Text style={styles.qrScanText}>Align Equipment QR Tag in View</Text>
            </View>

            {scannedAsset && (
              <View style={styles.scannedAssetCard}>
                <Text style={styles.subLabel}>ASSET IDENTIFIED FROM QR TAG</Text>
                <Text style={styles.scannedTitle}>{scannedAsset.name}</Text>
                <Text style={styles.scannedSub}>Category: {scannedAsset.category} · Health: {scannedAsset.healthScore}%</Text>

                <Text style={[styles.subLabel, { marginTop: 10 }]}>MODEL & WARRANTY</Text>
                <Text style={styles.scannedSub}>{scannedAsset.brandModel} ({scannedAsset.warrantyStatus})</Text>

                <Pressable
                  onPress={() => {
                    setIsQrScannerOpen(false);
                    Alert.alert('Asset Loaded', `Opened Profile & Repair History for ${scannedAsset.name}`);
                  }}
                  style={styles.scannedActionBtn}
                >
                  <Text style={styles.scannedActionBtnText}>View Full Maintenance History ↗</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* 9. MODAL: REQUEST SPARE PARTS (Feature 15)               */}
      {/* ======================================================== */}
      <Modal visible={isSpareRequestOpen} animationType="slide">
        <View style={styles.fullScreenModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Request Spare Parts</Text>
            <Pressable onPress={() => setIsSpareRequestOpen(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={{ padding: 20 }}>
            <Text style={styles.subLabel}>SPARE PART / MATERIAL NAME</Text>
            <TextInput
              placeholder="e.g. Daikin 45µF Running Capacitor / R410A Gas Cylinder"
              value={partName}
              onChangeText={setPartName}
              style={styles.modalInput}
            />

            <Text style={[styles.subLabel, { marginTop: 14 }]}>QUANTITY</Text>
            <TextInput
              placeholder="1"
              keyboardType="numeric"
              value={partQty}
              onChangeText={setPartQty}
              style={styles.modalInput}
            />

            <Text style={[styles.subLabel, { marginTop: 14 }]}>REASON FOR REQUEST</Text>
            <TextInput
              placeholder="e.g. Out of stock in mobile van; required for Penthouse 501 VRV repair"
              value={partReason}
              onChangeText={setPartReason}
              multiline
              numberOfLines={3}
              style={[styles.modalInput, styles.textAreaInput]}
            />

            <Pressable onPress={handleSubmitSpareRequest} style={styles.submitVerifyBtn}>
              <Text style={styles.submitVerifyBtnText}>Submit Spare Part Request ↗</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* 10. MODAL: SAFETY & HAZARD ALERTS (Feature 16)           */}
      {/* ======================================================== */}
      <Modal visible={isSafetyModalOpen} animationType="slide">
        <View style={styles.fullScreenModal}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: '#DC2626' }]}>🚨 Flag Safety & Hazard Alert</Text>
            <Pressable onPress={() => setIsSafetyModalOpen(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={{ padding: 20 }}>
            <Text style={styles.subLabel}>HAZARD LOCATION</Text>
            <TextInput
              value={hazardLocation}
              onChangeText={setHazardLocation}
              style={styles.modalInput}
            />

            <Text style={[styles.subLabel, { marginTop: 14 }]}>HAZARD TYPE</Text>
            <View style={styles.chipRow}>
              {(['Electrical', 'Gas Leak', 'Structural', 'Flooding', 'Chemical'] as const).map(ht => (
                <Pressable
                  key={ht}
                  onPress={() => setHazardType(ht)}
                  style={[styles.chip, hazardType === ht && styles.chipDangerActive]}
                >
                  <Text style={[styles.chipText, hazardType === ht && { color: '#FFFFFF' }]}>{ht}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.subLabel, { marginTop: 14 }]}>HAZARD DESCRIPTION & IMPACT</Text>
            <TextInput
              placeholder="Describe immediate danger, live wire, gas smell, or structural risk..."
              value={hazardDesc}
              onChangeText={setHazardDesc}
              multiline
              numberOfLines={4}
              style={[styles.modalInput, styles.textAreaInput]}
            />

            <Pressable onPress={handleSubmitSafetyHazard} style={styles.dangerSubmitBtn}>
              <Text style={styles.dangerSubmitBtnText}>🚨 Escalate Hazard to Supervisor Now</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* 11. MODAL: TEAM DIRECTORY (Feature 19)                    */}
      {/* ======================================================== */}
      <Modal visible={isTeamDirectoryOpen} animationType="slide">
        <View style={styles.fullScreenModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Team Directory & Hotlines</Text>
            <Pressable onPress={() => setIsTeamDirectoryOpen(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={{ padding: 20 }}>
            {[
              { name: 'Victer Manuel', role: 'Facility Supervisor', phone: '+91 98401 99001', email: 'victer@noverra.com' },
              { name: 'Sunil Master', role: 'Master Plumber', phone: '+91 98402 33445', email: 'sunil.plumbing@noverra.com' },
              { name: 'Arun Krishnan', role: 'Senior Electrician', phone: '+91 98403 55667', email: 'arun.elec@noverra.com' },
              { name: 'Dinesh Prakash', role: 'Carpentry Specialist', phone: '+91 98404 77889', email: 'dinesh.carpentry@noverra.com' },
              { name: '24/7 Emergency Command Desk', role: 'Emergency Desk', phone: '+91 1800 555 9111', email: 'emergency@noverra.com' },
            ].map((member, i) => (
              <View key={i} style={styles.teamCard}>
                <View style={styles.rowBetween}>
                  <View>
                    <Text style={styles.teamName}>{member.name}</Text>
                    <Text style={styles.teamRole}>{member.role}</Text>
                  </View>
                  <Pressable
                    onPress={() => Linking.openURL(`tel:${member.phone.replace(/\s+/g, '')}`)}
                    style={styles.callSmallBtn}
                  >
                    <Text style={styles.callSmallBtnText}>📞 Call</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* 12. MODAL: NOTIFICATIONS (Feature 21)                    */}
      {/* ======================================================== */}
      <Modal visible={isNotificationsOpen} animationType="slide">
        <View style={styles.fullScreenModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notifications & Alerts</Text>
            <Pressable onPress={() => setIsNotificationsOpen(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={{ padding: 20 }}>
            {[
              { title: 'New Work Order Allocated', desc: 'Ticket IC260031 assigned by Supervisor Victer (4h SLA)', time: '10 mins ago', urgent: true },
              { title: 'Rework Note Added', desc: 'Supervisor Victer requested re-test on WO-2026-0101', time: '1 hour ago', urgent: true },
              { title: 'Spare Part Approved', desc: 'Daikin Capacitor 45µF approved by central store', time: '2 hours ago', urgent: false },
            ].map((n, i) => (
              <View key={i} style={[styles.notifCard, n.urgent && styles.notifUrgent]}>
                <Text style={styles.notifTitle}>{n.title}</Text>
                <Text style={styles.notifDesc}>{n.desc}</Text>
                <Text style={styles.notifTime}>{n.time}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* 13. MODAL: REASON FOR HOLD                               */}
      {/* ======================================================== */}
      <Modal visible={isHoldModalOpen} transparent animationType="fade">
        <View style={styles.darkOverlay}>
          <View style={styles.dialogCard}>
            <Text style={styles.dialogTitle}>Pause Job & Place On Hold</Text>
            <Text style={styles.dialogSub}>Specify the reason for holding repair execution:</Text>
            <TextInput
              placeholder="e.g. Awaiting spare part delivery from store / Tenant unavailable"
              value={holdReason}
              onChangeText={setHoldReason}
              multiline
              numberOfLines={3}
              style={[styles.modalInput, styles.textAreaInput]}
            />
            <View style={styles.rowBetween}>
              <Pressable onPress={() => setIsHoldModalOpen(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={() => selectedJob && handlePutOnHold(selectedJob.id)} style={styles.confirmHoldBtn}>
                <Text style={styles.confirmHoldBtnText}>Confirm Hold</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF9' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? 18 : 10,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerBrandGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  emblemWrap: { width: 32, height: 32, borderRadius: 9, backgroundColor: '#070A0F', padding: 2, justifyContent: 'center', alignItems: 'center' },
  brandTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A', letterSpacing: -0.8 },
  roleBadgePill: { backgroundColor: '#ECFDF5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginTop: 1 },
  roleBadgeText: { fontSize: 8.5, fontWeight: '900', color: '#059669', letterSpacing: 0.8 },
  headerRightActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: { position: 'relative', padding: 4 },
  notifBadgeDot: { position: 'absolute', top: 2, right: 2, width: 7, height: 7, borderRadius: 4, backgroundColor: '#DC2626' },
  logoutBtn: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1' },
  logoutBtnText: { fontSize: 11, fontWeight: '800', color: '#0F172A' },

  offlineStatusBar: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 18,
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowAlign: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  greenPulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  offlineStatusText: { fontSize: 10, color: '#A7F3D0', letterSpacing: 0.5 },
  lastSyncText: { fontSize: 10, color: '#94A3B8' },

  scrollContent: { padding: 18, maxWidth: 680, width: '100%', alignSelf: 'center' },

  // REWORK BANNER
  reworkBannerCard: { backgroundColor: '#FFF1F2', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#FECDD3', marginBottom: 16 },
  reworkBannerTitle: { fontSize: 11, fontWeight: '900', color: '#DC2626', letterSpacing: 1 },
  reworkBox: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#FFE4E6' },
  reworkTicketId: { fontSize: 12, fontWeight: '800', color: '#0F172A' },
  reworkText: { fontSize: 11.5, color: '#BE123C', marginTop: 2 },
  reworkActionBtn: { marginTop: 6, backgroundColor: '#DC2626', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10, alignSelf: 'flex-start' },
  reworkActionBtnText: { fontSize: 10.5, fontWeight: '800', color: '#FFFFFF' },

  // GREETING BANNER
  greetingBanner: { marginBottom: 14 },
  greetingSmall: { fontSize: 12, color: '#64748B' },
  greetingName: { fontSize: 24, fontWeight: '900', color: '#0F172A', letterSpacing: -0.6 },
  greetingSub: { fontSize: 12, color: '#0F766E', fontWeight: '700', marginTop: 1 },

  // KPI GRID
  kpiGrid: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  kpiCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', position: 'relative', overflow: 'hidden' },
  kpiNumber: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  kpiLabel: { fontSize: 9.5, color: '#64748B', fontWeight: '700', marginTop: 2, textAlign: 'center' },
  kpiBar: { position: 'absolute', bottom: 0, left: 8, right: 8, height: 3, borderRadius: 2 },

  // TIME CLOCK CARD
  timeClockCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#059669', marginBottom: 16, shadowColor: '#059669', shadowOpacity: 0.08, shadowRadius: 10, elevation: 2 },
  pulseGreenOrb: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#059669' },
  timeClockTitle: { fontSize: 10, fontWeight: '900', color: '#059669', letterSpacing: 1 },
  timerDigits: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  timeClockSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  timeClockActionsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  timeClockBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  bgGreenBtn: { backgroundColor: '#059669' },
  bgAmberBtn: { backgroundColor: '#D97706' },
  bgDarkBtn: { backgroundColor: '#0F172A' },
  timeClockBtnText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },

  // QUICK TOOLBAR
  quickToolbarRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  toolBtn: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  toolBtnDanger: { backgroundColor: '#FEF2F2', borderColor: '#FECDD3' },
  toolIcon: { fontSize: 16 },
  toolText: { fontSize: 10, fontWeight: '800', color: '#0F172A', marginTop: 4 },

  // SECTION HEADERS
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  sectionCount: { fontSize: 12, fontWeight: '700', color: '#0284C7' },

  filterStrip: { flexDirection: 'row', marginBottom: 14 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', marginRight: 8 },
  filterChipActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  filterChipText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  filterChipTextActive: { color: '#FFFFFF' },

  // JOB CARDS
  jobsList: { gap: 12 },
  jobCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  jobCardActive: { borderColor: '#10B981', borderWidth: 1.5 },
  jobId: { fontSize: 12, fontWeight: '800', color: '#0F766E' },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginLeft: 6 },
  priorityBadgeText: { fontSize: 9.5, fontWeight: '800' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusBadgeText: { fontSize: 10, fontWeight: '800' },
  bgAssigned: { backgroundColor: '#EFF6FF' },
  txtAssigned: { color: '#1D4ED8', fontSize: 10, fontWeight: '800' },
  bgProgress: { backgroundColor: '#ECFDF5' },
  txtProgress: { color: '#059669', fontSize: 10, fontWeight: '800' },
  bgPending: { backgroundColor: '#FEF3C7' },
  txtPending: { color: '#B45309', fontSize: 10, fontWeight: '800' },
  jobTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginTop: 6 },
  jobDesc: { fontSize: 12, color: '#64748B', marginTop: 3, lineHeight: 17 },
  metaRow: { marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F8FAFC', gap: 2 },
  metaLocation: { fontSize: 11.5, fontWeight: '700', color: '#0F172A' },
  metaAsset: { fontSize: 11, color: '#0284C7', fontWeight: '600' },

  progressSection: { marginTop: 10 },
  progressLabel: { fontSize: 9, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.8 },
  progressPercent: { fontSize: 10, fontWeight: '800', color: '#059669' },
  progressBarTrack: { height: 5, backgroundColor: '#E2E8F0', borderRadius: 3, marginTop: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#059669' },

  cardActionsRow: { marginTop: 12 },
  startBtn: { backgroundColor: '#0F766E', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  startBtnText: { fontSize: 12, fontWeight: '800', color: '#FFFFFF' },
  executeBtn: { backgroundColor: '#0F172A', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  executeBtnText: { fontSize: 12, fontWeight: '800', color: '#00F0FF' },

  // MODAL COMMON
  modalView: { flex: 1, backgroundColor: '#F8FAF9' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 24 : 16, paddingBottom: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  modalEyebrow: { fontSize: 9.5, fontWeight: '800', color: '#0F766E', letterSpacing: 1.2 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  modalCloseText: { fontSize: 16, fontWeight: '800', color: '#64748B' },
  modalScroll: { padding: 18 },

  jobDetailCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
  subLabel: { fontSize: 9.5, fontWeight: '900', color: '#0F766E', letterSpacing: 1 },
  jobDetailVal: { fontSize: 12.5, fontWeight: '800', color: '#0F172A', marginTop: 3 },
  jobDetailDesc: { fontSize: 12, color: '#334155', marginTop: 3, lineHeight: 18 },

  formSectionHeader: { fontSize: 10, fontWeight: '900', color: '#64748B', letterSpacing: 1.2, marginTop: 14, marginBottom: 8 },
  clockControlRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  clockToggleBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  clockToggleBtnText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },

  checklistCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E2E8F0', gap: 10 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkSquare: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center' },
  checkSquareDone: { backgroundColor: '#059669', borderColor: '#059669' },
  checkMark: { fontSize: 12, color: '#FFFFFF', fontWeight: '900' },
  checkText: { flex: 1, fontSize: 12.5, color: '#0F172A', fontWeight: '600' },
  checkTextDone: { textDecorationLine: 'line-through', color: '#94A3B8' },

  photoStripSection: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  photoStripTitle: { fontSize: 9.5, fontWeight: '800', color: '#64748B' },
  photoStrip: { flexDirection: 'row', gap: 10, marginTop: 8 },
  evidenceThumb: { width: 70, height: 70, borderRadius: 10, marginRight: 8 },
  addPhotoBtn: { width: 70, height: 70, borderRadius: 10, borderWidth: 1.5, borderColor: '#CBD5E1', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAF9' },
  addPhotoText: { fontSize: 9, fontWeight: '800', color: '#0F766E', marginTop: 2 },

  materialsCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E2E8F0', gap: 8 },
  matRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  matName: { fontSize: 12, fontWeight: '700', color: '#0F172A' },
  matCost: { fontSize: 12, fontWeight: '800', color: '#0F766E' },
  addMatInputsRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  modalInput: { height: 42, backgroundColor: '#F8FAF9', borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 12, fontSize: 12, color: '#0F172A' },
  textAreaInput: { height: 80, textAlignVertical: 'top', paddingTop: 10 },
  addMatBtn: { backgroundColor: '#0F766E', paddingHorizontal: 14, justifyContent: 'center', borderRadius: 10 },
  addMatBtnText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },

  submitActionsRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  holdActionBtn: { flex: 1, backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#FDE68A', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  holdActionBtnText: { fontSize: 12, fontWeight: '800', color: '#B45309' },
  submitVerifyBtn: { flex: 2, backgroundColor: '#0F172A', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  submitVerifyBtnText: { fontSize: 12, fontWeight: '800', color: '#00F0FF' },

  // FULL SCREEN MODALS
  fullScreenModal: { flex: 1, backgroundColor: '#F8FAF9' },
  qrScannerView: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  cameraTargetBox: { width: 240, height: 240, borderRadius: 20, borderWidth: 2, borderColor: '#10B981', justifyContent: 'center', alignItems: 'center', position: 'relative', backgroundColor: 'rgba(15, 23, 42, 0.85)' },
  corner: { position: 'absolute', width: 20, height: 20, borderColor: '#00F0FF' },
  topLeft: { top: 10, left: 10, borderTopWidth: 3, borderLeftWidth: 3 },
  topRight: { top: 10, right: 10, borderTopWidth: 3, borderRightWidth: 3 },
  bottomLeft: { bottom: 10, left: 10, borderBottomWidth: 3, borderLeftWidth: 3 },
  bottomRight: { bottom: 10, right: 10, borderBottomWidth: 3, borderRightWidth: 3 },
  qrScanText: { fontSize: 11, fontWeight: '800', color: '#00F0FF', textAlign: 'center', paddingHorizontal: 20 },
  scannedAssetCard: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, marginTop: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  scannedTitle: { fontSize: 16, fontWeight: '900', color: '#0F172A', marginTop: 2 },
  scannedSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  scannedActionBtn: { marginTop: 14, backgroundColor: '#0F766E', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  scannedActionBtnText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1' },
  chipDangerActive: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
  chipText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  dangerSubmitBtn: { backgroundColor: '#DC2626', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  dangerSubmitBtnText: { fontSize: 12, fontWeight: '800', color: '#FFFFFF' },

  teamCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 10 },
  teamName: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  teamRole: { fontSize: 11, color: '#64748B', marginTop: 1 },
  callSmallBtn: { backgroundColor: '#0F766E', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  callSmallBtnText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },

  notifCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 10 },
  notifUrgent: { borderColor: '#FECDD3', backgroundColor: '#FFF1F2' },
  notifTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  notifDesc: { fontSize: 11.5, color: '#334155', marginTop: 2 },
  notifTime: { fontSize: 10, color: '#94A3B8', marginTop: 4 },

  darkOverlay: { flex: 1, backgroundColor: 'rgba(7, 12, 18, 0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  dialogCard: { width: '100%', maxWidth: 450, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20 },
  dialogTitle: { fontSize: 16, fontWeight: '900', color: '#0F172A' },
  dialogSub: { fontSize: 12, color: '#64748B', marginTop: 4, marginBottom: 12 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  cancelBtnText: { fontSize: 12, fontWeight: '800', color: '#64748B' },
  confirmHoldBtn: { backgroundColor: '#B45309', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  confirmHoldBtnText: { fontSize: 12, fontWeight: '800', color: '#FFFFFF' },
});
