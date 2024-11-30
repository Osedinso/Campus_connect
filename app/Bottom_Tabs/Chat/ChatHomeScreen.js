// screens/Chat/ChatHomeScreen.js

import React, { useState, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { chatsRef, db } from '../../../firebaseConfig';
import { query, where, orderBy, onSnapshot, addDoc, getDocs, getDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../../context/authContext';
import ChatListItem from './ChatListItem'; // Adjust the import path as needed
import { AntDesign } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function ChatHomeScreen() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  // AI Assistant User ID (Assuming a fixed ID)
  const AI_USER_ID = 'ai_assistant';

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

  const startAIChat = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Please enter a message');
      return;
    }

    try {
      // Check if a chat with AI assistant already exists
      const q = query(
        chatsRef,
        where('participants', 'array-contains', user.userId)
      );

      const querySnapshot = await getDocs(q);
      let aiChat = querySnapshot.docs.find(doc => {
        const chatData = doc.data();
        return !chatData.isGroup &&
               chatData.participants.includes(AI_USER_ID);
      });

      if (!aiChat) {
        // Create a new chat with the AI assistant
        const chatDocRef = await addDoc(chatsRef, {
          isGroup: false,
          participants: [user.userId, AI_USER_ID],
          participantDetails: {
            [user.userId]: {
              username: user.username,
              profileUrl: user.profileUrl
            },
            [AI_USER_ID]: {
              username: 'AI Assistant',
              profileUrl: '../../../assets/images/question_answer_ico.png'
            }
          },
          createdAt: serverTimestamp(),
          lastMessage: null,
          lastMessageTime: serverTimestamp()
        });

        aiChat = await getDoc(chatDocRef);
        aiChat = { id: aiChat.id, ...aiChat.data() };
      }

      // Navigate to the chatroom with AI assistant
      navigation.navigate('chatRoom', {
        chatId: aiChat.id,
        isGroup: false,
        chatDetails: aiChat,
        isAIChat: true, // Indicate that this chat is with the AI assistant
        initialMessage: searchQuery.trim(), // Pass the initial message
      });

      // Clear the search query
      setSearchQuery('');

    } catch (error) {
      console.error('Error starting AI chat:', error);
      Alert.alert('Error', 'Failed to start chat with AI assistant. Please try again.');
    }
  };

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
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Ask CampusConnect AI..."
          style={styles.searchInput}
          onSubmitEditing={startAIChat}
        />
        <TouchableOpacity onPress={startAIChat} style={styles.searchButton}>
          <AntDesign name="arrowright" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Header Actions */}
      <View style={styles.headerActions}>
        <TouchableOpacity 
          onPress={handleNewChat}
          style={styles.newChatButton}
        >
          <AntDesign name="message1" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={handleNewGroup}
          style={styles.newGroupButton}
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
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No conversations yet</Text>
            <Text style={styles.emptySubText}>
              Start a new chat or create a group
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Container styles
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
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#F3F4F6', // Tailwind gray-100
    margin: 8,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#3B82F6', // Tailwind blue-500
    padding: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 4,
    paddingRight: 16,
  },
  newChatButton: {
    backgroundColor: '#3B82F6', // Tailwind blue-500
    padding: 12,
    borderRadius: 9999,
    marginRight: 8,
  },
  newGroupButton: {
    backgroundColor: '#10B981', // Tailwind green-500
    padding: 12,
    borderRadius: 9999,
  },
  emptyContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#6B7280', // Tailwind gray-500
    fontSize: hp(2),
  },
  emptySubText: {
    color: '#9CA3AF', // Tailwind gray-400
    textAlign: 'center',
    marginTop: 8,
  },
});
