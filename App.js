// App.js  (root of React Native project)
import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import Toast from 'react-native-toast-message';

const App = () => {
  const navigationRef = React.useRef(null);

  return (
    <AuthProvider>
      <AppProvider>
        <AppNavigator navigationRef={navigationRef} />
        <Toast />
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
