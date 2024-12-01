// HomeHeader.js

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, Alert, TextInput, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { MenuItem } from './CustomMenuItems';
import { AntDesign, Feather } from '@expo/vector-icons';
import { useAuth } from '../context/authContext';
import { useNavigation, useRouter } from '@react-navigation/native';
import { blurhash } from '../utils/common';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { storage, db } from '../firebaseConfig';

export default function HomeHeader() {
  const { user, logout, updateUserData } = useAuth();
  const { top } = useSafeAreaInsets();
  const navigation = useNavigation();
  const [uploading, setUploading] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false); // New state for edit profile modal
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // States for editing profile
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (!result.success) {
        Alert.alert('Logout Error', result.msg || 'Failed to logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const navigateToAcademics = () => {
    navigation.navigate('Academics');
  };

  const uploadImageToFirebase = async (uri) => {
    try {
      if (!user?.uid) {
        throw new Error('User is not authenticated');
      }

      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => resolve(xhr.response);
        xhr.onerror = (e) => reject(new TypeError('Network request failed'));
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
      });

      const fileName = `profile_${user.uid}_${Date.now()}.jpg`;
      const storageRef = ref(storage, `profilePictures/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, blob);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            blob.close();
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(storageRef);
              blob.close();

              const userRef = doc(db, 'users', user.uid);
              await updateDoc(userRef, {
                profileUrl: downloadURL,
              });
              await updateUserData(user.uid); // Update user context
              resolve(downloadURL);
            } catch (error) {
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
        mediaTypes: "images",  // Changed this line
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
  
      if (!result.canceled && result.assets && result.assets.length > 0) {
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

  // Function to handle profile update
  const handleUpdateProfile = async () => {
    // Validate inputs
    if (!firstName.trim() || !lastName.trim() || !username.trim()) {
      Alert.alert('Update Profile', 'Please fill all the fields!');
      return;
    }

    setUpdatingProfile(true);

    try {
      const userRef = doc(db, 'users', user.uid);
      
      // Check if the new username is already taken (optional)
      // Implement this check based on your requirements
      
      // Update Firestore
      await updateDoc(userRef, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
      });

      // Update user context
      await updateUserData(user.uid);

      Alert.alert('Success', 'Profile updated successfully!');
      setEditProfileModalVisible(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setUpdatingProfile(false);
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
                width: 200, // Increased width to accommodate new option
                padding: 10, // Adjusted padding
              }
            }}
          >
            <MenuItem
              text="Change Profile Picture"
              action={() => setProfileModalVisible(true)}
              icon={<Feather name="camera" size={hp(2.5)} color="#2196f3" />}
            />
            <MenuItem
              text="Edit Profile"
              action={() => setEditProfileModalVisible(true)} // New action
              icon={<Feather name="edit" size={hp(2.5)} color="#10B981" />} // Edit icon
            />
            <MenuItem
              text="Sign Out"
              action={handleLogout}
              icon={<AntDesign name="logout" size={hp(2.5)} color="#ef4444" />}
            />
          </MenuOptions>
        </Menu>
      </View>

      {/* Modal for Changing Profile Picture */}
      <Modal
        visible={profileModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Update Profile Picture</Text>
            
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ 
                  uri: user?.profileUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
                }}
                style={styles.imagePreview}
              />
              
              {uploading && (
                <Text style={styles.uploadingText}>
                  Uploading... {uploadProgress.toFixed(0)}%
                </Text>
              )}
              
              <TouchableOpacity
                onPress={handleImagePick}
                disabled={uploading}
                style={[styles.button, uploading ? styles.buttonDisabled : styles.buttonPrimary]}
              >
                <Text style={styles.buttonText}>
                  {uploading ? 'Uploading...' : 'Choose Photo'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setProfileModalVisible(false)}
              disabled={uploading}
              style={[styles.button, styles.buttonSecondary]}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for Editing Profile Information */}
      <Modal
        visible={editProfileModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditProfileModalVisible(false)}
      >
        <ScrollView contentContainerStyle={styles.modalOverlay}>
          <View style={styles.editProfileModalContainer}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            {/* First Name Input */}
            <View style={styles.inputWrapper}>
              <Feather name="user" size={hp(2.5)} color="#6B7280" style={styles.icon} />
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            {/* Last Name Input */}
            <View style={styles.inputWrapper}>
              <Feather name="user" size={hp(2.5)} color="#6B7280" style={styles.icon} />
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                style={styles.input}
                placeholder="Last Name"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            {/* Username Input */}
            <View style={styles.inputWrapper}>
              <Feather name="edit" size={hp(2.5)} color="#6B7280" style={styles.icon} />
              <TextInput
                value={username}
                onChangeText={setUsername}
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleUpdateProfile}
              style={[styles.button, styles.buttonPrimary, { marginTop: hp(2) }]}
              disabled={updatingProfile}
            >
              {updatingProfile ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Save Changes</Text>
              )}
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              onPress={() => setEditProfileModalVisible(false)}
              style={[styles.button, styles.buttonSecondary, { marginTop: hp(1) }]}
              disabled={updatingProfile}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </>

  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  editProfileModalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: hp(2.5),
    fontWeight: 'bold',
    marginBottom: hp(2),
    textAlign: 'center',
    color: '#1F2937',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: hp(2),
  },
  imagePreview: {
    width: hp(15),
    height: hp(15),
    borderRadius: hp(7.5),
    marginBottom: hp(1),
  },
  uploadingText: {
    color: '#2196f3',
    marginBottom: hp(1),
    fontSize: hp(2),
  },
  button: {
    width: '100%',
    paddingVertical: hp(1.5),
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: hp(0.5),
  },
  buttonPrimary: {
    backgroundColor: '#3B82F6',
  },
  buttonSecondary: {
    backgroundColor: '#D1D5DB',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: hp(2),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: wp(4),
    height: hp(6),
    marginBottom: hp(2),
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  icon: {
    marginRight: wp(2),
  },
  input: {
    flex: 1,
    fontSize: hp(2),
    color: '#374151',
  },
});
