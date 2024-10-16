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
  import { Feather } from "@expo/vector-icons";
  import Ionicons from "@expo/vector-icons/Ionicons";
  import { SimpleLineIcons } from "@expo/vector-icons";
  
  import React, { useState } from "react";
  import { Dropdown } from "react-native-element-dropdown";
  import { SafeAreaView } from "react-native-safe-area-context";
  import AntDesign from "@expo/vector-icons/AntDesign";
  import FontAwesome from "@expo/vector-icons/FontAwesome";
  import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
  
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
              <Text className=" text-3xl text-left">Study Room</Text>
              <Text className="mt-3 text-sm">June 04, 2024</Text>
            </View>
          </View>
          {/*This view contains all the notes available to this particular student */}
          <View className="w-full h-fit  flex items-center">
            <View className=" basis-2/3 w-screen h-screen items-center  ">
              <View className="flex  w-11/12 h-full justify-start">
                {/* Todays task and Live events on campus */}
                {/* Today's Tasks */}
                <View className="flex  basis-24 rounded-xl  justify-start items-center border-solid border border-[#989898] overflow-hidden mb-5">
                  {/* The code below is for the Todays task header */}
                  <View className="basis-1/3 w-full justify-center items-center bg-[#075eec] ">
                    <View className="w-11/12 justify-center ">
                      <Text className="text-white">CSCI 410</Text>
                    </View>
                  </View>
                  {/* Tasks view below shows the 2 task in todays tasks */}
                  <View className="  flex basis-3/5 w-11/12 justify-between ">
                    <View className="basis-2/4  flex flex-row items-center ">
                      <View className="justify-start mr-3">
                        <FontAwesome6 name="book" size={24} color="black" />
                      </View>
                      <View className="basis-4/5 w-4/5 justify-start">
                        <Text>Notes</Text>
                      </View>
                      <View className="justify-start mr-3">
                        <AntDesign name="right" size={15} color="black" />
                      </View>
                    </View>
                    
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };
  
  export default Activites;
  
  const styles = StyleSheet.create({});
  