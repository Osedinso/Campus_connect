// screens/Need_a_hand.js

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
  StyleSheet,
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
        const posts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Sort posts by timestamp in descending order
        posts.sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate());
        setMyPosts(posts);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.innerContainer}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Need a Hand?</Text>
            <Text style={styles.subtitle}>
              Share your question and get help from others
            </Text>
          </View>

          {/* Toggle Button */}
          <TouchableOpacity
            onPress={() => setShowMyPosts(!showMyPosts)}
            style={styles.toggleButton}
          >
            <Feather
              name={showMyPosts ? 'edit' : 'list'}
              size={20}
              color="#3B82F6"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.toggleButtonText}>
              {showMyPosts ? 'Create New Post' : 'View My Posts'}
            </Text>
          </TouchableOpacity>

          {!showMyPosts ? (
            // Create Post Form
            <View style={styles.formContainer}>
              <Text style={styles.sectionTitle}>Upload Image</Text>
              <TouchableOpacity
                onPress={pickImage}
                style={[
                  styles.imagePicker,
                  image ? styles.imageSelected : styles.imageNotSelected,
                ]}
              >
                {image ? (
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: image.uri }}
                      style={styles.selectedImage}
                      resizeMode="cover"
                    />
                    <View style={styles.editIcon}>
                      <Feather name="edit-2" size={20} color="white" />
                    </View>
                  </View>
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <View style={styles.cameraIconContainer}>
                      <AntDesign name="camerao" size={40} color="#3B82F6" />
                    </View>
                    <Text style={styles.imagePlaceholderText}>
                      Tap to add a photo
                    </Text>
                    <Text style={styles.imagePlaceholderSubText}>
                      Upload a clear image of your problem
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.descriptionContainer}>
                <Text style={styles.sectionTitle}>Description</Text>
                <TextInput
                  multiline
                  numberOfLines={4}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Explain what you need help with..."
                  style={styles.descriptionInput}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                style={[
                  styles.submitButton,
                  loading ? styles.buttonDisabled : styles.buttonEnabled,
                ]}
              >
                {loading ? (
                  <View style={styles.buttonContent}>
                    <ActivityIndicator color="white" />
                    <Text style={styles.buttonText}>Posting...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Ask for Help</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            // My Posts List
            <View>
              <Text style={styles.myPostsTitle}>My Posts</Text>
              {myPosts.length === 0 ? (
                <View style={styles.noPostsContainer}>
                  <Feather name="inbox" size={48} color="#9CA3AF" />
                  <Text style={styles.noPostsText}>
                    You haven't created any help requests yet
                  </Text>
                </View>
              ) : (
                myPosts.map((post) => (
                  <View key={post.id} style={styles.postContainer}>
                    <Image
                      source={{ uri: post.imageUrl }}
                      style={styles.postImage}
                      resizeMode="cover"
                    />
                    <View style={styles.postContent}>
                      <Text style={styles.postDescription}>
                        {post.description}
                      </Text>
                      <View style={styles.postFooter}>
                        <Text style={styles.postTimestamp}>
                          {post.timestamp ? format(post.timestamp.toDate()) : ''}
                        </Text>
                        <View style={styles.postActions}>
                          <TouchableOpacity
                            onPress={() =>
                              navigation.navigate('Help_a_Friend')
                            }
                            style={styles.postActionButton}
                          >
                            <Feather
                              name="message-circle"
                              size={20}
                              color="#3B82F6"
                            />
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
                            style={styles.postActionButton}
                          >
                            <Feather
                              name="trash-2"
                              size={20}
                              color="#EF4444"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                      {post.comments?.length > 0 && (
                        <Text style={styles.postComments}>
                          {post.comments.length}{' '}
                          {post.comments.length === 1
                            ? 'response'
                            : 'responses'}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Tailwind gray-100
  },
  contentContainer: {
    paddingBottom: 16,
  },
  innerContainer: {
    padding: 16,
  },
  headerSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937', // Tailwind gray-800
    marginBottom: 8,
  },
  subtitle: {
    color: '#6B7280', // Tailwind gray-500
    fontSize: 16,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DBEAFE', // Tailwind blue-100
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  toggleButtonText: {
    color: '#3B82F6', // Tailwind blue-500
    fontWeight: '500',
    fontSize: 16,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    // Elevation for Android
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151', // Tailwind gray-700
    marginBottom: 12,
  },
  imagePicker: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 250,
    marginBottom: 16,
  },
  imageNotSelected: {
    borderColor: '#D1D5DB', // Tailwind gray-300
  },
  imageSelected: {
    borderColor: '#93C5FD', // Tailwind blue-300
    backgroundColor: '#DBEAFE', // Tailwind blue-100
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  editIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 6,
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  cameraIconContainer: {
    backgroundColor: '#DBEAFE', // Tailwind blue-100
    borderRadius: 50,
    padding: 16,
    marginBottom: 12,
  },
  imagePlaceholderText: {
    color: '#4B5563', // Tailwind gray-600
    fontWeight: '500',
    fontSize: 16,
  },
  imagePlaceholderSubText: {
    color: '#9CA3AF', // Tailwind gray-400
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  descriptionContainer: {
    marginTop: 16,
  },
  descriptionInput: {
    backgroundColor: '#F9FAFB', // Tailwind gray-50
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#374151', // Tailwind gray-700
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#D1D5DB', // Tailwind gray-300
  },
  submitButton: {
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonEnabled: {
    backgroundColor: '#3B82F6', // Tailwind blue-500
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF', // Tailwind gray-400
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  myPostsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937', // Tailwind gray-800
    marginBottom: 16,
  },
  noPostsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    // Elevation for Android
    elevation: 3,
  },
  noPostsText: {
    color: '#6B7280', // Tailwind gray-500
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  postContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    // Elevation for Android
    elevation: 3,
  },
  postImage: {
    width: '100%',
    height: 200,
  },
  postContent: {
    padding: 16,
  },
  postDescription: {
    color: '#374151', // Tailwind gray-700
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postTimestamp: {
    color: '#6B7280', // Tailwind gray-500
    fontSize: 14,
  },
  postActions: {
    flexDirection: 'row',
  },
  postActionButton: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 50,
    backgroundColor: '#F3F4F6', // Tailwind gray-100
  },
  postComments: {
    color: '#3B82F6', // Tailwind blue-500
    marginTop: 8,
    fontSize: 14,
  },
});

export default Need_a_hand;
