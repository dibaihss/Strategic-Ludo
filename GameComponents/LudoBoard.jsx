import React, { useState } from 'react';
import { View, Button, Text } from 'react-native';

export default function App() {
  const [state, setState] = useState({ count: 0, name: "John" });

      const [blueSoldiers, setBlueSoldiers] = useState([
            { id: 1, position: 1, color: "blue", initialPosition: '1a', onBoard: true, isOut: false },
            { id: 2, position: '2blue', color: "blue", initialPosition: '2blue', onBoard: false, isOut: false },
            { id: 3, position: '3blue', color: "blue", initialPosition: '3blue', onBoard: false, isOut: false },
            { id: 4, position: '4blue', color: "blue", initialPosition: '4blue', onBoard: false, isOut: false }
        ]);

  const handleClick = () => {
    setBlueSoldiers(prev => {
      const updatedSoldiers = prev.map(soldier => {
        if (soldier.id === 1) {
          return { ...soldier, position: soldier.position + 1 };
        }
        return soldier;
      });
      return updatedSoldiers;
    });
    console.log(blueSoldiers);
    setState(prev => ({
      ...prev,
      count: prev.count + 2,
      name: "Updated Name"
    }));
  };

  const handleClick2 = () => {
    for (let i = 0; i < 10; i++) {
    handleClick();
    }
  }

  return (
    <View>
      <Text>Count: {state.count}</Text>
      <Text>Name: {state.name}</Text>
      <Button title="Update Both" onPress={handleClick2} />
    </View>
  );
}