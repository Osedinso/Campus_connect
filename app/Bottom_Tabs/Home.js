// Home.js

import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import {
  StyleSheet,
  Text,
  Image,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { db, usersRef } from "../../firebaseConfig";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { useAuth } from "../../context/authContext";
import { useNavigation } from "@react-navigation/native"; // Ensure correct import

const Home = ({ navigation }) => {
  const { user } = useAuth();
  const months = [
    { label: "Jan", value: "1" },
    { label: "Feb", value: "2" },
    { label: "Mar", value: "3" },
    { label: "Apr", value: "4" },
    { label: "May", value: "5" },
    { label: "Jun", value: "6" },
    { label: "Jul", value: "7" },
    { label: "Aug", value: "8" },
    { label: "Sep", value: "9" },
    { label: "Oct", value: "10" },
    { label: "Nov", value: "11" },
    { label: "Dec", value: "12" },
  ];

  const today = new Date();
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getMonthValue = (mon_value) => {
    const month = months.find((m) => m.label === mon_value);
    return month ? month.value : null;
  };

  useEffect(() => {
    // If user is not authenticated, do not proceed
    if (!user?.userId) {
      return;
    }
    
    const fetchData = () => {
      try {
        const userRefTask = doc(db, "users", user.userId);
        const tasksCollection = collection(userRefTask, "Tasks");

        // Real-time listener for Tasks
        const unsubscribeTasks = onSnapshot(tasksCollection, (snapshot) => {
          const tasksList = snapshot.docs.map((doc) => ({
            title: doc.data().title,
            month_value: doc.data().month_value,
            day: doc.data().day,
            day_value: doc.data().day_value,
            year_value: doc.data().year_value,
            start_hr_val: doc.data().start_hr_val,
            start_min_val: doc.data().start_min_val,
            start_ampm_val: doc.data().start_ampm_val,
            checked: doc.data().checked,
            full_date:
              doc.data().year_value +
              "-" +
              getMonthValue(doc.data().month_value) +
              "-" +
              doc.data().day_value,
          }));

          // Sort tasks by date
          tasksList.sort(
            (a, b) => new Date(a.full_date) - new Date(b.full_date)
          );

          setTasks(tasksList);
        });

        const userRefActivity = doc(db, "users", user.userId);
        const activitiesCollection = collection(userRefActivity, "Activities");

        // Real-time listener for Activities
        const unsubscribeActivities = onSnapshot(
          activitiesCollection,
          (snapshot) => {
            const activityList = snapshot.docs.map((doc) => ({
              title: doc.data().title,
              month_value: doc.data().month,
              day: doc.data().day,
              day_value: doc.data().day_num,
              year_value: doc.data().year,
              start_hr_val: doc.data().start_hr,
              start_min_val: doc.data().start_min,
              start_ampm_val: doc.data().start_amPm,
              full_date:
                doc.data().year +
                "-" +
                getMonthValue(doc.data().month) +
                "-" +
                doc.data().day_num,
            }));

            // Sort activities by date
            activityList.sort(
              (a, b) => new Date(a.full_date) - new Date(b.full_date)
            );

            setActivities(activityList);
          }
        );

        // Cleanup listeners on unmount
        return () => {
          unsubscribeTasks();
          unsubscribeActivities();
        };
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    const unsubscribe = fetchData();
    return () => unsubscribe && unsubscribe();
  }, [user?.userId]); // Use optional chaining to prevent errors

  // If user is not authenticated, show a loading indicator or redirect
  if (!user) {
    // Optionally, navigate to SignIn screen
    // navigation.navigate("SignIn");

    // Show a loading indicator while checking authentication
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#075eec" />
      </View>
    );
  }

  return (
    <ScrollView className="flex basis-4/5 bg-white ">
      {/* Welcome Text and Date */}
      <View className="basis-1/4 w-screen flex justify-center items-center ">
        <View className="flex flex-col w-11/12 justify-end items-start mt-3 mb-4">
          {/* Updated Greeting Text */}
          <Text className="text-3xl text-left">
            Hi {user?.firstName || user?.username || "Guest"}
          </Text>
          <Text className="mt-3 text-sm">{formattedDate}</Text>
        </View>
      </View>

      {/* Dashboard Content */}
      <View className="basis-2/3 w-screen h-screen items-center">
        <View className="flex w-11/12 h-full justify-start">
          {/* Dashboard Header */}
          <View className="flex basis-1/12 flex-row items-center justify-between ">
            <Text className="text-base font-medium">Dashboard</Text>
            <AntDesign name="ellipsis1" size={24} color="black" />
          </View>

          {/* Personal Tasks Section */}
          <View className="flex h-64 rounded-xl justify-between items-center border-solid border border-[#989898] overflow-hidden mb-5">
            {/* Tasks Header */}
            <View className="basis-1/5 w-full justify-center items-center bg-[#075eec] ">
              <View className="w-11/12 justify-center ">
                <Text className="text-white">Personal Task</Text>
              </View>
            </View>

            {/* Tasks List */}
            <View className="flex basis-3/5 w-11/12 justify-between pt-3">
              {tasks.length === 0 ? (
                <View className="h-full flex justify-center items-center">
                  <Text>No Task Today</Text>
                </View>
              ) : (
                tasks.slice(0, 2).map((temp_task, index) => (
                  <View key={index} className="basis-1/2 flex flex-row mb-2">
                    <View className="basis-4/5 w-4/5 justify-start">
                      <View className="flex flex-row items-center">
                        <Text className="mb-2 font-semibold">
                          {temp_task.title}
                        </Text>
                      </View>

                      <View className="flex flex-row items-center">
                        <Ionicons name="time-outline" size={15} color="black" />
                        <Text className="ml-2">
                          {temp_task.start_hr_val}:{temp_task.start_min_val}{" "}
                          {temp_task.start_ampm_val}
                        </Text>
                      </View>
                      <View className="flex flex-row items-center">
                        <AntDesign name="calendar" size={15} color="black" />
                        <Text className="ml-2">
                          {temp_task.day}, {temp_task.month_value}{" "}
                          {temp_task.day_value}, {temp_task.year_value}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* View More Tasks Button */}
            <TouchableOpacity
              className="basis-1/5 w-full justify-center items-center border-solid border-[#989898] border-t rounded-t-l "
              onPress={() => navigation.navigate("Calendar")}
            >
              <View className="w-11/12 justify-between flex flex-row ">
                <Text className="text-black">View More</Text>
                <AntDesign name="right" size={15} color="black" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Campus Events Section */}
          <View className="flex h-64 rounded-xl justify-between items-center border-solid border border-[#989898] overflow-hidden mb-5">
            {/* Events Header */}
            <View className="h-10 w-full justify-center items-center bg-[#075eec] ">
              <View className="w-11/12 justify-center ">
                <Text className="text-white">Campus Events</Text>
              </View>
            </View>

            {/* Events List */}
            <View className="flex basis-3/5 w-11/12 justify-between pt-3">
              {activities.length === 0 ? (
                <View className="h-full flex justify-center items-center">
                  <Text>No Events Today</Text>
                </View>
              ) : (
                activities.slice(0, 2).map((temp_activity, index) => (
                  <View key={index} className="basis-1/2 flex flex-row mb-2">
                    <View className="basis-4/5 w-4/5 justify-start">
                      <View className="flex flex-row items-center">
                        <Text className="mb-2 font-semibold">
                          {temp_activity.title}
                        </Text>
                      </View>

                      <View className="flex flex-row items-center">
                        <Ionicons name="time-outline" size={15} color="black" />
                        <Text className="ml-2">
                          {temp_activity.start_hr_val}:
                          {temp_activity.start_min_val} {temp_activity.start_ampm_val}
                        </Text>
                      </View>
                      <View className="flex flex-row items-center">
                        <AntDesign name="calendar" size={15} color="black" />
                        <Text className="ml-2">
                          {temp_activity.day}, {temp_activity.month_value}{" "}
                          {temp_activity.day_value}, {temp_activity.year_value}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* View More Events Button */}
            <TouchableOpacity
              className="h-10 w-full justify-center items-center border-solid border-[#989898] border-t rounded-t-l "
              onPress={() => navigation.navigate("Activities")}
            >
              <View className="w-11/12 justify-between flex flex-row ">
                <Text className="text-black">Find More Events</Text>
                <AntDesign name="right" size={15} color="black" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Start Reading Button */}
          <TouchableOpacity
            className="h-1/6 justify-start items-center"
            onPress={() => navigation.navigate("Study_Room")}
          >
            <View className="w-2/4 h-2/5 bg-[#075eec] flex justify-center items-center rounded-2xl">
              <Text className="text-white">Start Reading</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
