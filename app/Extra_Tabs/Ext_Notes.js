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
  Animated,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import { BlurView } from 'expo-blur';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  deleteObject,
} from "firebase/storage";
import { storage, db } from "../../firebaseConfig";
import { useAuth } from "../../context/authContext";

const { width } = Dimensions.get('window');

const Ext_Activities = ({ route, navigation }) => {
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [course, set_course] = useState("");
  const { cur_course } = route.params;
  const [new_file_name, set_new_file_name] = useState(null);
  const [new_file_uri, set_new_file_uri] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [note_list, set_note_list] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    if (user?.userId) {
      fetchNotes();
    }
  }, [cur_course, user?.userId]);

  const handleDocumentSelection = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets[0]) {
        set_new_file_uri(result.assets[0].uri);
        set_new_file_name(result.assets[0].name);
      }
    } catch (error) {
      console.error("Error picking document: ", error);
      Alert.alert("Error", "Failed to select document. Please try again.");
    }
  };

  const uploadNote = async (uri, name) => {
    try {
      setIsLoading(true);

      if (!course.trim()) {
        Alert.alert("Error", "Please enter a note title.");
        return;
      }

      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = `${course.trim()}_${Date.now()}_${name}`;
      const storageRef = ref(
        storage,
        `Notes/${user.userId}/${cur_course}/${fileName}`
      );

      await uploadBytes(storageRef, blob);
      await fetchNotes();
      Alert.alert("Success", "Note uploaded successfully!");
    } catch (error) {
      console.error("Error uploading document: ", error);
      Alert.alert("Error", "Failed to upload document. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
      Alert.alert("Error", "Failed to load notes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const delete_note = async (note_name) => {
    try {
      setIsLoading(true);
      const noteRef = ref(
        storage,
        `Notes/${user.userId}/${cur_course}/${note_name}`
      );
      await deleteObject(noteRef);
      await fetchNotes();
      Alert.alert("Success", "Note deleted successfully!");
    } catch (error) {
      console.error("Error deleting note: ", error);
      Alert.alert("Error", "Failed to delete note. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
    <Animated.View
      key={temp_note.name}
      style={[
        styles.noteCard,
        {
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            })
          }]
        }
      ]}
    >
      <TouchableOpacity
        style={styles.noteCardContent}
        onPress={() =>
          navigation.navigate("Opened_note", {
            cur_note_uri: temp_note.url,
            note_name: temp_note.name,
          })
        }
      >
        <View style={styles.noteCardInner}>
          <View style={styles.noteCardLeft}>
            <View style={styles.iconContainer}>
              <Feather name="file-text" size={24} color="#075eec" />
            </View>
            <View style={styles.noteDetails}>
              <Text style={styles.noteTitle} numberOfLines={1}>
                {temp_note.name.split('_')[0]}
              </Text>
              <Text style={styles.noteDate}>
                {new Date(parseInt(temp_note.name.split('_')[1])).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "Delete Note",
                "Are you sure you want to delete this note?",
                [
                  { text: "Cancel", style: "cancel" },
                  { 
                    text: "Delete", 
                    onPress: () => delete_note(temp_note.name),
                    style: "destructive"
                  }
                ]
              );
            }}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Feather name="book-open" size={48} color="#CBD5E1" />
      <Text style={styles.emptyStateText}>No Notes Available</Text>
      <Text style={styles.emptyStateSubtext}>
        Tap the + button to add your first note
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {cur_course || "No Course Selected"}
          </Text>
          <Text style={styles.headerDate}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
          <Text style={styles.sectionTitle}>My Notes</Text>
        </View>

        <View style={styles.notesList}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#075eec" style={styles.loader} />
          ) : note_list.length === 0 ? (
            renderEmptyState()
          ) : (
            note_list.map((temp_note, index) => renderNoteItem(temp_note, index))
          )}
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <BlurView intensity={90} style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidView}
          >
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <AntDesign name="close" size={24} color="#1F2937" />
              </TouchableOpacity>

              <Text style={styles.modalTitle}>Add New Note</Text>

              <TextInput
                style={styles.input}
                placeholder="Note Title"
                placeholderTextColor="#94A3B8"
                onChangeText={set_course}
                value={course}
              />

              <View style={styles.fileInfo}>
                <Feather 
                  name={new_file_name ? "file-text" : "upload-cloud"} 
                  size={24} 
                  color={new_file_name ? "#075eec" : "#94A3B8"}
                  style={styles.fileIcon}
                />
                <Text style={[
                  styles.fileName,
                  !new_file_name && styles.fileNamePlaceholder
                ]}>
                  {new_file_name || "No file selected"}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.selectButton}
                onPress={handleDocumentSelection}
              >
                <Feather name="upload" size={20} color="white" />
                <Text style={styles.selectButtonText}>Select PDF File</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.addButton,
                  (!new_file_uri || !new_file_name || isLoading) && styles.buttonDisabled
                ]}
                onPress={handleAddNote}
                disabled={!new_file_uri || !new_file_name || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Feather name="plus" size={20} color="white" />
                    <Text style={styles.addButtonText}>Add Note</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </BlurView>
      </Modal>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setModalVisible(true)}
      >
        <AntDesign name="plus" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  headerDate: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#334155',
  },
  notesList: {
    padding: 16,
  },
  noteCard: {
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  noteCardContent: {
    padding: 16,
  },
  noteCardInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  noteDetails: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  noteDate: {
    fontSize: 13,
    color: '#64748B',
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#075eec',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#075eec',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidView: {
    width: '100%',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 16,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  fileIcon: {
    marginRight: 12,
  },
  fileName: {
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
  },
  fileNamePlaceholder: {
    color: '#94A3B8',
  },
  selectButton: {
    backgroundColor: '#075eec',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  selectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: '#075eec',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  loader: {
    marginTop: 32,
  },
});

export default Ext_Activities;