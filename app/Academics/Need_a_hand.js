import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { storage, db } from '../../firebaseConfig';
import { useAuth } from '../../context/authContext';
import { useNavigation } from '@react-navigation/native';
import { AntDesign, Feather } from '@expo/vector-icons';
import HomeHeader from '../../components/HomeHeader';
import { format } from 'timeago.js';

const Need_a_hand = () => {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [myPosts, setMyPosts] = useState([]);
  const [showMyPosts, setShowMyPosts] = useState(false);
  const { user } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (user?.userId) {
      const q = query(
        collection(db, 'help_requests'),
        where('userId', '==', user.userId)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const posts = [];
        snapshot.forEach((doc) => {
          posts.push({ id: doc.id, ...doc.data() });
        });
        // Sort posts by timestamp in descending order
        posts.sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate());
        setMyPosts(posts);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Please grant permission to access your photos'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0]);
      }
    } catch (err) {
      console.error('Error picking image:', err);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const fileName = `help_requests/${user.userId}_${Date.now()}.jpg`;
      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!image || !description.trim()) {
      Alert.alert('Error', 'Please select an image and add a description');
      return;
    }

    setLoading(true);
    try {
      const imageUrl = await uploadImage(image.uri);

      await addDoc(collection(db, 'help_requests'), {
        userId: user.userId,
        username: user.username,
        userProfilePic: user.profileUrl,
        imageUrl,
        description: description.trim(),
        timestamp: serverTimestamp(),
        status: 'pending',
        comments: [],
      });

      Alert.alert('Success', 'Your request has been posted!', [
        {
          text: 'View My Posts',
          onPress: () => setShowMyPosts(true),
        },
      ]);

      setImage(null);
      setDescription('');
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to post request');
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (post) => {
    try {
      // Delete image from storage
      if (post.imageUrl) {
        const imageRef = ref(storage, post.imageUrl);
        await deleteObject(imageRef).catch((error) => {
          console.log('Error deleting image:', error);
        });
      }

      // Delete document from Firestore
      await deleteDoc(doc(db, 'help_requests', post.id));
      Alert.alert('Success', 'Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      Alert.alert('Error', 'Failed to delete post');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <HomeHeader />
      <ScrollView className="flex-1">
        <View className="p-6">
          {/* Header Section */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-800">Need a Hand?</Text>
            <Text className="text-gray-500 mt-2">
              Share your question and get help from others
            </Text>
          </View>

          {/* Toggle Button */}
          <TouchableOpacity
            onPress={() => setShowMyPosts(!showMyPosts)}
            className="mb-6 flex-row items-center justify-center bg-blue-100 p-3 rounded-xl"
          >
            <Feather
              name={showMyPosts ? 'edit' : 'list'}
              size={20}
              color="#3b82f6"
              style={{ marginRight: 8 }}
            />
            <Text className="text-blue-600 font-medium">
              {showMyPosts ? 'Create New Post' : 'View My Posts'}
            </Text>
          </TouchableOpacity>

          {!showMyPosts ? (
            // Create Post Form
            <View className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <Text className="text-lg font-semibold mb-3 text-gray-700">
                Upload Image
              </Text>
              <TouchableOpacity
                onPress={pickImage}
                className={`border-2 border-dashed rounded-xl p-4 mb-2 items-center justify-center ${
                  image ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
                }`}
                style={{ height: 250 }}
              >
                {image ? (
                  <View className="w-full h-full relative">
                    <Image
                      source={{ uri: image.uri }}
                      className="w-full h-full rounded-lg"
                      resizeMode="cover"
                    />
                    <View className="absolute bottom-2 right-2 bg-black/50 rounded-full p-2">
                      <Feather name="edit-2" size={20} color="white" />
                    </View>
                  </View>
                ) : (
                  <View className="items-center">
                    <View className="bg-blue-100 rounded-full p-4 mb-3">
                      <AntDesign name="camerao" size={40} color="#3b82f6" />
                    </View>
                    <Text className="text-gray-600 font-medium">
                      Tap to add a photo
                    </Text>
                    <Text className="text-gray-400 text-sm mt-1">
                      Upload a clear image of your problem
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <View className="mt-6">
                <Text className="text-lg font-semibold mb-3 text-gray-700">
                  Description
                </Text>
                <TextInput
                  multiline
                  numberOfLines={4}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Explain what you need help with..."
                  className="bg-gray-50 rounded-xl p-4 text-base text-gray-700"
                  textAlignVertical="top"
                  style={{ minHeight: 100 }}
                />
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                className={`mt-6 py-4 rounded-xl ${
                  loading ? 'bg-gray-400' : 'bg-blue-500'
                }`}
              >
                {loading ? (
                  <View className="flex-row justify-center items-center">
                    <ActivityIndicator color="white" />
                    <Text className="text-white ml-2 font-semibold">Posting...</Text>
                  </View>
                ) : (
                  <Text className="text-white text-center font-semibold">
                    Ask for Help
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            // My Posts List
            <View>
              <Text className="text-xl font-bold mb-4 text-gray-800">My Posts</Text>
              {myPosts.length === 0 ? (
                <View className="bg-white rounded-xl p-6 items-center">
                  <Feather name="inbox" size={48} color="#9ca3af" />
                  <Text className="text-gray-500 mt-4 text-center">
                    You haven't created any help requests yet
                  </Text>
                </View>
              ) : (
                myPosts.map((post) => (
                  <View
                    key={post.id}
                    className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden"
                  >
                    <Image
                      source={{ uri: post.imageUrl }}
                      className="w-full h-48"
                      resizeMode="cover"
                    />
                    <View className="p-4">
                      <Text className="text-gray-700 font-medium mb-2">
                        {post.description}
                      </Text>
                      <View className="flex-row justify-between items-center">
                        <Text className="text-gray-500 text-sm">
                          {format(post.timestamp?.toDate())}
                        </Text>
                        <View className="flex-row">
                          <TouchableOpacity
                            onPress={() => navigation.navigate('Help_a_Friend')}
                            className="mr-3 bg-blue-100 p-2 rounded-full"
                          >
                            <Feather name="message-circle" size={20} color="#3b82f6" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              Alert.alert(
                                'Delete Post',
                                'Are you sure you want to delete this post?',
                                [
                                  { text: 'Cancel', style: 'cancel' },
                                  {
                                    text: 'Delete',
                                    onPress: () => deletePost(post),
                                    style: 'destructive',
                                  },
                                ]
                              );
                            }}
                            className="bg-red-100 p-2 rounded-full"
                          >
                            <Feather name="trash-2" size={20} color="#ef4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      {post.comments?.length > 0 && (
                        <Text className="text-blue-500 mt-2">
                          {post.comments.length}{' '}
                          {post.comments.length === 1 ? 'response' : 'responses'}
                        </Text>
                      )}
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Need_a_hand;
