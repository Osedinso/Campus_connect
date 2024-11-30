// screens/Bottom_Tabs/Status/StatusViewer.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../context/authContext';
import { Ionicons } from '@expo/vector-icons';

const PROGRESS_BAR_TIME = 5000; // 5 seconds per status

export default function StatusViewer({ route }) {
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const { statuses } = route.params;
  const { user } = useAuth();
  const navigation = useNavigation();
  const progressInterval = useRef(null);
  const pressStartTime = useRef(0);

  useEffect(() => {
    if (!statuses || statuses.length === 0) {
      navigation.goBack();
      return;
    }

    startProgressBar();

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentStatusIndex]);

  const startProgressBar = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    
    setProgress(0);
    const startTime = Date.now();
    progressInterval.current = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const newProgress = (elapsedTime / PROGRESS_BAR_TIME) * 100;
      
      if (newProgress >= 100) {
        handleNext();
      } else {
        setProgress(newProgress);
      }
    }, 100);
  };

  const handleNext = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    if (currentStatusIndex < statuses.length - 1) {
      setCurrentStatusIndex(prev => prev + 1);
    } else {
      navigation.goBack();
    }
  };

  const handlePrevious = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    if (currentStatusIndex > 0) {
      setCurrentStatusIndex(prev => prev - 1);
    }
  };

  const handleTouchStart = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    pressStartTime.current = Date.now();
  };

  const handleTouchEnd = (e) => {
    const pressDuration = Date.now() - pressStartTime.current;
    
    if (pressDuration > 200) { // Long press
      startProgressBar();
      return;
    }

    const screenWidth = Dimensions.get('window').width;
    const touchX = e.nativeEvent.locationX;

    if (touchX < screenWidth / 2) {
      handlePrevious();
    } else {
      handleNext();
    }
  };

  const currentStatus = statuses[currentStatusIndex];
  if (!currentStatus) return null;

  return (
    <View className="flex-1 bg-black">
      <SafeAreaView className="flex-1">
        {/* Progress bars */}
        <View className="flex-row px-2 mt-2">
          {statuses.map((_, index) => (
            <View key={index} className="flex-1 h-0.5 mx-1 overflow-hidden bg-white/30">
              {index === currentStatusIndex && (
                <View 
                  className="h-full bg-white" 
                  style={{ width: `${progress}%` }} 
                />
              )}
              {index < currentStatusIndex && (
                <View className="h-full w-full bg-white" />
              )}
            </View>
          ))}
        </View>

        {/* Header */}
        <View className="px-4 py-2 flex-row items-center">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="mr-4"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Image
            source={
              currentStatus.userProfileUrl 
                ? { uri: currentStatus.userProfileUrl }
                : require('../../../assets/images/default-avatar.png')
            }
            className="w-10 h-10 rounded-full"
          />
          <View className="ml-3">
            <Text className="text-white font-semibold text-base">
              {currentStatus.userId === user?.userId ? 'My Status' : currentStatus.username}
            </Text>
            <Text className="text-white/70 text-sm">
              {new Date(currentStatus.timestamp?.toDate()).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </Text>
          </View>
        </View>

        {/* Status Content */}
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={handleTouchStart}
          onPressOut={handleTouchEnd}
          className="flex-1 justify-center items-center"
        >
          {currentStatus.type === 'image' ? (
            <Image
              source={{ uri: currentStatus.content }}
              className="w-full h-full"
              resizeMode="contain"
            />
          ) : (
            <View className="p-6 bg-[#222] rounded-lg m-4">
              <Text className="text-white text-xl text-center">
                {currentStatus.content}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}