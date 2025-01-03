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
import {
  query,
  addDoc,
  collection,
  doc,
  where,
  deleteDoc,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
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
  const [tbd_task, set_tbd_task] = useState([]);
  const [attendee, setAttendee] = useState([]);
  const [attending, setAttending] = useState();
  const { user } = useAuth();
  async function attend_event() {
    try {
      const userRef = doc(db, "Activities", cur_event_id);
      const activityRef = collection(userRef, "Attendees");
      const existingAttendeesSnapshot = await getDocs(activityRef);
      const isDuplicateAttendee = existingAttendeesSnapshot.docs.some(
        (doc) => doc.data().email === user.email
      );
      if (isDuplicateAttendee) {
        alert("You have already registered for this event.");
        return;
      }

      await addDoc(activityRef, {
        name: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });

      const cur_userRef = doc(db, "users", user.userId);
      const cur_activityRef = collection(cur_userRef, "Activities");
      await addDoc(cur_activityRef, {
        event_id: cur_event_id,
        title: cur_title,
        start_hr: cur_start_hr,
        start_min: cur_start_min,
        start_amPm: cur_start_amPm,
        day: cur_day,
        day_num: cur_date,
        month: cur_month,
        year: cur_year,
      });

      alert("Name added to event successfully!");
    } catch (error) {
      console.error("Error adding course: ", error);
    }
  }
  async function unAttend_event() {
    const userRef = doc(db, "Activities", cur_event_id);
    const activityRef = collection(userRef, "Attendees");
    try {
      // Fetch all attendees
      const existingAttendeesSnapshot = await getDocs(activityRef);
      const userDoc = existingAttendeesSnapshot.docs.find(
        (doc) => doc.data().email === user.email
      );
      // Find the document for the current user

      if (userDoc) {
        // Delete the user's document
        await deleteDoc(userDoc.ref);
        delete_from_user();

        alert("You have been removed from the attendee list.");
      } else {
        alert("You are not registered for this event.");
      }
    } catch (error) {
      console.error("Error removing user: ", error);
    }
  }
  async function delete_from_user() {
    try {
      // Reference to the user's Activities collection
      const userRef = doc(db, "users", user.userId);
      const eventsRef = collection(userRef, "Activities");

      // Retrieve all documents from the Activities collection
      const snapshot = await getDocs(eventsRef);
      const eventsList = snapshot.docs.map((doc) => ({
        user_activity_id: doc.id, // Firestore document ID
        campus_activity_id: doc.data().event_id, // Event ID from document data
      }));

      // Loop through tasks and delete the matching document
      for (const temp_task of eventsList) {
        if (temp_task.campus_activity_id === cur_event_id) {
          // Reference to the specific document to delete
          const taskRef = doc(eventsRef, temp_task.user_activity_id);
          await deleteDoc(taskRef); // Delete the document
        }
      }
    } catch (error) {
      console.error("Error deleting activity:", error);
    }
  }

  useEffect(() => {
    const fetchAttendees = () => {
      try {
        const userRef = doc(db, "Activities", cur_event_id);
        const activityRef = collection(userRef, "Attendees"); // Reference the user document

        const unsubscribe = onSnapshot(activityRef, (snapshot) => {
          const ActivitiesList = snapshot.docs.map((doc) => ({
            name: doc.data().name,
            lastName: doc.data().lastName,
            email: doc.data().email,
          }));
          setAttendee(ActivitiesList);
          attendee.forEach((temp_attendee) => {
            if (user.email == temp_attendee.email) {
              setAttending(true);
            } else {
              setAttending(false);
            }
          });
        });

        // Clean up the listener when the component unmounts
        return unsubscribe;
      } catch (error) {
        console.error("Error fetching courses: ", error);
      }
    };

    const unsubscribe = fetchAttendees();
    return () => unsubscribe && unsubscribe(); // Clean up the listener
  }, [user.userId]);

  const [modalVisible, setModalVisible] = useState(true);
  return (
    <View className="flex h-fit bg-white">
      {/* This is the top nav bar  */}
      
      <ScrollView className="flex h-full">
        {/* This is the welcome Text and date */}
        <View className="h-screen w-screen flex justify-start items-center">
          
          <Image
                  source={require("../../assets/images/background image.jpeg")}
                  className="basis-64 w-screen bg-slate-500 "
                  resizeMode="fit"
                  alt="Logo"
                />
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
              
              <View>
                <Text className="font-semibold">Hosted By</Text>
                <Text>{cur_host}</Text>
              </View>
            </View>
            {/* Event Attendees */}
            <View className="mt-3 mb-3 h-fit flex justify-center ">
              <TouchableOpacity
                onPress={() => {
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
                      <Text className=" w-2/5">{temp_event.name} {temp_event.lastName}</Text>
                      
                      <Text className=" w-3/5"> {temp_event.email}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
            {/* Event Attend Button */}
            <View className="h-14 flex items-center">
              <View className="items-center w-36 bg-[#002b84] rounded-3xl">
                {attending == false ? (
                  <TouchableOpacity
                    onPress={async () => {
                      await attend_event(); // Wait for the event to be attended
                      setAttending(true)
                    }}
                    className="w-full justify-center items-center"
                  >
                    <View className="h-12 justify-center">
                      <Text className="text-xl font-normal text-white">
                        Attend
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={async () => {
                      await unAttend_event(); // Wait for the event to be unattended
                      setAttending(false)
                    }}
                    className="w-full justify-center items-center"
                  >
                    <View className="h-12 justify-center">
                      <Text className="text-xl font-normal text-white">
                        Un-Attend
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Ext_Activities;

const styles = StyleSheet.create({});
