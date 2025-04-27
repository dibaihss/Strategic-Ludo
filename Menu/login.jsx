import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    SafeAreaView,
    Image,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    TouchableOpacity
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { uiStrings } from '../assets/shared/hardCodedData.js';
import { loginUser, loginGuest } from '../assets/store/authSlice.jsx';
import Toast from 'react-native-toast-message';

const LoginPage = ({ navigation }) => {

    const dispatch = useDispatch();
    const theme = useSelector(state => state.theme.current);
    const systemLang = useSelector(state => state.language.systemLang);
    const authError = useSelector(state => state.auth.error);
    const loading = useSelector(state => state.auth.loading);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLoginPress = () => {
        console.log("Registering user:", { email, password }); // Debugging line

        // Basic validation
        if (!email.trim() || !password.trim()) {
            Toast.show({
                type: 'error',
                text1: uiStrings[systemLang].error || 'Error',
                text2: uiStrings[systemLang].fillFields || 'Please fill in all fields',
                position: 'bottom',
            });
            return;
        }

        dispatch(loginUser({
            email,
            password
        }))
            .unwrap()
            .then(result => {
                console.log("Login successful:", result);
            })
            .catch(error => {
                console.error("Login failed:", error);
            });

    };
    const handleGuestLogin = () => {
        console.log("Logging in as guest");
        dispatch(loginGuest())
            .unwrap()
            .then(result => {
                console.log("Guest login successful:", result);
                Toast.show({
                    type: 'success',
                    text1: uiStrings[systemLang].success || 'Success',
                    text2: uiStrings[systemLang].guestLoginSuccess || 'Logged in as guest',
                    position: 'bottom',
                });
            })
            .catch(error => {
                console.error("Guest login failed:", error);
                Toast.show({
                    type: 'error',
                    text1: uiStrings[systemLang].error || 'Error',
                    text2: error || uiStrings[systemLang].guestLoginFailed || 'Guest login failed',
                    position: 'bottom',
                });
            });
    };

    const goToRegister = () => {
        console.log("Navigating to Register");
        navigation.navigate('Register');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: "white" }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    {/* Logo and Title */}
                    <View style={styles.header}>
                        <Image
                            source={require('../assets/iconPWA.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={[styles.title, { color: theme.colors.text }]}>
                            {uiStrings[systemLang].loginTitle || 'Login to Ludo'}
                        </Text>
                    </View>

                    {/* Input Fields */}
                    <View style={styles.inputContainer}>
                        {/* Email Input */}
                        <View style={[styles.inputWrapper, { borderColor: theme.colors.border }]}>
                            <MaterialIcons name="email" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: theme.colors.text }]}
                                placeholder={uiStrings[systemLang].email || 'Email Address'}
                                placeholderTextColor={theme.colors.textSecondary}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                editable={!loading}
                            />
                        </View>

                        {/* Password Input */}
                        <View style={[styles.inputWrapper, { borderColor: theme.colors.border }]}>
                            <MaterialIcons name="lock" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: theme.colors.text }]}
                                placeholder={uiStrings[systemLang].password || 'Password'}
                                placeholderTextColor={theme.colors.textSecondary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                editable={!loading}
                            />
                        </View>
                    </View>

                    {/* Error message */}
                    {authError && (
                        <Text style={[styles.errorText, { color: theme.colors.error }]}>
                            {authError}
                        </Text>
                    )}

                    {/* Login Button */}
                    <Pressable
                        style={[styles.button, {
                            backgroundColor: loading ? theme.colors.disabled : theme.colors.button
                        }]}
                        onPress={handleLoginPress}

                    >
                        {loading ? (
                            <ActivityIndicator color={theme.colors.buttonText} />
                        ) : (
                            <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>
                                {uiStrings[systemLang].login || 'Login'}
                            </Text>
                        )}
                    </Pressable>

                    {/* Forgot Password */}
                    <TouchableOpacity
                        style={styles.forgotPasswordContainer}
                    >
                        <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>
                            {uiStrings[systemLang].forgotPassword || 'Forgot password?'}
                        </Text>
                    </TouchableOpacity>

                    {/* Register Link */}
                    <TouchableOpacity
                        style={styles.registerContainer}
                        onPress={goToRegister}
                    >
                        <Text style={[styles.registerText, { color: theme.colors.primary }]}>
                            {uiStrings[systemLang].noAccount || "Don't have an account?"}
                            <Text style={{ fontWeight: 'bold' }}> {uiStrings[systemLang].signUp || "Sign Up"}</Text>
                        </Text>
                    </TouchableOpacity>
                      {/* Divider */}
                <View style={styles.divider}>
                    <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
                    <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>
                        {uiStrings[systemLang].or || 'OR'}
                    </Text>
                    <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
                </View>

                {/* Guest Login */}
                <Pressable
                    style={[styles.guestButton, {
                        backgroundColor: 'transparent',
                        borderWidth: 1,
                        borderColor: theme.colors.border
                    }]}
                    onPress={handleGuestLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={theme.colors.text} />
                    ) : (
                        <Text style={[styles.guestButtonText, { color: theme.colors.text }]}>
                            {uiStrings[systemLang].continueAsGuest || 'Continue as Guest'}
                        </Text>
                    )}
                </Pressable>
                </View>
              
            </KeyboardAvoidingView>
            <Toast />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
    },
    button: {
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        fontSize: 14,
        marginBottom: 15,
        textAlign: 'center',
    },
    forgotPasswordContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    forgotPasswordText: {
        fontSize: 14,
    },
    registerContainer: {
        alignItems: 'center',
        marginTop: 5,
        padding: 10,
    },
    registerText: {
        fontSize: 14,
    },
    // Add these styles to your StyleSheet
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        paddingHorizontal: 15,
        fontSize: 14,
    },
    guestButton: {
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
    },
    guestButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
});

export default LoginPage;