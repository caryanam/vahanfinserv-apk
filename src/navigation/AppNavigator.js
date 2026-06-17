// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { setNavigationCallback } from '../services/api';

// Home
import HomeScreen from '../screens/home/HomeScreen';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import VerifyOtpScreen from '../screens/auth/VerifyOtpScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import UnauthorizedScreen from '../screens/auth/UnauthorizedScreen';

// Dashboard Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminDealersScreen from '../screens/admin/AdminDealersScreen';
import AdminDocumentsScreen from '../screens/admin/AdminDocumentsScreen';
import AdminPaymentsScreen from '../screens/admin/AdminPaymentsScreen';
import AdminBanksScreen from '../screens/admin/AdminBanksScreen';
import AdminReportsScreen from '../screens/admin/AdminReportsScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import CustomerDashboardScreen from '../screens/customer/CustomerDashboardScreen';
import DealerDashboardScreen from '../screens/dealer/DealerDashboardScreen';

// Customer Loan Flow Screens
import ApplyLoanScreen from '../screens/customer/ApplyLoanScreen';
import PersonalInfoScreen from '../screens/customer/PersonalInfoScreen';
import KycUploadScreen from '../screens/customer/KycUploadScreen';
import ResidentialInfoScreen from '../screens/customer/ResidentialInfoScreen';
import IncomeInfoScreen from '../screens/customer/IncomeInfoScreen';
import VehicleDocumentsScreen from '../screens/customer/VehicleDocumentsScreen';
import VerifySubmitScreen from '../screens/customer/VerifySubmitScreen';
import PaymentScreen from '../screens/customer/PaymentScreen';
import LoanStatusScreen from '../screens/customer/LoanStatusScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = ({ navigationRef }) => {
  // Set up global 403 error handler callback
  React.useEffect(() => {
    if (navigationRef) {
      setNavigationCallback(() => {
        navigationRef.current?.reset({ index: 0, routes: [{ name: 'Login' }] });
      });
    }
  }, [navigationRef]);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}
      >
        {/* Landing */}
        <Stack.Screen name="Home" component={HomeScreen} />

        {/* Auth */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="Unauthorized" component={UnauthorizedScreen} />

        {/* Admin */}
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
        <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
        <Stack.Screen name="AdminDealers" component={AdminDealersScreen} />
        <Stack.Screen name="AdminDocuments" component={AdminDocumentsScreen} />
        <Stack.Screen name="AdminPayments" component={AdminPaymentsScreen} />
        <Stack.Screen name="AdminBanks" component={AdminBanksScreen} />
        <Stack.Screen name="AdminReports" component={AdminReportsScreen} />
        <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />

        {/* Dashboards */}
        <Stack.Screen name="CustomerDashboard" component={CustomerDashboardScreen} />
        <Stack.Screen name="DealerDashboard" component={DealerDashboardScreen} />

        {/* Customer Loan Flow */}
        <Stack.Screen name="ApplyLoan" component={ApplyLoanScreen} />
        <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
        <Stack.Screen name="KycUpload" component={KycUploadScreen} />
        <Stack.Screen name="ResidentialInfo" component={ResidentialInfoScreen} />
        <Stack.Screen name="IncomeInfo" component={IncomeInfoScreen} />
        <Stack.Screen name="VehicleDocuments" component={VehicleDocumentsScreen} />
        <Stack.Screen name="VerifySubmit" component={VerifySubmitScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="LoanStatus" component={LoanStatusScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
