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
  Dimensions,
  Animated,
} from "react-native";
import ColorPicker from "react-native-wheel-color-picker";
import React, { useState, useEffect, useRef } from "react";
import {
  AntDesign,
  Feather,
  Ionicons,
  MaterialIcons,
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
import { BlurView } from "expo-blur";

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.4;
const CARD_MARGIN = width * 0.025;

const Activites = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [course, set_course] = useState(null);
  const [color, setColor] = useState("#6871FF");
  const [class_list, set_class_list] = useState([]);
  const { user } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  async function submit_form() {
    if (!user?.userId || !course?.trim()) {
      alert("Please enter a course name");
      return;
    }
    try {
      const userRef = doc(db, "users", user?.userId);
      const coursesRef = collection(userRef, "Courses");
      await addDoc(coursesRef, {
        name: course,
        color: color,
      });
      alert("Course added successfully!");
      set_course(null);
      setColor("#6871FF");
    } catch (error) {
      console.error("Error adding course: ", error);
      alert("Failed to add course. Please try again.");
    }
  }

  const confirmDelete = (courseId) => {
    setCourseToDelete(courseId);
    setDeleteModalVisible(true);
  };

  async function delete_course(course_id) {
    try {
      const userRef = doc(db, "users", user.userId);
      const courseRef = doc(collection(userRef, "Courses"), course_id);
      await deleteDoc(courseRef);
      setDeleteModalVisible(false);
      setCourseToDelete(null);
    } catch (error) {
      console.error("Error deleting course: ", error);
      alert("Failed to delete course. Please try again.");
    }
  }

  useEffect(() => {
    const fetchCourses = () => {
      if (user?.userId) {
        try {
          const userRef = doc(db, "users", user.userId);
          const coursesRef = collection(userRef, "Courses");
          const unsubscribe = onSnapshot(coursesRef, (snapshot) => {
            const coursesList = snapshot.docs.map((doc) => ({
              id: doc.id,
              course: doc.data().name,
              color: doc.data().color,
            }));
            set_class_list(coursesList);
          });
          return unsubscribe;
        } catch (error) {
          console.error("Error fetching courses: ", error);
        }
      }
    };

    const unsubscribe = fetchCourses();
    return () => unsubscribe && unsubscribe();
  }, [user?.userId]);

  const renderCourseCard = (temp_course, index) => (
    <Animated.View
      key={temp_course.id}
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.card, { backgroundColor: temp_course.color }]}
        onPress={() =>
          navigation.navigate("ExtNotes", {
            cur_course: temp_course.course,
            cur_course_id: temp_course.id,
          })
        }
      >
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => confirmDelete(temp_course.id)}
        >
          <MaterialIcons name="delete-outline" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.cardContent}>
          <Image
            source={require("../../assets/images/study_ico.png")}
            style={styles.courseIcon}
            resizeMode="contain"
          />
          <Text style={styles.courseText}>{temp_course.course}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Study Room</Text>
          <Text style={styles.date}>{formattedDate}</Text>
          <Text style={styles.subtitle}>Courses</Text>
        </View>

        <View style={styles.courseGrid}>
          {class_list.map((course, index) => renderCourseCard(course, index))}
        </View>
      </ScrollView>

      {/* Add Course Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <BlurView intensity={90} style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoid}
          >
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <AntDesign name="close" size={24} color="#333" />
              </TouchableOpacity>

              <Text style={styles.modalTitle}>Add New Course</Text>

              <TextInput
                style={styles.input}
                placeholder="Course Name (e.g., CSCI 410)"
                placeholderTextColor="#999"
                value={course}
                onChangeText={set_course}
              />

              <View style={styles.colorPickerContainer}>
                <Text style={styles.colorPickerLabel}>Choose Course Color</Text>
                <ColorPicker
                  color={color}
                  onColorChange={setColor}
                  thumbSize={40}
                  sliderSize={40}
                  noSnap={true}
                  row={false}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, !course?.trim() && styles.buttonDisabled]}
                onPress={() => {
                  submit_form();
                  setModalVisible(false);
                }}
                disabled={!course?.trim()}
              >
                <Text style={styles.submitButtonText}>Add Course</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </BlurView>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <BlurView intensity={90} style={styles.modalContainer}>
          <View style={styles.deleteModalContent}>
            <Text style={styles.deleteModalTitle}>Delete Course</Text>
            <Text style={styles.deleteModalText}>
              Are you sure you want to delete this course? This action cannot be undone.
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.confirmButton]}
                onPress={() => delete_course(courseToDelete)}
              >
                <Text style={styles.confirmButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setModalVisible(true)}
      >
        <AntDesign name="plus" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 24,
  },
  courseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: CARD_WIDTH,
    margin: CARD_MARGIN,
  },
  card: {
    height: CARD_WIDTH * 1.2,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    alignSelf: 'flex-end',
  },
  courseIcon: {
    width: CARD_WIDTH * 0.4,
    height: CARD_WIDTH * 0.4,
    marginBottom: 12,
  },
  courseText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#075eec',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoid: {
    width: '100%',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
    marginBottom: 24,
  },
  colorPickerContainer: {
    marginBottom: 24,
  },
  colorPickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#075eec',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#A0AEC0',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  deleteModalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  deleteModalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#F8F9FA',
  },
  confirmButton: {
    backgroundColor: '#DC3545',
  },
  cancelButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Activites;