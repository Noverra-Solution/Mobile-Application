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
  View,
} from 'react-native';
import { ApartmentAsset, SubAsset } from '../types/cafm';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  apartments: ApartmentAsset[];
  onOpenApartment: (apt: ApartmentAsset) => void;
  onRaiseCaseForAsset: (aptId: string, assetName: string) => void;
}

export default function ScanModule({
  apartments,
  onOpenApartment,
  onRaiseCaseForAsset,
}: Props) {
  const [scannedResult, setScannedResult] = useState<{
    type: 'apartment' | 'subAsset';
    apartment: ApartmentAsset;
    subAsset?: SubAsset;
  } | null>(null);

  // Quick simulation triggers
  function handleSimulateScan(unitNumber: string, subName?: string) {
    const apt = apartments.find(a => a.unitNumber === unitNumber) || apartments[0];
    if (subName) {
      const sub = apt.subAssets.find(s => s.name.includes(subName)) || apt.subAssets[0];
      setScannedResult({ type: 'subAsset', apartment: apt, subAsset: sub });
    } else {
      setScannedResult({ type: 'apartment', apartment: apt });
    }
  }

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>QR & Asset Scanner</Text>
        <Text style={styles.headerSub}>Scan door tag or appliance barcode to inspect lifetime costs</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>
        {/* Animated Scanner Viewfinder */}
        <View style={styles.viewfinderCard}>
          <View style={styles.viewfinderBox}>
            {/* 4 corner brackets */}
            <View style={[styles.cornerBracket, styles.topLeft]} />
            <View style={[styles.cornerBracket, styles.topRight]} />
            <View style={[styles.cornerBracket, styles.bottomLeft]} />
            <View style={[styles.cornerBracket, styles.bottomRight]} />

            {/* Glowing Laser Scan Bar */}
            <View style={styles.laserBar} />
            <Text style={styles.viewfinderText}>ALIGN QR OR ASSET BARCODE</Text>
          </View>
          <Text style={styles.viewfinderHint}>Point camera at equipment asset tag or apartment door QR code</Text>
        </View>

        {/* Quick Scan Simulator Chips */}
        <View style={styles.quickScanBox}>
          <Text style={styles.quickScanTitle}>SIMULATE TAG SCANS (TAP TO TEST):</Text>

          <Pressable
            onPress={() => handleSimulateScan('Unit 204')}
            style={({ pressed }) => [styles.simBtn, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.simIcon}>🚪</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.simBtnText}>Scan Unit 204 Door Tag</Text>
              <Text style={styles.simBtnSub}>Pulls up 3BHK lifetime rent, spent & expense ratio</Text>
            </View>
            <Text style={styles.simArrow}>↗</Text>
          </Pressable>

          <Pressable
            onPress={() => handleSimulateScan('Unit 204', 'Living Room Dual Split AC')}
            style={({ pressed }) => [styles.simBtn, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.simIcon}>❄️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.simBtnText}>Scan Living Room AC Tag (Unit 204)</Text>
              <Text style={styles.simBtnSub}>Mitsubishi 2.0T · ₹14.2k lifetime repairs · Expired Warranty</Text>
            </View>
            <Text style={styles.simArrow}>↗</Text>
          </Pressable>

          <Pressable
            onPress={() => handleSimulateScan('Unit 101', 'Bathroom Geyser')}
            style={({ pressed }) => [styles.simBtn, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.simIcon}>🚰</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.simBtnText}>Scan AO Smith Geyser Tag (Unit 101)</Text>
              <Text style={styles.simBtnSub}>25L Glass-Lined · ₹850 lifetime repairs · Under Warranty</Text>
            </View>
            <Text style={styles.simArrow}>↗</Text>
          </Pressable>

          <Pressable
            onPress={() => handleSimulateScan('Penthouse 501', 'VRV AC')}
            style={({ pressed }) => [styles.simBtn, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.simIcon}>⚡</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.simBtnText}>Scan Daikin VRV 6HP Tag (Penthouse 501)</Text>
              <Text style={styles.simBtnSub}>Multi-Zone VRV · ₹38.5k lifetime repairs · AMC Active</Text>
            </View>
            <Text style={styles.simArrow}>↗</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* ======================================================== */}
      {/* MODAL: SCANNED ASSET RESULT SHEET                        */}
      {/* ======================================================== */}
      <Modal visible={!!scannedResult} animationType="slide" presentationStyle="pageSheet">
        {scannedResult && (
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <View>
                <Text style={styles.resultEyebrow}>QR VERIFIED INSTANT INSPECTION</Text>
                <Text style={styles.resultTitle}>
                  {scannedResult.type === 'apartment' ? scannedResult.apartment.unitNumber : scannedResult.subAsset?.name}
                </Text>
              </View>
              <Pressable onPress={() => setScannedResult(null)} hitSlop={12} style={styles.resultCloseBtn}>
                <Text style={styles.resultCloseText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView style={{ flex: 1, padding: 20 }}>
              {/* If scanned an apartment */}
              {scannedResult.type === 'apartment' && (
                <View>
                  <View style={styles.verifiedCard}>
                    <Text style={styles.verCardTitle}>APARTMENT MAIN ASSET</Text>
                    <Text style={styles.verUnitBig}>{scannedResult.apartment.unitNumber} ({scannedResult.apartment.type})</Text>
                    <Text style={styles.verSubText}>📍 {scannedResult.apartment.property} · {scannedResult.apartment.buildingBlock}</Text>

                    <View style={styles.divider} />
                    <View style={styles.rowBetween}>
                      <Text style={styles.vLabel}>Monthly Rent:</Text>
                      <Text style={styles.vVal}>₹{scannedResult.apartment.monthlyRent.toLocaleString()}</Text>
                    </View>
                    <View style={styles.rowBetween}>
                      <Text style={styles.vLabel}>Lifetime Rent Earned:</Text>
                      <Text style={styles.vVal}>₹{scannedResult.apartment.totalRentCollected.toLocaleString()}</Text>
                    </View>
                    <View style={styles.rowBetween}>
                      <Text style={styles.vLabel}>Total Maintenance Spent:</Text>
                      <Text style={[styles.vVal, { color: '#0F766E' }]}>₹{scannedResult.apartment.totalMaintenanceSpent.toLocaleString()}</Text>
                    </View>
                    <View style={styles.rowBetween}>
                      <Text style={styles.vLabel}>Expense Ratio:</Text>
                      <Text style={[styles.vVal, { color: '#059669', fontWeight: '900' }]}>
                        {((scannedResult.apartment.totalMaintenanceSpent / scannedResult.apartment.totalRentCollected) * 100).toFixed(1)}% (Healthy)
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    onPress={() => {
                      const apt = scannedResult.apartment;
                      setScannedResult(null);
                      onOpenApartment(apt);
                    }}
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionBtnText}>Open Sub-Assets Explorer ↗</Text>
                  </Pressable>
                </View>
              )}

              {/* If scanned a specific sub-asset (e.g. AC) */}
              {scannedResult.type === 'subAsset' && scannedResult.subAsset && (
                <View>
                  <View style={styles.verifiedCard}>
                    <Text style={styles.verCardTitle}>SUB-ASSET EQUIPMENT PROFILE</Text>
                    <Text style={styles.verUnitBig}>{scannedResult.subAsset.name}</Text>
                    <Text style={styles.verSubText}>{scannedResult.subAsset.brandModel}</Text>
                    <Text style={[styles.verSubText, { color: '#64748B' }]}>Inside: {scannedResult.apartment.unitNumber} ({scannedResult.apartment.property})</Text>

                    <View style={styles.divider} />
                    <View style={styles.rowBetween}>
                      <Text style={styles.vLabel}>Purchase / Capex Cost:</Text>
                      <Text style={styles.vVal}>₹{scannedResult.subAsset.purchaseCost.toLocaleString()}</Text>
                    </View>
                    <View style={styles.rowBetween}>
                      <Text style={styles.vLabel}>Lifetime Repair Cost:</Text>
                      <Text style={[styles.vVal, { color: '#DC2626', fontWeight: '800' }]}>
                        ₹{scannedResult.subAsset.lifetimeRepairCost.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.rowBetween}>
                      <Text style={styles.vLabel}>Warranty / AMC Status:</Text>
                      <Text style={[styles.vVal, { color: '#0284C7' }]}>{scannedResult.subAsset.warrantyStatus}</Text>
                    </View>
                    <View style={styles.rowBetween}>
                      <Text style={styles.vLabel}>Equipment Health Score:</Text>
                      <Text style={styles.vVal}>{scannedResult.subAsset.healthScore}%</Text>
                    </View>

                    {/* Past Repair Logs */}
                    {scannedResult.subAsset.repairLogs && scannedResult.subAsset.repairLogs.length > 0 && (
                      <View style={{ marginTop: 14 }}>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 1.2 }}>SERVICE HISTORY:</Text>
                        {scannedResult.subAsset.repairLogs.map(log => (
                          <View key={log.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                            <Text style={{ fontSize: 11, color: '#334155' }}>• {log.title} ({log.date})</Text>
                            <Text style={{ fontSize: 11, fontWeight: '800', color: '#DC2626' }}>₹{log.cost.toLocaleString()}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>

                  <Pressable
                    onPress={() => {
                      const apt = scannedResult.apartment;
                      const sub = scannedResult.subAsset!;
                      setScannedResult(null);
                      onRaiseCaseForAsset(apt.id, sub.name);
                    }}
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionBtnText}>+ Raise Repair Case for this Asset ↗</Text>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 14,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 },
  headerSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  scrollPad: { padding: 20, paddingBottom: 60, maxWidth: 650, width: '100%', alignSelf: 'center' },
  viewfinderCard: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 20,
  },
  viewfinderBox: {
    width: 200,
    height: 200,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  cornerBracket: { position: 'absolute', width: 26, height: 26, borderColor: '#00F0FF', borderWidth: 3.5 },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  laserBar: {
    width: 170,
    height: 2,
    backgroundColor: '#00F0FF',
    shadowColor: '#00F0FF',
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  viewfinderText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 20,
  },
  viewfinderHint: { color: '#94A3B8', fontSize: 11, textAlign: 'center', marginTop: 10 },
  quickScanBox: { marginTop: 10 },
  quickScanTitle: { fontSize: 10, letterSpacing: 1.4, fontWeight: '900', color: '#64748B', marginBottom: 10 },
  simBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    gap: 12,
  },
  simIcon: { fontSize: 24 },
  simBtnText: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  simBtnSub: { fontSize: 11, color: '#64748B', marginTop: 2 },
  simArrow: { fontSize: 16, color: '#0284C7', fontWeight: '800' },

  // RESULT MODAL
  resultContainer: { flex: 1, backgroundColor: '#F8FAF9' },
  resultHeader: {
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
  resultEyebrow: { fontSize: 9, letterSpacing: 1.4, fontWeight: '800', color: '#0284C7' },
  resultTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A', marginTop: 2 },
  resultCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  resultCloseText: { fontSize: 14, color: '#475569', fontWeight: '800' },
  verifiedCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
  verCardTitle: { fontSize: 9, letterSpacing: 1.5, fontWeight: '900', color: '#64748B', marginBottom: 8 },
  verUnitBig: { fontSize: 24, fontWeight: '900', color: '#0F172A' },
  verSubText: { fontSize: 12, color: '#0284C7', fontWeight: '600', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 14 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  vLabel: { fontSize: 12, color: '#64748B' },
  vVal: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  actionBtn: { backgroundColor: '#0F766E', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  actionBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
});

