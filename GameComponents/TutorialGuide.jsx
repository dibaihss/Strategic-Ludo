import React, { useMemo } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { uiStrings } from '../assets/shared/hardCodedData.js';

const getStepLayout = (step, isSmallScreen) => {
    if (step === 0) {
        return {
            popup: {
                top: isSmallScreen ? '36%' : '50%',
                left: isSmallScreen ? 12 : 24,
                right: isSmallScreen ? 12 : undefined,
            },
            target: {
                left: isSmallScreen ? 44 : 86,
                top: isSmallScreen ? '58%' : '56%',
                width: isSmallScreen ? 58 : 80,
                height: isSmallScreen ? 58 : 80,
            },
        };
    }

    if (step === 1) {
        return {
            popup: {
                top: isSmallScreen ? 177 : 501,
                left: isSmallScreen ? 14 : undefined,
                right: isSmallScreen ? 14 : 800,
            },
            target: {
                right: isSmallScreen ? 18 : 44,
                top: isSmallScreen ? 38 : 72,
                width: isSmallScreen ? 48 : 62,
                height: isSmallScreen ? 64 : 78,
            },
        };
    }

    if (step === 2) {
        return {
            popup: {
                top: isSmallScreen ? '36%' : 501,
                left: isSmallScreen ? 14 : undefined,
                right: isSmallScreen ? 14 : 800,
            },
            target: {
                right: isSmallScreen ? 104 : 140,
                top: isSmallScreen ? '38%' : '33%',
                width: isSmallScreen ? 38 : 48,
                height: isSmallScreen ? 38 : 48,
            },
        };
    }

    if (step === 3) {
        return {
            popup: {
               top: isSmallScreen ? '54%' : '50%',
                left: isSmallScreen ? 14 : undefined,
                right: isSmallScreen ? 14 : 28,
            },
            target: {
                right: isSmallScreen ? 16 : 40,
                top: isSmallScreen ? 124 : 166,
                width: isSmallScreen ? 50 : 64,
                height: isSmallScreen ? 50 : 64,
            },
        };
    }

    if (step === 4) {
        return {
            popup: {
                top: isSmallScreen ? '48%' : '50%',
                left: isSmallScreen ? 14 : undefined,
                right: isSmallScreen ? 14 : 28,
            },
            target: {
                right: isSmallScreen ? 18 : 44,
                top: isSmallScreen ? 38 : 72,
                width: isSmallScreen ? 48 : 62,
                height: isSmallScreen ? 64 : 78,
            },
        };
    }

    return {
        popup: {
            bottom: isSmallScreen ? 84 : 104,
            left: isSmallScreen ? 14 : undefined,
            right: isSmallScreen ? 14 : 40,
        },
        target: {
            bottom: isSmallScreen ? 34 : 44,
            left: isSmallScreen ? 22 : undefined,
            right: isSmallScreen ? undefined : 40,
            width: isSmallScreen ? 148 : 212,
            height: isSmallScreen ? 40 : 56,
        },
    };
};

