import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';
import { StatusBar } from 'react-native';
import store from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/constants/colors';
import { useEffect } from 'react';
import { setupAxiosInterceptors } from './src/services/authService';

function App(): React.ReactNode {
  useEffect(() => {
    // Setup interceptor khi app khởi động
    setupAxiosInterceptors();
    console.log('Axios interceptors configured');
  }, [])
  return (
    <SafeAreaProvider>
      <ReduxProvider store={store}>
        <StatusBar backgroundColor={COLORS.WHITE} barStyle="dark-content" />
        <AppNavigator />
      </ReduxProvider>
    </SafeAreaProvider>
  );
}

export default App;