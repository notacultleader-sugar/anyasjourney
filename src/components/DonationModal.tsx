import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { config } from '@/constants/config';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { formatCurrency } from '@/data/equipment';

export type DonationRequest = {
  /** What the donor is giving for, e.g. "Sponsoring: Park Bench" */
  note: string;
  /** Suggested amount in dollars, if there is one */
  amount?: number;
  /** Heading; defaults to "Your item has been copied to your clipboard" */
  title?: string;
};

type Site = 'canadaHelps' | 'payPal' | 'goFundMe';
const sites: { key: Site; label: string }[] = [
  { key: 'canadaHelps', label: 'CanadaHelps' },
  { key: 'payPal', label: 'PayPal' },
  { key: 'goFundMe', label: 'GoFundMe' },
];

function siteUrl(site: Site, amount?: number) {
  // PayPal is the only one that takes the amount in its link.
  if (site === 'payPal' && amount) return `${config.donate.payPal}/${amount}CAD`;
  return config.donate[site];
}

// Full-screen pop-up shown before a donation page opens. The donation sites
// can't have their message box filled in from a link, so this copies the note
// for the donor and gives them copy buttons for the note and the amount.
export function DonationModal({ request, onClose }: { request: DonationRequest | null; onClose: () => void }) {
  const [site, setSite] = useState<Site>('canadaHelps');
  const [copied, setCopied] = useState<'note' | 'amount' | null>(null);

  useEffect(() => {
    if (!request) return;
    setCopied(null);
    Clipboard.setStringAsync(request.note).catch(() => {});
  }, [request]);

  const copy = (what: 'note' | 'amount', text: string) => {
    Clipboard.setStringAsync(text).catch(() => {});
    setCopied(what);
  };

  const go = () => {
    if (!request) return;
    WebBrowser.openBrowserAsync(siteUrl(site, request.amount));
    onClose();
  };

  const siteName = sites.find((s) => s.key === site)!.label;

  return (
    <Modal visible={!!request} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" style={styles.close} hitSlop={12}>
            <MaterialCommunityIcons name="close" size={24} color={colors.muted} />
          </Pressable>
          <ScrollView contentContainerStyle={styles.content} bounces={false}>
            <View style={styles.badge}>
              <MaterialCommunityIcons name="clipboard-check-outline" size={44} color={colors.gold} />
            </View>
            <Text style={styles.title}>{request?.title ?? 'Your item has been copied to your clipboard'}</Text>
            <Text style={styles.subtitle}>Don't forget to paste it in your message on the donation screen.</Text>

            {request ? (
              <>
                <Field
                  label="Your donation"
                  value={request.note}
                  copied={copied === 'note'}
                  onCopy={() => copy('note', request.note)}
                />
                {request.amount ? (
                  <Field
                    label="Amount"
                    value={formatCurrency(request.amount)}
                    copied={copied === 'amount'}
                    onCopy={() => copy('amount', String(request.amount))}
                  />
                ) : null}
              </>
            ) : null}

            <Text style={styles.label}>Donate with</Text>
            <View style={styles.sites}>
              {sites.map((s) => (
                <Pressable
                  key={s.key}
                  onPress={() => setSite(s.key)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: site === s.key }}
                  style={[styles.site, site === s.key && styles.siteOn]}
                >
                  <Text style={[styles.siteText, site === s.key && styles.siteTextOn]}>{s.label}</Text>
                </Pressable>
              ))}
            </View>
            {site === 'payPal' && request?.amount ? (
              <Text style={styles.hint}>PayPal opens with the amount filled in.</Text>
            ) : null}
          </ScrollView>

          <Pressable
            onPress={go}
            accessibilityRole="button"
            style={({ pressed }) => [styles.ok, pressed && { backgroundColor: colors.goldLight }]}
          >
            <Text style={styles.okText}>OK</Text>
            <Text style={styles.okSub}>Go to {siteName}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function Field({ label, value, copied, onCopy }: { label: string; value: string; copied: boolean; onCopy: () => void }) {
  return (
    <View style={styles.field}>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value} selectable>
          {value}
        </Text>
      </View>
      <Pressable
        onPress={onCopy}
        accessibilityRole="button"
        accessibilityLabel={`Copy ${label.toLowerCase()}`}
        style={({ pressed }) => [styles.copy, copied && styles.copyDone, pressed && { opacity: 0.7 }]}
      >
        <MaterialCommunityIcons name={copied ? 'check' : 'content-copy'} size={18} color={colors.white} />
        <Text style={styles.copyText}>{copied ? 'Copied' : 'Copy'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  sheet: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    maxHeight: '92%',
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  close: { position: 'absolute', top: spacing.md, right: spacing.md, zIndex: 1 },
  content: { padding: spacing.lg, paddingTop: spacing.xl },
  badge: {
    alignSelf: 'center',
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.goldPale,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: { fontFamily: fonts.heading, fontSize: 26, lineHeight: 34, color: colors.heading, textAlign: 'center' },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.section,
  },
  label: { fontFamily: fonts.bodyMedium, fontSize: 12, letterSpacing: 1, color: colors.gold, textTransform: 'uppercase' },
  value: { fontFamily: fonts.bodyBold, fontSize: 17, color: colors.heading, marginTop: 2 },
  copy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.button,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  copyDone: { backgroundColor: '#3c8d5a' },
  copyText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.white },
  sites: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  site: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  siteOn: { borderColor: colors.gold, backgroundColor: colors.goldPale },
  siteText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.text },
  siteTextOn: { color: colors.heading },
  hint: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: spacing.sm },
  ok: { backgroundColor: colors.gold, paddingVertical: spacing.md, alignItems: 'center' },
  okText: { fontFamily: fonts.bodyBold, fontSize: 20, color: colors.white },
  okSub: { fontFamily: fonts.body, fontSize: 13, color: colors.white },
});
