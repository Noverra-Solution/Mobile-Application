import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import HeroOpeningAnimation from './src/components/HeroOpeningAnimation';
import DonutChart from './src/components/DonutChart';
import ApartmentsAssetModule from './src/components/ApartmentsAssetModule';
import CasesModule from './src/components/CasesModule';
import ScanModule from './src/components/ScanModule';
import MoreModule from './src/components/MoreModule';
import {
  INITIAL_APARTMENTS,
  INITIAL_CASES,
} from './src/data/mockData';
import { ApartmentAsset, ServiceCase } from './src/types/cafm';

const C = {
  navy: '#0F172A',
  forest: '#0F766E',
  mint: '#BEE1CE',
  lime: '#00F0FF',
  cream: '#F8FAF9',
  white: '#FFFFFF',
  ink: '#1E293B',
  muted: '#64748B',
  border: '#E2E8F0',
  red: '#DC2626',
  pale: '#F1F5F9',
  blue: '#0284C7',
};

const USERS = [
  { email: 'anto@gmail.com', name: 'Anto', initials: 'AN', role: 'Real Estate Asset Owner', color: '#D8E9F7' },
  { email: 'rufin@gmail.com', name: 'Rufin', initials: 'RU', role: 'Portfolio Manager', color: '#E9E0F8' },
  { email: 'victer@gmail.com', name: 'Victer', initials: 'VI', role: 'Facility Supervisor', color: '#F9E5CE' },
] as const;

type User = typeof USERS[number];
type Tab = 'home' | 'cases' | 'scan' | 'assets' | 'more';

