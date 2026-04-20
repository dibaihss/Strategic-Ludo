import { StyleSheet, Platform } from 'react-native';

export const createInstructionsStyles = (theme) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      padding: 24,
    },
    modalContent: {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
      borderWidth: 1,
      padding: 24,
      borderRadius: 20,
      maxHeight: '80%',
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
      minHeight: 280,
      maxHeight: 460,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    instructionsGif: {
      width: '100%',
      height: '100%',
    },
    modalTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 20,
      color: theme.colors.text,
      textAlign: 'center',
    },
    closeButton: {
      backgroundColor: theme.colors.accent,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 16,
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
