import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, StyleSheet, Keyboard } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import { TypeProvider } from './TypeContext';
// Import your screens here
import HomeScreen from './components/screens/Home';
import SummaryScreen from './components/screens/SummaryScreen';
import AddTransactionScreen from './components/screens/AddTransactionScreen';
import NotificationScreen from './components/screens/NotificationScreen';
import GoalScreen from './components/screens/GoalScreen';
import AddGoalScreen from './components/screens/AddGoalScreen';
import ExpenseSummaryScreen from './components/screens/ExpenseSummaryScreen';
import IncomeSummaryScreen from './components/screens/IncomeSummaryScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Goal Stack Navigator
const GoalStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="GoalScreen" component={GoalScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AddGoalScreen" component={AddGoalScreen} options={{ title: 'เพิ่มเป้าหมายการเงิน', headerTitleAlign: 'center', }} />
  </Stack.Navigator>
);

const SumStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Summary" component={SummaryScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ExpenseSummaryScreen" component={ExpenseSummaryScreen} options={{ title: 'ประวัติของรายจ่าย', headerTitleAlign: 'center', }} />
    <Stack.Screen name="IncomeSummaryScreen" component={IncomeSummaryScreen} options={{ title: 'ประวัติของรายรับ', headerTitleAlign: 'center', }} />
  </Stack.Navigator>
);

// Bottom Tab Navigator
const TabNavigator = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);


  return (
    <TypeProvider>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarLabel: ({ focused, color }) => {
            let label = '';
            if (route.name === 'หน้าแรก') {
              label = 'หน้าแรก';
            } else if (route.name === 'เพิ่ม') {
              label = 'เพิ่ม';
            } else if (route.name === 'สรุป') {
              label = 'สรุป';
            } else if (route.name === 'แจ้งเตือน') {
              label = 'แจ้งเตือน';
            } else if (route.name === 'เป้าหมาย') {
              label = 'เป้าหมาย';
            }
            return <Text style={{ color: focused ? '#ff3b30' : 'gray', fontSize: 16 }}>{label}</Text>;
          },
          tabBarActiveTintColor: '#ff3b30',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: { height: 60, paddingBottom: 10, display: isKeyboardVisible ? 'none' : 'flex' },
        })}
      >
        <Tab.Screen
          name="หน้าแรก"
          component={HomeScreen}
          options={{
            headerShown: true, headerTitleAlign: 'center', headerTitle: 'ผู้จัดการเงิน', tabBarIcon: ({ color }) => (<Icon name="home" size={24} color={color} />)
          }}
        />
        <Tab.Screen
          name="สรุป"
          component={SumStackNavigator}
          options={{ headerTitleAlign: 'center', tabBarIcon: ({ color }) => (<Icon name="pie-chart" size={24} color={color} />) }}
        />
        <Tab.Screen
          name="เพิ่ม"
          component={AddTransactionScreen}
          options={{
            headerShown: true, headerTitle: 'เพิ่ม', tabBarLabel: () => null, headerTitleAlign: 'center', headerStyle: { height: 100 },
            tabBarIcon: ({ color }) => (<Icon name="add-circle-outline" size={50} color={color} />)
          }}
        />
        <Tab.Screen
          name="เป้าหมาย"
          component={GoalStackNavigator} // Use the Goal Stack Navigator here
          options={{ headerShown: false, tabBarIcon: ({ color }) => (<FontAwesome name="bullseye" size={24} color={color} />) }}
        />
        <Tab.Screen
          name="แจ้งเตือน"
          component={NotificationScreen}
          options={{ headerTitleAlign: 'center', tabBarIcon: ({ color }) => (<Icon name="notifications" size={24} color={color} />) }}
        />
      </Tab.Navigator>
    </TypeProvider>
  );
};

// Main App Component
const App = () => {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
};

export default App;

