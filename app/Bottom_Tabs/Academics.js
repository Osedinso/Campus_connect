import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 48 = padding (24) * 2

const Academics = ({ navigation }) => {
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const academicOptions = [
    {
      id: 1,
      title: "Study Room",
      route: "Study_Room",
      color: ["#6871FF", "#8E94FF"],
      icon: require("../../assets/images/study_ico.png"),
      description: "Access your study materials",
    },
    {
      id: 2,
      title: "Quick Exam",
      route: "Quick_Exam",
      color: ["#47BC88", "#69D4A5"],
      icon: require("../../assets/images/exam_ico.png"),
      description: "Take practice tests",
    },
    {
      id: 3,
      title: "Help a Friend",
      route: "Help_a_Friend",
      color: ["#FEBB5E", "#FFD283"],
      icon: require("../../assets/images/question_answer_ico.png"),
      description: "Assist other students",
    },
    {
      id: 4,
      title: "Need a Hand",
      route: "Need_a_Hand",
      color: ["#EA66C6", "#F48CD6"],
      icon: require("../../assets/images/question_ico.png"),
      description: "Get help with studies",
    },
  ];

  const renderAcademicOption = ({ id, title, route, color, icon, description }, index) => {
    const animationDelay = index * 100;

    return (
      <Animated.View
        key={id}
        style={[
          styles.cardContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate(route)}
          style={styles.cardTouchable}
        >
          <LinearGradient
            colors={color}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <Image
              source={icon}
              style={styles.cardIcon}
              resizeMode="contain"
            />
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDescription}>{description}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Academics</Text>
            <Text style={styles.headerDate}>{formattedDate}</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#404040" />
          </TouchableOpacity>
        </View>

        {/* Sections Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sections</Text>
          <TouchableOpacity>
            <AntDesign name="ellipsis1" size={24} color="#404040" />
          </TouchableOpacity>
        </View>

        {/* Academic Options Grid */}
        <View style={styles.grid}>
          {academicOptions.map((option, index) => renderAcademicOption(option, index))}
        </View>
      </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  headerDate: {
    fontSize: 14,
    color: '#666',
  },
  settingsButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F1F3F5',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginBottom: 16,
    paddingHorizontal: 6,
  },
  cardTouchable: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  card: {
    height: CARD_WIDTH * 1.2,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  cardIcon: {
    width: CARD_WIDTH * 0.4,
    height: CARD_WIDTH * 0.4,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});

export default Academics;