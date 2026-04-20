import React, { useState, useMemo } from 'react'
import { View, Text, Pressable, Modal, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { uiStrings } from '../assets/shared/hardCodedData.js';
import { createInstructionsStyles } from './Instructions.styles.js';

const instructionsGif = require('../assets/gifs/win workflow.gif');

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
        visible={showModal && mode !== "multiplayer"}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{uiStrings[systemLang].instructionsTitle || 'How To Play'}</Text>
            <View style={styles.mediaFrame}>
              <Image
                source={instructionsGif}
                style={styles.instructionsGif}
                resizeMode="contain"
                accessibilityLabel="Game instructions animation"
              />
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