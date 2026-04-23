import { StyleSheet, Platform } from 'react-native';

export const createInstructionsStyles = (theme) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      padding: 16,
    },
    modalContent: {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
      borderWidth: 1,
      padding: 18,
      borderRadius: 20,
      maxHeight: '92%',
      width: '100%',
      maxWidth: 720,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    mediaFrame: {
      width: '100%',
      minHeight: 140,
      maxHeight: 460,
      flexShrink: 1,
      flexGrow: 1,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    instructionsScroll: {
      width: '100%',
      height: '100%',
    },
    instructionsScrollContent: {
      padding: 16,
    },
    instructionsText: {
      color: theme.colors.text,
      fontSize: 15,
      lineHeight: 24,
      textAlign: 'left',
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 12,
      color: theme.colors.text,
      textAlign: 'center',
    },
    closeButton: {
      backgroundColor: theme.colors.accent,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 8,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    closeButtonText: {
      color: theme.colors.buttonText,
      fontSize: 16,
      fontWeight: '600',
    },
  });
