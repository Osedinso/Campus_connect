import React from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const Academics = ({ navigation }) => {
  const academicOptions = [
    {
      id: 1,
      title: "Study Room",
      route: "Study_Room",
      color: "#6871FF",
      icon: require("../../assets/images/study_ico.png"),
    },
    {
      id: 2,
      title: "Quick Exam",
      route: "Quick_Exam",
      color: "#47BC88",
      icon: require("../../assets/images/exam_ico.png"),
    },
    {
      id: 3,
      title: "Help a Friend",
      route: "Help_a_Friend",
      color: "#FEBB5E",
      icon: require("../../assets/images/question_answer_ico.png"),
    },
    {
      id: 4,
      title: "Need a Hand",
      route: "Need_a_Hand",
      color: "#EA66C6",
      icon: require("../../assets/images/question_ico.png"),
    },
  ];

  // Get the current date in "Month DD, YYYY" format
  const getCurrentDate = () => {
    const date = new Date();
    const options = { month: "long", day: "numeric", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  const renderAcademicOption = ({ id, title, route, color, icon }) => (
    <TouchableOpacity
      key={id}
      onPress={() => navigation.navigate(route)}
      className="mb-4"
    >
      <View
        style={{ backgroundColor: color }}
        className="flex justify-center items-center w-40 h-40 rounded-2xl shadow-sm"
      >
        <Image
          source={icon}
          className="w-16 h-16"
          resizeMode="contain"
        />
        <Text className="text-white mt-3 text-lg font-semibold">
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Header Section */}
        <View className="px-6 mt-4 mb-6">
          <Text className="text-3xl font-semibold text-gray-900">Academics</Text>
          <Text className="mt-2 text-sm text-gray-500">{getCurrentDate()}</Text>
        </View>

        {/* Sections Header */}
        <View className="px-6 flex-row items-center justify-between mb-6">
          <Text className="text-lg font-medium text-gray-900">Sections</Text>
          <TouchableOpacity>
            <AntDesign name="ellipsis1" size={24} color="#404040" />
          </TouchableOpacity>
        </View>

        {/* Academic Options Grid */}
        <View className="px-6">
          <View className="flex-row flex-wrap justify-between">
            {academicOptions.map(renderAcademicOption)}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Academics;
