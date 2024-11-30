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
} from "firebase/firestore";
import { useAuth } from "../../context/authContext";

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
    const fetchCourses = () => {
      try {
        const userRef_task = doc(db, "users", user.userId);
        const eventsRef_task = collection(userRef_task, "Tasks");

        // Set up a real-time listener with onSnapshot
        const unsubscribe_task = onSnapshot(eventsRef_task, (snapshot) => {
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

          setTasks(tasksList);

          tasks.sort((a, b) => new Date(a.full_date) - new Date(b.full_date));
        });

        const userRef_activity = doc(db, "users", user.userId);
        const eventsRef_activity = collection(userRef_activity, "Activities");

        // Set up a real-time listener with onSnapshot
        const unsubscribe_activity = onSnapshot(
          eventsRef_activity,
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

            setActivities(activityList);
            tasks.sort((a, b) => new Date(a.full_date) - new Date(b.full_date));
          }
        );

        // Clean up the listener when the component unmounts
        return unsubscribe;
      } catch (error) {
        console.error("Error fetching courses: ", error);
      }
    };

    const unsubscribe = fetchCourses();
    return () => unsubscribe && unsubscribe(); // Clean up the listener
  });
  return (
    <ScrollView className="flex basis-4/5 bg-white ">
      {/* This is the welcome Text and date */}
      <View className="basis-1/4 w-screen flex justify-center items-center ">
        <View className=" flex flex-col w-11/12 justify-end items-start mt-3 mb-4">
          <Text className=" text-3xl text-left">Hi {user?.username || "Guest"}</Text>
          <Text className="mt-3 text-sm">{formattedDate}</Text>
        </View>
      </View>
      {/* This class contains the dashboard, todays task, and on-campus live events */}
      <View className=" basis-2/3 w-screen h-screen items-center  ">
        <View className="flex  w-11/12 h-full justify-start">
          <View className="flex basis-1/12 flex-row items-center justify-between ">
            <Text className="text-base font-medium">DashBoard</Text>
            <AntDesign name="ellipsis1" size={24} color="black" />
          </View>
          {/* Todays task and Live events on campus */}
          {/* Today's Tasks */}
          <View className="flex  h-64 rounded-xl  justify-between items-center border-solid border border-[#989898] overflow-hidden mb-5">
            {/* The code below is for the Todays task header */}
            <View className="basis-1/5 w-full justify-center items-center bg-[#075eec] ">
              <View className="w-11/12 justify-center ">
                <Text className="text-white">Personal Task</Text>
              </View>
            </View>
            {/* Tasks view below shows the 2 task in todays tasks */}

            <View className="  flex basis-3/5  w-11/12 justify-between pt-3 ">
              {tasks.length === 0 ? (
                <View className=" h-full flex justify-center items-center">
                  <Text className=" ">No task today</Text>
                </View>
              ) : (
                tasks.slice(0, 2).map((temp_task, index) => (
                  <View className="basis-1/2  flex flex-row">
                    <View className="basis-4/5 w-4/5 justify-start">
                      <View className="flex flex-row items-center">
                        <Text className="mb-2 font-semibold">
                          {temp_task.title}
                        </Text>
                      </View>

                      <View className="flex flex-row items-center">
                        <Ionicons name="time-outline" size={15} color="black" />
                        <Text className="ml-2 ">
                          {temp_task.start_hr_val}:{temp_task.start_min_val}{" "}
                          {temp_task.start_ampm_val}
                        </Text>
                      </View>
                      <View className="flex flex-row items-center">
                        <AntDesign name="calendar" size={15} color="black" />
                        <Text className="ml-2 ">
                          {temp_task.day}, {temp_task.month_value}{" "}
                          {temp_task.day_value}, {temp_task.year_value}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* This code below is for the View more button */}

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
          {/* Live Events on Campus */}
          <View className="flex  h-64 rounded-xl  justify-between items-center border-solid border border-[#989898] overflow-hidden mb-5">
            {/* The code below is for the Todays task header */}
            <View className="h-10 w-full justify-center items-center bg-[#075eec] ">
              <View className="w-11/12 justify-center ">
                <Text className="text-white">Campus Events</Text>
              </View>
            </View>
            {/* Tasks view below shows the 2 task in todays tasks */}

            <View className="  flex basis-3/5  w-11/12 justify-between pt-3 ">
              {activities.length === 0 ? (
                <View className=" h-full flex justify-center items-center">
                  <Text className=" ">No Events Today</Text>
                </View>
              ) : (
                activities.slice(0, 2).map((temp_activity, index) => (
                  <View className="basis-1/2  flex flex-row">
                    <View className="basis-4/5 w-4/5 justify-start">
                      <View className="flex flex-row items-center">
                        <Text className="mb-2 font-semibold">
                          {temp_activity.title}
                        </Text>
                      </View>

                      <View className="flex flex-row items-center">
                        <Ionicons name="time-outline" size={15} color="black" />
                        <Text className="ml-2 ">
                          {temp_activity.start_hr_val}:
                          {temp_activity.start_min_val}{" "}
                          {temp_activity.start_ampm_val}
                        </Text>
                      </View>
                      <View className="flex flex-row items-center">
                        <AntDesign name="calendar" size={15} color="black" />
                        <Text className="ml-2 ">
                          {temp_activity.day}, {temp_activity.month_value}{" "}
                          {temp_activity.day_value}, {temp_activity.year_value}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* This code below is for the View more button */}
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
          {/*  Start Reading Button*/}
          <TouchableOpacity
            className=" h-1/6 justify-start items-center "
            onPress={() => navigation.navigate("Study_Room")}
          >
            <View className="w-2/4 h-2/5 bg-[#075eec] flex justify-center items-center  rounded-2xl">
              <Text className="text-white">Start Reading</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({});
