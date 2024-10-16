import * as React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../Bottom_Tabs/Home";
import CalenderScreen from "../Bottom_Tabs/Calender";
import ChatList from "../../components/ChatList";
import ActivitiesScreen from "../Bottom_Tabs/Activities";
import AcademicsScreen from "../Bottom_Tabs/Academics";
import StudyRoomScreen from "../Academics/Study_room";
import QuickExamScreen from "../Academics/Quick_exam";
import NeedAHandScreen from "../Academics/Need_a_hand";
import HelpAFriendScreen from "../Academics/Help_a_friend";
import ext_Activites from "../Extra_Tabs/Ext_Activities";
import { NavigationContainer } from "@react-navigation/native";
import Profile from "../Bottom_Tabs/Profile";
import { useAuth } from '../../context/authContext';
import { db } from '../../firebaseConfig';
import { createStackNavigator } from "@react-navigation/stack";
import HomeHeader from "../../components/HomeHeader";
import { collection, getDocs, query, where } from 'firebase/firestore';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();  // Add this line

// Create a stack navigator for each tab that needs the header
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ header: () => <HomeHeader /> }}>
    <Stack.Screen name="HomeScreen" component={HomeScreen} />
  </Stack.Navigator>
);

const CalendarStack = () => (
  <Stack.Navigator screenOptions={{ header: () => <HomeHeader /> }}>
    <Stack.Screen name="CalendarScreen" component={CalenderScreen} />
  </Stack.Navigator>
);

const ActivitiesStack = () => (
  <Stack.Navigator screenOptions={{ header: () => <HomeHeader /> }}>
    <Stack.Screen name="ActivitiesScreen" component={ActivitiesScreen} />
  </Stack.Navigator>
);

const AcademicsStack = () => (
  <Stack.Navigator screenOptions={{ header: () => <HomeHeader /> }}>
    <Stack.Screen name="AcademicsScreen" component={AcademicsScreen} />
  </Stack.Navigator>
);

const ChatStack = () => {
  const { user } = useAuth();
  const [users, setUsers] = React.useState([]);

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('userId', '!=', user.userId));
        const querySnapshot = await getDocs(q);
        const fetchedUsers = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
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

  const { user } = useAuth();  // Assuming you have an auth context
  const [users, setUsers] = React.useState([]);  // You'd fetch this from your backend

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('userId', '!=', user.userId));
        const querySnapshot = await getDocs(q);
        const fetchedUsers = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
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
      screenOptions={{
        headerShown: false,  // This will hide the header for all screens
      }}
      >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Calender"
        component={CalendarStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatStack}
        options={{ headerShown: false }}
      >
      </Tab.Screen>
      <Tab.Screen
        name="Activities"
        component={ActivitiesStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Academics"
        component={AcademicsStack}
        options={{ headerShown: false, tabBarButton: () => null }}
      />
      <Tab.Screen
        name="profile"
        component={Profile}
        options={{ headerShown: false, tabBarButton: () => null }}
      />
      <Tab.Screen
        name="Study_Room"
        component={StudyRoomScreen}
        options={{ headerShown: false, tabBarButton: () => null }}
      />
      <Tab.Screen
        name="Quick_Exam"
        component={QuickExamScreen}
        options={{ headerShown: false, tabBarButton: () => null }}
      />
      <Tab.Screen
        name="Need_a_Hand"
        component={NeedAHandScreen}
        options={{ headerShown: false, tabBarButton: () => null }}
      />
      <Tab.Screen
        name="Help_a_Friend"
        component={HelpAFriendScreen}
        options={{ headerShown: false, tabBarButton: () => null }}
      />
      <Tab.Screen
        name="ext_activites"
        component={ext_Activites}
        options={{ headerShown: false, tabBarButton: () => null }}
      />
    </Tab.Navigator>
  );
}

