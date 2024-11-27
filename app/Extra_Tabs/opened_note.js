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
  } from "react-native";
  import ColorPicker from "react-native-wheel-color-picker";
  
  import React, { useState, useEffect } from "react";
  import AntDesign from "@expo/vector-icons/AntDesign";
  import FontAwesome from "@expo/vector-icons/FontAwesome";
  import { db } from "../../firebaseConfig";
  import {
    addDoc,
    collection,
    doc,
    onSnapshot,
  } from "firebase/firestore";
  import { useAuth } from "../../context/authContext";
  import HomeHeader from '../../components/HomeHeader';
  
  const opened_note = ({ navigation }) => {
    
    return (
      <View className="flex h-screen bg-white">
        {/* This is the top nav bar  */}
        <HomeHeader />
        <ScrollView className="flex basis-4/5 bg-white ">
         
        </ScrollView>
        
      </View>
    );
  };
  
  export default opened_note;
  
  const styles = StyleSheet.create({
    floatingButton: {
      position: "absolute",
      right: 20,
      bottom: 70,
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
    container: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
    },
  });
  