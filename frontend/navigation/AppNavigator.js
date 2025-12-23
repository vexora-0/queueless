import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import ServicesScreen from '../screens/user/ServicesScreen';
import BookTokenScreen from '../screens/user/BookTokenScreen';
import MyTokensScreen from '../screens/user/MyTokensScreen';
import TokenDetailsScreen from '../screens/user/TokenDetailsScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminServicesScreen from '../screens/admin/AdminServicesScreen';
import AdminTokensScreen from '../screens/admin/AdminTokensScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function UserStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Services" 
        component={ServicesScreen}
        options={{ title: 'Available Services' }}
      />
      <Stack.Screen 
        name="BookToken" 
        component={BookTokenScreen}
        options={{ title: 'Book Token' }}
      />
      <Stack.Screen 
        name="MyTokens" 
        component={MyTokensScreen}
        options={{ title: 'My Tokens' }}
      />
      <Stack.Screen 
        name="TokenDetails" 
        component={TokenDetailsScreen}
        options={{ title: 'Token Details' }}
      />
    </Stack.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Dashboard" 
        component={AdminDashboardScreen}
        options={{ title: 'Admin Dashboard' }}
      />
      <Stack.Screen 
        name="AdminServices" 
        component={AdminServicesScreen}
        options={{ title: 'Manage Services' }}
      />
      <Stack.Screen 
        name="AdminTokens" 
        component={AdminTokensScreen}
        options={{ title: 'Manage Tokens' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MyTokens') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'Admin') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={UserStack} />
      <Tab.Screen name="MyTokens" component={MyTokensScreen} />
      {user?.role === 'admin' && (
        <Tab.Screen name="Admin" component={AdminStack} />
      )}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

