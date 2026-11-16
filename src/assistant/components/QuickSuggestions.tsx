import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const SUGGESTIONS = [
  { icon: '👤', text: 'Who is the maintenance supervisor?' },
  { icon: '🚨', text: 'Show emergency contact numbers.' },
  { icon: '🚰', text: 'Who handles plumbing repairs?' },
  { icon: '🏢', text: 'Show contacts for Building 2.' },
  { icon: '📍', text: 'Where is Room 6232?' },
  { icon: '❄️', text: 'What is the procedure for reporting an AC failure?' },
  { icon: '🔧', text: 'Show my assigned Work Orders.' },
];

interface Props {
  onSelectSuggestion: (question: string) => void;
}

export default function QuickSuggestions({ onSelectSuggestion }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.headerTitle}>SUGGESTED QUESTIONS</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollPad}
      >
        {SUGGESTIONS.map((item, index) => (
          <Pressable
            key={index}
            onPress={() => onSelectSuggestion(item.text)}
            style={({ pressed }) => [
              styles.pill,
              pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] },
            ]}
          >
            <Text style={styles.pillIcon}>{item.icon}</Text>
            <Text style={styles.pillText}>{item.text}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 6,
    backgroundColor: '#F8FAF9',
  },
  headerTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.2,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  scrollPad: {
    paddingHorizontal: 14,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 6,
    shadowColor: '#0F172A',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  pillIcon: {
    fontSize: 12,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
});
