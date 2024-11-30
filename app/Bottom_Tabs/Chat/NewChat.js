// screens/Chat/NewChat.js

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image,
  StyleSheet, 
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../context/authContext';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  getDoc, 
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { db, chatsRef } from '../../../firebaseConfig';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AntDesign } from '@expo/vector-icons';

export default function NewChat() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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
      const usersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to fetch users. Please try again later.');
    }
  };

  // Function to start a chat with a selected user
  const startChat = async (selectedUser) => {
    try {
      // Check if a one-on-one chat already exists between the current user and the selected user
      const q = query(
        chatsRef,
        where('participants', 'array-contains', user.userId),
        where('isGroup', '==', false)
      );
      const querySnapshot = await getDocs(q);
      const existingChat = querySnapshot.docs.find(doc => {
        const chatData = doc.data();
        return chatData.participants.includes(selectedUser.userId);
      });

      if (existingChat) {
        // If chat exists, fetch its details and navigate to ChatRoom
        const chatDocRef = doc(db, 'chats', existingChat.id);
        const chatDoc = await getDoc(chatDocRef);
        if (chatDoc.exists()) {
          const chatDetails = { id: chatDoc.id, ...chatDoc.data() };
          navigation.navigate('chatRoom', { // Ensure 'chatRoom' matches your navigation name
            chatId: chatDoc.id,
            isGroup: false,
            chatDetails: chatDetails, // Pass chatDetails via route.params
          });
        } else {
          console.log("Chat document does not exist.");
          Alert.alert('Error', 'Chat not found. Please try again.');
        }
        return;
      }

      // If chat does not exist, create a new one
      const chatData = {
        isGroup: false,
        participants: [user.userId, selectedUser.userId],
        participantDetails: {
          [user.userId]: {
            username: user.username,
            profileUrl: user.profileUrl
          },
          [selectedUser.userId]: {
            username: selectedUser.username,
            profileUrl: selectedUser.profileUrl
          }
        },
        createdAt: serverTimestamp(),
        lastMessage: null,
        lastMessageTime: serverTimestamp()
      };

      const chatDocRef = await addDoc(chatsRef, chatData);

      // Fetch the newly created chat document to get chatDetails
      const chatDocSnapshot = await getDoc(chatDocRef);
      if (chatDocSnapshot.exists()) {
        const chatDetails = { id: chatDocSnapshot.id, ...chatDocSnapshot.data() };
        navigation.navigate('chatRoom', { // Ensure 'chatRoom' matches your navigation name
          chatId: chatDocSnapshot.id,
          isGroup: false,
          chatDetails: chatDetails, // Pass chatDetails via route.params
        });
      } else {
        console.log("Failed to fetch the newly created chat document.");
        Alert.alert('Error', 'Failed to create chat. Please try again.');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      Alert.alert('Error', 'An error occurred while creating the chat. Please try again.');
    }
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

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.userId} // Ensure 'userId' is unique
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => startChat(item)}
            style={styles.userItem}
            activeOpacity={0.7}
          >
            <Image
              source={
                item.profileUrl 
                  ? { uri: item.profileUrl }
                  : require('../../../assets/images/default-avatar.png')
              }
              style={styles.userImage}
            />
            <View style={styles.userInfo}>
              <Text style={styles.username}>{item.username}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
      />
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
    borderBottomColor: '#f0f0f0',
  },
  userImage: {
    width: hp(7),
    height: hp(7),
    borderRadius: hp(3.5),
    backgroundColor: '#f0f0f0',
  },
  userInfo: {
    marginLeft: 16,
  },
  username: {
    fontWeight: '600',
    fontSize: 18,
    color: '#1F2937', // Tailwind gray-900
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
});