export default function App() {
  const [showHero, setShowHero] = useState(true);
  const [screen, setScreen] = useState<'login' | 'welcome' | 'main'>('login');
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedSite, setSelectedSite] = useState<string>('All Sites');
  const [selectedCaseFilter, setSelectedCaseFilter] = useState<'All' | 'Open' | 'Overdue' | 'Resolved'>('All');

  // Shared Application State
  const [apartments, setApartments] = useState<ApartmentAsset[]>(INITIAL_APARTMENTS);
  const [cases, setCases] = useState<ServiceCase[]>(INITIAL_CASES);
  const [currentUser, setCurrentUser] = useState<User | null>(USERS[0]);
  const [loginInput, setLoginInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Welcome auto-advance
  useEffect(() => {
    if (screen === 'welcome') {
      const t = setTimeout(() => {
        setScreen('main');
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [screen]);

  function handleLogin() {
    const user = USERS.find(u => u.email === loginInput.trim().toLowerCase());
    if (!user) {
      setLoginError('Please select one of the three demo accounts below.');
      return;
    }
    setCurrentUser(user);
    setLoginError('');
    setScreen('welcome');
  }

  function handleLogout() {
    setCurrentUser(null);
    setLoginInput('');
    setScreen('login');
    setActiveTab('home');
  }

  // Financial calculations
  const totalRentCollected = apartments.reduce((acc, a) => acc + a.totalRentCollected, 0);
  const totalMaintenanceSpent = apartments.reduce((acc, a) => acc + a.totalMaintenanceSpent, 0);
  const portfolioExpenseRatio = totalRentCollected > 0 ? (totalMaintenanceSpent / totalRentCollected) * 100 : 0;
  const totalMonthlyRent = apartments.reduce((acc, a) => acc + a.monthlyRent, 0);

  // Priority counts for Donut Chart (matching Image 1 & 5: Critical 3, High 1, Medium 7, Low 5)
  const criticalCount = cases.filter(c => c.priority === 'Critical').length;
  const highCount = cases.filter(c => c.priority === 'High').length;
  const mediumCount = cases.filter(c => c.priority === 'Medium').length;
  const lowCount = cases.filter(c => c.priority === 'Low').length;

  const totalCount = cases.length;
  const openCount = cases.filter(c => c.status === 'Open').length;
  const overdueCount = cases.filter(c => c.status === 'Overdue').length;
  const resolvedCount = cases.filter(c => c.status === 'Resolved').length;

  return (
    <SafeAreaView style={[styles.root, screen === 'welcome' && { backgroundColor: '#070C12' }]}>
      <StatusBar barStyle={screen === 'welcome' || showHero ? 'light-content' : 'dark-content'} />

      {/* Hero Opening Animation on launch */}
      {showHero && (
        <HeroOpeningAnimation onFinish={() => setShowHero(false)} />
      )}

      {/* ======================================================== */}
      {/* 1. LOGIN SCREEN                                          */}
      {/* ======================================================== */}
      {screen === 'login' && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.loginContainer} keyboardShouldPersistTaps="handled">
            {/* Brand Header */}
            <View style={styles.brandRow}>
              <View style={styles.brandMark}>
                <Image source={require('./assets/nexus-emblem.png')} style={styles.brandEmblem} resizeMode="contain" />
              </View>
              <Text style={styles.brandTitle}>noverra<Text style={{ color: '#00F0FF' }}>.</Text></Text>
            </View>

            <View style={styles.loginHero}>
              <View style={styles.eyebrow}>
                <View style={styles.greenDot} />
                <Text style={styles.eyebrowText}>REAL ESTATE ASSET LIFETIME INTELLIGENCE</Text>
              </View>
              <Text style={styles.heroHeading}>
                Apartment Asset Cost{'\n'}<Text style={{ color: '#0284C7' }}>& Expense Ratio Control.</Text>
              </Text>
              <Text style={styles.heroSub}>
                Track primary apartment revenue against sub-asset maintenance (ACs, geysers, appliances) to protect lifetime net yields.
              </Text>
            </View>

            <View style={styles.loginCard}>
              <Text style={styles.panelTitle}>Welcome to Noverra</Text>
              <Text style={styles.panelSub}>Choose your owner account to inspect real estate asset costs.</Text>

              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <TextInput
                placeholder="you@example.com"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                value={loginInput}
                onChangeText={v => { setLoginInput(v); setLoginError(''); }}
                onSubmitEditing={handleLogin}
                style={styles.textInput}
              />
              {!!loginError && <Text style={styles.errorText}>{loginError}</Text>}

              <Pressable
                onPress={handleLogin}
                disabled={!loginInput.trim()}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  !loginInput.trim() && { opacity: 0.5 },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={styles.primaryBtnText}>Enter Noverra</Text>
                <Text style={styles.primaryBtnArrow}>↗</Text>
              </Pressable>

              <View style={styles.dividerRow}>
                <View style={styles.hairline} />
                <Text style={styles.dividerText}>DEMO OWNER ACCOUNTS</Text>
                <View style={styles.hairline} />
              </View>

              {/* Demo Accounts List: Name only (e.g. Anto) */}
              {USERS.map(user => (
                <Pressable
                  key={user.email}
                  onPress={() => { setLoginInput(user.email); setLoginError(''); }}
                  style={({ pressed }) => [
                    styles.accountRow,
                    loginInput === user.email && styles.accountSelected,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <View style={[styles.avatar, { backgroundColor: user.color }]}>
                    <Text style={styles.avatarLetters}>{user.initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.accountName}>{user.name}</Text>
                    <Text style={styles.accountEmail}>{user.email}</Text>
                  </View>
                  <Text style={styles.accountArrow}>{loginInput === user.email ? '✓' : '→'}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.demoDisclaimer}>REAL ESTATE ASSET INTELLIGENCE · TAP ANY ACCOUNT TO LOG IN</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* ======================================================== */}
      {/* 2. WELCOME SCREEN (Personalized without logo)             */}
      {/* ======================================================== */}
      {screen === 'welcome' && (
        <View style={styles.welcomeContainer}>
          <View style={[styles.welcomeAvatarOrb, { backgroundColor: currentUser?.color || '#D8E9F7' }]}>
            <Text style={styles.welcomeAvatarText}>{currentUser?.initials || 'A'}</Text>
          </View>
          <View style={styles.welcomePill}>
            <Text style={styles.welcomePillText}>✓ AUTHENTICATED</Text>
          </View>
          <Text style={styles.welcomeTitle}>Welcome, {currentUser?.name}.</Text>
          <Text style={styles.welcomeSub}>Your Noverra real estate asset portfolio is ready.</Text>
          <View style={styles.welcomeFooter}>
            <Text style={{ color: '#94A3B8', fontSize: 11, letterSpacing: 1.2 }}>NOVERRA  /  ASSET LIFETIME COST SYSTEM</Text>
          </View>
        </View>
      )}

      {/* ======================================================== */}
      {/* 3. MAIN APP INTERFACE WITH 5 BOTTOM TABS                 */}
      {/* ======================================================== */}
      {screen === 'main' && (
        <View style={{ flex: 1, backgroundColor: '#F8FAF9' }}>
          {/* TAB 1: HOME (Matching Image 1 & 5) */}
          {activeTab === 'home' && (
            <ScrollView contentContainerStyle={styles.homeScroll} showsVerticalScrollIndicator={false}>
              {/* Top Navigation Bar with Noverra Brand, Bell, Profile Avatar */}
              <View style={styles.homeHeader}>
                <View style={styles.homeBrandGroup}>
                  <View style={styles.headerEmblemWrap}>
                    <Image source={require('./assets/nexus-emblem.png')} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                  </View>
                  <Text style={styles.headerBrandTitle}>noverra<Text style={{ color: '#0284C7' }}>.</Text></Text>
                </View>

                <View style={styles.headerActionIcons}>
                  <View style={styles.bellIconWrap}>
                    <Text style={{ fontSize: 18 }}>🔔</Text>
                    <View style={styles.bellRedDot} />
                  </View>
                  <View style={[styles.smallAvatar, { backgroundColor: currentUser?.color || '#D8E9F7' }]}>
                    <Text style={styles.smallAvatarText}>{currentUser?.initials?.charAt(0) || 'A'}</Text>
                  </View>
                </View>
              </View>

              {/* Greeting & Site Selector Dropdown */}
              <View style={styles.greetingSection}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.greetingSmall}>Good evening,</Text>
                  <Text style={styles.greetingName}>{currentUser?.name || 'Shyju'}</Text>
                </View>

                {/* Site Dropdown Selector */}
                <Pressable
                  onPress={() => {
                    const next = selectedSite === 'All Sites' ? 'Palm Residency' : selectedSite === 'Palm Residency' ? 'Cyber Heights' : 'All Sites';
                    setSelectedSite(next);
                  }}
                  style={styles.siteDropdownPill}
                >
                  <Text style={styles.siteIcon}>🏢</Text>
                  <Text style={styles.siteText}>{selectedSite}</Text>
                  <Text style={styles.siteArrow}>▾</Text>
                </Pressable>
              </View>

              {/* 4 Metric Cards (Matching Image 1 & 5) */}
              <View style={styles.kpiCardsRow}>
                {/* Total */}
                <Pressable
                  onPress={() => { setSelectedCaseFilter('All'); setActiveTab('cases'); }}
                  style={styles.kpiCard}
                >
                  <Text style={styles.kpiNumber}>{totalCount}</Text>
                  <Text style={styles.kpiTitle}>Total</Text>
                  <View style={[styles.kpiUnderline, { backgroundColor: '#0284C7' }]} />
                </Pressable>

                {/* Open */}
                <Pressable
                  onPress={() => { setSelectedCaseFilter('Open'); setActiveTab('cases'); }}
                  style={styles.kpiCard}
                >
                  <Text style={styles.kpiNumber}>{openCount}</Text>
                  <Text style={styles.kpiTitle}>Open</Text>
                  <View style={[styles.kpiUnderline, { backgroundColor: '#EA580C' }]} />
                </Pressable>

                {/* Overdue */}
                <Pressable
                  onPress={() => { setSelectedCaseFilter('Overdue'); setActiveTab('cases'); }}
                  style={styles.kpiCard}
                >
                  <Text style={styles.kpiNumber}>{overdueCount}</Text>
                  <Text style={styles.kpiTitle}>Overdue</Text>
                  <View style={[styles.kpiUnderline, { backgroundColor: '#BE185D' }]} />
                </Pressable>

                {/* Resolved */}
                <Pressable
                  onPress={() => { setSelectedCaseFilter('Resolved'); setActiveTab('cases'); }}
                  style={styles.kpiCard}
                >
                  <Text style={styles.kpiNumber}>{resolvedCount}</Text>
                  <Text style={styles.kpiTitle}>Resolved</Text>
                  <View style={[styles.kpiUnderline, { backgroundColor: '#059669' }]} />
                </Pressable>
              </View>

              {/* REAL ESTATE OWNER ASSET LIFETIME COST SNAPSHOT */}
              <View style={styles.ownerCostCard}>
                <View style={styles.rowBetween}>
                  <View>
                    <Text style={styles.ownerCostLabel}>REAL ESTATE ASSET LIFETIME HEALTH</Text>
                    <Text style={styles.ownerCostHeading}>Rent vs Lifetime Spend</Text>
                  </View>
                  <Pressable onPress={() => setActiveTab('assets')} style={styles.exploreLink}>
                    <Text style={styles.exploreLinkText}>Explore Assets ↗</Text>
                  </Pressable>
                </View>

                <View style={styles.ownerMetricsRow}>
                  <View style={styles.ownerMetricCol}>
                    <Text style={styles.ownerMetricVal}>₹{(totalMonthlyRent / 1000).toFixed(0)}k</Text>
                    <Text style={styles.ownerMetricSub}>Monthly Rent</Text>
                  </View>
                  <View style={styles.ownerDivider} />
                  <View style={styles.ownerMetricCol}>
                    <Text style={[styles.ownerMetricVal, { color: '#0F766E' }]}>₹{(totalMaintenanceSpent / 1000).toFixed(0)}k</Text>
                    <Text style={styles.ownerMetricSub}>Lifetime Spend</Text>
                  </View>
                  <View style={styles.ownerDivider} />
                  <View style={styles.ownerMetricCol}>
                    <Text style={[styles.ownerMetricVal, { color: '#059669' }]}>{portfolioExpenseRatio.toFixed(1)}%</Text>
                    <Text style={styles.ownerMetricSub}>Expense Ratio</Text>
                  </View>
                </View>

                <View style={styles.ratioBarContainer}>
                  <View style={[styles.ratioBarFill, { width: `${Math.min(portfolioExpenseRatio * 4, 100)}%` }]} />
                </View>
                <Text style={styles.ratioExplainer}>
                  Expense ratio is <Text style={{ fontWeight: '800', color: '#059669' }}>Healthy ({portfolioExpenseRatio.toFixed(1)}%)</Text>. Optimal benchmark is &lt;15% of rental income.
                </Text>
              </View>

              {/* Cases by Priority Card (Matching Image 1 & 5) */}
              <View style={styles.prioritySectionCard}>
                <Text style={styles.priorityCardTitle}>Cases by Priority</Text>
                <DonutChart
                  critical={criticalCount}
                  high={highCount}
                  medium={mediumCount}
                  low={lowCount}
                />
              </View>

              {/* Recent Cases Card (Matching Image 1 & 5) */}
              <View style={styles.recentCasesCard}>
                <View style={styles.rowBetween}>
                  <Text style={styles.recentCasesTitle}>Recent Cases</Text>
                  <Pressable onPress={() => setActiveTab('cases')} hitSlop={10}>
                    <Text style={styles.viewAllChevron}>›</Text>
                  </Pressable>
                </View>

                <View style={styles.recentListStack}>
                  {cases.slice(0, 5).map(item => {
                    const dotColor =
                      item.priority === 'Critical'
                        ? '#DC2626'
                        : item.priority === 'High'
                        ? '#EA580C'
                        : item.priority === 'Medium'
                        ? '#FACC15'
                        : '#94A3B8';

                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => setActiveTab('cases')}
                        style={({ pressed }) => [styles.recentCaseRow, pressed && { backgroundColor: '#F8FAFC' }]}
                      >
                        <View style={[styles.caseDot, { backgroundColor: dotColor }]} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.recentCaseText} numberOfLines={1}>{item.title}</Text>
                          <Text style={styles.recentCaseSub}>{item.id} · {item.location}</Text>
                        </View>
                        <Text style={styles.recentArrow}>›</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              <View style={{ height: 40 }} />
            </ScrollView>
          )}

          {/* TAB 2: CASES (Matching Image 4) */}
          {activeTab === 'cases' && (
            <CasesModule
              cases={cases}
              apartments={apartments}
              onUpdateCases={setCases}
              currentUser={{ name: currentUser?.name || 'Anto', email: currentUser?.email || 'anto@gmail.com' }}
              initialFilter={selectedCaseFilter}
            />
          )}

          {/* TAB 3: SCAN (QR & Barcode Scanner for Apartments & Sub-Assets) */}
          {activeTab === 'scan' && (
            <ScanModule
              apartments={apartments}
              onOpenApartment={apt => {
                setActiveTab('assets');
              }}
              onRaiseCaseForAsset={(aptId, subName) => {
                setActiveTab('cases');
              }}
            />
          )}

          {/* TAB 4: ASSETS (Real Estate Owner Asset Lifetime Cost Engine) */}
          {activeTab === 'assets' && (
            <ApartmentsAssetModule
              apartments={apartments}
              onUpdateApartments={setApartments}
              onOpenCaseForm={() => setActiveTab('cases')}
            />
          )}

          {/* TAB 5: MORE (Matching Image 2 & 3) */}
          {activeTab === 'more' && (
            <MoreModule
              currentUser={{
                name: currentUser?.name || 'Anto',
                email: currentUser?.email || 'anto@gmail.com',
                initials: currentUser?.initials || 'A',
                role: currentUser?.role || 'Real Estate Owner',
                color: currentUser?.color || '#D8E9F7',
              }}
              onLogout={handleLogout}
              onRaiseCase={() => setActiveTab('cases')}
            />
          )}

          {/* ======================================================== */}
          {/* BOTTOM NAVIGATION BAR (Matching Image 1, 2, 4, 5)        */}
          {/* ======================================================== */}
          <View style={styles.bottomTabBar}>
            {/* 1. Home */}
            <Pressable
              onPress={() => setActiveTab('home')}
              style={styles.tabButton}
            >
              <Text style={[styles.tabIcon, activeTab === 'home' && styles.tabIconActive]}>🏠</Text>
              <Text style={[styles.tabLabel, activeTab === 'home' && styles.tabLabelActive]}>Home</Text>
            </Pressable>

            {/* 2. Cases */}
            <Pressable
              onPress={() => {
                setSelectedCaseFilter('All');
                setActiveTab('cases');
              }}
              style={styles.tabButton}
            >
              <Text style={[styles.tabIcon, activeTab === 'cases' && styles.tabIconActive]}>📁</Text>
              <Text style={[styles.tabLabel, activeTab === 'cases' && styles.tabLabelActive]}>Cases</Text>
            </Pressable>

            {/* 3. Scan */}
            <Pressable
              onPress={() => setActiveTab('scan')}
              style={styles.tabButton}
            >
              <Text style={[styles.tabIcon, activeTab === 'scan' && styles.tabIconActive]}>⊡</Text>
              <Text style={[styles.tabLabel, activeTab === 'scan' && styles.tabLabelActive]}>Scan</Text>
            </Pressable>

            {/* 4. Assets (Core Owner Asset Lifetime Cost) */}
            <Pressable
              onPress={() => setActiveTab('assets')}
              style={styles.tabButton}
            >
              <Text style={[styles.tabIcon, activeTab === 'assets' && styles.tabIconActive]}>⬡</Text>
              <Text style={[styles.tabLabel, activeTab === 'assets' && styles.tabLabelActive]}>Assets</Text>
            </Pressable>

            {/* 5. More */}
            <Pressable
              onPress={() => setActiveTab('more')}
              style={styles.tabButton}
            >
              <Text style={[styles.tabIcon, activeTab === 'more' && styles.tabIconActive]}>☰</Text>
              <Text style={[styles.tabLabel, activeTab === 'more' && styles.tabLabelActive]}>More</Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAF9' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  // LOGIN SCREEN STYLING
  loginContainer: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40, maxWidth: 650, width: '100%', alignSelf: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#070A0F', justifyContent: 'center', alignItems: 'center', padding: 3 },
  brandEmblem: { width: '100%', height: '100%' },
  brandTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -1, color: '#0F172A' },
  loginHero: { marginTop: 36, marginBottom: 28 },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  greenDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#0284C7' },
  eyebrowText: { fontSize: 10, letterSpacing: 1.6, fontWeight: '800', color: '#64748B' },
  heroHeading: { marginTop: 14, fontSize: 34, fontWeight: '900', lineHeight: 42, letterSpacing: -1.8, color: '#0F172A' },
  heroSub: { marginTop: 12, fontSize: 13, lineHeight: 21, color: '#64748B' },
  loginCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 22, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOpacity: 0.05, shadowRadius: 20, elevation: 3 },
  panelTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.8, color: '#0F172A' },
  panelSub: { marginTop: 4, fontSize: 13, color: '#64748B', lineHeight: 19 },
  inputLabel: { fontSize: 10, letterSpacing: 1.5, fontWeight: '800', color: '#64748B', marginTop: 22, marginBottom: 8 },
  textInput: { borderWidth: 1, borderColor: '#CBD5E1', height: 48, borderRadius: 12, paddingHorizontal: 14, fontSize: 13, color: '#0F172A', backgroundColor: '#F8FAF9' },
  errorText: { fontSize: 11, color: '#DC2626', marginTop: 8, fontWeight: '700' },
  primaryBtn: { marginTop: 16, backgroundColor: '#0F172A', borderRadius: 12, height: 48, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18 },
  primaryBtnText: { fontSize: 13, color: '#FFFFFF', fontWeight: '800' },
  primaryBtnArrow: { color: '#00F0FF', fontSize: 18, fontWeight: '800' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 24, marginBottom: 10 },
  hairline: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { fontSize: 9, letterSpacing: 1.2, fontWeight: '800', color: '#94A3B8' },
  accountRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 10, borderRadius: 12, gap: 12, marginTop: 4 },
  accountSelected: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' },
  avatar: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  avatarLetters: { fontSize: 12, fontWeight: '800', color: '#0F172A' },
  accountName: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  accountEmail: { fontSize: 11, color: '#64748B', marginTop: 1 },
  accountArrow: { fontSize: 18, color: '#0284C7' },
  demoDisclaimer: { marginTop: 20, fontSize: 10, textAlign: 'center', color: '#94A3B8', letterSpacing: 0.8 },

  // WELCOME SCREEN
  welcomeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: '#070C12' },
  welcomeAvatarOrb: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 18, borderWidth: 2, borderColor: '#00F0FF', shadowColor: '#00F0FF', shadowOpacity: 0.6, shadowRadius: 20, elevation: 6 },
  welcomeAvatarText: { fontSize: 38, fontWeight: '900', color: '#070C12' },
  welcomePill: { backgroundColor: 'rgba(0, 240, 255, 0.12)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.3)', marginBottom: 12 },
  welcomePillText: { fontSize: 10, color: '#00F0FF', fontWeight: '900', letterSpacing: 2 },
  welcomeTitle: { fontSize: 30, color: '#FFFFFF', letterSpacing: -1.2, fontWeight: '800', textAlign: 'center' },
  welcomeSub: { fontSize: 13, color: '#94A3B8', marginTop: 8, textAlign: 'center' },
  welcomeFooter: { position: 'absolute', bottom: 35 },

  // HOME SCREEN (Matching Image 1 & 5)
  homeScroll: { paddingHorizontal: 18, paddingTop: Platform.OS === 'android' ? 18 : 10, paddingBottom: 60, maxWidth: 650, width: '100%', alignSelf: 'center' },
  homeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 14 },
  homeBrandGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerEmblemWrap: { width: 30, height: 30, borderRadius: 8, backgroundColor: '#070A0F', padding: 2, justifyContent: 'center', alignItems: 'center' },
  headerBrandTitle: { fontSize: 22, fontWeight: '900', color: '#0284C7', letterSpacing: -0.8 },
  headerActionIcons: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bellIconWrap: { position: 'relative' },
  bellRedDot: { position: 'absolute', top: 0, right: 0, width: 7, height: 7, borderRadius: 4, backgroundColor: '#DC2626' },
  smallAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  smallAvatarText: { fontSize: 14, fontWeight: '900', color: '#0F172A' },
  greetingSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, marginBottom: 16 },
  greetingSmall: { fontSize: 13, color: '#334155' },
  greetingName: { fontSize: 26, fontWeight: '900', color: '#0284C7', letterSpacing: -0.8 },
  siteDropdownPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  siteIcon: { fontSize: 13 },
  siteText: { fontSize: 12, fontWeight: '700', color: '#0F172A' },
  siteArrow: { fontSize: 12, color: '#64748B' },

  // 4 KPI CARDS (Matching Image 1 & 5)
  kpiCardsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  kpiCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', position: 'relative', overflow: 'hidden' },
  kpiNumber: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  kpiTitle: { fontSize: 11, color: '#64748B', fontWeight: '600', marginTop: 2, marginBottom: 6 },
  kpiUnderline: { position: 'absolute', bottom: 0, left: 10, right: 10, height: 3.5, borderRadius: 2 },

  // OWNER ASSET LIFETIME COST CARD
  ownerCostCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16, shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  ownerCostLabel: { fontSize: 9, letterSpacing: 1.4, fontWeight: '900', color: '#0F766E' },
  ownerCostHeading: { fontSize: 17, fontWeight: '900', color: '#0F172A', marginTop: 2 },
  exploreLink: { backgroundColor: '#F0FDFA', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1, borderColor: '#CCFBF1' },
  exploreLinkText: { fontSize: 11, fontWeight: '800', color: '#0F766E' },
  ownerMetricsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  ownerMetricCol: { alignItems: 'center', flex: 1 },
  ownerMetricVal: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  ownerMetricSub: { fontSize: 10, color: '#64748B', marginTop: 2 },
  ownerDivider: { width: 1, height: 26, backgroundColor: '#E2E8F0' },
  ratioBarContainer: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, marginTop: 14, overflow: 'hidden' },
  ratioBarFill: { height: '100%', backgroundColor: '#059669' },
  ratioExplainer: { fontSize: 11, color: '#64748B', marginTop: 8, lineHeight: 16 },

  // PRIORITY DONUT CARD (Matching Image 1 & 5)
  prioritySectionCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
  priorityCardTitle: { fontSize: 16, fontWeight: '900', color: '#0F172A', marginBottom: 10 },

  // RECENT CASES CARD (Matching Image 1 & 5)
  recentCasesCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20 },
  recentCasesTitle: { fontSize: 16, fontWeight: '900', color: '#0F172A' },
  viewAllChevron: { fontSize: 20, color: '#0284C7', fontWeight: '800' },
  recentListStack: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  recentCaseRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  caseDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  recentCaseText: { fontSize: 12.5, fontWeight: '700', color: '#0F172A' },
  recentCaseSub: { fontSize: 11, color: '#64748B', marginTop: 2 },
  recentArrow: { fontSize: 18, color: '#CBD5E1', marginLeft: 8 },

  // BOTTOM NAVIGATION BAR (Matching Image 1, 2, 4, 5)
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    justifyContent: 'space-around',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
  },
  tabButton: { alignItems: 'center', justifyContent: 'center', minWidth: 50 },
  tabIcon: { fontSize: 18, color: '#64748B', marginBottom: 3 },
  tabIconActive: { color: '#0284C7' },
  tabLabel: { fontSize: 10, fontWeight: '600', color: '#64748B' },
  tabLabelActive: { color: '#0284C7', fontWeight: '800' },
});
