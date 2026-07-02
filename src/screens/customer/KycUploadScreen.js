// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
// } from 'react-native';
// import DocumentPicker from 'react-native-document-picker';
// import api from '../../services/api';
// import { COLORS, SPACING, RADIUS } from '../../constants/theme';
// import Toast from 'react-native-toast-message';

// const ALLOWED_TYPES = [
//   DocumentPicker.types.images,
//   DocumentPicker.types.pdf,
// ];

// const KycUploadScreen = ({ navigation, route }) => {
//   const { applicationNumber, userId } = route.params || {};
//   const [loading, setLoading] = useState(false);
//   const [aadhaarFile, setAadhaarFile] = useState(null);
//   const [panFile, setPanFile] = useState(null);

//   const pickFile = async (setFile) => {
//     try {
//       const result = await DocumentPicker.pickSingle({ type: ALLOWED_TYPES });
//       setFile({
//         uri: result.uri,
//         name: result.name,
//         type: result.type,
//       });
//     } catch (err) {
//       if (!DocumentPicker.isCancel(err)) {
//         Toast.show({ type: 'error', text1: 'Could not open file picker' });
//       }
//     }
//   };

//   const uploadDocument = async (type, file) => {
//     const formData = new FormData();
//     formData.append('userId', userId);
//     formData.append('type', type);
//     formData.append('file', { uri: file.uri, name: file.name, type: file.type });

//     await api.post('/documents/upload', formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     });
//   };

//   const saveKyc = async () => {
//     if (!aadhaarFile) {
//       Toast.show({ type: 'error', text1: 'Please upload Aadhaar Card' });
//       return;
//     }
//     if (!panFile) {
//       Toast.show({ type: 'error', text1: 'Please upload PAN Card' });
//       return;
//     }

//     setLoading(true);
//     try {
//       await uploadDocument('AADHAAR', aadhaarFile);
//       await uploadDocument('PAN', panFile);

//       Toast.show({ type: 'success', text1: 'KYC Documents Saved' });
//       navigation.navigate('ResidentialInfo', { applicationNumber, userId });
//     } catch (err) {
//       console.log('KYC ERROR => ', err?.response?.data);
//       Toast.show({
//         type: 'error',
//         text1: err?.response?.data?.message || 'Failed to save KYC',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderUploadBox = (label, docType, file, setFile) => (
//     <View style={styles.uploadSection}>
//       <View style={styles.uploadLabelRow}>
//         <Text style={styles.uploadIcon}>{docType === 'AADHAAR' ? '🪪' : '💳'}</Text>
//         <Text style={styles.uploadLabel}>{label}</Text>
//       </View>

//       {file ? (
//         <View style={styles.uploadedBox}>
//           <View style={styles.uploadedInfo}>
//             <Text style={styles.fileIcon}>📄</Text>
//             <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
//           </View>
//           <TouchableOpacity onPress={() => pickFile(setFile)} style={styles.replaceBtn}>
//             <Text style={styles.replaceBtnText}>Replace</Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <TouchableOpacity style={styles.uploadBox} onPress={() => pickFile(setFile)}>
//           <Text style={styles.uploadBoxIcon}>⬆️</Text>
//           <Text style={styles.uploadBoxText}>Tap to upload</Text>
//           <Text style={styles.uploadBoxHint}>JPG, PNG or PDF</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <ScrollView contentContainerStyle={styles.container}>
//         <View style={styles.headerBadge}>
//           <Text style={styles.headerBadgeText}>STEP 3 OF 6</Text>
//         </View>
//         <Text style={styles.title}>KYC Documents</Text>
//         <Text style={styles.subtitle}>
//           Application No: {applicationNumber || `USER-${userId}`}
//         </Text>

//         <View style={styles.card}>
//           <Text style={styles.sectionHeading}>Upload Documents</Text>
//           <Text style={styles.sectionHint}>Accepted formats: JPG, JPEG, PNG, PDF</Text>

//           {renderUploadBox('Aadhaar Card', 'AADHAAR', aadhaarFile, setAadhaarFile)}
//           <View style={styles.divider} />
//           {renderUploadBox('PAN Card', 'PAN', panFile, setPanFile)}
//         </View>

