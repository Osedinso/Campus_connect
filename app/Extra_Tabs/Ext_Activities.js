import {
  StyleSheet,
  Text,
  TextInput,
  Image,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import React, { useState } from "react";
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { SimpleLineIcons } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";

const Ext_Activities = ({ route, navigation }) => {
  const {
    cur_title,
    cur_host,
    cur_giveaway,
    cur_location,
    cur_day,
    cur_date,
    cur_month,
    cur_year,
    cur_start_hr,
    cur_start_min,
    cur_start_amPm,
    cur_end_hr,
    cur_end_min,
    cur_end_ampm,
    cur_description,
    cur_fee,
  } = route.params;
  const [modalVisible, setModalVisible] = useState(true);
  return (
    <View className="flex h-screen bg-white">
      {/* This is the top nav bar  */}
      <View className=" h-12 flex  w-screen  items-center border-solid border-b bg-white border-gray-400 pb-5">
        <View className=" flex flex-row w-screen justify-start items-center">
          <View className=" h-12 w-24 items-center  justify-center flex flex-row">
            <TouchableOpacity
              onPress={() => navigation.navigate("Activities")}
              className=" justify-center items-center flex flex-row"
            >
              <Ionicons name="arrow-back-outline" size={24} color="black" />
              <Text className="ml-3">Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <ScrollView className="flex h-full">
        {/* This is the welcome Text and date */}
        <View className="h-screen w-screen flex justify-start items-center">
          <View className="basis-64 w-screen bg-slate-500 "></View>
          <View className=" flex flex-col h-5/6 w-11/12 ">
            {/* Event Title */}
            <View className="h-14 ">
              <Text className="text-xl font-semibold">{cur_title}</Text>
            </View>
            {/* Event Summary */}
            <View className="h-28  flex flex-row ">
              <View className="basis-1/2 ">
                <View className="basis-1/2 flex flex-row items-center">
                  <AntDesign name="calendar" size={24} color="black" />
                  <Text className="ml-3">
                    {cur_start_hr}:{cur_start_min} {cur_start_amPm} -{" "}
                    {cur_end_hr}:{cur_end_min} {cur_end_ampm}
                    {"\n"}
                    {cur_day} {cur_month} {cur_date} {cur_year}
                  </Text>
                </View>
                <View className="basis-1/2 flex flex-row items-center">
                  <AntDesign name="gift" size={24} color="black" />
                  <Text className="ml-3">{cur_giveaway}</Text>
                </View>
              </View>

              <View className="basis-1/2 ">
                <View className="basis-1/2 flex flex-row items-center">
                  <SimpleLineIcons
                    name="location-pin"
                    size={24}
                    color="black"
                  />
                  <Text className="ml-3">{cur_location}</Text>
                </View>
                <View className="basis-1/2 flex flex-row items-center">
                  <Ionicons name="cash-outline" size={24} color="black" />
                  <Text className="ml-3">{cur_fee}</Text>
                </View>
              </View>
            </View>
            {/* Event Description */}
            <View className="h-28 ">
              <Text className="font-semibold mb-2">Description</Text>
              <Text>{cur_description}</Text>
            </View>
            {/* Event Host */}
            <View className="h-14  flex flex-row">
              <View className="mr-4">
                <Image
                  source={require("../../assets/images/Ellipse 13.jpg")}
                  className="w-13 h-13"
                  resizeMode="contain"
                  alt="Logo"
                />
              </View>
              <View>
                <Text className="font-semibold">Hosted By</Text>
                <Text>{cur_host}</Text>
              </View>
            </View>
            {/* Event Attendees */}
            <View className="h-20 flex justify-center ">
              <TouchableOpacity
                onPress={() => {
                  console.log("Show Users");
                }}
              >
                <Text className="font-semibold text-[#002b84]">
                  20 Attendees
                </Text>
              </TouchableOpacity>
              {modalVisible && (
                <View className="h-20 w-20 bg-slate-500"></View>
              )}
            </View>
            {/* Event Attend Button */}
            <View className="h-14 flex items-center">
              <View className="items-center w-36 bg-[#002b84] rounded-3xl">
                <TouchableOpacity
                  onPress={() => {
                    //Handel on press action
                    navigation.navigate("Login");
                  }}
                  className="w-full justify-center items-center"
                >
                  <View className="h-12 justify-center">
                    <Text className="text-xl font-normal text-white ">
                      Attend
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Ext_Activities;

const styles = StyleSheet.create({});
