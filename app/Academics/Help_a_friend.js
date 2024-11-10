import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, FlatList, Image, TouchableOpacity, TextInput, Alert, SafeAreaView } from 'react-native';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../context/authContext';
import { AntDesign, Feather } from '@expo/vector-icons';
import TimeAgo from 'react-native-timeago';
import HomeHeader from "../../components/HomeHeader";

const Help_a_friend = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [comment, setComment] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const q = query(
      collection(db, 'help_requests'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData = [];
      snapshot.forEach((doc) => {
        requestsData.push({ id: doc.id, ...doc.data() });
      });
      setRequests(requestsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addComment = async (requestId) => {
    if (!comment.trim()) return;

    try {
      const requestRef = doc(db, 'help_requests', requestId);
      await updateDoc(requestRef, {
        comments: arrayUnion({
          userId: user.userId,
          username: user.username,
          userProfilePic: user.profileUrl,
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

  const renderItem = ({ item }) => (
    <View className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
      {/* User Info Header */}
      <View className="flex-row items-center p-4 bg-gray-50">
        <Image
          source={{ uri: item.userProfilePic }}
          className="w-12 h-12 rounded-full border-2 border-blue-100"
        />
        <View className="ml-3 flex-1">
          <Text className="font-bold text-lg">{item.username}</Text>
          <Text className="text-gray-500 text-sm">
            <TimeAgo time={item.timestamp?.toDate()} />
          </Text>
        </View>
      </View>

      {/* Image */}
      <View className="relative">
        <Image
          source={{ uri: item.imageUrl }}
          className="w-full h-72"
          resizeMode="cover"
        />
        <View className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
          <Text className="text-white text-lg font-medium">{item.description}</Text>
        </View>
      </View>

      {/* Comments Section */}
      <View className="p-4">
        <Text className="font-bold text-lg mb-3">Comments</Text>
        {item.comments?.map((comment, index) => (
          <View key={index} className="flex-row items-start mb-3 bg-gray-50 p-3 rounded-lg">
            <Image
              source={{ uri: comment.userProfilePic }}
              className="w-10 h-10 rounded-full border border-gray-200"
            />
            <View className="ml-3 flex-1">
              <Text className="font-bold text-gray-800">{comment.username}</Text>
              <Text className="text-gray-600 mt-1">{comment.text}</Text>
            </View>
          </View>
        ))}

        {/* Add Comment Section */}
        {selectedRequest === item.id ? (
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
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <HomeHeader />
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListHeaderComponent={
            <View className="mb-4">
              <Text className="text-2xl font-bold text-gray-800">Help Requests</Text>
              <Text className="text-gray-500 mt-1">See how you can help others</Text>
            </View>
          }
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center p-8">
              <Feather name="inbox" size={48} color="#9ca3af" />
              <Text className="text-gray-500 text-lg mt-4 text-center">
                No help requests yet.{'\n'}Check back later!
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default Help_a_friend;