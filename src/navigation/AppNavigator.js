import React, { useEffect, useState, useContext } from 'react';
import { Pressable } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import Screens
import SplashScreen from '../screens/SplashScreen';
import DashboardScreen from '../screens/DashboardScreen';
import HomeScreen from '../screens/HomeScreen';
import MonthScreen from '../screens/MonthScreen';
import CalendarScreen from '../screens/CalendarScreen';
import DayExpenseScreen from '../screens/DayExpenseScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import EditExpenseScreen from '../screens/EditExpenseScreen';
import ReportsScreen from '../screens/ReportsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AboutScreen from '../screens/AboutScreen';
import SearchScreen from '../screens/SearchScreen';
import SubscriptionListScreen from '../screens/SubscriptionListScreen';

// New Feature Screens
import CategoryBudgetScreen from '../screens/CategoryBudgetScreen';
import SavingsGoalsScreen from '../screens/SavingsGoalsScreen';
import BillSplitScreen from '../screens/BillSplitScreen';
import WishlistScreen from '../screens/WishlistScreen';
import BackupRestoreScreen from '../screens/BackupRestoreScreen';
import LockScreen from '../screens/LockScreen';

// Import Constants
import { COLORS } from '../constants/theme';
import { AppContext } from '../context/AppContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const BrowseStack = createNativeStackNavigator();

// Browse Flow Navigator (Year -> Month -> Calendar -> Day Expense)
function BrowseStackNavigator() {
  const { theme } = useContext(AppContext);
  const colors = COLORS[theme];

  return (
    <BrowseStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <BrowseStack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={({ navigation }) => ({ 
          title: 'Years',
          headerRight: () => (
            <Pressable 
              onPress={() => navigation.navigate('Search')}
              style={({ pressed }) => [
                { marginRight: 5, padding: 4 },
                pressed && { opacity: 0.7 }
              ]}
            >
              <Ionicons name="search" size={22} color="#fff" />
            </Pressable>
          ),
        })} 
      />
      <BrowseStack.Screen 
        name="Month" 
        component={MonthScreen} 
        options={{ title: 'Months' }} 
      />
      <BrowseStack.Screen 
        name="Calendar" 
        component={CalendarScreen} 
        options={{ title: 'Calendar' }} 
      />
      <BrowseStack.Screen 
        name="DayExpense" 
        component={DayExpenseScreen} 
        options={{ title: 'Day Expenses' }} 
      />
    </BrowseStack.Navigator>
  );
}

// Bottom Tab Navigator for main navigation tabs
function TabNavigator() {
  const { theme } = useContext(AppContext);
  const colors = COLORS[theme];

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = 'wallet-outline';
          } else if (route.name === 'Browse') {
            iconName = 'calendar-outline';
          } else if (route.name === 'Reports') {
            iconName = 'bar-chart-outline';
          } else if (route.name === 'Settings') {
            iconName = 'settings-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.card,
          paddingBottom: 5,
          height: 60,
        },
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={({ navigation }) => ({ 
          title: 'Dashboard',
          headerRight: () => (
            <Pressable 
              onPress={() => navigation.navigate('Search')}
              style={({ pressed }) => [
                { marginRight: 15, padding: 4 },
                pressed && { opacity: 0.7 }
              ]}
            >
              <Ionicons name="search" size={22} color="#fff" />
            </Pressable>
          ),
        })} 
      />
      <Tab.Screen 
        name="Browse" 
        component={BrowseStackNavigator} 
        options={{ headerShown: false }} // Header managed by the internal stack
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Prevent default navigation behavior
            e.preventDefault();
            // Navigate directly to the 'Home' screen inside the 'Browse' stack
            navigation.navigate('Browse', { screen: 'Home' });
          },
        })}
      />
      <Tab.Screen 
        name="Reports" 
        component={ReportsScreen} 
        options={{ title: 'Reports' }} 
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Settings' }} 
      />
    </Tab.Navigator>
  );
}

// Main App Navigation Container Flow (includes Splash -> Tab -> Modals)
export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const { theme, isAppLocked } = useContext(AppContext);
  const colors = COLORS[theme];

  // Simulate splash screen display for 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  if (isAppLocked) {
    return <LockScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main Bottom Tab Navigation */}
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      
      {/* Modal / Overlay Screens */}
      <Stack.Screen 
        name="AddExpense" 
        component={AddExpenseScreen} 
        options={{ 
          presentation: 'modal', 
          headerShown: true,
          title: 'Add Expense',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="EditExpense" 
        component={EditExpenseScreen} 
        options={{ 
          presentation: 'modal', 
          headerShown: true,
          title: 'Edit Expense',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="CategoryBudget" 
        component={CategoryBudgetScreen} 
        options={{ 
          headerShown: true,
          title: 'Category Budgets',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="SavingsGoals" 
        component={SavingsGoalsScreen} 
        options={{ 
          headerShown: true,
          title: 'Savings Goals',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="BillSplit" 
        component={BillSplitScreen} 
        options={{ 
          headerShown: true,
          title: 'Bill Split Calculator',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="Wishlist" 
        component={WishlistScreen} 
        options={{ 
          headerShown: true,
          title: 'Wishlist Tracker',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="BackupRestore" 
        component={BackupRestoreScreen} 
        options={{ 
          headerShown: true,
          title: 'Backup & Restore',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{ 
          headerShown: true,
          title: 'Advanced Search',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="SubscriptionList" 
        component={SubscriptionListScreen} 
        options={{ 
          headerShown: true,
          title: 'Subscriptions',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="About" 
        component={AboutScreen} 
        options={{ 
          headerShown: true, 
          title: 'About App',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
        }} 
      />
    </Stack.Navigator>
  );
}

