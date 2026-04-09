import { StyleSheet } from 'react-native';

export const createMultiplayerMenuStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 24,
      paddingTop: 32,
      justifyContent: 'space-between',
    },
    backButton: {
      padding: 8,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      flex: 1,
      textAlign: 'center',
      marginHorizontal: 16,
      color: theme.colors.text,
    },
    refreshButtonHeader: {
      padding: 8,
    },
    listContent: {
      padding: 24,
      flexGrow: 1,
    },
    matchItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      marginBottom: 16,
      borderRadius: 16,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    matchInfo: {
      flex: 1,
    },
    matchTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 6,
      color: theme.colors.text,
    },
    matchStatus: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    matchPlayers: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    playersCount: {
      marginRight: 12,
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    footer: {
      padding: 24,
      paddingBottom: 32,
    },
    createButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    createButtonText: {
      marginLeft: 12,
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.buttonText,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    errorContainer: {
      padding: 24,
      alignItems: 'center',
    },
    errorText: {
      marginBottom: 16,
      textAlign: 'center',
      fontSize: 16,
      color: theme.colors.error,
    },
    retryButton: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
    },
    retryText: {
      fontWeight: '600',
      color: theme.colors.buttonText,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 48,
    },
    emptyText: {
      fontSize: 20,
      textAlign: 'center',
      color: theme.colors.textSecondary,
    },
    emptySubtext: {
      marginTop: 12,
      fontSize: 16,
      textAlign: 'center',
      color: theme.colors.textSecondary,
    },
  });
