// screens/Chat/NewChat.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  TextInput 
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Changed this line
import { useAuth } from '../../../context/authContext';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
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
  const navigation = useNavigation(); // Changed this line

  useEffect(() => {
    fetchUsers();
  }, []);

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
    }
  };

  const startChat = async (selectedUser) => {
    try {
      // Check if chat already exists
      const q = query(
        chatsRef,
        where('participants', 'array-contains', user.userId)
      );
      const querySnapshot = await getDocs(q);
      const existingChat = querySnapshot.docs.find(doc => {
        const chatData = doc.data();
        return !chatData.isGroup && 
          chatData.participants.includes(selectedUser.userId);
      });

      if (existingChat) {
        navigation.navigate('chatRoom', { // Changed this line
          chatId: existingChat.id,
          isGroup: false
        });
        return;
      }

      // Create new chat
      const chatDoc = await addDoc(chatsRef, {
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
      });

      navigation.navigate('chatRoom', { // Changed this line
        chatId: chatDoc.id,
        isGroup: false
      });
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  // Rest of your component remains the same
  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="p-4">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
          <AntDesign name="search1" size={20} color="gray" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search users..."
            className="flex-1 ml-2"
          />
        </View>
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.userId}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => startChat(item)}
            className="flex-row items-center p-4 border-b border-gray-100"
          >
            <Image
              source={
                item.profileUrl 
                  ? { uri: item.profileUrl }
                  : require('../../../assets/images/default-avatar.png')
              }
              style={{ width: hp(7), height: hp(7), borderRadius: hp(3.5) }}
              className="bg-gray-100"
            />
            <View className="ml-4">
              <Text className="font-semibold text-lg">{item.username}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center p-4">
            <Text className="text-gray-500 text-lg">No users found</Text>
          </View>
        }
      />
    </View>
  );
}