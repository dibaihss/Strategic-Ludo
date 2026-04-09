import { Provider } from 'react-redux';
import { store } from './assets/store/store.jsx';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { WebSocketProvider } from './assets/shared/webSocketConnection.jsx'; // Import useWebSocket
import AppNavigator from './AppNavigator.jsx';
import Toast from 'react-native-toast-message';


// --- Main App Component ---
export default function App() {
  return (
    <Provider store={store}>
      <WebSocketProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AppNavigator />
          <Toast />
        </GestureHandlerRootView>
      </WebSocketProvider>
    </Provider>
  );
}