// import React, { useState } from 'react';
// import {
//   View, Text, StyleSheet, SafeAreaView,
//   TouchableOpacity, ScrollView, ActivityIndicator,
// } from 'react-native';
// import DocumentPicker from 'react-native-document-picker';
// import api from '../../services/api';
// import Toast from 'react-native-toast-message';
// import { COLORS, SPACING, RADIUS } from '../../constants/theme';

// const ALLOWED_TYPES = [DocumentPicker.types.images, DocumentPicker.types.pdf];

// const ResidentialInfoScreen = ({ navigation, route }) => {
//   const { applicationNumber, userId } = route.params || {};
//   const [loading, setLoading] = useState(false);
//   const [lightBillFile, setLightBillFile] = useState(null);
//   const [rentalFile, setRentalFile] = useState(null);

//   const pickFile = async (setFile) => {
//     try {
//       const result = await DocumentPicker.pickSingle({ type: ALLOWED_TYPES });
//       setFile({ uri: result.uri, name: result.name, type: result.type });
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

//   const handleSave = async () => {
//     if (!lightBillFile) {
//       Toast.show({ type: 'error', text1: 'Please upload Light Bill' });
//       return;
//     }
//     if (!rentalFile) {
//       Toast.show({ type: 'error', text1: 'Please upload Rental Agreement' });
//       return;
//     }
//     setLoading(true);
//     try {
//       await uploadDocument('LIGHT_BILL', lightBillFile);
//       await uploadDocument('RENTAL_AGREEMENT', rentalFile);
//       Toast.show({ type: 'success', text1: 'Residential documents uploaded' });
//       navigation.navigate('IncomeInfo', { applicationNumber, userId });
//     } catch (err) {
//       Toast.show({
//         type: 'error',
//         text1: err?.response?.data?.message || 'Upload failed',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const UploadCard = ({ label, icon, docType, file, setFile }) => (
//     <View style={styles.uploadSection}>
//       <View style={styles.uploadLabelRow}>
//         <Text style={styles.uploadIcon}>{icon}</Text>
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
//       <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
//         <View style={styles.headerBadge}>
//           <Text style={styles.headerBadgeText}>STEP 4 OF 6</Text>
//         </View>
//         <Text style={styles.title}>Residential Documents</Text>
//         <Text style={styles.subtitle}>
//           Application No: {applicationNumber || `USER-${userId}`}
//         </Text>

//         <View style={styles.card}>
//           <Text style={styles.sectionHeading}>Upload Documents</Text>
//           <Text style={styles.sectionHint}>Accepted formats: JPG, JPEG, PNG, PDF</Text>

//           <UploadCard
//             label="Light Bill"
//             icon="💡"
//             docType="LIGHT_BILL"
//             file={lightBillFile}
//             setFile={setLightBillFile}
//           />
//           <View style={styles.divider} />
//           <UploadCard
//             label="Rental Agreement"
//             icon="📋"
//             docType="RENTAL_AGREEMENT"
//             file={rentalFile}
//             setFile={setRentalFile}
//           />
//         </View>

//         <TouchableOpacity
//           style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
//           onPress={handleSave}
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

// export default ResidentialInfoScreen;

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
//     fontSize: 13,
//     color: COLORS.textSecondary,
//     marginTop: 4,
//     marginBottom: SPACING.md,
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

//   uploadSection: { marginBottom: 4 },
//   uploadLabelRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   uploadIcon: { fontSize: 18, marginRight: 8 },
//   uploadLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text },

//   uploadBox: {
//     borderWidth: 1.5,
//     borderColor: COLORS.accent,
//     borderStyle: 'dashed',
//     borderRadius: RADIUS.md,
//     paddingVertical: SPACING.lg,
//     alignItems: 'center',
//     backgroundColor: COLORS.accent + '0A',
//   },
//   uploadBoxIcon: { fontSize: 28, marginBottom: 8 },
//   uploadBoxText: { fontSize: 14, fontWeight: '700', color: COLORS.accentDark },
//   uploadBoxHint: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },

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
//   fileIcon: { fontSize: 20, marginRight: 8 },
//   fileName: { fontSize: 13, fontWeight: '600', color: COLORS.text, flex: 1 },
//   replaceBtn: {
//     backgroundColor: COLORS.primary + '14',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: RADIUS.sm,
//   },
//   replaceBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },

//   primaryBtn: {
//     backgroundColor: COLORS.primary,
//     padding: 16,
//     borderRadius: RADIUS.sm,
//     alignItems: 'center',
//     marginTop: SPACING.sm,
//   },
//   primaryBtnDisabled: { opacity: 0.7 },
//   primaryBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },

//   backBtn: { padding: 14, alignItems: 'center' },
//   backBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
// });
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { launchCamera } from 'react-native-image-picker';
import api from '../../services/api';
import Toast from 'react-native-toast-message';
import { sanitizeFileName } from '../../services/fileUtils';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

const ALLOWED_TYPES = [DocumentPicker.types.images, DocumentPicker.types.pdf];

