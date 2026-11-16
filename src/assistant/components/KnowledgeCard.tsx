import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { KnowledgeDocument } from '../types/assistant';

interface Props {
  document: KnowledgeDocument;
}

export default function KnowledgeCard({ document }: Props) {
  const isEmergency = document.emergencyLevel === 'Emergency';

  return (
    <View style={[styles.card, isEmergency && styles.cardEmergency]}>
      <View style={styles.headerRow}>
        <View style={[styles.catBadge, isEmergency ? styles.bgRed : styles.bgTeal]}>
          <Text style={[styles.catText, isEmergency ? styles.txtRed : styles.txtTeal]}>
            {document.category}
          </Text>
        </View>
        <Text style={styles.refCode}>Ref: {document.refDoc}</Text>
      </View>

      <Text style={styles.title}>{document.title}</Text>
      <Text style={styles.contentSummary}>{document.content}</Text>

      {document.steps && document.steps.length > 0 && (
        <View style={styles.stepsContainer}>
          <Text style={styles.stepsHeader}>PROCEDURAL STEPS & GUIDELINES:</Text>
          {document.steps.map((step, idx) => (
            <Text key={idx} style={styles.stepText}>
              {step}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.footerRow}>
        <Text style={styles.footerNote}>
          Verified Standard Operating Procedure · Local Noverra Knowledge Base
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
    marginBottom: 6,
  },
  cardEmergency: {
    borderColor: '#FECDD3',
    backgroundColor: '#FFF1F2',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bgTeal: { backgroundColor: '#F0FDFA' },
  txtTeal: { color: '#0F766E' },
  bgRed: { backgroundColor: '#FEE2E2' },
  txtRed: { color: '#DC2626' },
  catText: {
    fontSize: 10,
    fontWeight: '800',
  },
  refCode: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  title: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 6,
  },
  contentSummary: {
    fontSize: 12,
    color: '#334155',
    marginTop: 4,
    lineHeight: 18,
  },
  stepsContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.6)',
    gap: 6,
  },
  stepsHeader: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#0F766E',
    letterSpacing: 1,
  },
  stepText: {
    fontSize: 11.5,
    color: '#1E293B',
    lineHeight: 17,
  },
  footerRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(241, 245, 249, 0.8)',
  },
  footerNote: {
    fontSize: 9.5,
    color: '#94A3B8',
  },
});
