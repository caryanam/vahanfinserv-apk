// src/components/common/DocumentPreviewModal.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import FileViewer from 'react-native-file-viewer';
import Toast from 'react-native-toast-message';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import {
  downloadDocumentToCache,
  downloadDocumentToStorage,
} from '../../services/documentService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Shared Document Preview Modal.
 *
 * Props:
 *   visible       — boolean, controls modal visibility
 *   documentId    — the document ID to preview
 *   fileName      — original file name (used to detect PDF vs image)
 *   onClose       — callback to close the modal
 *   showDownload  — (optional) show a download button, default true
 */
const DocumentPreviewModal = ({
  visible,
  documentId,
  fileName,
  onClose,
  showDownload = true,
}) => {
  const [state, setState] = useState('idle'); // idle | loading | success | error
  const [localPath, setLocalPath] = useState(null);
  const [errorType, setErrorType] = useState(null); // UNAUTHORIZED | NOT_FOUND | NETWORK | UNKNOWN

  const isPdf = (name) => (name || '').toLowerCase().endsWith('.pdf');

  const loadPreview = useCallback(async () => {
    if (!documentId) return;

    setState('loading');
    setErrorType(null);

    try {
      const path = await downloadDocumentToCache(documentId, fileName);

      if (isPdf(fileName)) {
        // For PDFs, open with native file viewer and close modal
        setState('idle');
        onClose();
        await FileViewer.open(path, { showOpenWithDialog: false });
      } else {
        // For images, display inside the modal
        setLocalPath(path);
        setState('success');
      }
    } catch (err) {
      const msg = err?.message || '';
      if (msg === 'UNAUTHORIZED') {
        setErrorType('UNAUTHORIZED');
      } else if (msg === 'NOT_FOUND') {
        setErrorType('NOT_FOUND');
      } else if (
        msg.includes('Network') ||
        msg.includes('network') ||
        msg.includes('Unable to resolve')
      ) {
        setErrorType('NETWORK');
      } else {
        setErrorType('UNKNOWN');
      }
      setState('error');
    }
  }, [documentId, fileName, onClose]);

  // Trigger load when modal opens
  useEffect(() => {
    if (visible && documentId) {
      loadPreview();
    } else {
      // Reset state when closed
      setState('idle');
      setLocalPath(null);
      setErrorType(null);
    }
  }, [visible, documentId, loadPreview]);

  const handleDownload = async () => {
    try {
      Toast.show({ type: 'info', text1: 'Downloading...', visibilityTime: 1500 });
      const path = await downloadDocumentToStorage(documentId, fileName);
      Toast.show({
        type: 'success',
        text1: 'Download Complete',
        text2: `Saved to Downloads folder`,
      });
    } catch (err) {
      const msg = err?.message || '';
      if (msg === 'UNAUTHORIZED') {
        Toast.show({ type: 'error', text1: 'Unauthorized', text2: 'You do not have permission' });
      } else if (msg === 'NOT_FOUND') {
        Toast.show({ type: 'error', text1: 'File not found' });
      } else {
        Toast.show({ type: 'error', text1: 'Download failed', text2: 'Please try again' });
      }
    }
  };

  const getErrorMessage = () => {
    switch (errorType) {
      case 'UNAUTHORIZED':
        return { title: '🔒 Unauthorized', message: 'You do not have permission to view this document.' };
      case 'NOT_FOUND':
        return { title: '📄 Not Found', message: 'This document could not be found on the server.' };
      case 'NETWORK':
        return { title: '🌐 Network Error', message: 'Please check your internet connection and try again.' };
      default:
        return { title: '⚠️ Error', message: 'Something went wrong. Please try again.' };
    }
  };

  const renderContent = () => {
    if (state === 'loading') {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Loading document...</Text>
        </View>
      );
    }

    if (state === 'error') {
      const error = getErrorMessage();
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorTitle}>{error.title}</Text>
          <Text style={styles.errorMessage}>{error.message}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadPreview}>
            <Text style={styles.retryBtnText}>↻ Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (state === 'success' && localPath) {
      return (
        <ScrollView
          style={styles.imageScrollView}
          contentContainerStyle={styles.imageScrollContent}
          maximumZoomScale={5}
          minimumZoomScale={1}
          bouncesZoom
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <Image
            source={{ uri: Platform.OS === 'android' ? `file://${localPath}` : localPath }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        </ScrollView>
      );
    }

    return null;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />

        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {fileName || 'Document Preview'}
            </Text>
          </View>

          {showDownload && state === 'success' && (
            <TouchableOpacity onPress={handleDownload} style={styles.downloadBtn}>
              <Text style={styles.downloadBtnText}>⬇</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        {renderContent()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
    paddingBottom: 12,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.9,
  },
  downloadBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadBtnText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: SPACING.md,
  },
  errorTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  errorMessage: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  retryBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
  },
  retryBtnText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  imageScrollView: {
    flex: 1,
  },
  imageScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.85,
  },
});

export default DocumentPreviewModal;
