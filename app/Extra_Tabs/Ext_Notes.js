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
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  deleteObject,
} from "firebase/storage";
import { storage, db } from "../../firebaseConfig";
import { useAuth } from "../../context/authContext";

const Ext_Activities = ({ route, navigation }) => {
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [course, set_course] = useState("");
  const { cur_course } = route.params;
  const [new_file_name, set_new_file_name] = useState(null);
  const [new_file_uri, set_new_file_uri] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [note_list, set_note_list] = useState([]);

  /**
   * Handles the document selection process.
   */
  const handleDocumentSelection = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      console.log("DocumentPicker result: ", result);

      if (result.assets && result.assets[0]) {
        set_new_file_uri(result.assets[0].uri);
        set_new_file_name(result.assets[0].name);
      } else {
        console.log("Document selection cancelled");
      }
    } catch (error) {
      console.error("Error picking document: ", error);
      Alert.alert("Error", "Failed to pick document.");
    }
  };

  /**
   * Uploads the selected note to Firebase Storage.
   */
  const uploadNote = async (uri, name) => {
    try {
      setIsLoading(true);

      if (!course.trim()) {
        Alert.alert("Error", "Please enter a course name.");
        return;
      }

      const response = await fetch(uri);
      const blob = await response.blob();

      const storageRef = ref(
        storage,
        `Notes/${user.userId}/${cur_course}/${course.trim()}_${Date.now()}_${name}`
      );

      await uploadBytes(storageRef, blob);
      console.log("File uploaded successfully");

      await fetchNotes();
      Alert.alert("Success", "Note uploaded successfully.");
    } catch (error) {
      console.error("Error uploading document: ", error);
      Alert.alert("Error", "Failed to upload document.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetches all notes from Firebase Storage.
   */
  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const notesRef = ref(storage, `Notes/${user.userId}/${cur_course}`);
      const result = await listAll(notesRef);

      const notesPromises = result.items.map(async (fileRef) => {
        const url = await getDownloadURL(fileRef);
        return { name: fileRef.name, url };
      });

      const notes = await Promise.all(notesPromises);
      set_note_list(notes);
    } catch (error) {
      console.error("Error fetching notes: ", error);
      Alert.alert("Error", "Failed to fetch notes.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Deletes a specific note.
   */
  const delete_note = async (note_name) => {
    try {
      const noteRef = ref(
        storage,
        `Notes/${user.userId}/${cur_course}/${note_name}`
      );
      await deleteObject(noteRef);
      console.log("Note deleted successfully");
      await fetchNotes();
      Alert.alert("Success", "Note deleted successfully.");
    } catch (error) {
      console.error("Error deleting note: ", error);
      Alert.alert("Error", "Failed to delete note.");
    }
  };

  useEffect(() => {
    if (!user?.userId) return;
    fetchNotes();
  }, [cur_course, user?.userId]);

  const handleAddNote = () => {
    if (!new_file_uri || !new_file_name) {
      Alert.alert("Error", "Please select a file first.");
      return;
    }

    uploadNote(new_file_uri, new_file_name);
    setModalVisible(false);
    set_new_file_uri(null);
    set_new_file_name(null);
    set_course("");
  };

  const renderNoteItem = (temp_note, index) => (
    <View
      key={temp_note.name}
      style={styles.eventCard}
      className="flex basis-20 rounded-xl justify-center items-center border-solid border border-[#989898] overflow-hidden mb-5"
    >
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("Opened_note", {
            cur_note_uri: temp_note.url,
            note_name: temp_note.name,
          })
        }
      >
        <View className="flex basis-3/5 w-11/12 justify-center between items-center">
          <View className="flex flex-row items-center">
            <View className="justify-start mr-3">
              <Feather name="book" size={24} color="black" />
            </View>
            <View className="basis-4/5 w-4/5 justify-start">
              <Text className="text-xl">{temp_note.name}</Text>
            </View>
            <TouchableOpacity
              onPress={() => delete_note(temp_note.name)}
              className="flex items-end"
            >
              <Ionicons name="trash-outline" size={20} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView className="flex basis-4/5 bg-white">
        <View className="basis-1/4 w-screen flex justify-center items-center">
          <View className="flex flex-col w-11/12 justify-end items-start mt-3 mb-4">
            <Text className="text-3xl text-left">
              {cur_course || "No Course Selected"}
            </Text>
            <Text className="mt-3 text-sm">
              {new Date().toLocaleDateString()}
            </Text>
            <Text className="mt-5 text-base font-medium">My Notes</Text>
          </View>
        </View>

        <View className="w-full h-fit flex items-center">
          <View className="basis-2/3 w-screen h-screen items-center">
            <View className="flex w-11/12 h-full justify-start">
              {isLoading ? (
                <ActivityIndicator size="large" color="#075eec" />
              ) : note_list.length === 0 ? (
                <View
                  key="no_notes"
                  style={styles.eventCard}
                  className="flex basis-20 rounded-xl justify-center items-center border-solid border border-[#989898] overflow-hidden mb-5"
                >
                  <View className="flex basis-3/5 w-11/12 justify-center between items-center">
                    <Text className="text-xl">No Notes Available</Text>
                  </View>
                </View>
              ) : (
                note_list.map((temp_note, index) =>
                  renderNoteItem(temp_note, index)
                )
              )}
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

              <Text style={styles.modalTitle}>Add New Note</Text>

              <TextInput
                style={styles.input}
                placeholder="Course Name (e.g CSCI 289)"
                placeholderTextColor="#B2ACAC"
                onChangeText={(text) => set_course(text)}
                value={course}
              />

              <View className="flex h-10 w-fit justify-center items-start">
                <Text>{new_file_name || "No file selected."}</Text>
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleDocumentSelection}
              >
                <Text style={styles.submitButtonText}>Select File</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!new_file_uri || !new_file_name || isLoading) ? styles.buttonDisabled : {},
                ]}
                onPress={handleAddNote}
                disabled={!new_file_uri || !new_file_name || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>Add Note</Text>
                )}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
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
    textAlign: "center",
    color: "#1F2937",
  },
  input: {
    borderWidth: 1,
    borderColor: "#B2ACAC",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
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
  buttonDisabled: {
    backgroundColor: "#A0AEC0",
  },
  eventCard: {
    width: "100%",
    padding: 10,
  },
});

export default Ext_Activities;