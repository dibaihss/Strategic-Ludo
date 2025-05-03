import { Provider, useDispatch } from 'react-redux';
import { store } from './assets/store/store.jsx';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { WebSocketProvider } from './assets/shared/webSocketConnection.jsx'; // Import useWebSocket
import AppNavigator from './AppNavigator.jsx';


// --- Main App Component ---
export default function App() {
  return (
    <Provider store={store}>
      <WebSocketProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AppNavigator />
        </GestureHandlerRootView>
      </WebSocketProvider>
    </Provider>
  );
}