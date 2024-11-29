import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Dropdown } from "react-native-element-dropdown";
import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
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

const App = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selected_day, set_selected_day] = useState(null);
  const [events, setEvents] = useState([
    {
      title: "Breakfast with Drake",
      location: "Moodle Submission",
      month_value: "Oct",
      day: "Sat",
      day_value: "15",
      year_value: "2024",
      start_hr_val: "5",
      start_min_val: "30",
      start_ampm_val: "PM",
      checked: false,
    },
  ]);
  const { user } = useAuth();
  const [tasked_day, set_tasked_day] = useState([]);
  const [title, set_title] = useState(null);
  const [location, set_location] = useState(null);
  const [day_value, setDay] = useState(null);
  const [month_value, setMonth] = useState(null);
  const [year_value, setYear] = useState(null);
  const [start_hr_val, set_start_hr] = useState(null);
  const [start_min_val, set_start_min] = useState(null);
  const [start_ampm_val, set_start_ampm] = useState(null);
  const [checked, set_checked] = useState(false);

  const months = [
    { label: "Jan", value: "01" },
    { label: "Feb", value: "02" },
    { label: "Mar", value: "03" },
    { label: "Apr", value: "04" },
    { label: "May", value: "05" },
    { label: "Jun", value: "06" },
    { label: "Jul", value: "07" },
    { label: "Aug", value: "08" },
    { label: "Sep", value: "09" },
    { label: "Oct", value: "10" },
    { label: "Nov", value: "11" },
    { label: "Dec", value: "12" },
  ];
  const daysOfMonth = Array.from({ length: 31 }, (_, i) => ({
    label: String(i + 1).padStart(2, "0"),
    value: String(i + 1).padStart(2, "0"),
  }));
  const years = [
    { label: "2024", value: "2024" },
    { label: "2025", value: "2025" },
    { label: "2026", value: "2026" },
    { label: "2027", value: "2027" },
    { label: "2028", value: "2028" },
    { label: "2029", value: "2029" },
    { label: "2030", value: "2030" },
  ];
  const minutes = Array.from({ length: 12 }, (_, i) => ({
    label: String(i * 5).padStart(2, "0"),
    value: String(i * 5).padStart(2, "0"),
  }));
  const hours = Array.from({ length: 12 }, (_, i) => ({
    label: String(i + 1).padStart(2, "0"),
    value: String(i + 1).padStart(2, "0"),
  }));
  const amPm = [
    { label: "AM", value: "AM" },
    { label: "PM", value: "PM" },
  ];

  const [markedDates, setMarkedDates] = useState({});
  const [temp_selected_day, set_temp_selected_day] = useState({});

  function find_day(day, month, year) {
    const date = new Date(year, month - 1, day);
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return daysOfWeek[date.getDay()];
  }

  const toggleChecked = (index) => {
    const updatedEvents = events.map((event, i) =>
      i === index ? { ...event, checked: !event.checked } : event
    );
    setEvents(updatedEvents);
  };

  async function submit_form() {
    const month = months.find((month) => month.label === month_value);
    const day = find_day(
      parseInt(day_value),
      parseInt(month.value),
      parseInt(year_value)
    );
    const new_tasked_day = year_value + "-" + month.value + "-" + day_value;

    if (user?.userId === "") return;
    try {
      const userRef = doc(db, "users", user?.userId);
      const eventRef = collection(userRef, "Tasks");
      await addDoc(eventRef, {
        title: title,
        location: location,
        month_value: month_value,
        day: day,
        day_value: day_value,
        year_value: year_value,
        start_hr_val: start_hr_val,
        start_min_val: start_min_val,
        start_ampm_val: start_ampm_val,
        checked: checked,
        new_tasked_day: new_tasked_day,
      });
      alert("Task added successfully!");
    } catch (error) {
      console.error("Error adding course: ", error);
    }
  }
  async function delete_task(task_tbd) {
    try {
      const userRef = doc(db, "users", user.userId);
      const taskRef = doc(collection(userRef, "Tasks"), task_tbd);
      await deleteDoc(taskRef);
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
          const eventsRef = collection(userRef, "Tasks");

          // Set up a real-time listener with onSnapshot
          const unsubscribe = onSnapshot(eventsRef, (snapshot) => {
            const eventsList = snapshot.docs.map((doc) => ({
              id: doc.id,
              title: doc.data().title,
              location: doc.data().location,
              month_value: doc.data().month_value,
              day: doc.data().day,
              day_value: doc.data().day_value,
              year_value: doc.data().year_value,
              start_hr_val: doc.data().start_hr_val,
              start_min_val: doc.data().start_min_val,
              start_ampm_val: doc.data().start_ampm_val,
              checked: doc.data().checked,
            }));
            const tasked_days = snapshot.docs.map((doc) => ({
              new_tasked_day: doc.data().new_tasked_day,
            }));

            setEvents(eventsList);
            set_tasked_day(tasked_days);
          });

          // Clean up the listener when the component unmounts
          return unsubscribe;
        } catch (error) {
          console.error("Error fetching courses: ", error);
        }
      }
    };

    const unsubscribe = fetchCourses();
    return () => unsubscribe && unsubscribe();
  }, []);

  useEffect(() => {
    // Set marked dates when tasked_day is updated
    if (tasked_day.length > 0) {
      const newMarkedDates = {};
      tasked_day.forEach((date) => {
        newMarkedDates[date.new_tasked_day] = {
          marked: true,
          dotColor: "#075eec",
        };
      });
      setMarkedDates(newMarkedDates);
    }
  }, [tasked_day]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Calendar
          style={styles.calendar}
          theme={{
            backgroundColor: "#ffffff",
            calendarBackground: "#ffffff",
            textSectionTitleColor: "#2d4150",
            selectedDayBackgroundColor: "#00adf5",
            selectedDayTextColor: "#ffffff",
            todayTextColor: "#075eec",
            dayTextColor: "#2d4150",
            textDisabledColor: "#d3d3d3",
            arrowColor: "#075eec",
          }}
          markedDates={{ ...markedDates, ...temp_selected_day }}
          onDayPress={(day) => {
            set_selected_day(day.day);
            updatedMarkedDates = {
              [day.dateString]: { selected: true, selectedColor: "blue" },
            };
            set_temp_selected_day(updatedMarkedDates);
          }}
        />
        <View style={styles.eventsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Activities</Text>
          </View>
          <ScrollView style={styles.eventsList}>
            {events.filter(
              (event) => selected_day === parseFloat(event.day_value)
            ).length === 0 ? (
              // Display "No task today" if there are no matching tasks
              <Text style={styles.noTaskText}>No task today</Text>
            ) : (
              // Display tasks that match the selected day
              events.map((temp_event, index) => {
                if (selected_day === parseFloat(temp_event.day_value)) {
                  return (
                    <View
                      key={index}
                      className="flex flex-row justify-between border-b  border-[#e0e0e0]"
                    >
                      <View style={styles.eventCard}>
                        <TouchableOpacity onPress={() => toggleChecked(index)}>
                          {temp_event.checked ? (
                            <Feather
                              name="check-circle"
                              size={20}
                              color="black"
                            />
                          ) : (
                            <Feather name="circle" size={20} color="black" />
                          )}
                        </TouchableOpacity>
                        <View style={styles.eventDetails}>
                          <Text style={styles.eventTitle}>
                            {temp_event.title}
                          </Text>
                          <View style={styles.eventInfo}>
                            <Ionicons
                              name="time-outline"
                              size={15}
                              color="black"
                            />
                            <Text>
                              {temp_event.day}, {temp_event.start_hr_val}:
                              {temp_event.start_min_val}{" "}
                              {temp_event.start_ampm_val}
                            </Text>
                          </View>
                          <View style={styles.eventInfo}>
                            <SimpleLineIcons
                              name="location-pin"
                              size={15}
                              color="black"
                            />
                            <Text>{temp_event.location}</Text>
                          </View>
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={() => delete_task(temp_event.id)}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={15}
                          color="black"
                        />
                      </TouchableOpacity>
                    </View>
                  );
                }
                return null;
              })
            )}
          </ScrollView>
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
              <Text style={styles.modalTitle}>Create Your Event</Text>
              <TextInput
                style={styles.input}
                placeholder="Event Title"
                placeholderTextColor="#B2ACAC"
                onChangeText={(text) => set_title(text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Event Location"
                placeholderTextColor="#B2ACAC"
                onChangeText={(text) => set_location(text)}
              />
              <Text style={styles.label}>Event Date</Text>
              <View style={styles.dateContainer}>
                <Dropdown
                  style={styles.dropdown}
                  data={daysOfMonth}
                  labelField="label"
                  valueField="value"
                  placeholder="Day"
                  value={day_value}
                  onChange={(item) => setDay(item.value)}
                />
                <Dropdown
                  style={styles.dropdown}
                  data={months}
                  labelField="label"
                  valueField="value"
                  placeholder="Month"
                  value={month_value}
                  onChange={(item) => setMonth(item.label)}
                />
                <Dropdown
                  style={styles.dropdown}
                  data={years}
                  labelField="label"
                  valueField="value"
                  placeholder="Year"
                  value={year_value}
                  onChange={(item) => setYear(item.value)}
                />
              </View>
              <Text style={styles.label}>Start Time</Text>
              <View style={styles.timeContainer}>
                <Dropdown
                  style={styles.dropdown}
                  data={hours}
                  labelField="label"
                  valueField="value"
                  placeholder="Hour"
                  value={start_hr_val}
                  onChange={(item) => set_start_hr(item.value)}
                />
                <Dropdown
                  style={styles.dropdown}
                  data={minutes}
                  labelField="label"
                  valueField="value"
                  placeholder="Min"
                  value={start_min_val}
                  onChange={(item) => set_start_min(item.value)}
                />
                <Dropdown
                  style={styles.dropdown}
                  data={amPm}
                  labelField="label"
                  valueField="value"
                  placeholder="AM/PM"
                  value={start_ampm_val}
                  onChange={(item) => set_start_ampm(item.value)}
                />
              </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollView: {
    flex: 1,
  },
  calendar: {
    marginBottom: 10,
  },
  eventsContainer: {
    padding: 15,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  eventsList: {
    maxHeight: 300,
  },
  eventCard: {
    flexDirection: "row",
    alignItems: "start",
    padding: 10,
  },
  eventDetails: {
    marginLeft: 10,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#075eec",
  },
  eventInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
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
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  dropdown: {
    height: 40,
    borderColor: "#B2ACAC",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    flex: 1,
    marginRight: 5,
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
  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
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
});

export default App;
