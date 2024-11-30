// screens/Chat/NewGroup.js

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../context/authContext';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  getDoc, // Import getDoc
  doc,    // Import doc
  serverTimestamp 
} from 'firebase/firestore';
import { db, storage, chatsRef } from '../../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { AntDesign } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function NewGroup() {
  const [groupName, setGroupName] = useState('');
  const [groupImage, setGroupImage] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // Define searchQuery state
  const { user } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    fetchUsers();
  }, []);

  // Function to fetch all users except the current user
  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('userId', '!=', user.userId));
      const querySnapshot = await getDocs(q);
      const usersList = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setUsers(usersList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load users');
    }
  };

  // Function to handle image picking
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
        setGroupImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Function to upload group image to Firebase Storage
  const uploadGroupImage = async () => {
    if (!groupImage) return null;

    try {
      const response = await fetch(groupImage);
      const blob = await response.blob();
      const imageRef = ref(storage, `groupImages/${Date.now()}.jpg`);
      await uploadBytes(imageRef, blob);
      return await getDownloadURL(imageRef);
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload group image');
      return null;
    }
  };

  // Function to create a new group chat
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (selectedUsers.length < 2) {
      Alert.alert('Error', 'Please select at least 2 members');
      return;
    }

    setUploading(true);

    try {
      let groupImageUrl = null;
      if (groupImage) {
        groupImageUrl = await uploadGroupImage();
      }

      // Create chat document data
      const chatData = {
        isGroup: true,
        groupName: groupName.trim(),
        groupImage: groupImageUrl,
        createdBy: user.userId,
        createdAt: serverTimestamp(),
        lastMessage: null,
        lastMessageTime: serverTimestamp(),
        participants: [user.userId, ...selectedUsers.map(u => u.userId)],
        participantDetails: {
          [user.userId]: {
            username: user.username,
            profileUrl: user.profileUrl || null,
          },
          ...selectedUsers.reduce((acc, u) => ({
            ...acc,
            [u.userId]: {
              username: u.username,
              profileUrl: u.profileUrl || null,
            }
          }), {})
        }
      };

      // Add chat document to Firestore
      const chatDocRef = await addDoc(chatsRef, chatData);

      // Fetch the newly created chat document to get chatDetails
      const chatDocSnapshot = await getDoc(chatDocRef);
      if (chatDocSnapshot.exists()) {
        const chatDetails = { id: chatDocSnapshot.id, ...chatDocSnapshot.data() };
        navigation.navigate('chatRoom', { // Ensure 'chatRoom' matches your navigation name
          chatId: chatDocSnapshot.id,
          isGroup: true,
          chatDetails: chatDetails, // Pass chatDetails via route.params
        });
      } else {
        console.log("Failed to fetch the newly created chat document.");
        Alert.alert('Error', 'Failed to create group. Please try again.');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group');
    } finally {
      setUploading(false);
    }
  };

  // Function to toggle user selection
  const toggleUserSelection = (selectedUser) => {
    setSelectedUsers(prev => {
      if (prev.find(u => u.userId === selectedUser.userId)) {
        return prev.filter(u => u.userId !== selectedUser.userId);
      } else {
        return [...prev, selectedUser];
      }
    });
  };

  // Filter users based on search query
  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render loading indicator while fetching users
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Group Info Section */}
      <View style={styles.groupInfoContainer}>
        <TouchableOpacity
          onPress={handleImagePick}
          style={styles.imagePicker}
        >
          <View style={styles.imageContainer}>
            <Image
              source={groupImage ? { uri: groupImage } : require('../../../assets/images/default-avatar.png')}
              style={styles.groupImage}
            />
            <View style={styles.cameraIconContainer}>
              <AntDesign name="camera" size={20} color="white" />
            </View>
          </View>
        </TouchableOpacity>

        <TextInput
          value={groupName}
          onChangeText={setGroupName}
          placeholder="Group Name"
          style={styles.groupNameInput}
        />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <AntDesign name="search1" size={20} color="gray" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search users..."
          style={styles.searchInput}
        />
      </View>

      {/* Members Selection */}
      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.userId}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => toggleUserSelection(item)}
            style={styles.userItem}
            activeOpacity={0.7}
          >
            <Image
              source={item.profileUrl ? { uri: item.profileUrl } : require('../../../assets/images/default-avatar.png')}
              style={styles.userImage}
            />
            <View style={styles.userInfo}>
              <Text style={styles.username}>{item.username}</Text>
            </View>
            <View 
              style={[
                styles.checkbox,
                selectedUsers.find(u => u.userId === item.userId) 
                  ? styles.checkboxSelected 
                  : styles.checkboxUnselected
              ]}
            >
              {selectedUsers.find(u => u.userId === item.userId) && (
                <AntDesign name="check" size={16} color="white" />
              )}
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.flatListContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
      />

      {/* Create Button */}
      <View style={styles.createButtonContainer}>
        <TouchableOpacity
          onPress={handleCreateGroup}
          disabled={uploading}
          style={[
            styles.createButton,
            uploading ? styles.createButtonDisabled : styles.createButtonEnabled
          ]}
        >
          <Text style={styles.createButtonText}>
            {uploading ? 'Creating Group...' : `Create Group (${selectedUsers.length} selected)`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  groupInfoContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // Tailwind gray-200
  },
  imagePicker: {
    alignItems: 'center',
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
  },
  groupImage: {
    width: hp(12),
    height: hp(12),
    borderRadius: hp(6),
    backgroundColor: '#D1D5DB', // Tailwind gray-300
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3B82F6', // Tailwind blue-500
    padding: 4,
    borderRadius: 9999,
  },
  groupNameInput: {
    backgroundColor: '#F3F4F6', // Tailwind gray-100
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#111827', // Tailwind gray-900
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6', // Tailwind gray-100
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    margin: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#111827', // Tailwind gray-900
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6', // Tailwind gray-100
  },
  userImage: {
    width: hp(6),
    height: hp(6),
    borderRadius: hp(3),
    backgroundColor: '#D1D5DB', // Tailwind gray-300
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  username: {
    fontWeight: '600',
    fontSize: 18,
    color: '#1F2937', // Tailwind gray-900
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB', // Tailwind gray-300
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#3B82F6', // Tailwind blue-500
    borderColor: '#3B82F6',
  },
  checkboxUnselected: {
    backgroundColor: 'transparent',
  },
  flatListContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#6B7280', // Tailwind gray-500
    fontSize: 18,
  },
  createButtonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB', // Tailwind gray-200
  },
  createButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonEnabled: {
    backgroundColor: '#3B82F6', // Tailwind blue-500
  },
  createButtonDisabled: {
    backgroundColor: '#9CA3AF', // Tailwind gray-400
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
