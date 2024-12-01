import { SafeAreaView } from "react-native-safe-area-context";
import {
  StyleSheet,
  Text,
  Image,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, AntDesign, Ionicons } from "@expo/vector-icons";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db, usersRef } from "../../firebaseConfig";
import { useAuth } from "../../context/authContext";

const { width } = Dimensions.get('window');

const Home = ({ navigation }) => {
  const { user } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);

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

  const getMonthValue = (mon_value) => {
    const month = months.find((m) => m.label === mon_value);
    return month ? month.value : null;
  };

  useEffect(() => {
    if (!user?.userId) return;

    const fetchData = () => {
      try {
        const userRefTask = doc(db, "users", user.userId);
        const tasksCollection = collection(userRefTask, "Tasks");
        const activitiesCollection = collection(userRefTask, "Activities");

        const unsubscribeTasks = onSnapshot(tasksCollection, (snapshot) => {
          const tasksList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            full_date: `${doc.data().year_value}-${getMonthValue(doc.data().month_value)}-${doc.data().day_value}`,
          }));

          setTasks(tasksList.sort((a, b) => new Date(a.full_date) - new Date(b.full_date)));
        });

        const unsubscribeActivities = onSnapshot(activitiesCollection, (snapshot) => {
          const activityList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            full_date: `${doc.data().year}-${getMonthValue(doc.data().month)}-${doc.data().day_num}`,
          }));

          setActivities(activityList.sort((a, b) => new Date(a.full_date) - new Date(b.full_date)));
        });

        return () => {
          unsubscribeTasks();
          unsubscribeActivities();
        };
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    const unsubscribe = fetchData();
    return () => unsubscribe && unsubscribe();
  }, [user?.userId]);

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#075eec" />
      </View>
    );
  }

  const renderTask = (task, index) => (
    <Animated.View
      key={task.id}
      style={[
        styles.taskCard,
        {
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0]
            })
          }]
        }
      ]}
    >
      <View style={styles.taskContent}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          {task.checked && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>Completed</Text>
            </View>
          )}
        </View>
        
        <View style={styles.taskDetails}>
          <View style={styles.taskDetailRow}>
            <Ionicons name="time-outline" size={16} color="#64748B" />
            <Text style={styles.taskDetailText}>
              {task.start_hr_val}:{task.start_min_val} {task.start_ampm_val}
            </Text>
          </View>
          <View style={styles.taskDetailRow}>
            <AntDesign name="calendar" size={16} color="#64748B" />
            <Text style={styles.taskDetailText}>
              {task.day}, {task.month_value} {task.day_value}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderActivity = (activity, index) => (
    <Animated.View
      key={activity.id}
      style={[
        styles.activityCard,
        {
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0]
            })
          }]
        }
      ]}
    >
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{activity.title}</Text>
        <View style={styles.activityDetails}>
          <View style={styles.activityDetailRow}>
            <Ionicons name="time-outline" size={16} color="#64748B" />
            <Text style={styles.activityDetailText}>
              {activity.start_hr_val}:{activity.start_min_val} {activity.start_ampm_val}
            </Text>
          </View>
          <View style={styles.activityDetailRow}>
            <AntDesign name="calendar" size={16} color="#64748B" />
            <Text style={styles.activityDetailText}>
              {activity.day}, {activity.month_value} {activity.day_value}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hi{user?.firstName ? `, ${user.firstName}` : ''}! 👋
            </Text>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Feather name="user" size={24} color="#1E293B" />
          </TouchableOpacity>
        </View>

        <View style={styles.dashboardHeader}>
          <Text style={styles.dashboardTitle}>Dashboard</Text>
          <TouchableOpacity>
            <Feather name="more-horizontal" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Tasks</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => navigation.navigate("Calendar")}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <AntDesign name="right" size={16} color="#075eec" />
            </TouchableOpacity>
          </View>

          <View style={styles.tasksList}>
            {tasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="calendar" size={48} color="#CBD5E1" />
                <Text style={styles.emptyStateText}>No tasks for today</Text>
              </View>
            ) : (
              tasks.slice(0, 2).map(renderTask)
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Campus Events</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => navigation.navigate("Activities")}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <AntDesign name="right" size={16} color="#075eec" />
            </TouchableOpacity>
          </View>

          <View style={styles.activitiesList}>
            {activities.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="calendar" size={48} color="#CBD5E1" />
                <Text style={styles.emptyStateText}>No events scheduled</Text>
              </View>
            ) : (
              activities.slice(0, 2).map(renderActivity)
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.startReadingButton}
          onPress={() => navigation.navigate("Study_Room")}
        >
          <LinearGradient
            colors={['#075eec', '#2D82FE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButton}
          >
            <Feather name="book-open" size={24} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Start Reading</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#64748B',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  dashboardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#075eec',
    marginRight: 4,
  },
  tasksList: {
    paddingHorizontal: 24,
  },
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
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
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  completedBadge: {
    backgroundColor: '#DCF2E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completedText: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '500',
  },
  taskDetails: {
    marginTop: 8,
  },
  taskDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskDetailText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
  },
  activitiesList: {
    paddingHorizontal: 24,
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
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
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  activityDetails: {
    marginTop: 8,
  },
  activityDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityDetailText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
  },
  startReadingButton: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#075eec',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});

export default Home;