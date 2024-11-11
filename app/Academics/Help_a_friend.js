// screens/Help_a_friend.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  StyleSheet,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../context/authContext';
import { Feather } from '@expo/vector-icons';
import { format } from 'timeago.js';
import HomeHeader from '../../components/HomeHeader';

const DEFAULT_PROFILE_IMAGE =
  'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

const Help_a_friend = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [comment, setComment] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'help_requests'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        username: doc.data().username || 'Anonymous',
        userProfilePic: doc.data().userProfilePic || DEFAULT_PROFILE_IMAGE,
      }));
      setRequests(requestsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addComment = async (requestId) => {
    if (!comment.trim() || !user?.userId) {
      Alert.alert('Error', 'Please sign in to comment');
      return;
    }

    try {
      const requestRef = doc(db, 'help_requests', requestId);
      await updateDoc(requestRef, {
        comments: arrayUnion({
          userId: user.userId,
          username: user.username || 'Anonymous',
          userProfilePic: user.profileUrl || DEFAULT_PROFILE_IMAGE,
          text: comment.trim(),
          timestamp: new Date().toISOString(),
        }),
      });
      setComment('');
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  const renderItem = ({ item }) => {
    if (!item) return null;

    return (
      <View style={styles.postContainer}>
        {/* User Info Header */}
        <View style={styles.userInfoContainer}>
          <Image
            source={{ uri: item.userProfilePic || DEFAULT_PROFILE_IMAGE }}
            style={styles.userImage}
          />
          <View style={styles.userInfoTextContainer}>
            <Text style={styles.usernameText}>{item.username || 'Anonymous'}</Text>
            {item.timestamp && (
              <Text style={styles.timestampText}>
                {format(item.timestamp?.toDate())}
              </Text>
            )}
          </View>
        </View>

        {/* Image */}
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.postImage}
          resizeMode="cover"
        />
        <View style={styles.postContentContainer}>
          <Text style={styles.postDescription}>{item.description}</Text>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsContainer}>
          <Text style={styles.commentsHeader}>Comments</Text>
          {item.comments?.map((comment, index) => (
            <View key={index} style={styles.commentItem}>
              <Image
                source={{
                  uri: comment.userProfilePic || DEFAULT_PROFILE_IMAGE,
                }}
                style={styles.commentUserImage}
              />
              <View style={styles.commentTextContainer}>
                <Text style={styles.commentUsername}>
                  {comment.username || 'Anonymous'}
                </Text>
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
            </View>
          ))}

          {/* Add Comment Section */}
          {user ? (
            selectedRequest === item.id ? (
              <View style={styles.addCommentContainer}>
                <TextInput
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Add a helpful comment..."
                  style={styles.commentInput}
                />
                <TouchableOpacity
                  onPress={() => addComment(item.id)}
                  style={styles.sendButton}
                >
                  <Feather name="send" size={20} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setSelectedRequest(item.id)}
                style={styles.addCommentButton}
              >
                <Feather name="message-circle" size={20} color="#3b82f6" />
                <Text style={styles.addCommentButtonText}>Add Comment</Text>
              </TouchableOpacity>
            )
          ) : (
            <Text style={styles.signInToCommentText}>Sign in to comment</Text>
          )}
        </View>
      </View>
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <HomeHeader />
        <View style={styles.centeredContent}>
          <Text style={styles.signInText}>Please sign in to view help requests</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <HomeHeader />
      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={(item) => item?.id}
        contentContainerStyle={styles.contentContainer}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.pageTitle}>Help Requests</Text>
            <Text style={styles.pageSubtitle}>See how you can help others</Text>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Feather name="inbox" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>
                No help requests yet.{'\n'}Check back later!
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Tailwind gray-100
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  listHeader: {
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937', // Tailwind gray-800
  },
  pageSubtitle: {
    color: '#6B7280', // Tailwind gray-500
    marginTop: 4,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  signInText: {
    fontSize: 18,
    color: '#4B5563', // Tailwind gray-600
  },
  // Post Styles
  postContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  userImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#BFDBFE', // Tailwind blue-100
  },
  userInfoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  usernameText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1F2937',
  },
  timestampText: {
    color: '#6B7280',
  },
  postImage: {
    width: '100%',
    height: 200,
  },
  postContentContainer: {
    padding: 16,
  },
  postDescription: {
    fontSize: 16,
    color: '#374151',
  },
  commentsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  commentsHeader: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
    color: '#1F2937',
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  commentUserImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },
  commentTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  commentUsername: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  commentText: {
    marginTop: 4,
    color: '#4B5563',
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 24,
  },
  addCommentButton: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addCommentButtonText: {
    color: '#3B82F6',
    marginLeft: 8,
    fontWeight: '500',
  },
  signInToCommentText: {
    color: '#6B7280',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default Help_a_friend;
