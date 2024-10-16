import {
    StyleSheet,
    Text,
    TouchableOpacity,
    ScrollView,
    View,
  } from "react-native";
  import React from "react";
  import { SafeAreaView } from "react-native-safe-area-context";
  import AntDesign from "@expo/vector-icons/AntDesign";
  import MaterialIcons from "@expo/vector-icons/MaterialIcons";
  import FontAwesome from "@expo/vector-icons/FontAwesome";
  
  const Profile = ({ navigation }) => {
    return (
      <SafeAreaView className="flex flex-col  justify-start  h-screen  items-center bg-black">
        <View className="flex h-screen bg-white w-full">
        <View className=" basis-14 flex  w-screen  items-center justify-center border-solid border-b bg-white border-[#989898] ">
          <View className=" flex flex-row w-11/12 ">
            <TouchableOpacity className="basis-fit  items-start justify-center float-left "
            onPress={() => {
              navigation.navigate("Home");
            }}>
              <MaterialIcons name="arrow-back-ios" size={18} color="black" />
            </TouchableOpacity>
            <View className="basis-4/5 flex justify-center items-center float-right ">
              <Text className="text-right text-2xl font-medium w-fit">
                Profile Settings
              </Text>
            </View>
          </View>
        </View>
        <View className=" h-5/6 w-full flex bg-white items-center ">
          <View className=" h-full w-11/12 flex bg-white justify-evenly">
            <View className="w-full basis-fit ">
              <Text className="mb-3 text-lg">Account Settings</Text>
              <View className="w-full h-fit flex items-center border-solid border border-[#A0A0A0] rounded-xl">
                {/* Profile buttons below */}
                <TouchableOpacity
                  onPress={() => {
                    //Handel on press action
                  }}
                  className=" basis-fit  w-full items-center border-solid border-b border-[#A0A0A0]  "
                >
                  <View className=" basis-fit flex flex-row justify-between w-11/12 items-center  mt-2 mb-2">
                    <Text className="text-sm text-[#A8A8A8]">Name</Text>
                    <MaterialIcons
                      name="arrow-forward-ios"
                      size={15}
                      color="#7B7B7B"
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    //Handel on press action
                  }}
                  className=" basis-fit  w-full items-center border-solid border-b border-[#A0A0A0]  "
                >
                  <View className=" basis-fit flex flex-row justify-between w-11/12 items-center  mt-2 mb-2">
                    <Text className="text-sm text-[#A8A8A8]">Profile Picture</Text>
                    <MaterialIcons
                      name="arrow-forward-ios"
                      size={15}
                      color="#7B7B7B"
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    //Handel on press action
                  }}
                  className=" basis-fit  w-full items-center border-solid border-b border-[#A0A0A0]  "
                >
                  <View className=" basis-fit flex flex-row justify-between w-11/12 items-center  mt-2 mb-2">
                    <Text className="text-sm text-[#A8A8A8]">School Email</Text>
                    <MaterialIcons
                      name="arrow-forward-ios"
                      size={15}
                      color="#7B7B7B"
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    //Handel on press action
                  }}
                  className=" basis-fit  w-full items-center border-solid border-b border-[#A0A0A0]  "
                >
                  <View className=" basis-fit flex flex-row justify-between w-11/12 items-center  mt-2 mb-2">
                    <Text className="text-sm text-[#A8A8A8]">Password</Text>
                    <MaterialIcons
                      name="arrow-forward-ios"
                      size={15}
                      color="#7B7B7B"
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    //Handel on press action
                  }}
                  className=" basis-fit  w-full items-center   "
                >
                  <View className=" basis-fit flex flex-row justify-between w-11/12 items-center  mt-2 mb-2">
                    <Text className="text-sm text-[#A8A8A8]">Apperance</Text>
                    <MaterialIcons
                      name="arrow-forward-ios"
                      size={15}
                      color="#7B7B7B"
                    />
                  </View>
                </TouchableOpacity>
  
                {/* End of profile buttons */}
              </View>
            </View>
            <View className="w-full basis-fit ">
              <Text className="mb-3 text-lg">Support / Feedback</Text>
              <View className="w-full h-fit flex items-center border-solid border border-[#A0A0A0] rounded-xl">
                {/* Profile buttons below */}
                <TouchableOpacity
                  onPress={() => {
                    //Handel on press action
                  }}
                  className=" basis-fit  w-full items-center border-solid border-b border-[#A0A0A0]  "
                >
                  <View className=" basis-fit flex flex-row justify-between w-11/12 items-center  mt-2 mb-2">
                    <Text className="text-sm text-[#A8A8A8]">Contact Us</Text>
                    <MaterialIcons
                      name="arrow-forward-ios"
                      size={15}
                      color="#7B7B7B"
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    //Handel on press action
                  }}
                  className=" basis-fit  w-full items-center   "
                >
                  <View className=" basis-fit flex flex-row justify-between w-11/12 items-center  mt-2 mb-2">
                    <Text className="text-sm text-[#A8A8A8]">Feedback</Text>
                    <MaterialIcons
                      name="arrow-forward-ios"
                      size={15}
                      color="#7B7B7B"
                    />
                  </View>
                </TouchableOpacity>
             
  
                {/* End of profile buttons */}
              </View>
            </View>
            <View className="w-full basis-fit ">
              <Text className="mb-3 text-lg">More Information</Text>
              <View className="w-full h-fit flex items-center border-solid border border-[#A0A0A0] rounded-xl">
                {/* Profile buttons below */}
                <TouchableOpacity
                  onPress={() => {
                    //Handel on press action
                  }}
                  className=" basis-fit  w-full items-center border-solid border-b border-[#A0A0A0]  "
                >
                  <View className=" basis-fit flex flex-row justify-between w-11/12 items-center  mt-2 mb-2">
                    <Text className="text-sm text-[#A8A8A8]">About</Text>
                    <MaterialIcons
                      name="arrow-forward-ios"
                      size={15}
                      color="#7B7B7B"
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    //Handel on press action
                  }}
                  className=" basis-fit  w-full items-center border-solid border-b border-[#A0A0A0]  "
                >
                  <View className=" basis-fit flex flex-row justify-between w-11/12 items-center  mt-2 mb-2">
                    <Text className="text-sm text-[#A8A8A8]">Privacy Policy</Text>
                    <MaterialIcons
                      name="arrow-forward-ios"
                      size={15}
                      color="#7B7B7B"
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    //Handel on press action
                  }}
                  className=" basis-fit  w-full items-center   "
                >
                  <View className=" basis-fit flex flex-row justify-between w-11/12 items-center  mt-2 mb-2">
                    <Text className="text-sm text-[#A8A8A8]">Terms of Services</Text>
                    <MaterialIcons
                      name="arrow-forward-ios"
                      size={15}
                      color="#7B7B7B"
                    />
                  </View>
                </TouchableOpacity>
               
  
                {/* End of profile buttons */}
              </View>
            </View>
          </View>
        </View>
        </View>
        
      </SafeAreaView>
    );
  };
  
  export default Profile;
  
  const styles = StyleSheet.create({});
  