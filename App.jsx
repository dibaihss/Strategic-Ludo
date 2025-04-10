import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import LudoBoard from './GameComponents/LudoBoard.jsx';
import SmalBoard from './GameComponents/SmalBoard.jsx';

export default function App() {
  return (
    <View style={styles.container}>
      <SmalBoard />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  padding: 10,
  flex: 1,
  margin: 10,
  },
});
