import {
  StyleSheet,
  Text,
  TextInput,
  Image,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  KeyboardAvoidingView,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import React, { useState } from "react";
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import GridLayout from "react-grid-layout";

const Activites = ({ navigation }) => {
  return (
    <SafeAreaView className="flex h-screen bg-white">
      {/* This is the top nav bar  */}
      <View className=" h-12 flex  w-screen  items-center border-solid border-b bg-white border-gray-400 pb-5">
        <View className=" flex flex-row w-11/12 justify-between">
          <View className="basis-2/6 items-start justify-center ">
            <TouchableOpacity onPress={() => navigation.navigate("Academics")}>
              <AntDesign name="book" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <View className="basis-2/6 flex justify-center items-center pb-3">
            <Image
              source={require("../../assets/images/login.png")}
              className="self-center  w-16 h-16 "
              resizeMode="contain"
              alt="Logo"
            />
          </View>
          <View className="basis-2/6 justify-center items-end">
            <FontAwesome name="user-circle" size={24} color="black" />
          </View>
        </View>
      </View>
      <ScrollView className="flex basis-4/5 bg-white ">
        {/* This is the welcome Text and date */}
        <View className="basis-1/4 w-screen flex justify-center items-center ">
          <View className=" flex flex-col w-11/12 justify-end items-start mt-3 mb-4">
            <Text className=" text-3xl text-left">Help a Friend</Text>
            <Text className="mt-3 text-sm">June 04, 2024</Text>
          </View>
        </View>
        <View className=" w-screen h-fit bg-slate-400 grid grid-cols-2">
        {/* Tasks view below shows the 2 task in todays tasks */}


          <View className=" flex justify-center items-center w-40 h-40 bg-[#6871FF] rounded-lg border border-gray-400">
           
          </View>
          <View className=" flex justify-center items-center w-40 h-40 bg-[#6871FF] rounded-lg border border-gray-400">
           
          </View>
          <View className=" flex justify-center items-center w-40 h-40 bg-[#6871FF] rounded-lg border border-gray-400">
           
          </View>
          <View className=" flex justify-center items-center w-40 h-40 bg-[#6871FF] rounded-lg border border-gray-400">
           
          </View>

        
      </View>
      </ScrollView>
      
    </SafeAreaView>
  );
};

export default Activites;

const styles = StyleSheet.create({});
