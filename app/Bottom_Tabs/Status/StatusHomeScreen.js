// screens/Bottom_Tabs/Status/StatusHomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { useAuth } from '../../../context/authContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StatusHomeScreen() {
  const [userStatuses, setUserStatuses] = useState({
    myStatus: [],
    otherStatuses: []
  });
  const navigation = useNavigation();
  const { user } = useAuth();

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    try {
      const twentyFourHoursAgo = Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
      
      const statusesRef = collection(db, 'statuses');
      const q = query(
        statusesRef,
        where('timestamp', '>', twentyFourHoursAgo),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      
      const groupedStatuses = querySnapshot.docs.reduce((acc, doc) => {
        const status = { id: doc.id, ...doc.data() };
        const statusList = status.userId === user?.userId ? 'myStatus' : 'otherStatuses';
        
        if (statusList === 'otherStatuses') {
          const existingUserIndex = acc.otherStatuses.findIndex(
            item => item.userId === status.userId
          );

          if (existingUserIndex > -1) {
            acc.otherStatuses[existingUserIndex].statuses.push(status);
          } else {
            acc.otherStatuses.push({
              userId: status.userId,
              username: status.username,
              userProfileUrl: status.userProfileUrl,
              lastUpdate: status.timestamp,
              statuses: [status]
            });
          }
        } else {
          acc.myStatus.push(status);
        }
        
        return acc;
      }, { myStatus: [], otherStatuses: [] });

      console.log('Grouped statuses:', groupedStatuses);
      setUserStatuses(groupedStatuses);
    } catch (error) {
      console.error('Error fetching statuses:', error);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* My Status */}
      <TouchableOpacity
        onPress={() => 
          userStatuses.myStatus.length > 0
            ? navigation.navigate('viewStatus', { 
                userId: user.userId,
                statuses: userStatuses.myStatus 
              })
            : navigation.navigate('createStatus')
        }
        className="flex-row items-center p-5 border-b border-gray-100"
      >
        <View className="relative">
          <Image
            source={
              user?.profileUrl 
                ? { uri: user.profileUrl }
                : require('../../../assets/images/default-avatar.png')
            }
            className="w-16 h-16 rounded-full bg-gray-200"
          />
          <View className={`absolute right-0 bottom-0 rounded-full p-2
            ${userStatuses.myStatus.length > 0 ? 'bg-green-500' : 'bg-blue-500'}`}
          >
            <Ionicons 
              name={userStatuses.myStatus.length > 0 ? 'eye' : 'add'} 
              size={14} 
              color="white" 
            />
          </View>
        </View>
        <View className="ml-4 flex-1">
          <Text className="font-semibold text-gray-900 text-lg">My Status</Text>
          <Text className="text-gray-500 text-base mt-1">
            {userStatuses.myStatus.length > 0 
              ? 'Tap to view your status'
              : 'Tap to add status update'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Recent Updates */}
      {userStatuses.otherStatuses.length > 0 && (
        <View className="flex-1">
          <Text className="px-5 py-3 text-base font-medium text-gray-500 bg-gray-50">
            Recent Updates
          </Text>
          <FlatList
            data={userStatuses.otherStatuses}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => navigation.navigate('viewStatus', { 
                  userId: item.userId,
                  statuses: item.statuses 
                })}
                className="flex-row items-center p-5 border-b border-gray-100"
              >
                <View className="relative">
                  <Image
                    source={
                      item.userProfileUrl 
                        ? { uri: item.userProfileUrl }
                        : require('../../../assets/images/default-avatar.png')
                    }
                    className="w-16 h-16 rounded-full bg-gray-200"
                  />
                  <View className="absolute right-0 bottom-0 bg-green-500 rounded-full p-2">
                    <Ionicons name="eye" size={14} color="white" />
                  </View>
                </View>
                <View className="ml-4 flex-1">
                  <Text className="font-semibold text-gray-900 text-lg">{item.username}</Text>
                  <Text className="text-gray-500 text-base mt-1">
                    {new Date(item.lastUpdate?.toDate()).toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.userId}
          />
        </View>
      )}

      {/* Create Status FAB */}
      <TouchableOpacity
        onPress={() => navigation.navigate('createStatus')}
        className="absolute bottom-6 right-6 bg-blue-500 p-4 rounded-full shadow-lg z-10"
      >
        <Ionicons name="camera" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}