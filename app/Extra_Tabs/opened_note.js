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
  ActivityIndicator 
} from "react-native";
import ColorPicker from "react-native-wheel-color-picker";
import React, { useState, useEffect } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { db } from "../../firebaseConfig";
import ReactDOM from "react-dom";
import { Buffer } from "buffer";
import * as FileSystem from "expo-file-system";
import { WebView } from "react-native-webview";
import * as Sharing from "expo-sharing";

import { addDoc, collection, doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "../../context/authContext";
import HomeHeader from "../../components/HomeHeader";

const Opened_note = ({ route, navigation }) => {
  const { cur_note_uri } = route.params;
  const [fileUri, setFileUri] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const downloadPdf = async () => {
      try {

        // Encode the URI to handle special characters
        const pdfUri = encodeURI(cur_note_uri);

        // Step 1: Define the destination file path
        const filePath = FileSystem.documentDirectory + "downloaded.pdf";

        // Step 2: Download the PDF
        const response = await FileSystem.downloadAsync(pdfUri, filePath);

        // Step 3: Verify the download
        if (!response.uri) {
          Alert.alert("Error", "Failed to download the PDF.");
          return;
        }

        // Step 4: Set the file URI to display the PDF
        setFileUri(response.uri);
        setLoading(false);
      } catch (error) {
        console.error("Error downloading the PDF:", error);
        Alert.alert("Error", "Something went wrong. Please try again.");
        setLoading(false);
      }
    };

    // Trigger the function to download the PDF
    downloadPdf();
  }, [cur_note_uri]);
  return (
    <View  className="h-screen w-screen ">
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : fileUri ? (
        <WebView
        className="w-52 h-96 bg-white"
          originWhitelist={["*"]}
          source={{ uri: cur_note_uri }}
          
        />
      ) : (
        Alert.alert("Error", "Failed to load the PDF.")
      )}
    </View>
  );
};

export default Opened_note;

const styles = StyleSheet.create({

});
