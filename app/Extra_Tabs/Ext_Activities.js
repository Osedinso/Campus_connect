import {
  StyleSheet,
  Text,
  TextInput,
  Image,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import React, { useState, useEffect } from "react";
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { SimpleLineIcons } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { db } from "../../firebaseConfig";
import { addDoc, collection, doc, onSnapshot, getDocs } from "firebase/firestore";
import { useAuth } from "../../context/authContext";

const Ext_Activities = ({ route, navigation }) => {
  const {
    cur_event_id,
    cur_host_id,
    cur_title,
    cur_host,
    cur_giveaway,
    cur_location,
    cur_day,
    cur_date,
    cur_month,
    cur_year,
    cur_start_hr,
    cur_start_min,
    cur_start_amPm,
    cur_end_hr,
    cur_end_min,
    cur_end_ampm,
    cur_description,
    cur_fee,
  } = route.params;
  const [attendee, setAttendee] = useState([]);
  const { user } = useAuth();
  async function attend_event() {
    try {
      const userRef = doc(db, "Activities", cur_event_id);
      const activityRef = collection(userRef, "Attendees");
      const existingAttendeesSnapshot = await getDocs(activityRef);
      const duplicate = existingAttendeesSnapshot.docs.some(
        (doc) => doc.data().email === user.email
      );

      if (duplicate) {
        alert("You have already registered for this event.");
        return;
      }

      await addDoc(activityRef, {
        name: user.username,
        email: user.email,
      });
      alert("Course added successfully!");
    } catch (error) {
      console.error("Error adding course: ", error);
    }
  }

  useEffect(() => {
    const fetchCourses = () => {
      try {
        const userRef = doc(db, "Activities", cur_event_id);
        const activityRef = collection(userRef, "Attendees"); // Reference the user document

        // Set up a real-time listener with onSnapshot
        const unsubscribe = onSnapshot(activityRef, (snapshot) => {
          const ActivitiesList = snapshot.docs.map((doc) => ({
            name: doc.data().name,
            email: doc.data().email,
          }));
          setAttendee(ActivitiesList);
        });

        // Clean up the listener when the component unmounts
        return unsubscribe;
      } catch (error) {
        console.error("Error fetching courses: ", error);
      }
    };

    const unsubscribe = fetchCourses();
    return () => unsubscribe && unsubscribe(); // Clean up the listener
  });

  const [modalVisible, setModalVisible] = useState(true);
  return (
    <View className="flex h-fit bg-white">
      {/* This is the top nav bar  */}
      <View className=" h-12 flex  w-screen  items-center border-solid border-b bg-white border-gray-400 pb-5">
        <View className=" flex flex-row w-screen justify-start items-center">
          <View className=" h-12 w-24 items-center  justify-center flex flex-row">
            <TouchableOpacity
              onPress={() => navigation.navigate("ActivitiesScreen")}
              className=" justify-center items-center flex flex-row "
            >
              <Ionicons name="arrow-back-outline" size={24} color="black" />
              <Text className="ml-3">Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <ScrollView className="flex h-full">
        {/* This is the welcome Text and date */}
        <View className="h-screen w-screen flex justify-start items-center">
          <View className="basis-64 w-screen bg-slate-500 "></View>
          <View className=" flex flex-col h-5/6 w-11/12 ">
            {/* Event Title */}
            <View className="h-14 ">
              <Text className="text-xl font-semibold">{cur_title}</Text>
            </View>
            {/* Event Summary */}
            <View className="h-28  flex flex-row ">
              <View className="basis-1/2 ">
                <View className="basis-1/2 flex flex-row items-center">
                  <AntDesign name="calendar" size={24} color="black" />
                  <Text className="ml-3">
                    {cur_start_hr}:{cur_start_min} {cur_start_amPm} -{" "}
                    {cur_end_hr}:{cur_end_min} {cur_end_ampm}
                    {"\n"}
                    {cur_day} {cur_month} {cur_date} {cur_year}
                  </Text>
                </View>
                <View className="basis-1/2 flex flex-row items-center">
                  <AntDesign name="gift" size={24} color="black" />
                  <Text className="ml-3">{cur_giveaway}</Text>
                </View>
              </View>

              <View className="basis-1/2 ">
                <View className="basis-1/2 flex flex-row items-center">
                  <SimpleLineIcons
                    name="location-pin"
                    size={24}
                    color="black"
                  />
                  <Text className="ml-3">{cur_location}</Text>
                </View>
                <View className="basis-1/2 flex flex-row items-center">
                  <Ionicons name="cash-outline" size={24} color="black" />
                  <Text className="ml-3">{cur_fee}</Text>
                </View>
              </View>
            </View>
            {/* Event Description */}
            <View className="h-28 ">
              <Text className="font-semibold mb-2">Description</Text>
              <Text>{cur_description}</Text>
            </View>
            {/* Event Host */}
            <View className="h-14  flex flex-row">
              <View className="mr-4">
                <Image
                  source={require("../../assets/images/Ellipse 13.jpg")}
                  className="w-13 h-13"
                  resizeMode="contain"
                  alt="Logo"
                />
              </View>
              <View>
                <Text className="font-semibold">Hosted By</Text>
                <Text>{cur_host}</Text>
              </View>
            </View>
            {/* Event Attendees */}
            <View className="mt-3 mb-3 h-fit flex justify-center ">
              <TouchableOpacity
                onPress={() => {
                  console.log("Show Users");
                  setModalVisible(!modalVisible);
                }}
              >
                <Text className="font-semibold text-[#002b84]">
                  {attendee.length} Attendees
                </Text>
              </TouchableOpacity>
              {modalVisible && cur_host_id == user.userId && (
                <View className="h-20 w-full ">
                  <View className="flex flex-row justify-between">
                    <Text className="font-bold w-2/5">
                      Name <Text></Text>
                    </Text>
                    <Text className="font-bold w-3/5"> Email </Text>
                  </View>
                  {attendee.map((temp_event, index) => (
                    <View
                      className="flex flex-row justify-between"
                      key={index}
                      style={styles.eventCard}
                    >
                      <Text className=" w-2/5">{temp_event.name}</Text>
                      <Text className=" w-3/5"> {temp_event.email}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
            {/* Event Attend Button */}
            <View className="h-14 flex items-center">
              <View className="items-center w-36 bg-[#002b84] rounded-3xl">
                <TouchableOpacity
                  onPress={() => {
                    //Handel on press action
                    attend_event();
                  }}
                  className="w-full justify-center items-center"
                >
                  <View className="h-12 justify-center">
                    <Text className="text-xl font-normal text-white ">
                      Attend
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Ext_Activities;

const styles = StyleSheet.create({});
