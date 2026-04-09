import { StyleSheet } from 'react-native';

export const createRegisterStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    header: {
      alignItems: 'center',
      marginBottom: 48,
    },
    logo: {
      width: 100,
      height: 100,
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 20,
      color: theme.colors.text,
    },
    inputContainer: {
      marginBottom: 24,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 12,
      marginBottom: 16,
      paddingHorizontal: 16,
      height: 56,
      backgroundColor: theme.colors.inputBackground,
      borderColor: theme.colors.inputBorder,
    },
    inputIcon: {
      marginRight: 12,
      color: theme.colors.textSecondary,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
    },
    button: {
      height: 56,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.buttonText,
    },
    errorText: {
      fontSize: 14,
      marginBottom: 16,
      textAlign: 'center',
      color: theme.colors.error,
    },
    loginLink: {
      alignItems: 'center',
      padding: 12,
    },
    loginText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
  });
