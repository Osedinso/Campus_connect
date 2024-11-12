import React, { useState } from "react";
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
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign, Ionicons, SimpleLineIcons } from "@expo/vector-icons";

const Activities = ({ navigation }) => {
  const [events, setEvents] = useState([
    {
      title: "Music Festival",
      description: "A fun-filled music event with live performances.",
      location: "Central Park, NY",
      host: "John Doe",
      giveaway: "Free T-shirts",
      fee: "Free",
      month_value: "Oct",
      day: "Sat",
      day_value: "15",
      year_value: "2024",
      start_hr_val: "5",
      start_min_val: "30",
      start_ampm_val: "PM",
      end_hr_val: "8",
      end_min_val: "00",
      end_ampm_val: "PM"
    }
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [title, set_title] = useState("");
  const [description, set_description] = useState("");
  const [location, set_location] = useState("");
  const [host, set_host] = useState("");
  const [giveaway, set_giveaway] = useState("");
  const [fee, set_fee] = useState("");
  const [day_value, setDay] = useState(null);
  const [month_value, setMonth] = useState(null);
  const [year_value, setYear] = useState(null);
  const [start_hr_val, set_start_hr] = useState(null);
  const [start_min_val, set_start_min] = useState(null);
  const [start_ampm_val, set_start_ampm] = useState(null);
  const [end_hr_val, set_end_hr] = useState(null);
  const [end_min_val, set_end_min] = useState(null);
  const [end_ampm_val, set_end_ampm] = useState(null);

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

  const daysOfMonth = Array.from({ length: 31 }, (_, i) => ({
    label: String(i + 1).padStart(2, '0'),
    value: String(i + 1).padStart(2, '0')
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
    label: String(i * 5).padStart(2, '0'),
    value: String(i * 5).padStart(2, '0')
  }));

  const hours = Array.from({ length: 12 }, (_, i) => ({
    label: String(i + 1).padStart(2, '0'),
    value: String(i + 1).padStart(2, '0')
  }));

  const amPm = [
    { label: "AM", value: "AM" },
    { label: "PM", value: "PM" },
  ];

  function find_day(day, month, year) {
    const date = new Date(year, month - 1, day);
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return daysOfWeek[date.getDay()];
  }

  function submit_form() {
    const month = months.find((m) => m.label === month_value);
    const day = find_day(
      parseInt(day_value),
      parseInt(month.value),
      parseInt(year_value)
    );
    const newEvent = {
      title,
      description,
      location,
      host,
      fee,
      giveaway,
      month_value,
      day,
      day_value,
      year_value,
      start_hr_val,
      start_min_val,
      start_ampm_val,
      end_hr_val,
      end_min_val,
      end_ampm_val,
    };

    setEvents((prevEvents) => [...prevEvents, newEvent]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerText}>Events</Text>
          <TouchableOpacity
            style={styles.addEventButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addEventButtonText}>Add Event</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.eventsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Today</Text>
          </View>
          {events.map((temp_event, index) => (
            <View key={index} style={styles.eventCard}>
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>{temp_event.title}</Text>
                <Text style={styles.eventInfo}>
                  <AntDesign name="calendar" size={15} color="black" />{" "}
                  {temp_event.day} {temp_event.month_value} {temp_event.day_value} {temp_event.year_value}
                </Text>
                <Text style={styles.eventInfo}>
                  <Ionicons name="time-outline" size={15} color="black" />{" "}
                  {temp_event.start_hr_val}:{temp_event.start_min_val} {temp_event.start_ampm_val} - {temp_event.end_hr_val}:{temp_event.end_min_val} {temp_event.end_ampm_val}
                </Text>
                <Text style={styles.eventInfo}>
                  <SimpleLineIcons name="location-pin" size={15} color="black" />{" "}
                  {temp_event.location}
                </Text>
                <Text style={styles.eventInfo}>10 Attendees</Text>
              </View>
              <TouchableOpacity
                style={styles.viewMoreButton}
                onPress={() => navigation.navigate("ext_activities", {
                  cur_title: temp_event.title,
                  cur_host: temp_event.host,
                  cur_location: temp_event.location,
                  cur_day: temp_event.day,
                  cur_date: temp_event.day_value,
                  cur_month: temp_event.month_value,
                  cur_year: temp_event.year_value,
                  cur_start_hr: temp_event.start_hr_val,
                  cur_start_min: temp_event.start_min_val,
                  cur_start_amPm: temp_event.start_ampm_val,
                  cur_end_hr: temp_event.end_hr_val,
                  cur_end_min: temp_event.end_min_val,
                  cur_end_ampm: temp_event.end_ampm_val,
                  cur_description: temp_event.description,
                  cur_giveaway: temp_event.giveaway,
                  cur_fee: temp_event.fee
                })}
              >
                <Text style={styles.viewMoreText}>View More</Text>
                <AntDesign name="right" size={15} color="black" />
              </TouchableOpacity>
            </View>
          ))}
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
                placeholder="Event Host"
                placeholderTextColor="#B2ACAC"
                onChangeText={(text) => set_host(text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Event Location"
                placeholderTextColor="#B2ACAC"
                onChangeText={(text) => set_location(text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Event Giveaway"
                placeholderTextColor="#B2ACAC"
                onChangeText={(text) => set_giveaway(text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Event Fee"
                placeholderTextColor="#B2ACAC"
                onChangeText={(text) => set_fee(text)}
              />
              <Text style={styles.labelText}>Event Date</Text>
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
              <Text style={styles.labelText}>Start Time</Text>
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
              <Text style={styles.labelText}>End Time</Text>
              <View style={styles.timeContainer}>
                <Dropdown
                  style={styles.dropdown}
                  data={hours}
                  labelField="label"
                  valueField="value"
                  placeholder="Hour"
                  value={end_hr_val}
                  onChange={(item) => set_end_hr(item.value)}
                />
                <Dropdown
                  style={styles.dropdown}
                  data={minutes}
                  labelField="label"
                  valueField="value"
                  placeholder="Min"
                  value={end_min_val}
                  onChange={(item) => set_end_min(item.value)}
                />
                <Dropdown
                  style={styles.dropdown}
                  data={amPm}
                  labelField="label"
                  valueField="value"
                  placeholder="AM/PM"
                  value={end_ampm_val}
                  onChange={(item) => set_end_ampm(item.value)}
                />
              </View>
              <TextInput
                style={[styles.input, styles.descriptionInput]}
                placeholder="Event Description"
                placeholderTextColor="#B2ACAC"
                multiline
                numberOfLines={4}
                onChangeText={(text) => set_description(text)}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addEventButton: {
    backgroundColor: '#075eec',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  addEventButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  eventsContainer: {
    padding: 15,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventCard: {
    borderWidth: 1,
    borderColor: '#989898',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
  },
  eventDetails: {
    padding: 15,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  eventInfo: {
    fontSize: 14,
    marginBottom: 5,
  },
  viewMoreButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#989898',
  },
  viewMoreText: {
    color: '#075eec',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '90%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#B2ACAC',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  labelText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dropdown: {
    height: 40,
    borderColor: '#B2ACAC',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    flex: 1,
    marginRight: 5,
  },
  submitButton: {
    backgroundColor: '#075eec',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Activities;
