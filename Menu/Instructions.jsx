import React, { useState, useMemo } from 'react'
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { uiStrings, gameInstructions } from '../assets/shared/hardCodedData.js';
import { createInstructionsStyles } from './Instructions.styles.js';

export default function Instructions({ mode }) {
    const [showModal, setShowModal] = useState(process.env.EXPO_PUBLIC_E2E !== 'true');
    const systemLang = useSelector(state => state.language.systemLang);
    const theme = useSelector(state => state.theme.current);
    const styles = useMemo(() => createInstructionsStyles(theme), [theme]);
    const localizedInstructions = gameInstructions[systemLang] || gameInstructions.en;

  return (
    <View>
       <Modal
        animationType="fade"
        transparent={true}
        visible={showModal && mode !== "multiplayer"}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{localizedInstructions.title || uiStrings[systemLang].instructionsTitle || 'How To Play'}</Text>
            <View style={styles.mediaFrame}>
              <ScrollView
                style={styles.instructionsScroll}
                contentContainerStyle={styles.instructionsScrollContent}
                showsVerticalScrollIndicator={true}
              >
                <Text style={styles.instructionsText}>
                  {localizedInstructions.content}
                </Text>
              </ScrollView>
            </View>
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