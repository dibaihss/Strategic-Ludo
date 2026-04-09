import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, Text, Pressable, Modal, TextInput } from 'react-native';
import { setUser } from '../assets/store/authSlice.jsx';
import { setIsOnline } from '../assets/store/gameSlice.jsx';
import { createModalUserInputStyles } from './modelInputTest.styles.js';


export default function ModalUserInput({ navigation }) {
    const dispatch = useDispatch();
    const theme = useSelector(state => state.theme.current);

    const [showNameModal, setShowNameModal] = useState(true); // Show modal by default
    const [playerName, setPlayerName] = useState('');
    const styles = useMemo(() => createModalUserInputStyles(theme), [theme]);
  
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
        dispatch(setIsOnline(true));
        // Close modal and navigate to game
        setShowNameModal(false);
        navigation.navigate('Game', { mode: 'local' });
    };
    



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
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            Welcome to Ludo Game
                        </Text>
                        
                        <Text style={styles.welcomeText}>
                            Enter your name to start playing
                        </Text>
                        
                        <TextInput
                            style={styles.input}
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