export default function TutorialGuide({ visible, step, onSkip }) {
    const theme = useSelector((state) => state.theme.current);
    const systemLang = useSelector((state) => state.language.systemLang);
    const tutorialAnchorByStep = useSelector((state) => state.tutorial?.anchorByStep || {});
    const { width, height } = Dimensions.get('window');
    const isSmallScreen = width < 375 || height < 667;
    const popupWidth = isSmallScreen ? width - 60 : Math.min(360, width - 60);

    const styles = useMemo(() => StyleSheet.create({
        overlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.38)',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
        },
        popup: {
            position: 'absolute',
            width: popupWidth,
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
            borderWidth: 1,
            borderRadius: 16,
            paddingVertical: 14,
            paddingHorizontal: 14,
            zIndex: 200020,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 12,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
        },
        title: {
            color: theme.colors.text,
            fontWeight: '800',
            fontSize: isSmallScreen ? 14 : 16,
            flexShrink: 1,
            paddingRight: 8,
        },
        stepBadge: {
            fontSize: 11,
            fontWeight: '700',
            color: theme.colors.textSecondary,
        },
        body: {
            color: theme.colors.text,
            fontSize: isSmallScreen ? 13 : 14,
            lineHeight: isSmallScreen ? 18 : 20,
            marginBottom: 12,
        },
        hint: {
            color: theme.colors.textSecondary,
            fontSize: 12,
            marginBottom: 12,
        },
        skipButton: {
            alignSelf: 'flex-end',
            backgroundColor: theme.colors.button,
            borderColor: theme.colors.buttonBorder,
            borderWidth: 1,
            borderRadius: 10,
            paddingVertical: 8,
            paddingHorizontal: 12,
        },
        skipText: {
            color: theme.colors.buttonText,
            fontSize: 12,
            fontWeight: '700',
        },
        targetRing: {
            position: 'absolute',
            borderWidth: 2,
            borderColor: theme.colors.accent || theme.colors.selected || '#ffd54f',
            borderRadius: 14,
            backgroundColor: 'transparent',
            zIndex: 10001,
        },
    }), [isSmallScreen, theme, width]);

    const texts = uiStrings[systemLang] || uiStrings.en;
    const steps = [
        {
            title: texts.tutorialStep1Title || 'Choose your soldier',
            body: texts.tutorialStep1Body || 'Click on this piece to select it.',
            hint: texts.tutorialStep1Hint || 'Tip: the selected soldier shows a highlight.',
        },
        {
            title: texts.tutorialStep2Title || 'Play card value 6',
            body: texts.tutorialStep2Body || 'When you click card 6, the selected piece moves 6 steps forward on the board.',
            hint: texts.tutorialStep2Hint || 'Try pressing a card with value 6 now.',
        },
        {
            title: texts.tutorialStep5Title || 'Wait for your turn',
            body: texts.tutorialStep5Body || 'Wait until blue turn comes back to you before continuing.',
            hint: texts.tutorialStep5Hint || 'When blue is active again, the next step will appear.',
        },
        {
            title: texts.tutorialStep3Title || 'Enter a new soldier',
            body: texts.tutorialStep3Body || 'Use this control to enter a new soldier from your base.',
            hint: texts.tutorialStep3Hint || 'This helps you put more pieces into play.',
        },
        {
            title: texts.tutorialStep6Title || 'Capture the red soldier',
            body: texts.tutorialStep6Body || 'Click on 3 to capture the red soldier.',
            hint: texts.tutorialStep6Hint || 'Use card 3 to land on the red soldier and capture it.',
        },
    ];

    const safeStep = Math.max(0, Math.min(step, steps.length - 1));
    const layout = getStepLayout(safeStep, isSmallScreen);
    const current = steps[safeStep];
    const dynamicAnchor = tutorialAnchorByStep[safeStep];
    const showTargetRing = safeStep !== 2;

    const targetStyle = useMemo(() => {
        if ((safeStep !== 0 && safeStep !== 1 && safeStep !== 3 && safeStep !== 4) || !dynamicAnchor) {
            return layout.target;
        }

        const highlightPadding = safeStep === 1 || safeStep === 3 || safeStep === 4 ? 6 : 8;
        return {
            left: dynamicAnchor.x - highlightPadding,
            top: dynamicAnchor.y - highlightPadding,
            width: dynamicAnchor.width + (highlightPadding * 2),
            height: dynamicAnchor.height + (highlightPadding * 2),
            borderRadius: Math.max(12, Math.floor((dynamicAnchor.width + (highlightPadding * 2)) / 2)),
        };
    }, [dynamicAnchor, layout.target, safeStep]);

    const popupStyle = useMemo(() => {
        if (safeStep !== 0 || !dynamicAnchor) {
            return layout.popup;
        }

        const top = Math.min(height - (isSmallScreen ? 166 : 300), dynamicAnchor.y + dynamicAnchor.height + 12);
        const left = Math.max(12, Math.min(width - popupWidth - 12, dynamicAnchor.x - (popupWidth * 0.25)));

        return {
            top,
            left,
            right: undefined,
            bottom: undefined,
        };
    }, [dynamicAnchor, height, isSmallScreen, layout.popup, popupWidth, safeStep, width]);

    if (!visible) return null;

    return (
        <View style={styles.overlay} pointerEvents="box-none">
            {showTargetRing ? <View style={[styles.targetRing, targetStyle]} pointerEvents="none" /> : null}
            <View style={[styles.popup, popupStyle]} testID={`tutorial-step-${safeStep + 1}`}>
                <View style={styles.header}>
                    <Text style={styles.title}>{current.title}</Text>
                    <Text style={styles.stepBadge}>{safeStep + 1}/5</Text>
                </View>
                <Text style={styles.body}>{current.body}</Text>
                <Text style={styles.hint}>{current.hint}</Text>
                <Pressable testID="tutorial-skip-button" onPress={onSkip} style={styles.skipButton}>
                    <Text style={styles.skipText}>{texts.tutorialSkip || 'Skip tutorial'}</Text>
                </Pressable>
            </View>
        </View>
    );
}
