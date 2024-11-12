// screens/MyTabs.js

import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from '../../context/authContext';
import { db } from '../../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Import safe area insets

import HomeScreen from "../Bottom_Tabs/Home";
import CalendarScreen from "../Bottom_Tabs/Calender";
import ChatList from "../../components/ChatList";
import ActivitiesScreen from "../Bottom_Tabs/Activities";
import AcademicsScreen from "../Bottom_Tabs/Academics";
import StudyRoomScreen from "../Academics/Study_room";
import QuickExamScreen from "../Academics/Quick_exam";
import NeedAHandScreen from "../Academics/Need_a_hand";
import HelpAFriendScreen from "../Academics/Help_a_friend";
import ExtActivities from "../Extra_Tabs/Ext_Activities";
import ExtNotes from "../Extra_Tabs/Ext_Notes";
import Profile from "../Bottom_Tabs/Profile";
import HomeHeader from "../../components/HomeHeader";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack Navigator for Home Tab
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ header: () => <HomeHeader /> }}>
    <Stack.Screen name="HomeScreen" component={HomeScreen} />
  </Stack.Navigator>
);

// Stack Navigator for Calendar Tab
const CalendarStack = () => (
  <Stack.Navigator screenOptions={{ header: () => <HomeHeader /> }}>
    <Stack.Screen name="CalendarScreen" component={CalendarScreen} />
  </Stack.Navigator>
);

// Stack Navigator for Activities Tab
const ActivitiesStack = () => (
  <Stack.Navigator screenOptions={{ header: () => <HomeHeader /> }}>
    <Stack.Screen name="ActivitiesScreen" component={ActivitiesScreen} />
    <Stack.Screen name="ext_activities" component = {ExtActivities}/>
  </Stack.Navigator>
);

// Stack Navigator for Academics Tab (Hidden from Bottom Tabs)
const AcademicsStack = () => (
  <Stack.Navigator screenOptions={{ header: () => <HomeHeader /> }}>
    <Stack.Screen name="AcademicsScreen" component={AcademicsScreen} />
  </Stack.Navigator>
);

// Stack Navigator for Chat Tab
const ChatStack = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('userId', '!=', user.userId));
        const querySnapshot = await getDocs(q);
        const fetchedUsers = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    if (user) {
      fetchUsers();
    }
  }, [user]);

  return (
    <Stack.Navigator screenOptions={{ header: () => <HomeHeader /> }}>
      <Stack.Screen name="ChatScreen">
        {() => <ChatList users={users} currentUser={user} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default function MyTabs() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const insets = useSafeAreaInsets(); // Get safe area insets

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('userId', '!=', user.userId));
        const querySnapshot = await getDocs(q);
        const fetchedUsers = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    if (user) {
      fetchUsers();
    }
  }, [user]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // Hide the default header
        tabBarActiveTintColor: '#3B82F6', // Active icon color
        tabBarInactiveTintColor: '#9CA3AF', // Inactive icon color
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: insets.bottom || 10, // Add padding bottom based on safe area
          paddingTop: 5,
          // Add shadow for iOS
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          // Add elevation for Android
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: Platform.OS === 'android' ? 5 : 0, // Adjust label margin for Android
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Calendar':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Chat':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'Activities':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarStack}
        options={{ tabBarLabel: 'Calendar' }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatStack}
        options={{ tabBarLabel: 'Chat' }}
      />
      <Tab.Screen
        name="Activities"
        component={ActivitiesStack}
        options={{ tabBarLabel: 'Activities' }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{ tabBarButton: () => null }}
      />
      {/* Hidden Tabs */}
      <Tab.Screen
        name="Academics"
        component={AcademicsStack}
        options={{ tabBarButton: () => null }}
      />
      <Tab.Screen
        name="Study_Room"
        component={StudyRoomScreen}
        options={{ tabBarButton: () => null }}
      />
      <Tab.Screen
        name="Quick_Exam"
        component={QuickExamScreen}
        options={{ tabBarButton: () => null }}
      />
      <Tab.Screen
        name="Need_a_Hand"
        component={NeedAHandScreen}
        options={{ tabBarButton: () => null }}
      />
      <Tab.Screen
        name="Help_a_Friend"
        component={HelpAFriendScreen}
        options={{ tabBarButton: () => null }}
      />
      <Tab.Screen
        name="ExtActivities"
        component={ExtActivities}
        options={{ tabBarButton: () => null }}
      />
      <Tab.Screen
        name="ExtNotes"
        component={ExtNotes}
        options={{ tabBarButton: () => null }}
      />
    </Tab.Navigator>
  );
}