const ResidentialInfoScreen = ({ navigation, route }) => {
  const { applicationNumber, userId } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [lightBillFile, setLightBillFile] = useState(null);
  const [rentalFile, setRentalFile] = useState(null);
  const [uploadedStatus, setUploadedStatus] = useState({
    LIGHT_BILL: false,
    RENTAL_AGREEMENT: false,
  });

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
        Toast.show({ type: 'error', text1: 'Could not open file picker' });
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
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadedStatus((prev) => ({ ...prev, [type]: true }));
      return true;
    } catch (err) {
      const message = err?.response?.data?.message || '';

      console.log(`${type} UPLOAD ERROR => `, err?.response?.data);

      if (message.includes('Already Uploaded')) {
        setUploadedStatus((prev) => ({ ...prev, [type]: true }));
        return true;
      }

      throw err;
    }
  };

  const handleSave = async () => {
    if (!userId) {
      Toast.show({ type: 'error', text1: 'User ID not found' });
      return;
    }

    if (!lightBillFile && !rentalFile && !uploadedStatus.LIGHT_BILL && !uploadedStatus.RENTAL_AGREEMENT) {
      Toast.show({
        type: 'error',
        text1: 'Upload Light Bill or Rental Agreement',
      });
      return;
    }

    setLoading(true);

    try {
      let success = false;

      if (lightBillFile) {
        const ok = await uploadDocument('LIGHT_BILL', lightBillFile);
        success = success || ok;
      }

      if (rentalFile) {
        const ok = await uploadDocument('RENTAL_AGREEMENT', rentalFile);
        success = success || ok;
      }

      if (uploadedStatus.LIGHT_BILL || uploadedStatus.RENTAL_AGREEMENT) {
        success = true;
      }

      if (success) {
        Toast.show({
          type: 'success',
          text1: 'Residential document saved',
        });

        navigation.navigate('IncomeInfo', {
          applicationNumber: applicationNumber || `USER-${userId}`,
          userId,
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: err?.response?.data?.message || 'Upload failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const UploadCard = ({ label, icon, docType, file, setFile }) => {
    const isUploaded = uploadedStatus[docType];

    return (
      <View style={styles.uploadSection}>
        <View style={styles.uploadLabelRow}>
          <Text style={styles.uploadIcon}>{icon}</Text>
          <Text style={styles.uploadLabel}>{label}</Text>
          <Text style={styles.optionalText}>Optional</Text>
        </View>

        {isUploaded ? (
          <View style={styles.alreadyUploadedBox}>
            <Text style={styles.fileIcon}>✅</Text>
            <Text style={styles.fileName}>{label} already uploaded</Text>
          </View>
        ) : file ? (
          <View style={styles.uploadedBox}>
            <View style={styles.uploadedInfo}>
              <Text style={styles.fileIcon}>📄</Text>
              <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
            </View>
            <View style={styles.replaceActions}>
              <TouchableOpacity onPress={() => captureFromCamera(setFile)} style={styles.replaceCameraBtn}>
                <Text style={styles.replaceBtnText}>📷</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => pickFile(setFile)} style={styles.replaceBtn}>
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
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>STEP 4 OF 6</Text>
        </View>

        <Text style={styles.title}>Residential Documents</Text>
        <Text style={styles.subtitle}>
          Application No: {applicationNumber || `USER-${userId}`}
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Upload any one document: Light Bill or Rental Agreement
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Upload Documents</Text>
          <Text style={styles.sectionHint}>Accepted formats: JPG, JPEG, PNG, PDF</Text>

          <UploadCard
            label="Light Bill"
            icon="💡"
            docType="LIGHT_BILL"
            file={lightBillFile}
            setFile={setLightBillFile}
          />

          <View style={styles.divider} />

          <UploadCard
            label="Rental Agreement"
            icon="📋"
            docType="RENTAL_AGREEMENT"
            file={rentalFile}
            setFile={setRentalFile}
          />
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.primaryBtnText}>Save & Next →</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Previous</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ResidentialInfoScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SPACING.md, paddingBottom: SPACING.xxl },

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

  title: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: SPACING.md,
  },

  infoBox: {
    backgroundColor: COLORS.accent + '12',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  infoText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
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

  uploadSection: { marginBottom: 4 },
  uploadLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadIcon: { fontSize: 18, marginRight: 8 },
  uploadLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  optionalText: {
    marginLeft: 8,
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
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
  uploadBoxIcon: { fontSize: 28, marginBottom: 8 },
  uploadBoxText: { fontSize: 14, fontWeight: '700', color: COLORS.accentDark },
  uploadBoxHint: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },

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
  alreadyUploadedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.success || COLORS.accent,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    backgroundColor: (COLORS.success || COLORS.accent) + '0D',
  },
  uploadedInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: SPACING.sm },
  fileIcon: { fontSize: 20, marginRight: 8 },
  fileName: { fontSize: 13, fontWeight: '600', color: COLORS.text, flex: 1 },

  replaceBtn: {
    backgroundColor: COLORS.primary + '14',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  replaceBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },

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

  primaryBtn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },

  backBtn: { padding: 14, alignItems: 'center' },
  backBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
});