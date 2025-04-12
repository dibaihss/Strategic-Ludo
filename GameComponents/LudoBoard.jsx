import React, { useState } from 'react';
import { View, Button, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { 
   setState
} from '../assets/store/gameSlice.jsx';

export default function App() {
  
    const dispatch = useDispatch();
    const state = useSelector(state => state.game.statetest);



 

  const handleClick2 = () => {
    // Dispatch an action to update the state with a new value
    dispatch(setState({ count: state.count + 1, name: "John" }));
  }

  return (
    <View>
      <Text>Count: {state.count}</Text>
      <Text>Name: {state.name}</Text>
      <Button title="Update Both" onPress={handleClick2} />
    </View>
  );
}