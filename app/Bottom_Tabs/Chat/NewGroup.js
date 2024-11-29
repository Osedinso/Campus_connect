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
  Alert 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../context/authContext';
import { db, storage, chatsRef } from '../../../firebaseConfig';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
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
  const { user } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('userId', '!=', user.userId));
      const querySnapshot = await getDocs(q);
      const usersList = querySnapshot.docs.map(doc => ({
        ...doc.data()
      }));
      setUsers(usersList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to load users');
      setLoading(false);
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
        mediaTypes: "images",
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
      return null;
    }
  };

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

      // Create chat document
      const chatDoc = await addDoc(chatsRef, {
        isGroup: true,
        groupName: groupName.trim(),
        groupImage: groupImageUrl,
        createdBy: user.userId,
        createdAt: serverTimestamp(),
        lastMessageTime: serverTimestamp(),
        participants: [user.userId, ...selectedUsers.map(u => u.userId)],
        participantDetails: {
          [user.userId]: {
            username: user.username,
            profileUrl: user.profileUrl
          },
          ...selectedUsers.reduce((acc, u) => ({
            ...acc,
            [u.userId]: {
              username: u.username,
              profileUrl: u.profileUrl
            }
          }), {})
        }
      });

      navigation.navigate('chatRoom', { chatId: chatDoc.id, isGroup: true });
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group');
    } finally {
      setUploading(false);
    }
  };

  const toggleUserSelection = (selectedUser) => {
    setSelectedUsers(prev => {
      if (prev.find(u => u.userId === selectedUser.userId)) {
        return prev.filter(u => u.userId !== selectedUser.userId);
      } else {
        return [...prev, selectedUser];
      }
    });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Group Info Section */}
      <View className="p-4 border-b border-gray-200">
        <TouchableOpacity
          onPress={handleImagePick}
          className="items-center mb-4"
        >
          <View className="relative">
            <Image
              source={groupImage ? { uri: groupImage } : require('../../../assets/images/default-avatar.png')}
              style={{ width: hp(12), height: hp(12), borderRadius: hp(6) }}
              className="bg-gray-200"
            />
            <View className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full">
              <AntDesign name="camera" size={20} color="white" />
            </View>
          </View>
        </TouchableOpacity>

        <TextInput
          value={groupName}
          onChangeText={setGroupName}
          placeholder="Group Name"
          className="bg-gray-100 p-3 rounded-lg"
        />
      </View>

      {/* Members Selection */}
      <FlatList
        data={users}
        keyExtractor={item => item.userId}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => toggleUserSelection(item)}
            className="flex-row items-center p-4 border-b border-gray-100"
          >
            <Image
              source={item.profileUrl ? { uri: item.profileUrl } : require('../../../assets/images/default-avatar.png')}
              style={{ width: hp(6), height: hp(6), borderRadius: hp(3) }}
              className="bg-gray-200"
            />
            <Text className="flex-1 ml-3 font-medium">{item.username}</Text>
            <View 
              className={`w-6 h-6 rounded-full border-2 justify-center items-center
                ${selectedUsers.find(u => u.userId === item.userId) 
                  ? 'bg-blue-500 border-blue-500' 
                  : 'border-gray-300'}`}
            >
              {selectedUsers.find(u => u.userId === item.userId) && (
                <AntDesign name="check" size={16} color="white" />
              )}
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Create Button */}
      <View className="p-4">
        <TouchableOpacity
          onPress={handleCreateGroup}
          disabled={uploading}
          className={`p-4 rounded-lg ${uploading ? 'bg-gray-400' : 'bg-blue-500'}`}
        >
          <Text className="text-white text-center font-semibold">
            {uploading ? 'Creating Group...' : `Create Group (${selectedUsers.length} selected)`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
