import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { X, Link, MapPin, DollarSign, Bed, Bath, Square, Image as ImageIcon, Plus, Tag, Search, CheckCircle, AlertCircle } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import colors from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { useResponsive } from '@/hooks/useResponsive';

interface ExtractedMetadata {
  address?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  photos?: string[];
  listingSource?: string;
}

const extractListingSource = (url: string): string => {
  try {
    const hostname = new URL(url).hostname;
    if (hostname.includes('zillow')) return 'Zillow';
    if (hostname.includes('apartments')) return 'Apartments.com';
    if (hostname.includes('craigslist')) return 'Craigslist';
    if (hostname.includes('hotpads')) return 'HotPads';
    if (hostname.includes('trulia')) return 'Trulia';
    if (hostname.includes('realtor')) return 'Realtor.com';
    if (hostname.includes('redfin')) return 'Redfin';
    return hostname.replace('www.', '');
  } catch {
    return 'Other';
  }
};

const extractMetadataFromHtml = (html: string, url: string): ExtractedMetadata => {
  const metadata: ExtractedMetadata = {
    listingSource: extractListingSource(url),
  };

  const getMetaContent = (nameOrProperty: string): string | null => {
    const patterns = [
      new RegExp(`<meta[^>]*(?:name|property)=["']${nameOrProperty}["'][^>]*content=["']([^"']*)["']`, 'i'),
      new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${nameOrProperty}["']`, 'i'),
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) return match[1].trim();
    }
    return null;
  };

  const ogTitle = getMetaContent('og:title');
  const ogDescription = getMetaContent('og:description');
  const ogImage = getMetaContent('og:image');
  const twitterImage = getMetaContent('twitter:image');
  
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const pageTitle = titleMatch ? titleMatch[1].trim() : null;
  
  const combinedText = [ogTitle, ogDescription, pageTitle].filter(Boolean).join(' ');
  
  const pricePatterns = [
    /\$([\d,]+)(?:\.\d{2})?(?:\s*\/\s*(?:mo|month|per month))?/gi,
    /([\d,]+)(?:\.\d{2})?\s*(?:\/\s*)?(?:mo|month|per month)/gi,
    /rent[:\s]*\$?([\d,]+)/gi,
    /price[:\s]*\$?([\d,]+)/gi,
  ];
  
  for (const pattern of pricePatterns) {
    const matches = combinedText.matchAll(pattern);
    for (const match of matches) {
      const priceStr = match[1].replace(/,/g, '');
      const price = parseInt(priceStr, 10);
      if (price >= 500 && price <= 20000) {
        metadata.price = price;
        break;
      }
    }
    if (metadata.price) break;
  }

  const bedroomPatterns = [
    /(\d+)\s*(?:bed(?:room)?s?|br|bd)/gi,
    /studio/gi,
  ];
  
  for (const pattern of bedroomPatterns) {
    if (pattern.source === 'studio') {
      if (combinedText.toLowerCase().includes('studio')) {
        metadata.bedrooms = 0;
        break;
      }
    } else {
      const match = combinedText.match(pattern);
      if (match) {
        const beds = parseInt(match[0], 10);
        if (!isNaN(beds) && beds >= 0 && beds <= 10) {
          metadata.bedrooms = beds;
          break;
        }
      }
    }
  }

  const bathroomPatterns = [
    /([\d.]+)\s*(?:bath(?:room)?s?|ba)/gi,
  ];
  
  for (const pattern of bathroomPatterns) {
    const match = combinedText.match(pattern);
    if (match) {
      const baths = parseFloat(match[0]);
      if (!isNaN(baths) && baths >= 0 && baths <= 10) {
        metadata.bathrooms = baths;
        break;
      }
    }
  }

  const sqftPatterns = [
    /([\d,]+)\s*(?:sq\.?\s*ft\.?|sqft|square\s*feet)/gi,
  ];
  
  for (const pattern of sqftPatterns) {
    const match = combinedText.match(pattern);
    if (match) {
      const sqft = parseInt(match[0].replace(/,/g, ''), 10);
      if (!isNaN(sqft) && sqft >= 100 && sqft <= 50000) {
        metadata.squareFootage = sqft;
        break;
      }
    }
  }

  const addressPatterns = [
    /\d+\s+[\w\s]+(?:street|st|avenue|ave|boulevard|blvd|road|rd|drive|dr|lane|ln|way|court|ct|place|pl)[,\s]+[\w\s]+,?\s*[A-Z]{2}(?:\s+\d{5})?/gi,
  ];
  
  const ogStreetAddress = getMetaContent('og:street-address');
  const ogLocality = getMetaContent('og:locality');
  const ogRegion = getMetaContent('og:region');
  
  if (ogStreetAddress) {
    let address = ogStreetAddress;
    if (ogLocality) address += `, ${ogLocality}`;
    if (ogRegion) address += `, ${ogRegion}`;
    metadata.address = address;
  } else {
    for (const pattern of addressPatterns) {
      const match = combinedText.match(pattern);
      if (match && match[0]) {
        metadata.address = match[0].trim();
        break;
      }
    }
  }

  if (!metadata.address && (ogTitle || pageTitle)) {
    const title = ogTitle || pageTitle || '';
    if (title.length < 100 && /\d/.test(title)) {
      metadata.address = title.split('|')[0].split('-')[0].trim();
    }
  }

  const photos: string[] = [];
  if (ogImage) photos.push(ogImage);
  if (twitterImage && twitterImage !== ogImage) photos.push(twitterImage);
  
  const imgMatches = html.matchAll(/<img[^>]*src=["']([^"']+)["'][^>]*/gi);
  for (const match of imgMatches) {
    const src = match[1];
    if (src && 
        !src.includes('logo') && 
        !src.includes('icon') && 
        !src.includes('avatar') &&
        !src.includes('sprite') &&
        (src.includes('http') || src.startsWith('//')) &&
        photos.length < 8) {
      const fullUrl = src.startsWith('//') ? `https:${src}` : src;
      if (!photos.includes(fullUrl)) {
        photos.push(fullUrl);
      }
    }
  }
  
  if (photos.length > 0) {
    metadata.photos = photos;
  }

  return metadata;
};

