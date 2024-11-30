// screens/Bottom_Tabs/Status/CreateStatus.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../firebaseConfig';
import { useAuth } from '../../../context/authContext';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function CreateStatus() {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { user } = useAuth();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      setContent('');
    }
  };

  const uploadImage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileName = `status_${user.userId}_${Date.now()}.jpg`;
    const storageRef = ref(storage, `status/${fileName}`);
    await uploadBytes(storageRef, blob);
    return getDownloadURL(storageRef);
  };

  const createStatus = async () => {
    if (!content && !image) {
      Alert.alert('Error', 'Please add some content to your status');
      return;
    }

    setLoading(true);
    try {
      const statusData = {
        userId: user.userId,
        username: user.username,
        userProfileUrl: user.profileUrl,
        timestamp: serverTimestamp(),
        type: image ? 'image' : 'text',
        viewedBy: [],
      };

      if (image) {
        statusData.content = await uploadImage(image);
      } else {
        statusData.content = content;
      }

      await addDoc(collection(db, 'statuses'), statusData);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to create status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-4">
      {image ? (
        <View className="flex-1">
          <Image
            source={{ uri: image }}
            className="flex-1 rounded-lg"
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={() => setImage(null)}
            className="absolute top-2 right-2 bg-black/50 rounded-full p-2"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        <TextInput
          multiline
          value={content}
          onChangeText={setContent}
          placeholder="Type a status..."
          className="flex-1 text-lg"
          maxLength={300}
        />
      )}

      <View className="flex-row justify-between mt-4">
        <TouchableOpacity
          onPress={pickImage}
          className="bg-gray-100 p-3 rounded-full"
        >
          <Ionicons name="image" size={24} color="#3B82F6" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={createStatus}
          disabled={loading || (!content && !image)}
          className={`bg-blue-500 px-6 py-3 rounded-full ${
            (loading || (!content && !image)) && 'opacity-50'
          }`}
        >
          <Text className="text-white font-semibold">
            {loading ? 'Posting...' : 'Post Status'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}