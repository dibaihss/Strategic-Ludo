import React from 'react'
import { View, Text, StyleSheet, Pressable, Modal, ScrollView, Dimensions, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { gameInstructions, uiStrings } from '../assets/shared/hardCodedData.js';

export default function Anleitung() {

    const [showModal, setShowModal] = useState(true);
    const systemLang = useSelector(state => state.language.systemLang);


  const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 20,
      },
      modalContent: {
        backgroundColor: theme.colors.background,
        padding: 20,
        borderRadius: 10,
        maxHeight: '80%',
        width: '90%',
        overflow: 'hidden',
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          },
          android: {
            elevation: 5,
          },
        }),
      },
      modalScroll: {
        maxHeight: '100%',
      },
      modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
        color: theme.colors.buttonText,
        textAlign: 'center',
      },
      modalText: {
        fontSize: 16,
        color: theme.colors.buttonText,
        marginBottom: 20,
        lineHeight: 24,
      },
      closeButton: {
        backgroundColor: theme.colors.button,
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
      },
      closeButtonText: {
        color: theme.colors.buttonText,
        fontSize: 16,
        fontWeight: 'bold',
      },
    })

  return (
    <View>
       <Modal
        animationType="fade"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{gameInstructions[systemLang].title}</Text>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalText}>
                {mode === 'multiplayer'
                  ? uiStrings[systemLang].multiplayerInstructions || gameInstructions[systemLang].content
                  : gameInstructions[systemLang].content
                }
              </Text>
            </ScrollView>
            <Pressable
              style={styles.closeButton}
              onPress={() => {
                setShowModal(false);
              }}
            >
              <Text style={styles.closeButtonText}>
                {uiStrings[systemLang].gotIt}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  )
}