const fetchMetadataFromUrl = async (url: string): Promise<ExtractedMetadata> => {
  const source = extractListingSource(url);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'text/html,application/xhtml+xml',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log('Fetch failed with status:', response.status);
      return { listingSource: source };
    }
    
    const html = await response.text();
    console.log('Fetched HTML length:', html.length);
    
    return extractMetadataFromHtml(html, url);
  } catch (error) {
    console.log('Fetch error (likely CORS):', error);
    return { listingSource: source };
  }
};

export default function AddApartmentScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { addApartment } = useApp();
  const { isSmallScreen, isLargeScreen } = useResponsive();

  const [sourceUrl, setSourceUrl] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [squareFootage, setSquareFootage] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [listingSource, setListingSource] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState<'idle' | 'success' | 'partial' | 'failed'>('idle');

  const handleAddPhoto = () => {
    if (photoUrl.trim() && photos.length < 10) {
      setPhotos([...photos, photoUrl.trim()]);
      setPhotoUrl('');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < 10) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleExtractMetadata = useCallback(async () => {
    if (!sourceUrl.trim()) {
      Alert.alert('Enter URL', 'Please paste a listing URL first');
      return;
    }

    try {
      new URL(sourceUrl);
    } catch {
      Alert.alert('Invalid URL', 'Please enter a valid URL');
      return;
    }

    setIsExtracting(true);
    setExtractionStatus('idle');
    console.log('Extracting metadata from:', sourceUrl);

    try {
      const metadata = await fetchMetadataFromUrl(sourceUrl);
      console.log('Extracted metadata:', metadata);
      
      let fieldsExtracted = 0;

      if (metadata.address) {
        setAddress(metadata.address);
        fieldsExtracted++;
      }
      if (metadata.price) {
        setPrice(metadata.price.toString());
        fieldsExtracted++;
      }
      if (metadata.bedrooms !== undefined) {
        setBedrooms(metadata.bedrooms.toString());
        fieldsExtracted++;
      }
      if (metadata.bathrooms !== undefined) {
        setBathrooms(metadata.bathrooms.toString());
        fieldsExtracted++;
      }
      if (metadata.squareFootage) {
        setSquareFootage(metadata.squareFootage.toString());
        fieldsExtracted++;
      }
      if (metadata.photos && metadata.photos.length > 0) {
        setPhotos(metadata.photos);
        fieldsExtracted++;
      }
      if (metadata.listingSource) {
        setListingSource(metadata.listingSource);
      }

      if (fieldsExtracted >= 5) {
        setExtractionStatus('success');
      } else if (fieldsExtracted > 0) {
        setExtractionStatus('partial');
      } else {
        setExtractionStatus('failed');
      }
    } catch (error) {
      console.log('Extraction error:', error);
      setExtractionStatus('failed');
      setListingSource(extractListingSource(sourceUrl));
    } finally {
      setIsExtracting(false);
    }
  }, [sourceUrl]);

  const handleSubmit = async () => {
    if (!groupId) {
      Alert.alert('Error', 'No group selected');
      return;
    }

    if (!sourceUrl.trim()) {
      Alert.alert('Error', 'Please enter a listing URL');
      return;
    }

    if (!address.trim()) {
      Alert.alert('Error', 'Please enter an address');
      return;
    }

    const priceNum = parseInt(price, 10);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    const bedroomsNum = parseInt(bedrooms, 10);
    if (isNaN(bedroomsNum) || bedroomsNum < 0) {
      Alert.alert('Error', 'Please enter a valid number of bedrooms');
      return;
    }

    const bathroomsNum = parseFloat(bathrooms);
    if (isNaN(bathroomsNum) || bathroomsNum < 0) {
      Alert.alert('Error', 'Please enter a valid number of bathrooms');
      return;
    }

    setIsSubmitting(true);
    try {
      const detectedSource = listingSource.trim() || extractListingSource(sourceUrl);
      await addApartment(groupId, {
        sourceUrl: sourceUrl.trim(),
        address: address.trim(),
        price: priceNum,
        bedrooms: bedroomsNum,
        bathrooms: bathroomsNum,
        squareFootage: squareFootage ? parseInt(squareFootage, 10) : undefined,
        photos,
        listingSource: detectedSource,
        tags: tags.length > 0 ? tags : undefined,
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to add apartment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{
          title: 'Add Apartment',
          presentation: 'modal',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, isLargeScreen && styles.scrollContentWide]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Link size={16} color={colors.textSecondary} />
            <Text style={styles.label}>Listing URL *</Text>
          </View>
          <View style={styles.urlInputRow}>
            <TextInput
              style={[styles.input, styles.urlInput]}
              placeholder="Paste apartment listing URL..."
              placeholderTextColor={colors.textTertiary}
              value={sourceUrl}
              onChangeText={(text) => {
                setSourceUrl(text);
                if (extractionStatus !== 'idle') setExtractionStatus('idle');
              }}
              autoCapitalize="none"
              keyboardType="url"
            />
            <TouchableOpacity
              style={[
                styles.extractButton,
                isExtracting && styles.extractButtonDisabled,
              ]}
              onPress={handleExtractMetadata}
              disabled={isExtracting || !sourceUrl.trim()}
              activeOpacity={0.7}
            >
              {isExtracting ? (
                <ActivityIndicator size="small" color={colors.textInverse} />
              ) : (
                <Search size={20} color={colors.textInverse} />
              )}
            </TouchableOpacity>
          </View>
          
          {extractionStatus !== 'idle' && (
            <View style={[
              styles.extractionBanner,
              extractionStatus === 'success' && styles.extractionSuccess,
              extractionStatus === 'partial' && styles.extractionPartial,
              extractionStatus === 'failed' && styles.extractionFailed,
            ]}>
              {extractionStatus === 'success' && (
                <>
                  <CheckCircle size={16} color={colors.success} />
                  <Text style={[styles.extractionText, { color: colors.success }]}>
                    Details extracted! Review and edit below.
                  </Text>
                </>
              )}
              {extractionStatus === 'partial' && (
                <>
                  <AlertCircle size={16} color={colors.warning} />
                  <Text style={[styles.extractionText, { color: colors.warning }]}>
                    Partial extraction. Please fill in missing fields.
                  </Text>
                </>
              )}
              {extractionStatus === 'failed' && (
                <>
                  <AlertCircle size={16} color={colors.warning} />
                  <Text style={[styles.extractionText, { color: colors.warning }]}>
                    Could not extract details (site may block access). Enter manually.
                  </Text>
                </>
              )}
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <MapPin size={16} color={colors.textSecondary} />
            <Text style={styles.label}>Address *</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="123 Main St, Apt 4B"
            placeholderTextColor={colors.textTertiary}
            value={address}
            onChangeText={setAddress}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.flex1]}>
            <View style={styles.labelRow}>
              <DollarSign size={16} color={colors.textSecondary} />
              <Text style={styles.label}>Rent/mo *</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="2500"
              placeholderTextColor={colors.textTertiary}
              value={price}
              onChangeText={setPrice}
              keyboardType="number-pad"
            />
          </View>

          <View style={[styles.inputGroup, styles.flex1]}>
            <View style={styles.labelRow}>
              <Square size={16} color={colors.textSecondary} />
              <Text style={styles.label}>Sqft</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="1000"
              placeholderTextColor={colors.textTertiary}
              value={squareFootage}
              onChangeText={setSquareFootage}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.flex1]}>
            <View style={styles.labelRow}>
              <Bed size={16} color={colors.textSecondary} />
              <Text style={styles.label}>Beds *</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="2"
              placeholderTextColor={colors.textTertiary}
              value={bedrooms}
              onChangeText={setBedrooms}
              keyboardType="number-pad"
            />
          </View>

          <View style={[styles.inputGroup, styles.flex1]}>
            <View style={styles.labelRow}>
              <Bath size={16} color={colors.textSecondary} />
              <Text style={styles.label}>Baths *</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="1"
              placeholderTextColor={colors.textTertiary}
              value={bathrooms}
              onChangeText={setBathrooms}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Listing Source</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Auto-detected from URL"
            placeholderTextColor={colors.textTertiary}
            value={listingSource}
            onChangeText={setListingSource}
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <ImageIcon size={16} color={colors.textSecondary} />
            <Text style={styles.label}>Photos</Text>
          </View>
          <View style={styles.addFieldRow}>
            <TextInput
              style={[styles.input, styles.flex1]}
              placeholder="Paste image URL"
              placeholderTextColor={colors.textTertiary}
              value={photoUrl}
              onChangeText={setPhotoUrl}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddPhoto}
              disabled={!photoUrl.trim()}
            >
              <Plus size={20} color={photoUrl.trim() ? colors.primary : colors.textTertiary} />
            </TouchableOpacity>
          </View>
          {photos.length > 0 && (
            <View style={styles.chipList}>
              {photos.map((url, index) => (
                <View key={index} style={styles.chip}>
                  <Text style={styles.chipText} numberOfLines={1}>
                    Photo {index + 1}
                  </Text>
                  <TouchableOpacity onPress={() => handleRemovePhoto(index)}>
                    <X size={14} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Tag size={16} color={colors.textSecondary} />
            <Text style={styles.label}>Tags</Text>
          </View>
          <View style={styles.addFieldRow}>
            <TextInput
              style={[styles.input, styles.flex1]}
              placeholder="e.g., Parking, Pet Friendly"
              placeholderTextColor={colors.textTertiary}
              value={tagInput}
              onChangeText={setTagInput}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddTag}
              disabled={!tagInput.trim()}
            >
              <Plus size={20} color={tagInput.trim() ? colors.primary : colors.textTertiary} />
            </TouchableOpacity>
          </View>
          {tags.length > 0 && (
            <View style={styles.chipList}>
              {tags.map((tag, index) => (
                <View key={index} style={styles.chip}>
                  <Text style={styles.chipText}>{tag}</Text>
                  <TouchableOpacity onPress={() => handleRemoveTag(index)}>
                    <X size={14} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Adding...' : 'Add Apartment'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  scrollContentWide: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.textSecondary,
    fontFamily: fonts.dmSansMedium,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  urlInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  urlInput: {
    flex: 1,
  },
  extractButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 52,
  },
  extractButtonDisabled: {
    opacity: 0.7,
  },
  extractionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  extractionSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  extractionPartial: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  extractionFailed: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  extractionText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: fonts.dmSansMedium,
    flex: 1,
  },
  addFieldRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 13,
    color: colors.text,
    maxWidth: 120,
  },
  footer: {
    padding: 20,
    paddingBottom: 34,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.textInverse,
    fontSize: 17,
    fontWeight: '600',
    fontFamily: fonts.dmSansSemiBold,
  },
});
