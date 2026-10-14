import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Thermometer } from '@/components/Thermometer';
import { Body, Button, Card, SectionHeading } from '@/components/ui';
import { config } from '@/constants/config';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { story } from '@/data/story';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: spacing.xl }}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Image
          source={config.images.logo}
          style={styles.logo}
          contentFit="contain"
          accessibilityLabel="Anya's Journey Foundation logo"
        />
      </View>

      <View>
        <Image source={config.images.hero} style={styles.hero} contentFit="cover" transition={300} />
        <View style={styles.heroOverlay}>
          <Text style={styles.heroName}>Anya's Journey</Text>
          <Text style={styles.heroTagline}>{story.tagline}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeading eyebrow="My story" title="Hi, I'm Anya" />
        {story.intro.map((p) => (
          <Body key={p}>{p}</Body>
        ))}
        <Button
          label="Read my full story"
          variant="outline"
          icon="open-in-new"
          onPress={() => WebBrowser.openBrowserAsync(config.storyUrl)}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.gallery}
      >
        {config.images.gallery.map((uri) => (
          <Image key={uri} source={uri} style={styles.galleryImage} contentFit="cover" transition={200} />
        ))}
      </ScrollView>

      <View style={[styles.section, styles.grey]}>
        <SectionHeading eyebrow="Our mission" title="Playgrounds for everyone" />
        <Image source={config.images.playground} style={styles.feature} contentFit="cover" />
        <Body>{story.mission}</Body>
        <View style={styles.quote}>
          <Text style={styles.quoteText}>"{story.quote}"</Text>
          <Text style={styles.quoteBy}>Anya</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Thermometer compact />
        <Button
          label="Help build the playground"
          icon="hand-heart"
          style={{ marginTop: spacing.md }}
          onPress={() => router.navigate('/donate')}
        />
      </View>

      <View style={styles.section}>
        <Card>
          <Text style={styles.cardTitle}>What is Lamb-Shaffer Syndrome?</Text>
          <Body>{story.lss}</Body>
          <Button
            label="Learn more about LSS"
            variant="dark"
            onPress={() => WebBrowser.openBrowserAsync(config.lssUrl)}
          />
        </Card>
      </View>

      <View style={styles.footer}>
        <View style={styles.socials}>
          <Social icon="facebook" label="Facebook" url={config.social.facebook} />
          <Social icon="instagram" label="Instagram" url={config.social.instagram} />
          <Social icon="email-outline" label="Email us" url={`mailto:${config.contactEmail}`} />
        </View>
        <Text style={styles.footerText}>Anya's Journey Foundation</Text>
        <Text style={styles.footerText}>Registered charity {config.charityNumber}</Text>
      </View>
    </ScrollView>
  );
}

function Social({ icon, label, url }: { icon: 'facebook' | 'instagram' | 'email-outline'; label: string; url: string }) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={() =>
        url.startsWith('mailto:') ? Linking.openURL(url) : WebBrowser.openBrowserAsync(url)
      }
      style={styles.socialButton}
    >
      <MaterialCommunityIcons name={icon} size={24} color={colors.gold} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    alignItems: 'center',
    paddingBottom: spacing.sm,
    backgroundColor: colors.white,
  },
  logo: { width: 200, height: 70 },
  hero: { width: '100%', height: 360 },
  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  heroName: { fontFamily: fonts.heading, fontSize: 34, color: colors.white },
  heroTagline: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.white },
  section: { paddingHorizontal: spacing.md, paddingVertical: spacing.lg },
  grey: { backgroundColor: colors.section },
  gallery: { paddingHorizontal: spacing.md, gap: spacing.sm, paddingBottom: spacing.lg },
  galleryImage: { width: 160, height: 200, borderRadius: radius.md, backgroundColor: colors.section },
  feature: {
    width: '100%',
    height: 200,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    backgroundColor: colors.border,
  },
  quote: {
    borderLeftWidth: 4,
    borderLeftColor: colors.gold,
    backgroundColor: colors.white,
    padding: spacing.md,
  },
  quoteText: { fontFamily: fonts.headingRegular, fontSize: 18, color: colors.heading, fontStyle: 'italic' },
  quoteBy: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.gold, marginTop: spacing.xs },
  cardTitle: { fontFamily: fonts.heading, fontSize: 20, color: colors.heading, marginBottom: spacing.sm },
  footer: { alignItems: 'center', paddingTop: spacing.md, gap: spacing.xs },
  socials: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
});
