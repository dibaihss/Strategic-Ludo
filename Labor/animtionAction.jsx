import { Animated } from 'react-native';
import { 
    setSourcePosition, 
    setTargetPosition, 
    setShowClone, 
    setAnimatedValue 
} from '../assets/store/animationSlice';

export const moveElement = (sourcePos, targetPos) => (dispatch) => {
    console.log(sourcePos, targetPos)
    const animatedValue = new Animated.ValueXY({ x: 0, y: 0 });

    dispatch(setSourcePosition(sourcePos));
    dispatch(setTargetPosition(targetPos));
    dispatch(setShowClone(true));
    
    animatedValue.setValue({ x: sourcePos.x, y: sourcePos.y });
    dispatch(setAnimatedValue({ x: sourcePos.x, y: sourcePos.y }));

    Animated.timing(animatedValue, {
        toValue: { x: targetPos.x, y: targetPos.y },
        duration: 600,
        useNativeDriver: false,
    }).start(() => {
        dispatch(setShowClone(false));
    });
};