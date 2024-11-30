// Import necessary libraries and components
import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from '../../context/authContext';
import { db } from '../../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import your screens
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
import Opened_Note from "../Extra_Tabs/opened_note"
import Profile from "../Bottom_Tabs/Profile";
import HomeHeader from "../../components/HomeHeader";
import ChatHomeScreen from "../Bottom_Tabs/Chat/ChatHomeScreen";
import ChatRoomScreen from "../Bottom_Tabs/Chat/ChatRoom";
import NewChatScreen from "../Bottom_Tabs/Chat/NewChat";
import NewGroup from "../Bottom_Tabs/Chat/NewGroup";
import ChatRoomHeader from "../../components/ChatRoomHeader";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack Navigator for Home Tab
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ header: () => <HomeHeader /> }}>
    <Stack.Screen name="HomeScreen" component={HomeScreen} />
    <Stack.Screen name="Profile" component={Profile} />
    <Stack.Screen name="Academics" component={AcademicsScreen} />
    <Stack.Screen name="Study_Room" component={StudyRoomScreen} />
    <Stack.Screen name="Quick_Exam" component={QuickExamScreen} />
    <Stack.Screen name="Need_a_Hand" component={NeedAHandScreen} />
    <Stack.Screen name="Help_a_Friend" component={HelpAFriendScreen} />
  </Stack.Navigator>
);

// Stack Navigator for Calendar Tab
const CalendarStack = () => (
  <Stack.Navigator screenOptions={{ header: () => <HomeHeader /> }}>
    <Stack.Screen name="CalendarScreen" component={CalendarScreen} />
    <Stack.Screen name="Academics" component={AcademicsScreen} />
    <Stack.Screen name="Study_Room" component={StudyRoomScreen} />
    <Stack.Screen name="Quick_Exam" component={QuickExamScreen} />
    <Stack.Screen name="Need_a_Hand" component={NeedAHandScreen} />
    <Stack.Screen name="Help_a_Friend" component={HelpAFriendScreen} />
  </Stack.Navigator>
);

// Stack Navigator for Activities Tab
const ActivitiesStack = () => (
  <Stack.Navigator screenOptions={{ header: () => <HomeHeader /> }}>
    <Stack.Screen name="ActivitiesScreen" component={ActivitiesScreen} />
    {/* Include extra activities and notes screens */}
    <Stack.Screen name="ext_activities" component={ExtActivities} />
    <Stack.Screen name="ExtNotes" component={ExtNotes} />
    <Stack.Screen name="Academics" component={AcademicsScreen} />
    <Stack.Screen name="Study_Room" component={StudyRoomScreen} />
    <Stack.Screen name="Quick_Exam" component={QuickExamScreen} />
    <Stack.Screen name="Need_a_Hand" component={NeedAHandScreen} />
    <Stack.Screen name="Help_a_Friend" component={HelpAFriendScreen} />
  </Stack.Navigator>
);

// Stack Navigator for Chat Tab
const ChatStack = () => {
  const { user } = useAuth();

  // Remove the users state and useEffect as they're now handled in individual components
  return (
    <Stack.Navigator 
      screenOptions={{ 
        header: () => <HomeHeader />,
      }}
    >
      <Stack.Screen 
        name="ChatScreen" 
        component={ChatHomeScreen}
        options={{
          header: () => <HomeHeader />,
        }}
      />
      <Stack.Screen 
        name="chatRoom"
        component={ChatRoomScreen}
        options={({ route }) => ({
        header: () => (
        <ChatRoomHeader 
          chatDetails={route.params.chatDetails}
          currentUser={user} // Pass from your auth context
        />
      ),
      })}
      />
      <Stack.Screen 
        name="newChat" 
        component={NewChatScreen}
        options={{
          presentation: 'modal',
          headerTitle: 'New Chat',
        }}
      />
      <Stack.Screen
          name="newGroup"
          component={NewGroup}
          options={{
            presentation: 'modal',
            headerTitle: 'Create Group'
          }}
        />
      <Stack.Screen name="Academics" component={AcademicsScreen} />
      <Stack.Screen name="Study_Room" component={StudyRoomScreen} />
      <Stack.Screen name="Quick_Exam" component={QuickExamScreen} />
      <Stack.Screen name="Need_a_Hand" component={NeedAHandScreen} />
      <Stack.Screen name="Help_a_Friend" component={HelpAFriendScreen} />
    </Stack.Navigator>
  );
};

export default function MyTabs() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const insets = useSafeAreaInsets();

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
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: Platform.select({
          ios: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            paddingBottom: insets.bottom,
            paddingTop: 5,
            height: 85,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          android: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            paddingBottom: 10,
            paddingTop: 5,
            height: 65,
            elevation: 5,
          },
        }),
        tabBarShowLabel: true,
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
            default:
              iconName = 'ellipse';
          }
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      {/* Visible Tabs */}
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Calendar" 
        component={CalendarStack}
        options={{
          tabBarLabel: 'Calendar',
        }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatStack}
        options={{
          tabBarLabel: 'Chat',
        }}
      />
      <Tab.Screen 
        name="Activities" 
        component={ActivitiesStack}
        options={{
          tabBarLabel: 'Activities',
        }}
      />
    </Tab.Navigator>
  );
}
