import {
  StyleSheet,
  Text,
  TextInput,
  Image,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import ColorPicker from "react-native-wheel-color-picker";

import React, { useState, useEffect } from "react";

import {
  AntDesign,
  Feather,
  Ionicons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { db } from "../../firebaseConfig";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";
import { useAuth } from "../../context/authContext";

const Activites = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [course, set_course] = useState(null);
  const [color, setColor] = useState("#fff");
  const [class_list, set_class_list] = useState([
    { course: "CSCI 410" },
    { course: "CSCI 210" },
  ]);
  const { user } = useAuth();

  async function submit_form() {
    if (user?.userId === "" || !course) return;
    try {
      const userRef = doc(db, "users", user?.userId);
      const coursesRef = collection(userRef, "Courses");
      await addDoc(coursesRef, {
        name: course,
        color: color,
      });
      alert("Course added successfully!");
    } catch (error) {
      console.error("Error adding course: ", error);
    }
  }
  async function delete_course(course_id) {
    try {
      console.log(course_id)
      // Delete the document
      const userRef = doc(db, "users", user.userId);
      const courseRef = doc(collection(userRef, "Courses"), course_id);
      console.log(courseRef)
      await deleteDoc(courseRef);
      console.log("Event deleted successfully!");
    } catch (error) {
      console.error("Error deleting event: ", error);
    }
  }
  useEffect(() => {
    const fetchCourses = () => {
      if (user?.userId) {
        try {
          const userRef = doc(db, "users", user.userId);
          const coursesRef = collection(userRef, "Courses");

          // Set up a real-time listener with onSnapshot
          const unsubscribe = onSnapshot(coursesRef, (snapshot) => {
            const coursesList = snapshot.docs.map((doc) => ({
              id:doc.id,
              course: doc.data().name,
              color: doc.data().color,
            }));
            set_class_list(coursesList);
          });

          // Clean up the listener when the component unmounts
          return unsubscribe;
        } catch (error) {
          console.error("Error fetching courses: ", error);
        }
      }
    };

    const unsubscribe = fetchCourses();
    return () => unsubscribe && unsubscribe(); // Clean up the listener
  }, [user?.userId]);
  return (
    <View className="flex h-screen bg-white">
      {/* This is the top nav bar  */}
      <ScrollView className="flex basis-4/5 bg-white ">
        {/* This is the welcome Text and date */}
        <View className="basis-1/4 w-screen flex justify-center items-center ">
          <View className=" flex flex-col w-11/12 justify-end items-start mt-3 mb-4">
            <Text className=" text-3xl text-left">Study Room</Text>
            <Text className="mt-3 text-sm">June 04, 2024</Text>
            <Text className="mt-5 text-base font-medium">Courses</Text>
          </View>
        </View>
        {/*This view contains all the notes available to this particular student */}
        <View className="w-full h-fit  flex items-center">
          <View className=" basis-2/3 w-screen h-screen items-center  ">
            <View className="flex  w-11/12 h-full justify-start flex-row">
              {/*Notes Row 1 */}
              <View className=" h-full w-1/2 flex items-center">
                {class_list.map((temp_course, index) => {
                  if (index % 2 == 0) {
                    return (
                      <View key={index} className="mb-5">
                        {/* Tasks view below shows the 2 task in todays tasks */}

                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate("ExtNotes", {
                              cur_course: temp_course.course,
                            })
                          }
                        >
                          <View
                            className=" flex justify-evenly items-center w-40 h-40 bg-[#6871FF] rounded-lg border border-gray-400"
                            style={{
                              backgroundColor: temp_course.color,
                            }}
                          >
                            <TouchableOpacity
                              onPress={() => delete_course(temp_course.id)}
                              className="flex w-4/5 items-end "
                            >
                              <Ionicons
                                name="trash-outline"
                                size={20}
                                color="white"
                              />
                            </TouchableOpacity>
                            <View>
                              <Image
                                source={require("../../assets/images/study_ico.png")}
                                className="self-center  w-16 h-16 "
                                resizeMode="contain"
                                alt="Logo"
                              />
                              <Text className="text-white mt-2 font-bold">
                                {temp_course.course}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      </View>
                    );
                  }
                })}
              </View>
              {/*Notes row 2*/}
              <View className=" h-full w-1/2 items-center">
                {class_list.map((temp_course, index) => {
                  if (index % 2 != 0) {
                    return (
                      <View key={index} className="mb-5">
                        {/* Tasks view below shows the 2 task in todays tasks */}

                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate("ext_notes", {
                              cur_course: temp_course.course,
                              cur_course_id:temp_course.id
                            })
                          }
                        >
                          <View
                            className=" flex justify-center items-center w-40 h-40  rounded-lg border border-gray-400"
                            style={{
                              backgroundColor: temp_course.color,
                            }}
                          >
                            <Image
                              source={require("../../assets/images/study_ico.png")}
                              className="self-center  w-16 h-16 "
                              resizeMode="contain"
                              alt="Logo"
                            />
                            <Text className="text-white mt-2 font-bold">
                              {temp_course.course}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    );
                  }
                })}
              </View>
              {/* Todays task and Live events on campus */}
              {/* Today's Tasks */}
            </View>
          </View>
        </View>
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <ScrollView>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <AntDesign name="close" size={20} color="black" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Add New Class</Text>
              <TextInput
                style={styles.input}
                placeholder="Course Name (e.g CSCI 289)"
                placeholderTextColor="#B2ACAC"
                onChangeText={(text) => set_course(text)}
              />
              <ColorPicker
                color={color}
                onColorChange={(color) => setColor(color)}
                thumbSize={30}
                sliderSize={30}
                noSnap={true}
                row={false}
              />

              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => {
                  submit_form();
                  setModalVisible(false);
                }}
              >
                <Text style={styles.submitButtonText}>Add Event</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setModalVisible(true)}
      >
        <AntDesign name="plus" size={40} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default Activites;

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 200,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#075eec",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  closeButton: {
    alignSelf: "flex-end",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#B2ACAC",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  submitButton: {
    backgroundColor: "#075eec",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  container: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
  },
});