//         <TouchableOpacity
//           style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
//           onPress={saveKyc}
//           disabled={loading}
//         >
//           {loading ? (
//             <ActivityIndicator color={COLORS.white} />
//           ) : (
//             <Text style={styles.primaryBtnText}>Save & Next →</Text>
//           )}
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
//           <Text style={styles.backBtnText}>← Previous</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default KycUploadScreen;

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: COLORS.background },

//   container: {
//     padding: SPACING.md,
//     paddingBottom: SPACING.xxl,
//   },

//   headerBadge: {
//     alignSelf: 'flex-start',
//     backgroundColor: COLORS.accent + '22',
//     borderRadius: RADIUS.sm,
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     marginBottom: SPACING.sm,
//   },
//   headerBadgeText: {
//     fontSize: 11,
//     fontWeight: '700',
//     color: COLORS.accentDark,
//     letterSpacing: 1,
//   },

//   title: {
//     fontSize: 24,
//     fontWeight: '800',
//     color: COLORS.text,
//   },
//   subtitle: {
//     color: COLORS.textSecondary,
//     marginTop: 4,
//     marginBottom: SPACING.md,
//     fontSize: 13,
//   },

//   card: {
//     backgroundColor: COLORS.white,
//     borderRadius: RADIUS.lg,
//     padding: SPACING.lg,
//     marginBottom: SPACING.md,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.06,
//     shadowRadius: 4,
//     elevation: 2,
//   },

//   sectionHeading: {
//     fontSize: 15,
//     fontWeight: '800',
//     color: COLORS.text,
//     marginBottom: 4,
//   },
//   sectionHint: {
//     fontSize: 12,
//     color: COLORS.textMuted,
//     marginBottom: SPACING.md,
//   },

//   divider: {
//     height: 1,
//     backgroundColor: COLORS.border,
//     marginVertical: SPACING.md,
//   },

//   // Upload section
//   uploadSection: {
//     marginBottom: 4,
//   },
//   uploadLabelRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   uploadIcon: {
//     fontSize: 18,
//     marginRight: 8,
//   },
//   uploadLabel: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: COLORS.text,
//   },

//   // Dotted upload box
//   uploadBox: {
//     borderWidth: 1.5,
//     borderColor: COLORS.accent,
//     borderStyle: 'dashed',
//     borderRadius: RADIUS.md,
//     paddingVertical: SPACING.lg,
//     alignItems: 'center',
//     backgroundColor: COLORS.accent + '0A',
//   },
//   uploadBoxIcon: {
//     fontSize: 28,
//     marginBottom: 8,
//   },
//   uploadBoxText: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: COLORS.accentDark,
//   },
//   uploadBoxHint: {
//     fontSize: 11,
//     color: COLORS.textMuted,
//     marginTop: 4,
//   },

//   // Uploaded state
//   uploadedBox: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     borderWidth: 1,
//     borderColor: COLORS.success,
//     borderRadius: RADIUS.md,
//     paddingHorizontal: SPACING.md,
//     paddingVertical: 12,
//     backgroundColor: COLORS.success + '0D',
//   },
//   uploadedInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//     marginRight: SPACING.sm,
//   },
//   fileIcon: {
//     fontSize: 20,
//     marginRight: 8,
//   },
//   fileName: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: COLORS.text,
//     flex: 1,
//   },
//   replaceBtn: {
//     backgroundColor: COLORS.primary + '14',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: RADIUS.sm,
//   },
//   replaceBtnText: {
//     fontSize: 12,
//     fontWeight: '700',
//     color: COLORS.primary,
//   },

