import React from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { CompanyContact } from '../types/assistant';

interface Props {
  contact: CompanyContact;
}

export default function ContactCard({ contact }: Props) {
  async function handleCall() {
    const url = `tel:${contact.phone.replace(/\s+/g, '')}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Phone Dialer', `Dialing ${contact.name} at ${contact.phone}`);
      }
    } catch (e) {
      Alert.alert('Phone Action', `Opening phone app for ${contact.name}: ${contact.phone}`);
    }
  }

  async function handleEmail() {
    const url = `mailto:${contact.email}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Email App', `Sending email to ${contact.email}`);
      }
    } catch (e) {
      Alert.alert('Email Action', `Opening email app for ${contact.email}`);
    }
  }

  const isAvailable = contact.availability === 'On-Duty' || contact.availability === 'Available';

  return (
    <View style={styles.card}>
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <View style={[styles.avatar, { backgroundColor: contact.avatarColor || '#D8E9F7' }]}>
          <Text style={styles.avatarText}>{contact.name.charAt(0)}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.name}>{contact.name}</Text>
          <Text style={styles.jobTitle}>{contact.jobTitle}</Text>
        </View>
        <View style={[styles.statusBadge, isAvailable ? styles.bgGreen : styles.bgAmber]}>
          <Text style={[styles.statusText, isAvailable ? styles.txtGreen : styles.txtAmber]}>
            ● {contact.availability}
          </Text>
        </View>
      </View>

      {/* Details Grid */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>DEPARTMENT</Text>
          <Text style={styles.detailValue}>{contact.department}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>ASSIGNED SITE</Text>
          <Text style={styles.detailValue}>{contact.assignedBuilding}</Text>
        </View>
      </View>

      {!!contact.specialty && (
        <Text style={styles.specialtyText}>
          Focus: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{contact.specialty}</Text>
        </Text>
      )}

      {/* Action Buttons: 1-Tap Phone & 1-Tap Email */}
      <View style={styles.actionsRow}>
        <Pressable
          onPress={handleCall}
          style={({ pressed }) => [styles.actionBtn, styles.callBtn, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.callIcon}>📞</Text>
          <Text style={styles.callBtnText}>Call {contact.phone}</Text>
        </Pressable>

        <Pressable
          onPress={handleEmail}
          style={({ pressed }) => [styles.actionBtn, styles.emailBtn, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.emailIcon}>✉️</Text>
          <Text style={styles.emailBtnText}>Email</Text>
        </Pressable>
      </View>

      {/* Access Permission Tag */}
      <View style={styles.permissionFooter}>
        <Text style={styles.permissionText}>
          🔒 Verified Local Contact · Access Level: Authorized
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
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  name: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  jobTitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  bgGreen: { backgroundColor: '#DCFCE7' },
  txtGreen: { color: '#15803D' },
  bgAmber: { backgroundColor: '#FEF3C7' },
  txtAmber: { color: '#B45309' },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  specialtyText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  callBtn: {
    flex: 1.5,
    backgroundColor: '#0F766E',
  },
  callIcon: { fontSize: 13 },
  callBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emailBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  emailIcon: { fontSize: 13 },
  emailBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  permissionFooter: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    alignItems: 'flex-start',
  },
  permissionText: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
