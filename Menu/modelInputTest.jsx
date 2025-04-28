import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, Text, StyleSheet, Pressable, Modal, TextInput, Dimensions, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { setUser } from '../assets/store/dbSlice.jsx';

export default function ModalUserInput({ route, navigation }) {
    const dispatch = useDispatch();
    const theme = useSelector(state => state.theme.current);

    const [showNameModal, setShowNameModal] = useState(true); // Show modal by default
    const [playerName, setPlayerName] = useState('');
  
    // Handle name submission
    const handleNameSubmit = () => {
        if (!playerName.trim()) {
            // Don't submit if name is empty
            return;
        }

        // Create a user object with a unique ID
        const user = {
            id: parseInt(playerName), 
            name: playerName.trim(),
            isGuest: true
        };

        // Set the user in Redux state
        dispatch(setUser(user));
        
        // Close modal and navigate to game
        setShowNameModal(false);
        navigation.navigate('Game', { mode: 'local' });
    };
    

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.colors.background
        },
        // Modal styles
        modalOverlay: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
        },
        modalContainer: {
            width: '80%',
            padding: 20,
            borderRadius: 10,
            alignItems: 'center',
        },
        modalTitle: {
            fontSize: 22,
            fontWeight: 'bold',
            marginBottom: 20,
            textAlign: 'center'
        },
        welcomeText: {
            fontSize: 16,
            marginBottom: 20,
            textAlign: 'center',
            color: theme.colors.textSecondary
        },
        input: {
            width: '100%',
            height: 50,
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 15,
            marginBottom: 20,
            fontSize: 16
        },
        buttonRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%'
        },
        startButton: {
            backgroundColor: theme.colors.primary,
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 8,
            flex: 3,
            alignItems: 'center',
            justifyContent: 'center'
        },
        skipButton: {
            paddingVertical: 12,
            paddingHorizontal: 15,
            borderRadius: 8,
            marginRight: 10,
            borderWidth: 1,
            borderColor: theme.colors.border,
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center'
        },
        startButtonText: {
            color: 'white',
            fontSize: 16,
            fontWeight: 'bold',
        },
        skipButtonText: {
            color: theme.colors.textSecondary,
            fontSize: 16,
        },
    });

    return (
        <View style={styles.container}>
            {/* Simple Name Input Modal */}
            <Modal
                visible={showNameModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => handleSkip()} // Handle back button on Android
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                            Welcome to Ludo Game
                        </Text>
                        
                        <Text style={styles.welcomeText}>
                            Enter your name to start playing
                        </Text>
                        
                        <TextInput
                            style={[styles.input, { 
                                borderColor: theme.colors.border,
                                backgroundColor: theme.colors.card,
                                color: theme.colors.text
                            }]}
                            placeholder="Your Name"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={playerName}
                            onChangeText={setPlayerName}
                            autoFocus={true}
                            onSubmitEditing={handleNameSubmit}
                            returnKeyType="done"
                        />
                        
                        <View style={styles.buttonRow}>
            
                            <Pressable 
                                style={[
                                    styles.startButton,
                                    !playerName.trim() && { opacity: 0.7 } // Dim button if no name
                                ]}
                                onPress={handleNameSubmit}
                                disabled={!playerName.trim()}
                            >
                                <Text style={styles.startButtonText}>
                                    Start Game
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}