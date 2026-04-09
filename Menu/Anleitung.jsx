import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable, Modal, ScrollView, Dimensions, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { gameInstructions, uiStrings } from '../assets/shared/hardCodedData.js';

export default function Anleitung({ mode }) {
    const [showModal, setShowModal] = useState(true);
    const systemLang = useSelector(state => state.language.systemLang);
    const theme = useSelector(state => state.theme.current);


  const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 24,
      },
      modalContent: {
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
        borderWidth: 1,
        padding: 24,
        borderRadius: 20,
        maxHeight: '80%',
        width: '90%',
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 10,
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
      modalScroll: {
        maxHeight: '100%',
      },
      modalTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: theme.colors.text,
        textAlign: 'center',
      },
      modalText: {
        fontSize: 16,
        color: theme.colors.text,
        marginBottom: 20,
        lineHeight: 24,
      },
      closeButton: {
        backgroundColor: theme.colors.accent,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
        shadowColor: "#000",
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