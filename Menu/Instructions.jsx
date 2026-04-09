import React, { useState, useMemo } from 'react'
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { gameInstructions, uiStrings } from '../assets/shared/hardCodedData.js';
import { createInstructionsStyles } from './Instructions.styles.js';

export default function Instructions({ mode }) {
    const [showModal, setShowModal] = useState(process.env.EXPO_PUBLIC_E2E !== 'true');
    const systemLang = useSelector(state => state.language.systemLang);
    const theme = useSelector(state => state.theme.current);
    const styles = useMemo(() => createInstructionsStyles(theme), [theme]);

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