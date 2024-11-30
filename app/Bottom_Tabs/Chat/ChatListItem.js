// components/chat/ChatListItem.js

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  Platform,
  ActionSheetIOS,
  ToastAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { AntDesign } from '@expo/vector-icons';
import { db } from '../../../firebaseConfig';
import {
  collection,
  doc,
  deleteDoc,
  getDocs,
  query,
  updateDoc, // Import updateDoc
} from 'firebase/firestore';

export default function ChatListItem({ chat, currentUser }) {
  const navigation = useNavigation();

  // Define constants for AI Assistant
  const AI_USER_ID = 'ai_assistant';
  const AI_USERNAME = 'AI Assistant';
  const AI_PROFILE_URL = require('../../../assets/images/default-avatar.png'); // Replace with your AI avatar URL

  const getChatName = () => {
    if (chat.isGroup) {
      return chat.groupName || 'Group Chat';
    }
    if (!currentUser?.userId || !chat.participantDetails) {
      return 'Unknown User';
    }
    // Find the other participant's details
    const otherParticipant = Object.entries(chat.participantDetails).find(
      ([id]) => id !== currentUser.userId
    );

    // Check if the other participant is the AI Assistant
    if (otherParticipant?.[0] === AI_USER_ID) {
      return AI_USERNAME;
    }

    return otherParticipant?.[1]?.username || 'Unknown User';
  };

  const getChatImage = () => {
    if (chat.isGroup) {
      return chat.groupImage
        ? { uri: chat.groupImage }
        : require('../../../assets/images/default-avatar.png');
    }
    if (!currentUser?.userId || !chat.participantDetails) {
      return require('../../../assets/images/default-avatar.png');
    }
    const otherParticipant = Object.entries(chat.participantDetails).find(
      ([id]) => id !== currentUser.userId
    );

    // Check if the other participant is the AI Assistant
    if (otherParticipant?.[0] === AI_USER_ID) {
      return AI_PROFILE_URL;
    }

    return otherParticipant?.[1]?.profileUrl
      ? { uri: otherParticipant[1].profileUrl }
      : require('../../../assets/images/default-avatar.png');
  };

  const formatLastMessage = () => {
    if (!chat.lastMessage) return 'No messages yet';
    if (!currentUser?.userId) {
      return chat.lastMessage.text;
    }
    if (chat.lastMessage.userId === currentUser.userId) {
      return `You: ${chat.lastMessage.text}`;
    } else if (chat.isGroup) {
      return `${chat.lastMessage.username}: ${chat.lastMessage.text}`;
    } else {
      return chat.lastMessage.text;
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp?.toDate) return '';
    const date = timestamp.toDate();
    const now = new Date();

    const diffInSeconds = Math.floor((now - date) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handlePress = () => {
    const isAIChat = chat.participants.includes(AI_USER_ID);

    navigation.navigate('chatRoom', {
      chatId: chat.id,
      isGroup: chat.isGroup,
      chatDetails: chat,
      isAIChat: isAIChat, // Pass isAIChat parameter
    });
  };

  // Function to handle long press (show options to delete chat)
  const handleLongPress = () => {
    if (Platform.OS === 'ios') {
      showActionSheetIOS();
    } else {
      showActionSheetAndroid();
    }
  };

  const showActionSheetIOS = () => {
    const options = ['Cancel', 'Delete Chat'];
    const destructiveButtonIndex = 1;
    const cancelButtonIndex = 0;

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        destructiveButtonIndex,
        cancelButtonIndex,
        title: 'Chat Options',
      },
      (buttonIndex) => {
        if (buttonIndex === destructiveButtonIndex) {
          confirmDeleteChat();
        }
      }
    );
  };

  const showActionSheetAndroid = () => {
    Alert.alert(
      'Chat Options',
      'Do you want to delete this chat?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Chat', onPress: confirmDeleteChat, style: 'destructive' },
      ],
      { cancelable: true }
    );
  };

  const confirmDeleteChat = () => {
    Alert.alert(
      'Delete Chat',
      'Are you sure you want to delete this chat?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: deleteChatHistory, style: 'destructive' },
      ],
      { cancelable: true }
    );
  };

  const deleteChatHistory = async () => {
    try {
      const chatDocRef = doc(db, 'chats', chat.id);

      if (chat.isGroup) {
        // Delete all messages in the group chat but keep the chat document
        const messagesCollectionRef = collection(db, 'chats', chat.id, 'messages');
        const messagesQuery = query(messagesCollectionRef);
        const messagesSnapshot = await getDocs(messagesQuery);

        const deletePromises = messagesSnapshot.docs.map((doc) => deleteDoc(doc.ref));

        await Promise.all(deletePromises);

        // Optionally, update the lastMessage and lastMessageTime
        await updateDoc(chatDocRef, {
          lastMessage: null,
          lastMessageTime: null,
        });

        showToast('Chat history cleared.');
      } else {
        // Delete the entire chat document (one-on-one chat)
        await deleteDoc(chatDocRef);

        showToast('Chat deleted.');
      }
    } catch (error) {
      console.error('Error deleting chat history:', error);
      Alert.alert('Error', 'Failed to delete chat. Please try again.');
    }
  };

  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert(message);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={styles.container}
      activeOpacity={0.7}
    >
      {/* Profile/Group Image */}
      <View style={{ position: 'relative' }}>
        <Image
          source={getChatImage()}
          style={styles.chatImage}
        />
        {chat.isGroup && (
          <View style={styles.groupIconContainer}>
            <AntDesign name="team" size={12} color="white" />
          </View>
        )}
      </View>

      {/* Chat Details */}
      <View style={{ flex: 1, marginLeft: 16 }}>
        <View style={styles.chatHeader}>
          <Text
            style={styles.chatName}
            numberOfLines={1}
          >
            {getChatName()}
          </Text>
          {chat.lastMessageTime && (
            <Text
              style={styles.chatTime}
            >
              {formatTime(chat.lastMessageTime)}
            </Text>
          )}
        </View>

        <Text
          style={styles.chatLastMessage}
          numberOfLines={1}
        >
          {formatLastMessage()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  chatImage: {
    width: hp(7),
    height: hp(7),
    borderRadius: hp(3.5),
    backgroundColor: '#f0f0f0',
  },
  groupIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#10B981', // Tailwind green-500
    padding: 4,
    borderRadius: 9999,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatName: {
    fontWeight: '600',
    color: '#1F2937', // Tailwind gray-900
    fontSize: hp(2),
    flex: 1,
  },
  chatTime: {
    color: '#6B7280', // Tailwind gray-500
    fontSize: hp(1.6),
    marginLeft: 8,
  },
  chatLastMessage: {
    color: '#6B7280', // Tailwind gray-500
    marginTop: 4,
    fontSize: hp(1.8),
  },
});
