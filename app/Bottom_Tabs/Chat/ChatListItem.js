// components/chat/ChatListItem.js

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { AntDesign } from '@expo/vector-icons';

export default function ChatListItem({ chat, currentUser }) {
  const navigation = useNavigation();

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
    return otherParticipant?.[1]?.username || 'Unknown User';
  };

  const getChatImage = () => {
    if (chat.isGroup) {
      return chat.groupImage
        ? { uri: chat.groupImage } // Wrap the groupImage in { uri: ... }
        : require('../../../assets/images/default-avatar.png');
    }
    if (!currentUser?.userId || !chat.participantDetails) {
      return require('../../../assets/images/default-avatar.png');
    }
    const otherParticipant = Object.entries(chat.participantDetails).find(
      ([id]) => id !== currentUser.userId
    );
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
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handlePress = () => {
    navigation.navigate('chatRoom', {
      chatId: chat.id,
      isGroup: chat.isGroup,
      chatDetails: chat,
    });
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
      }}
    >
      {/* Profile/Group Image */}
      <View style={{ position: 'relative' }}>
        <Image
          source={getChatImage()}
          style={{
            width: hp(7),
            height: hp(7),
            borderRadius: hp(3.5),
            backgroundColor: '#f0f0f0',
          }}
        />
        {chat.isGroup && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: '#10B981', // Tailwind green-500
              padding: 4,
              borderRadius: 9999,
            }}
          >
            <AntDesign name="team" size={12} color="white" />
          </View>
        )}
      </View>

      {/* Chat Details */}
      <View style={{ flex: 1, marginLeft: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text
            style={{
              fontWeight: '600',
              color: '#1F2937', // Tailwind gray-900
              fontSize: hp(2),
              flex: 1,
            }}
            numberOfLines={1}
          >
            {getChatName()}
          </Text>
          {chat.lastMessageTime && (
            <Text
              style={{
                color: '#6B7280', // Tailwind gray-500
                fontSize: hp(1.6),
                marginLeft: 8,
              }}
            >
              {formatTime(chat.lastMessageTime)}
            </Text>
          )}
        </View>

        <Text
          style={{
            color: '#6B7280', // Tailwind gray-500
            marginTop: 4,
            fontSize: hp(1.8),
          }}
          numberOfLines={1}
        >
          {formatLastMessage()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
