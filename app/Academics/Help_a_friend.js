import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, TextInput, Alert, SafeAreaView } from 'react-native';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../context/authContext';
import { AntDesign, Feather } from '@expo/vector-icons';
import { format } from 'timeago.js';
import HomeHeader from "../../components/HomeHeader";

const DEFAULT_PROFILE_IMAGE = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

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
      const requestsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        username: doc.data().username || 'Anonymous',
        userProfilePic: doc.data().userProfilePic || DEFAULT_PROFILE_IMAGE
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
          timestamp: new Date().toISOString()
        })
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
      <View className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
        {/* User Info Header */}
        <View className="flex-row items-center p-4 bg-gray-50">
          <Image
            source={{ uri: item.userProfilePic || DEFAULT_PROFILE_IMAGE }}
            className="w-12 h-12 rounded-full border-2 border-blue-100"
          />
          <View className="ml-3 flex-1">
            <Text className="font-bold text-lg">{item.username || 'Anonymous'}</Text>
            {item.timestamp && (
              <Text>{format(item.timestamp?.toDate())}</Text>
            )}
          </View>
        </View>

        {/* Image */}
        <Image
          source={{ uri: item.imageUrl }}
          className="w-full h-72"
          resizeMode="cover"
        />
        <View className="p-4">
          <Text className="text-gray-800 text-lg">{item.description}</Text>
        </View>

        {/* Comments Section */}
        <View className="p-4 border-t border-gray-100">
          <Text className="font-bold text-lg mb-3">Comments</Text>
          {item.comments?.map((comment, index) => (
            <View key={index} className="flex-row items-start mb-3 bg-gray-50 p-3 rounded-lg">
              <Image
                source={{ uri: comment.userProfilePic || DEFAULT_PROFILE_IMAGE }}
                className="w-10 h-10 rounded-full border border-gray-200"
              />
              <View className="ml-3 flex-1">
                <Text className="font-bold text-gray-800">{comment.username || 'Anonymous'}</Text>
                <Text className="text-gray-600 mt-1">{comment.text}</Text>
              </View>
            </View>
          ))}

          {/* Add Comment Section */}
          {user ? (
            selectedRequest === item.id ? (
              <View className="flex-row items-center mt-3">
                <TextInput
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Add a helpful comment..."
                  className="flex-1 bg-gray-50 px-4 py-3 rounded-full mr-2"
                />
                <TouchableOpacity
                  onPress={() => addComment(item.id)}
                  className="bg-blue-500 p-3 rounded-full"
                >
                  <Feather name="send" size={20} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setSelectedRequest(item.id)}
                className="mt-2 flex-row items-center"
              >
                <Feather name="message-circle" size={20} color="#3b82f6" />
                <Text className="text-blue-500 ml-2 font-medium">Add Comment</Text>
              </TouchableOpacity>
            )
          ) : (
            <Text className="text-gray-500 mt-2">Sign in to comment</Text>
          )}
        </View>
      </View>
    );
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <HomeHeader />
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-xl text-gray-600">Please sign in to view help requests</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <HomeHeader />
      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={item => item?.id}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <View className="mb-4">
            <Text className="text-2xl font-bold text-gray-800">Help Requests</Text>
            <Text className="text-gray-500 mt-1">See how you can help others</Text>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View className="flex-1 justify-center items-center p-8">
              <Text>Loading...</Text>
            </View>
          ) : (
            <View className="flex-1 justify-center items-center p-8">
              <Feather name="inbox" size={48} color="#9ca3af" />
              <Text className="text-gray-500 text-lg mt-4 text-center">
                No help requests yet.{'\n'}Check back later!
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
};

export default Help_a_friend;