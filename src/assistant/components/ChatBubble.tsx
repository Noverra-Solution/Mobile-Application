import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AssetCard from './AssetCard';
import ContactCard from './ContactCard';
import KnowledgeCard from './KnowledgeCard';
import SpaceCard from './SpaceCard';
import WorkOrderCard from './WorkOrderCard';
import {
  BuildingSpace,
  ChatMessage,
  KnowledgeAsset,
  KnowledgeWorkOrder,
} from '../types/assistant';

interface Props {
  message: ChatMessage;
  onSelectFollowUp?: (text: string) => void;
  onInspectSpace?: (space: BuildingSpace) => void;
  onInspectAsset?: (asset: KnowledgeAsset) => void;
  onInspectWorkOrder?: (wo: KnowledgeWorkOrder) => void;
}

export default function ChatBubble({
  message,
  onSelectFollowUp,
  onInspectSpace,
  onInspectAsset,
  onInspectWorkOrder,
}: Props) {
  const isUser = message.sender === 'user';
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(14)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    // Accessibility check for Reduced Motion
    AccessibilityInfo.isReduceMotionEnabled()
      .then(enabled => setReduceMotion(enabled))
      .catch(() => setReduceMotion(false));

    if (reduceMotion) {
      opacityAnim.setValue(1);
      translateYAnim.setValue(0);
    } else {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
      ]).start();
    }
  }, [reduceMotion]);

  const queryRes = message.queryResult;

  return (
    <Animated.View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
        { opacity: opacityAnim, transform: [{ translateY: translateYAnim }] },
      ]}
    >
      {!isUser && (
        <View style={styles.avatarWrap}>
          <Image
            source={require('../../../assets/nexus-emblem.png')}
            style={styles.avatarEmblem}
            resizeMode="contain"
          />
        </View>
      )}

      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        {/* Header Sender Tag for Assistant */}
        {!isUser && (
          <View style={styles.assistantHeader}>
            <Text style={styles.assistantTitle}>Noverra Assistant</Text>
            <View style={styles.offlinePill}>
              <Text style={styles.offlinePillText}>⚡ OFFLINE ENGINE</Text>
            </View>
          </View>
        )}

        {/* Message Main Text */}
        <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
          {message.text}
        </Text>

        {/* Disambiguation Option Buttons */}
        {!isUser && queryRes && queryRes.intent === 'disambiguation' && queryRes.disambiguationOptions && (
          <View style={styles.optionsStack}>
            {queryRes.disambiguationOptions.map((opt, idx) => (
              <Pressable
                key={opt.id || idx}
                onPress={() => onSelectFollowUp && onSelectFollowUp(opt.query)}
                style={({ pressed }) => [styles.optionBtn, pressed && { backgroundColor: '#EFF6FF' }]}
              >
                <Text style={styles.optionNum}>{idx + 1}.</Text>
                <Text style={styles.optionLabel}>{opt.label}</Text>
                <Text style={styles.optionArrow}>→</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Render Contacts */}
        {!isUser && queryRes && queryRes.contacts && queryRes.contacts.length > 0 && (
          <View style={styles.cardsStack}>
            {queryRes.contacts.map((contact, idx) => (
              <ContactCard key={contact.id || idx} contact={contact} />
            ))}
          </View>
        )}

        {/* Render Spaces */}
        {!isUser && queryRes && queryRes.spaces && queryRes.spaces.length > 0 && (
          <View style={styles.cardsStack}>
            {queryRes.spaces.map((space, idx) => (
              <SpaceCard key={space.id || idx} space={space} onInspect={onInspectSpace} />
            ))}
          </View>
        )}

        {/* Render Assets */}
        {!isUser && queryRes && queryRes.assets && queryRes.assets.length > 0 && (
          <View style={styles.cardsStack}>
            {queryRes.assets.map((asset, idx) => (
              <AssetCard key={asset.id || idx} asset={asset} onInspect={onInspectAsset} />
            ))}
          </View>
        )}

        {/* Render Documents / SOPs */}
        {!isUser && queryRes && queryRes.docs && queryRes.docs.length > 0 && (
          <View style={styles.cardsStack}>
            {queryRes.docs.map((doc, idx) => (
              <KnowledgeCard key={doc.id || idx} document={doc} />
            ))}
          </View>
        )}

        {/* Render Work Orders */}
        {!isUser && queryRes && queryRes.workOrders && queryRes.workOrders.length > 0 && (
          <View style={styles.cardsStack}>
            {queryRes.workOrders.map((wo, idx) => (
              <WorkOrderCard key={wo.id || idx} workOrder={wo} onInspect={onInspectWorkOrder} />
            ))}
          </View>
        )}

        {/* Citation Badge */}
        {!isUser && message.citationRef && (
          <View style={styles.citationRow}>
            <Text style={styles.citationText}>
              Reference Record: <Text style={{ fontWeight: '800' }}>{message.citationRef}</Text>
            </Text>
          </View>
        )}

        {/* Timestamp */}
        <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.assistantTimestamp]}>
          {message.timestamp}
        </Text>
      </View>

      {/* Suggested Follow-up Pills under Assistant Message */}
      {!isUser && message.suggestedFollowUps && message.suggestedFollowUps.length > 0 && (
        <View style={styles.followUpWrap}>
          {message.suggestedFollowUps.slice(0, 3).map((fText, fIdx) => (
            <Pressable
              key={fIdx}
              onPress={() => onSelectFollowUp && onSelectFollowUp(fText)}
              style={({ pressed }) => [styles.followUpPill, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.followUpText}>💡 {fText}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    paddingHorizontal: 14,
    maxWidth: '100%',
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  avatarWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#070A0F',
    padding: 3,
    marginBottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmblem: {
    width: '100%',
    height: '100%',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    maxWidth: '88%',
  },
  userBubble: {
    backgroundColor: '#0F172A',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    width: '100%',
  },
  assistantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  assistantTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0284C7',
    letterSpacing: -0.2,
  },
  offlinePill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  offlinePillText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  messageText: {
    fontSize: 13.5,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  assistantText: {
    color: '#0F172A',
  },
  optionsStack: {
    marginTop: 10,
    gap: 6,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  optionNum: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0284C7',
  },
  optionLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  optionArrow: {
    fontSize: 14,
    color: '#0284C7',
    fontWeight: '800',
  },
  cardsStack: {
    marginTop: 6,
  },
  citationRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  citationText: {
    fontSize: 9.5,
    color: '#94A3B8',
  },
  timestamp: {
    fontSize: 9.5,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: '#94A3B8',
  },
  assistantTimestamp: {
    color: '#94A3B8',
  },
  followUpWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    paddingLeft: 4,
  },
  followUpPill: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  followUpText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0F766E',
  },
});