//   // Buttons
//   primaryBtn: {
//     backgroundColor: COLORS.primary,
//     padding: 16,
//     borderRadius: RADIUS.sm,
//     alignItems: 'center',
//     marginTop: SPACING.sm,
//   },
//   primaryBtnDisabled: {
//     opacity: 0.7,
//   },
//   primaryBtnText: {
//     color: COLORS.white,
//     fontWeight: '800',
//     fontSize: 15,
//   },
//   backBtn: {
//     padding: 14,
//     alignItems: 'center',
//   },
//   backBtnText: {
//     color: COLORS.primary,
//     fontWeight: '700',
//     fontSize: 14,
//   },
// });
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { launchCamera } from 'react-native-image-picker';
import api from '../../services/api';
import { sanitizeFileName } from '../../services/fileUtils';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import Toast from 'react-native-toast-message';

const ALLOWED_TYPES = [
  DocumentPicker.types.images,
  DocumentPicker.types.pdf,
];

const KycUploadScreen = ({ navigation, route }) => {
  const { applicationNumber, userId } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [aadhaarFrontFile, setAadhaarFrontFile] = useState(null);
  const [aadhaarBackFile, setAadhaarBackFile] = useState(null);
  const [panFile, setPanFile] = useState(null);

  const pickFile = async (setFile) => {
    try {
      const result = await DocumentPicker.pickSingle({
        type: ALLOWED_TYPES,
        copyTo: 'cachesDirectory',
      });

      setFile({
        uri: result.fileCopyUri || result.uri,
        name: sanitizeFileName(result.name, 'document'),
        type: result.type || 'application/octet-stream',
      });
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Toast.show({
          type: 'error',
          text1: 'Could not open file picker',
        });
      }
    }
  };

  const captureFromCamera = async (setFile) => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
        saveToPhotos: false,
      });

      if (result.didCancel) return;

      if (result.errorCode) {
        Toast.show({
          type: 'error',
          text1: result.errorCode === 'camera_unavailable'
            ? 'Camera not available'
            : result.errorMessage || 'Camera error',
        });
        return;
      }

      const asset = result.assets?.[0];
      if (asset) {
        setFile({
          uri: asset.uri,
          name: sanitizeFileName(asset.fileName, 'document'),
          type: asset.type || 'image/jpeg',
        });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Could not open camera' });
    }
  };

  const uploadDocument = async (type, file) => {
    const formData = new FormData();

    formData.append('userId', String(userId));
    formData.append('type', type);

    formData.append('file', {
      uri: file.uri,
      name: sanitizeFileName(file.name, type),
      type: file.type || 'image/jpeg',
    });

    try {
      await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return true;
    } catch (err) {
      const message = err?.response?.data?.message || '';

      console.log(`${type} UPLOAD ERROR => `, err?.response?.data);

      if (
        message.includes('Already Uploaded') ||
        message.includes(`${type} Already Uploaded`)
      ) {
        return true;
      }

      throw err;
    }
  };

  const saveKyc = async () => {
    if (!userId) {
      Toast.show({
        type: 'error',
        text1: 'User ID not found',
      });
      return;
    }

    if (!aadhaarFrontFile) {
      Toast.show({
        type: 'error',
        text1: 'Please upload Aadhaar Front Side',
      });
      return;
    }

    if (!aadhaarBackFile) {
      Toast.show({
        type: 'error',
        text1: 'Please upload Aadhaar Back Side',
      });
      return;
    }

    if (!panFile) {
      Toast.show({
        type: 'error',
        text1: 'Please upload PAN Card',
      });
      return;
    }

    setLoading(true);

    try {
      await uploadDocument('AADHAAR_1', aadhaarFrontFile);
      await uploadDocument('AADHAAR_2', aadhaarBackFile);
      await uploadDocument('PAN', panFile);

      Toast.show({
        type: 'success',
        text1: 'KYC documents saved',
      });

      navigation.navigate('ResidentialInfo', {
        applicationNumber: applicationNumber || `USER-${userId}`,
        userId,
      });
    } catch (err) {
      console.log('KYC ERROR => ', err?.response?.data);

      Toast.show({
        type: 'error',
        text1:
          err?.response?.data?.message ||
          'Failed to save KYC documents',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderUploadBox = (label, docType, file, setFile) => (
    <View style={styles.uploadSection}>
      <View style={styles.uploadLabelRow}>
        <Text style={styles.uploadIcon}>
          {docType === 'AADHAAR' ? '🪪' : '💳'}
        </Text>
        <Text style={styles.uploadLabel}>{label}</Text>
      </View>

      {file ? (
        <View style={styles.uploadedBox}>
          <View style={styles.uploadedInfo}>
            <Text style={styles.fileIcon}>📄</Text>
            <Text style={styles.fileName} numberOfLines={1}>
              {file.name}
            </Text>
          </View>

          <View style={styles.replaceActions}>
            <TouchableOpacity
              onPress={() => captureFromCamera(setFile)}
              style={styles.replaceCameraBtn}
            >
              <Text style={styles.replaceBtnText}>📷</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => pickFile(setFile)}
              style={styles.replaceBtn}
            >
              <Text style={styles.replaceBtnText}>Replace</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.uploadBox}>
          <Text style={styles.uploadBoxIcon}>⬆️</Text>
          <Text style={styles.uploadBoxText}>Upload Document</Text>
          <Text style={styles.uploadBoxHint}>JPG, PNG or PDF</Text>
          <View style={styles.uploadActions}>
            <TouchableOpacity style={styles.cameraBtn} onPress={() => captureFromCamera(setFile)}>
              <Text style={styles.cameraBtnText}>📷 Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.galleryBtn} onPress={() => pickFile(setFile)}>
              <Text style={styles.galleryBtnText}>📁 Gallery / Files</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>STEP 3 OF 6</Text>
        </View>

        <Text style={styles.title}>KYC Documents</Text>

        <Text style={styles.subtitle}>
          Application No: {applicationNumber || `USER-${userId}`}
        </Text>

        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Upload Documents</Text>
          <Text style={styles.sectionHint}>
            Accepted formats: JPG, JPEG, PNG, PDF
          </Text>

          {renderUploadBox(
            'Aadhaar Card (Front)',
            'AADHAAR_1',
            aadhaarFrontFile,
            setAadhaarFrontFile,
          )}

          <View style={styles.divider} />

          {renderUploadBox(
            'Aadhaar Card (Back)',
            'AADHAAR_2',
            aadhaarBackFile,
            setAadhaarBackFile,
          )}

          <View style={styles.divider} />

          {renderUploadBox(
            'PAN Card',
            'PAN',
            panFile,
            setPanFile,
          )}
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
          onPress={saveKyc}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.primaryBtnText}>Save & Next →</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>← Previous</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default KycUploadScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },

  headerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accent + '22',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: SPACING.sm,
  },

  headerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accentDark,
    letterSpacing: 1,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },

  subtitle: {
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: SPACING.md,
    fontSize: 13,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },

  sectionHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },

  uploadSection: {
    marginBottom: 4,
  },

  uploadLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  uploadIcon: {
    fontSize: 18,
    marginRight: 8,
  },

  uploadLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },

  uploadBox: {
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    borderStyle: 'dashed',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    backgroundColor: COLORS.accent + '0A',
  },

  uploadBoxIcon: {
    fontSize: 28,
    marginBottom: 8,
  },

  uploadBoxText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.accentDark,
  },

  uploadBoxHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  uploadedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.success || COLORS.accent,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    backgroundColor: (COLORS.success || COLORS.accent) + '0D',
  },

  uploadedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
  },

  fileIcon: {
    fontSize: 20,
    marginRight: 8,
  },

  fileName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },

  replaceBtn: {
    backgroundColor: COLORS.primary + '14',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },

  replaceBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },

  replaceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  replaceCameraBtn: {
    backgroundColor: COLORS.accent + '22',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },

  uploadActions: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
    width: '100%',
    paddingHorizontal: SPACING.md,
  },

  cameraBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },

  cameraBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
  },

  galleryBtn: {
    flex: 1,
    backgroundColor: COLORS.accent + '22',
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },

  galleryBtnText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
  },

  // Buttons
  primaryBtn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },

  primaryBtnDisabled: {
    opacity: 0.7,
  },

  primaryBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 15,
  },

  backBtn: {
    padding: 14,
    alignItems: 'center',
  },

  backBtnText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});