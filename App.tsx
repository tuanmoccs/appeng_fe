import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';
import { StatusBar } from 'react-native';
import store from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/constants/colors';

function App(): React.ReactNode {
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