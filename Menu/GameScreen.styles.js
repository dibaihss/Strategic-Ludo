import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
const isSmallScreen = windowWidth < 375 || windowHeight < 667;

export const createGameScreenStyles = (theme) => {
  return StyleSheet.create({
    container: {
      padding: isSmallScreen ? 1 : 10,
      flex: 1,
      margin: isSmallScreen ? 1 : 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background,
    },
    controls: {
      position: 'absolute',
      bottom: isSmallScreen ? 22 : -20,
      left: isSmallScreen ? "25%" : "",
      flexDirection: 'row',
      gap: isSmallScreen ? 4 : 20,
      backgroundColor: theme.colors.background,
      padding: isSmallScreen ? 2 : 10,
      borderRadius: 10,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        },
        android: {
          elevation: 6,
        },
      }),
      zIndex: 999
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: isSmallScreen ? 2 : 10,
      backgroundColor: theme.colors.button,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.buttonBorder,
      gap: isSmallScreen ? 2 : 10,
      elevation: isSmallScreen ? 3 : 0,
    },
    buttonText: {
      fontSize: isSmallScreen ? 14 : 16,
      color: theme.colors.buttonText,
      fontWeight: isSmallScreen ? 'bold' : '500',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: theme.colors.text,
    },
    // --- Modal Styles ---
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker overlay
    },
    modalContainer: {
      width: '85%',
      maxWidth: 350,
      padding: 25,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 15,
      textAlign: 'center',
      color: theme.colors.text,
    },
    modalMessage: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 25,
      lineHeight: 22,
      color: theme.colors.textSecondary,
    },
    modalButtonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },
    modalButton: {
      flex: 1, // Make buttons share space
      paddingVertical: 12,
      paddingHorizontal: 15,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 5, // Add some space between buttons
    },
    cancelButton: {
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    confirmButton: {
      backgroundColor: theme.colors.error || '#dc3545',
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '500',
    },
  });
};