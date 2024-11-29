// screens/Chat/ChatHomeScreen.js
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, FlatList, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { chatsRef } from '../../../firebaseConfig';
import { query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../../context/authContext';
import ChatListItem from './ChatListItem';
import { AntDesign } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function ChatHomeScreen() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    if (!user?.userId) return;

    const q = query(
      chatsRef,
      where('participants', 'array-contains', user.userId),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChats(chatList);
      setLoading(false);
    }, (error) => {
      console.error('Chat list error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleNewChat = () => {
    navigation.navigate('newChat');
  };

  const handleNewGroup = () => {
    navigation.navigate('newGroup');
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
      {/* Header Actions */}
      <View className="flex-row justify-end items-center p-4 space-x-4">
        <TouchableOpacity 
          onPress={handleNewChat}
          className="bg-blue-500 p-3 rounded-full"
        >
          <AntDesign name="message1" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={handleNewGroup}
          className="bg-green-500 p-3 rounded-full"
        >
          <AntDesign name="addusergroup" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Chat List */}
      <FlatList
        data={chats}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ChatListItem chat={item} currentUser={user} />}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center p-4">
            <Text className="text-gray-500 text-lg">No conversations yet</Text>
            <Text className="text-gray-400 text-center mt-2">
              Start a new chat or create a group
            </Text>
          </View>
        }
      />
    </View>
  );
}