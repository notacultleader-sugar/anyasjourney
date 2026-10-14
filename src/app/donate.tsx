import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Thermometer } from '@/components/Thermometer';
import { Body, Button, Card, SectionHeading } from '@/components/ui';
import { config } from '@/constants/config';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { equipment, formatCurrency, type EquipmentItem } from '@/data/equipment';

const open = (url: string) => WebBrowser.openBrowserAsync(url);

function sponsor(item: EquipmentItem) {
  const message = `Thank you! Donate ${formatCurrency(item.price)} and add "${item.name}" in your donation note so we know what you're sponsoring.`;
  if (Platform.OS === 'web') {
    open(config.donate.canadaHelps);
    return;
  }
  Alert.alert(`Sponsor a ${item.name}`, message, [
    { text: 'CanadaHelps', onPress: () => open(config.donate.canadaHelps) },
    { text: 'PayPal', onPress: () => open(config.donate.payPal) },
    { text: 'GoFundMe', onPress: () => open(config.donate.goFundMe) },
  ], { cancelable: true });
}

export default function DonateScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Thermometer />

      <View style={styles.block}>
        <SectionHeading eyebrow="Give today" title="Donate online" />
        <Body>
          Every dollar goes toward building accessible, inclusive playgrounds for all ages. Donations of any
          amount are welcome.
        </Body>
        <View style={styles.buttons}>
          <Button label="Donate on CanadaHelps" icon="heart-outline" onPress={() => open(config.donate.canadaHelps)} />
          <Button label="Credit card with PayPal" icon="credit-card-outline" variant="dark" onPress={() => open(config.donate.payPal)} />
          <Button label="Donate on GoFundMe" icon="hand-heart-outline" variant="outline" onPress={() => open(config.donate.goFundMe)} />
        </View>
      </View>

      <View style={styles.block}>
        <SectionHeading eyebrow="Sponsor equipment" title="Build the playground" />
        <Body>Choose a piece of playground equipment to sponsor.</Body>
        <Text style={styles.placeholder}>Items and prices shown are placeholders.</Text>
        {equipment.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => sponsor(item)}
            accessibilityRole="button"
            accessibilityLabel={`Sponsor ${item.name}, ${formatCurrency(item.price)}`}
            style={({ pressed }) => [styles.item, pressed && { backgroundColor: colors.goldPale }]}
          >
            <View style={styles.itemIcon}>
              <MaterialCommunityIcons name={item.icon} size={30} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDesc}>{item.description}</Text>
            </View>
            <View style={styles.priceCol}>
              <Text style={styles.price}>{formatCurrency(item.price)}</Text>
              <Text style={styles.sponsor}>Sponsor</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <Card style={styles.block}>
        <Text style={styles.otherTitle}>E-transfer</Text>
        <Body>Send an Interac e-Transfer to {config.donate.eTransferEmail}.</Body>
        <View style={styles.buttons}>
          <Button
            label="Email for e-transfer details"
            variant="outline"
            icon="email-outline"
            onPress={() => Linking.openURL(`mailto:${config.donate.eTransferEmail}`)}
          />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  block: { marginTop: spacing.xl },
  buttons: { gap: spacing.sm },
  placeholder: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
    fontStyle: 'italic',
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
  },
  itemIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.goldPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.heading },
  itemDesc: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.text, marginTop: 2 },
  priceCol: { alignItems: 'flex-end' },
  price: { fontFamily: fonts.heading, fontSize: 18, color: colors.heading },
  sponsor: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.gold, marginTop: 2 },
  otherTitle: { fontFamily: fonts.heading, fontSize: 20, color: colors.heading, marginBottom: spacing.sm },
});
