import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, Alert } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { MenuItem } from './CustomMenuItems';
import { AntDesign, Feather } from '@expo/vector-icons';
import { useAuth } from '../context/authContext';
import { useNavigation } from '@react-navigation/native';
import { blurhash } from '../utils/common';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { storage, db } from '../firebaseConfig';

export default function HomeHeader() {
  const { user, logout } = useAuth();
  const { top } = useSafeAreaInsets();
  const navigation = useNavigation();
  const [uploading, setUploading] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleLogout = async () => {
    await logout();
  };

  const navigateToAcademics = () => {
    navigation.navigate('Academics');
  };

  const uploadImageToFirebase = async (uri) => {
    try {
      console.log('Starting upload process...');
      console.log('User object:', user);
  
      if (!user || !user.uid) {
        throw new Error('User is not authenticated or UID is missing');
      }
  
      // Use XMLHttpRequest to fetch the image
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          console.log('Blob created successfully');
          resolve(xhr.response);
        };
        xhr.onerror = function (e) {
          console.error('XHR error:', e);
          reject(new TypeError('Network request failed'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
      });
  
      // Create a storage reference
      const fileName = `profile_${user.uid}_${Date.now()}.jpg`;
      const storageRef = ref(storage, `profilePictures/${fileName}`);
  
      console.log('Uploading to Firebase Storage...');
  
      // Create upload task
      const uploadTask = uploadBytesResumable(storageRef, blob);
  
      // Return a promise that resolves with the download URL
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Handle progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
            console.log('Upload is ' + progress + '% done');
          },
          (error) => {
            // Handle errors
            console.error('Upload error:', error);
            reject(error);
          },
          async () => {
            // Handle successful upload
            try {
              console.log('Upload Task Snapshot:', uploadTask.snapshot);
              console.log('Upload Task Snapshot Ref:', uploadTask.snapshot.ref);
  
              // Use storageRef directly
              const downloadURL = await getDownloadURL(storageRef);
              console.log('File available at', downloadURL);
  
              // Close the blob
              blob.close();
  
              // Update Firestore
              const userRef = doc(db, 'users', user.uid);
              await updateDoc(userRef, {
                profileUrl: downloadURL,
              });
  
              resolve(downloadURL);
            } catch (error) {
              console.error('Error getting download URL:', error);
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('Error in uploadImageToFirebase:', error);
      throw error;
    }
  };

  const handleImagePick = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        setUploadProgress(0);
        try {
          console.log('Selected image:', result.assets[0].uri);
          await uploadImageToFirebase(result.assets[0].uri);
          Alert.alert('Success', 'Profile picture updated successfully');
          setProfileModalVisible(false);
        } catch (error) {
          console.error('Upload error:', error);
          Alert.alert('Error', 'Failed to update profile picture. Please try again.');
        } finally {
          setUploading(false);
          setUploadProgress(0);
        }
      }
    } catch (error) {
      console.error('Image pick error:', error);
      Alert.alert('Error', 'Failed to pick image');
      setUploading(false);
    }
  };

  return (
    <>
      <View style={{ paddingTop: top }} className="flex-row justify-between items-center px-4 pb-3 bg-white shadow-sm">
        <TouchableOpacity 
          onPress={navigateToAcademics}
          className="p-2 rounded-full"
        >
          <AntDesign name="book" size={24} color="black" />
        </TouchableOpacity>

        <View className="flex-1 items-center">
          <Image
            source={require('../assets/images/login.png')}
            style={{ width: wp(16), height: hp(8) }}
            resizeMode="contain"
          />
        </View>

        <Menu>
          <MenuTrigger>
            <View className="p-0.5 bg-blue-500 rounded-full">
              <Image
                source={{ 
                  uri: user?.profileUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
                }}
                style={{ width: hp(4.5), height: hp(4.5), borderRadius: hp(2.25) }}
                placeholder={blurhash}
                contentFit="cover"
                transition={500}
              />
            </View>
          </MenuTrigger>

          <MenuOptions
            customStyles={{
              optionsContainer: {
                borderRadius: 15,
                marginTop: 30,
                marginLeft: -30,
                backgroundColor: 'white',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                width: 180,
                padding: 5,
              }
            }}
          >
            <MenuItem
              text="Change Profile Picture"
              action={() => setProfileModalVisible(true)}
              icon={<Feather name="camera" size={hp(2.5)} color="#2196f3" />}
            />
            <MenuItem
              text="Sign Out"
              action={handleLogout}
              icon={<AntDesign name="logout" size={hp(2.5)} color="#ef4444" />}
            />
          </MenuOptions>
        </Menu>
      </View>

      {/* Profile Picture Modal */}
      <Modal
        visible={profileModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white w-[90%] rounded-2xl p-6">
            <Text className="text-2xl font-bold mb-6">Update Profile Picture</Text>
            
            <View className="items-center mb-6">
              <Image
                source={{ 
                  uri: user?.profileUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
                }}
                style={{ width: hp(15), height: hp(15), borderRadius: hp(7.5) }}
                className="mb-4"
              />
              
              {uploading && (
                <Text className="mb-2 text-blue-500">
                  Uploading... {uploadProgress.toFixed(0)}%
                </Text>
              )}
              
              <TouchableOpacity
                onPress={handleImagePick}
                disabled={uploading}
                className={`py-3 px-6 rounded-lg ${uploading ? 'bg-gray-400' : 'bg-blue-500'}`}
              >
                <Text className="text-white font-semibold">
                  {uploading ? 'Uploading...' : 'Choose Photo'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setProfileModalVisible(false)}
              disabled={uploading}
              className="bg-gray-200 py-3 rounded-lg"
            >
              <Text className="text-center font-semibold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}