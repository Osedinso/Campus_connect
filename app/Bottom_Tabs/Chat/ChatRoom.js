// screens/Chat/ChatRoom.js

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Keyboard,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../context/authContext';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { db, storage } from '../../../firebaseConfig';
import { 
  collection,
  query, 
  orderBy, 
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc 
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MESSAGE_MAX_WIDTH = SCREEN_WIDTH * 0.75;

export default function ChatRoom({ route }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatDetails, setChatDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const navigation = useNavigation();
  const { chatId } = route.params;
  const { user } = useAuth();
  const flatListRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  useEffect(() => {
    if (!chatId) {
      console.log("No chatId provided");
      return;
    }

    const fetchChatDetails = async () => {
      try {
        const chatDocRef = doc(db, 'chats', chatId);
        const chatDoc = await getDoc(chatDocRef);
        
        if (chatDoc.exists()) {
          setChatDetails(chatDoc.data());
        } else {
          console.log("No chat found with ID:", chatId);
        }
      } catch (error) {
        console.error("Error fetching chat details:", error);
      }
    };
    fetchChatDetails();

    const messagesCollectionRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesCollectionRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messageList);
      setLoading(false);
    }, (error) => {
      console.error("Error in messages snapshot:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      const messagesCollectionRef = collection(db, 'chats', chatId, 'messages');
      const messageData = {
        text: inputMessage.trim(),
        userId: user.userId,
        username: user.username,
        timestamp: serverTimestamp(),
        type: 'text'
      };

      await addDoc(messagesCollectionRef, messageData);

      const chatDocRef = doc(db, 'chats', chatId);
      await updateDoc(chatDocRef, {
        lastMessage: {
          text: inputMessage.trim(),
          userId: user.userId,
          username: user.username
        },
        lastMessageTime: serverTimestamp()
      });

      setInputMessage('');
      Keyboard.dismiss();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        const response = await fetch(uri);
        const blob = await response.blob();
        
        const imageRef = ref(storage, `chat-images/${chatId}/${Date.now()}.jpg`);
        await uploadBytes(imageRef, blob);
        const downloadURL = await getDownloadURL(imageRef);

        const messageData = {
          text: 'Image',
          userId: user.userId,
          username: user.username,
          timestamp: serverTimestamp(),
          type: 'image',
          imageUrl: downloadURL
        };

        const messagesCollectionRef = collection(db, 'chats', chatId, 'messages');
        await addDoc(messagesCollectionRef, messageData);

        const chatDocRef = doc(db, 'chats', chatId);
        await updateDoc(chatDocRef, {
          lastMessage: {
            text: '📷 Image',
            userId: user.userId,
            username: user.username
          },
          lastMessageTime: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error sending image:', error);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const renderMessage = ({ item, index }) => {
    const isCurrentUser = item.userId === user.userId;
    const isImage = item.type === 'image';
    const showAvatar = !isCurrentUser && 
      (!messages[index + 1] || messages[index + 1].userId !== item.userId);

    return (
      <View 
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.messageContainerRight : styles.messageContainerLeft,
        ]}
      >
        {/* Show avatar for other users */}
        {showAvatar && !isCurrentUser && (
          <Image
            source={{ 
              uri: chatDetails?.participantDetails[item.userId]?.profileUrl || 
                   require('../../../assets/images/default-avatar.png')
            }}
            style={styles.avatar}
          />
        )}

        <View style={styles.messageContentContainer}>
          {/* Show username in group chats */}
          {showAvatar && !isCurrentUser && chatDetails?.isGroup && (
            <Text style={styles.usernameText}>
              {item.username}
            </Text>
          )}

          <View
            style={[
              styles.messageBubble,
              isCurrentUser ? styles.messageBubbleRight : styles.messageBubbleLeft,
            ]}
          >
            {isImage ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.messageImage}
                resizeMode="cover"
              />
            ) : (
              <Text
                style={[
                  styles.messageText,
                  isCurrentUser ? styles.messageTextRight : styles.messageTextLeft,
                ]}
              >
                {item.text}
              </Text>
            )}

            <Text
              style={[
                styles.messageTime,
                isCurrentUser ? styles.messageTimeRight : styles.messageTimeLeft,
              ]}
            >
              {formatTime(item.timestamp)}
            </Text>
          </View>
        </View>

        {/* Empty space to align messages correctly */}
        {isCurrentUser && (
          <View style={styles.avatarPlaceholder} />
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          inverted
          contentContainerStyle={styles.flatListContent}
          onContentSizeChange={() => {
            if (!isKeyboardVisible) {
              flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
            }
          }}
        />

        <View style={styles.inputContainer}>
          <View style={styles.inputInnerContainer}>
            <TouchableOpacity 
              onPress={handleImagePick}
              style={styles.imageButton}
              activeOpacity={0.7}
            >
              <Ionicons name="image-outline" size={24} color="#3B82F6" />
            </TouchableOpacity>

            <TextInput
              ref={inputRef}
              value={inputMessage}
              onChangeText={setInputMessage}
              placeholder="Message..."
              multiline
              style={styles.textInput}
            />

            <TouchableOpacity
              onPress={sendMessage}
              disabled={!inputMessage.trim()}
              style={[
                styles.sendButton,
                inputMessage.trim() ? styles.sendButtonActive : styles.sendButtonDisabled,
              ]}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color="white" 
                style={{ marginLeft: 2 }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  flatListContent: {
    paddingVertical: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Message styles
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    marginHorizontal: 10,
  },
  messageContainerLeft: {
    justifyContent: 'flex-start',
  },
  messageContainerRight: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: hp(4),
    height: hp(4),
    borderRadius: hp(2),
    marginRight: 8,
    marginTop: 2,
    backgroundColor: '#F3F4F6',
  },
  avatarPlaceholder: {
    width: hp(4),
    marginLeft: 8,
  },
  messageContentContainer: {
    maxWidth: MESSAGE_MAX_WIDTH,
  },
  usernameText: {
    fontSize: 12,
    color: '#6B7280', // Tailwind gray-500
    marginBottom: 2,
    marginLeft: 4,
  },
  messageBubble: {
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    maxWidth: '100%',
  },
  messageBubbleLeft: {
    backgroundColor: '#F3F4F6', // Tailwind gray-100
    borderTopLeftRadius: 0,
    alignSelf: 'flex-start',
  },
  messageBubbleRight: {
    backgroundColor: '#3B82F6', // Tailwind blue-500
    borderTopRightRadius: 0,
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTextLeft: {
    color: '#111827', // Tailwind gray-900
  },
  messageTextRight: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageTimeLeft: {
    color: '#6B7280', // Tailwind gray-500
  },
  messageTimeRight: {
    color: '#D1D5DB', // Tailwind gray-300
  },
  messageImage: {
    width: MESSAGE_MAX_WIDTH * 0.8,
    height: MESSAGE_MAX_WIDTH * 0.8,
    borderRadius: 12,
  },
  // Input styles
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB', // Tailwind gray-200
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  inputInnerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F3F4F6', // Tailwind gray-100
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  imageButton: {
    padding: 6,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    marginHorizontal: 8,
    paddingVertical: 8,
    fontSize: 16,
    lineHeight: 22,
    color: '#111827', // Tailwind gray-900
  },
  sendButton: {
    padding: 10,
    borderRadius: 9999,
  },
  sendButtonActive: {
    backgroundColor: '#3B82F6', // Tailwind blue-500
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF', // Tailwind gray-400
  },
});
