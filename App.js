import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, StyleSheet, Keyboard } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';

// Import your screens here
import HomeScreen from './components/screens/Home';
import SummaryScreen from './components/screens/SummaryScreen';
import AddTransactionScreen from './components/screens/AddTransactionScreen';
import NotificationScreen from './components/screens/NotificationScreen';
import GoalScreen from './components/screens/GoalScreen';
import AddGoalScreen from './components/screens/AddGoalScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Goal Stack Navigator
const GoalStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="GoalScreen" component={GoalScreen} options={{ headerShown: false }} />
    <Stack.Screen name="เพิ่มเป้าหมายการเงิน" component={AddGoalScreen} />
<<<<<<< HEAD
  </Stack.Navigator>
);
const StackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="ผู้จัดการเงิน" component={HomeScreen} 
    options={{ headerTitleAlign: 'center',  headerStyle: { height: 100 },}} />
    <Stack.Screen name="เพิ่ม" component={AddTransactionScreen} />
    <Stack.Screen name="Addexpense" component={AddTransactionScreen} />
    <Stack.Screen name="Addincome" component={AddTransactionScreen} />
    <Stack.Screen name="SummaryScreen" component={SummaryScreen} />
=======
>>>>>>> 2f6d50b (Save changes before pull with rebase)
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
        options={{ headerShown: true, headerTitleAlign: 'center',headerTitle: 'ผู้จัดการเงิน', tabBarIcon: ({ color }) => (<Icon name="home" size={24} color={color} />) 
<<<<<<< HEAD

=======
>>>>>>> 2f6d50b (Save changes before pull with rebase)
        }} 
      />
      <Tab.Screen 
        name="สรุป" 
        component={SummaryScreen} 
        options={{ headerTitleAlign: 'center', tabBarIcon: ({ color }) => (<Icon name="pie-chart" size={24} color={color} />) }}
      />
      <Tab.Screen 
        name="เพิ่ม" 
        component={AddTransactionScreen} 
        options={{ headerShown: true, headerTitle: 'เพิ่ม', tabBarLabel: () => null, headerTitleAlign: 'center',  headerStyle: { height: 100 },
          tabBarIcon: ({ color }) => (<Icon name="add-circle-outline" size={50} color={color} />)
        }} 
      />
      <Tab.Screen 
        name="เป้าหมาย" 
        component={GoalStackNavigator} // Use the Goal Stack Navigator here
        options={{headerShown: false, tabBarIcon: ({ color }) => (<FontAwesome name="bullseye" size={24} color={color} />) }}
      />
      <Tab.Screen 
        name="แจ้งเตือน" 
        component={NotificationScreen} 
        options={{headerTitleAlign: 'center', tabBarIcon: ({ color }) => (<Icon name="notifications" size={24} color={color} />) }}
      />
    </Tab.Navigator>
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

