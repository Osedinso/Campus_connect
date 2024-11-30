import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import { ref, uploadBytes, getDownloadURL, listAll,deleteObject } from "firebase/storage";
import { storage, db } from "../../firebaseConfig";
import { useAuth } from "../../context/authContext";

const Ext_Activities = ({ route, navigation }) => {
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [course, set_course] = useState(null);
  const { cur_course } = route.params;
  const [new_file_name, set_new_file_name] = useState(null);
  const [new_file_uri, set_new_file_uri] = useState(null);

  const [note_list, set_note_list] = useState([
    {
      note: "CSCI 410",
    },
  ]);
  const handleDocumentSelection = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf", // you can change this for different file types
      });
      set_new_file_uri(result);
      set_new_file_name(result.assets[0].name);

    } catch (error) {
      console.error("Error picking document: ", error);
    }
  };
  const uploadNote = async (result) => {
    try {
      if(course === null){
        set_course(result.assets[0].name)
      }
      const response = await fetch(result.assets[0].uri);
      const blob = await response.blob();

      // Create a storage reference with user ID and course name
      const storageRef = ref(
        storage,
        `Notes/${user.userId}/${cur_course}/${course}`
      );

      // Upload the blob to Firebase Storage
      await uploadBytes(storageRef, blob);
      console.log("File uploaded successfully");
    } catch (error) {
      console.error("Error picking document: ", error);
    }
  };
  const fetchNotes = async () => {
    try {
      const notesRef = ref(storage, `Notes/${user.userId}/${cur_course}`);

      // List all items in the directory
      const result = await listAll(notesRef);

      // Fetch download URLs for each file
      const notesPromises = result.items.map(async (fileRef) => {
        const url = await getDownloadURL(fileRef);
        return { name: fileRef.name, url };
      });
      
      // Wait for all download URLs to be fetched
      const notes = await Promise.all(notesPromises);

      // Update the note_list state with the fetched notes

      set_note_list(notes);
    } catch (error) {
      console.error("Error fetching notes: ", error);
    }
  };
  async function delete_note(note_name){
    const noteRef = ref(storage, `Notes/${user.userId}/${cur_course}/${note_name}`);
    await deleteObject(noteRef);
    await fetchNotes();
  }
  useEffect(() => {
    fetchNotes();
  }, [cur_course]);

  return (
    <SafeAreaView className="flex h-screen bg-white">
      {/* This is the top nav bar  */}
      {/* <View className=" h-12 flex  w-screen  items-center border-solid border-b bg-white border-gray-400 pb-5">
        <View className=" flex flex-row w-screen justify-start items-center">
          <View className=" h-12 w-24 items-center  justify-center flex flex-row">
            <TouchableOpacity
              onPress={() => navigation.navigate("Study_Room")}
              className=" justify-center items-center flex flex-row"
            >
              <Ionicons name="arrow-back-outline" size={24} color="black" />
              <Text className="ml-3">Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View> */}
      <ScrollView className="flex basis-4/5 bg-white ">
        {/* This is the welcome Text and date */}
        <View className="basis-1/4 w-screen flex justify-center items-center ">
          <View className=" flex flex-col w-11/12 justify-end items-start mt-3 mb-4">
            <Text className=" text-3xl text-left">{cur_course}</Text>
            <Text className="mt-3 text-sm">June 04, 2024</Text>
            <Text className="mt-5 text-base font-medium">My Notes</Text>
          </View>
        </View>
        {/*This view contains all the notes available to this particular student */}
        <View className="w-full h-fit  flex items-center">
          <View className=" basis-2/3 w-screen h-screen items-center  ">
            <View className="flex  w-11/12 h-full justify-start">
              {/* Todays task and Live events on campus */}
              {/* Today's Tasks */}
              {note_list.map((temp_note, index) => {
                return (
                  <View
                    key={index}
                    style={styles.eventCard}
                    className="flex  basis-20 rounded-xl  justify-center items-center border-solid border border-[#989898] overflow-hidden mb-5"
                  >
                    {/* Tasks view below shows the 2 task in todays tasks */}
                    <TouchableOpacity  onPress={() => navigation.navigate("Opened_note", 
                      {cur_note_uri:temp_note.url}
                    )}>
                      <View className="  flex basis-3/5 w-11/12 justify-center between items-center  ">
                        <View className="basis-full  flex flex-row items-center ">
                          <View className="justify-start mr-3">
                            <Feather name="book" size={24} color="black" />
                          </View>
                          <View className="basis-4/5 w-4/5 justify-start">
                            <Text className="text-xl">{temp_note.name}</Text>
                          </View>
                          <TouchableOpacity
                              onPress={() => delete_note(temp_note.name)}
                              className="flex items-end "
                            >
                              <Ionicons
                                name="trash-outline"
                                size={20}
                                color="black"
                              />
                            </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
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
              <View className="flex h-10 w-fit justify-center items-start ">
                <Text className="">{new_file_name}</Text>
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => {
                  handleDocumentSelection();
                }}
              >
                <Text style={styles.submitButtonText}>Select File</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => {
                  uploadNote(new_file_uri);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.submitButtonText}>Add Note</Text>
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
    </SafeAreaView>
  );
};

export default Ext_Activities;

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 200,
    width: 60,
    backgroundColor: "#B2ACAC",
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
});
