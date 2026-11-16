import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import ChatBubble from './ChatBubble';
import DetailModal from './DetailModal';
import QuickSuggestions from './QuickSuggestions';
import SyncStatusBanner from './SyncStatusBanner';
import { chatResponseFormatter } from '../services/ChatResponseFormatter';
import { localSearchProvider } from '../services/LocalSearchProvider';
import { assistantRepository } from '../storage/AssistantRepository';
import {
  BuildingSpace,
  ChatMessage,
  KnowledgeAsset,
  KnowledgeWorkOrder,
} from '../types/assistant';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  currentUser: { name: string; email: string; role?: string; initials?: string };
  onBack: () => void;
}

export default function AssistantScreen({ currentUser, onBack }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('12 Nov 2026, 08:30 AM');

  // Searchable History Modal State
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [historySearchTerm, setHistorySearchTerm] = useState('');

  // Inspection Detail Modal State
  const [selectedSpace, setSelectedSpace] = useState<BuildingSpace | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<KnowledgeAsset | null>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<KnowledgeWorkOrder | null>(null);

  const scrollRef = useRef<any>(null);
  const userRole = currentUser.role || 'Real Estate Asset Owner';

  // Load chat history & sync metadata on mount
  useEffect(() => {
    async function loadInitialData() {
      await assistantRepository.init();
      const history = await assistantRepository.getChatHistory(currentUser.email);
      setMessages(history);

      const syncMeta = await assistantRepository.getSyncMetadata();
      setLastSyncTime(syncMeta.lastSyncTimestamp);
    }
    loadInitialData();
  }, [currentUser.email]);

  // Scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isSearching]);

  async function handleSendMessage(queryText?: string) {
    const textToSend = (queryText || inputText).trim();
    if (!textToSend || isSearching) return;

    setInputText('');
    Keyboard.dismiss();

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp,
      isOffline: true,
    };

    // Update state immediately
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    await assistantRepository.saveChatMessage(currentUser.email, userMsg);

    setIsSearching(true);

    try {
      // Fast deterministic offline search query execution (<50ms)
      const searchRes = await localSearchProvider.executeSearch(textToSend, userRole, currentUser.email);
      const assistantMsg = chatResponseFormatter.formatSearchResultToMessage(textToSend, searchRes);

      setMessages(prev => [...prev, assistantMsg]);
      await assistantRepository.saveChatMessage(currentUser.email, assistantMsg);
    } catch (err) {
      console.warn('Search execution error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `Unable to search local database. Please try again.`,
        timestamp,
        isOffline: true,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsSearching(false);
    }
  }

  async function handleClearHistory() {
    await assistantRepository.clearChatHistory(currentUser.email);
    setMessages([]);
  }

  const filteredHistory = messages.filter(
    m => !historySearchTerm.trim() || m.text.toLowerCase().includes(historySearchTerm.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* ======================================================== */}
        {/* TOP SCREEN HEADER BAR                                    */}
        {/* ======================================================== */}
        <View style={styles.header}>
          <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Dashboard</Text>
          </Pressable>

          <View style={styles.headerBrandGroup}>
            <View style={styles.emblemWrap}>
              <Image
                source={require('../../../assets/nexus-emblem.png')}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            </View>
            <View>
              <Text style={styles.headerTitle}>
                Noverra Assistant<Text style={{ color: '#0284C7' }}>.</Text>
              </Text>
              <Text style={styles.headerSub}>OFFLINE COMPANY KNOWLEDGE</Text>
            </View>
          </View>

          <View style={styles.headerRightActions}>
            <Pressable
              onPress={() => setIsHistoryModalVisible(true)}
              hitSlop={8}
              style={styles.iconBtn}
            >
              <Text style={{ fontSize: 16 }}>📜</Text>
            </Pressable>

            <Pressable onPress={handleClearHistory} hitSlop={8} style={styles.iconBtn}>
              <Text style={{ fontSize: 16 }}>🗑️</Text>
            </Pressable>
          </View>
        </View>

        {/* Sync Status Banner */}
        <SyncStatusBanner lastSyncTime={lastSyncTime} isOffline={true} />

        {/* ======================================================== */}
        {/* MESSAGES CHAT AREA                                       */}
        {/* ======================================================== */}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.chatScrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* WELCOME / EMPTY STATE */}
          {messages.length === 0 && (
            <View style={styles.welcomeCard}>
              <View style={styles.welcomeEmblemWrap}>
                <Image
                  source={require('../../../assets/nexus-emblem.png')}
                  style={{ width: 28, height: 28 }}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.welcomeHeading}>Welcome to Noverra Assistant</Text>
              <Text style={styles.welcomeSub}>
                Your offline intelligent company assistant. Ask questions about contacts, rooms, assets, maintenance SOPs, and permitted Work Orders.
              </Text>

              <View style={styles.featuresList}>
                <View style={styles.featureRow}>
                  <Text style={styles.featureIcon}>⚡</Text>
                  <Text style={styles.featureText}>
                    100% Offline Capability · Fast local database search
                  </Text>
                </View>
                <View style={styles.featureRow}>
                  <Text style={styles.featureIcon}>📞</Text>
                  <Text style={styles.featureText}>
                    1-Tap Direct Dialer & Email for Supervisors & Technicians
                  </Text>
                </View>
                <View style={styles.featureRow}>
                  <Text style={styles.featureIcon}>🔒</Text>
                  <Text style={styles.featureText}>
                    Authorized access control for {userRole}
                  </Text>
                </View>
                <View style={styles.featureRow}>
                  <Text style={styles.featureIcon}>📋</Text>
                  <Text style={styles.featureText}>
                    Verified Standard Operating Procedures & Citations
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* CHAT MESSAGES STACK */}
          {messages.map(msg => (
            <ChatBubble
              key={msg.id}
              message={msg}
              onSelectFollowUp={txt => handleSendMessage(txt)}
              onInspectSpace={sp => setSelectedSpace(sp)}
              onInspectAsset={ast => setSelectedAsset(ast)}
              onInspectWorkOrder={wo => setSelectedWorkOrder(wo)}
            />
          ))}

          {/* SEARCHING INDICATOR */}
          {isSearching && (
            <View style={styles.searchingRow}>
              <ActivityIndicator size="small" color="#0284C7" />
              <Text style={styles.searchingText}>Searching local company database...</Text>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* ======================================================== */}
        {/* SUGGESTIONS & INPUT BAR AT BOTTOM                        */}
        {/* ======================================================== */}
        <View style={styles.inputAreaWrapper}>
          <QuickSuggestions onSelectSuggestion={q => handleSendMessage(q)} />

          <View style={styles.inputBar}>
            <TextInput
              placeholder="Ask Noverra Assistant..."
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSendMessage()}
              returnKeyType="send"
              style={styles.textInput}
            />

            {inputText.trim().length > 0 && (
              <Pressable onPress={() => setInputText('')} style={styles.clearInputBtn}>
                <Text style={styles.clearInputText}>✕</Text>
              </Pressable>
            )}

            <Pressable
              onPress={() => handleSendMessage()}
              disabled={!inputText.trim() || isSearching}
              style={({ pressed }) => [
                styles.sendBtn,
                (!inputText.trim() || isSearching) && { opacity: 0.4 },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.sendIcon}>↗</Text>
            </Pressable>
          </View>
        </View>

        {/* ======================================================== */}
        {/* SEARCHABLE CONVERSATION HISTORY MODAL                    */}
        {/* ======================================================== */}
        <Modal
          visible={isHistoryModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.historyContainer}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Conversation History</Text>
              <Pressable onPress={() => setIsHistoryModalVisible(false)}>
                <Text style={styles.historyClose}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.historySearchBox}>
              <TextInput
                placeholder="Search past chat messages..."
                placeholderTextColor="#94A3B8"
                value={historySearchTerm}
                onChangeText={setHistorySearchTerm}
                style={styles.historyInput}
              />
            </View>

            <ScrollView style={{ flex: 1, padding: 16 }}>
              {filteredHistory.length === 0 ? (
                <Text style={styles.emptyHistoryText}>No matching past messages found.</Text>
              ) : (
                filteredHistory.map(item => (
                  <View
                    key={item.id}
                    style={[
                      styles.historyCard,
                      item.sender === 'user' ? styles.hUser : styles.hAssistant,
                    ]}
                  >
                    <View style={styles.hRow}>
                      <Text style={styles.hSender}>
                        {item.sender === 'user' ? 'You' : 'Assistant'}
                      </Text>
                      <Text style={styles.hTime}>{item.timestamp}</Text>
                    </View>
                    <Text style={styles.hText}>{item.text}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </Modal>

        {/* ======================================================== */}
        {/* INSPECTION DETAIL MODAL                                 */}
        {/* ======================================================== */}
        <DetailModal
          visible={Boolean(selectedSpace || selectedAsset || selectedWorkOrder)}
          onClose={() => {
            setSelectedSpace(null);
            setSelectedAsset(null);
            setSelectedWorkOrder(null);
          }}
          space={selectedSpace}
          asset={selectedAsset}
          workOrder={selectedWorkOrder}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F766E',
  },
  headerBrandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emblemWrap: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: '#070A0F',
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconBtn: {
    padding: 4,
  },
  chatScrollContent: {
    paddingVertical: 12,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  welcomeEmblemWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#070A0F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  welcomeHeading: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
  },
  welcomeSub: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  featuresList: {
    marginTop: 16,
    width: '100%',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureIcon: {
    fontSize: 13,
  },
  featureText: {
    fontSize: 11.5,
    color: '#334155',
    fontWeight: '600',
  },
  searchingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    marginVertical: 8,
  },
  searchingText: {
    fontSize: 12,
    color: '#0284C7',
    fontWeight: '700',
  },
  inputAreaWrapper: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  textInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#F8FAF9',
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 13,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  clearInputBtn: {
    padding: 6,
  },
  clearInputText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '700',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    color: '#00F0FF',
    fontSize: 18,
    fontWeight: '800',
  },
  historyContainer: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  historyHeader: {
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
  historyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  historyClose: {
    fontSize: 16,
    fontWeight: '800',
    color: '#64748B',
  },
  historySearchBox: {
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  historyInput: {
    height: 40,
    backgroundColor: '#F8FAF9',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyHistoryText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 40,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hUser: {
    borderLeftWidth: 3,
    borderLeftColor: '#0284C7',
  },
  hAssistant: {
    borderLeftWidth: 3,
    borderLeftColor: '#0F766E',
  },
  hRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  hSender: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  hTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  hText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 17,
  },
});
