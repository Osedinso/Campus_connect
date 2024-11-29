// components/chat/ChatRoomHeader.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatRoomHeader({ chatDetails, currentUser }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const getOtherParticipant = () => {
    if (!chatDetails || chatDetails.isGroup) return null;
    const otherParticipant = Object.entries(chatDetails.participantDetails || {})
      .find(([id]) => id !== currentUser?.userId);
    return otherParticipant ? otherParticipant[1] : null;
  };

  const getChatImage = () => {
    if (chatDetails?.isGroup) {
      return chatDetails.groupImage
        ? { uri: chatDetails.groupImage }
        : require('../assets/images/default-avatar.png'); // Adjusted the path
    }
    const otherUser = getOtherParticipant();
    return otherUser?.profileUrl
      ? { uri: otherUser.profileUrl }
      : require('../assets/images/default-avatar.png'); // Adjusted the path
  };

  const getChatName = () => {
    if (chatDetails?.isGroup) {
      return chatDetails.groupName || 'Group Chat';
    }
    const otherUser = getOtherParticipant();
    return otherUser?.username || 'Chat';
  };

  return (
    <View
      style={[
        styles.headerContainer,
        { paddingTop: Platform.OS === 'ios' ? insets.top : 0 },
      ]}
    >
      <View style={styles.headerContent}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={28} color="#1F2937" />
        </TouchableOpacity>

        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Image
              source={getChatImage()}
              style={styles.avatar}
              resizeMode="cover"
            />
            {chatDetails?.isGroup && (
              <View style={styles.groupIndicator}>
                <Ionicons name="people" size={12} color="#fff" />
              </View>
            )}
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.chatTitle} numberOfLines={1}>
              {getChatName()}
            </Text>
            {chatDetails?.isGroup ? (
              <Text style={styles.status} numberOfLines={1}>
                {Object.keys(chatDetails.participantDetails || {}).length} members
              </Text>
            ) : (
              <Text style={styles.status} numberOfLines={1}>
                Online
              </Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {!chatDetails?.isGroup && (
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="call-outline" size={24} color="#3B82F6" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: hp(8),
    paddingHorizontal: wp(4),
    justifyContent: 'space-between',
  },
  backButton: {
    paddingRight: wp(2),
    paddingVertical: hp(1),
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: wp(3),
  },
  avatar: {
    width: hp(5),
    height: hp(5),
    borderRadius: hp(2.5),
    backgroundColor: '#F3F4F6',
  },
  groupIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#3B82F6',
    borderRadius: hp(1),
    width: hp(2.2),
    height: hp(2.2),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  textContainer: {
    flex: 1,
  },
  chatTitle: {
    fontSize: hp(2.2),
    fontWeight: '600',
    color: '#1F2937',
  },
  status: {
    fontSize: hp(1.6),
    color: '#6B7280',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: wp(2),
    padding: hp(1),
  },
});
