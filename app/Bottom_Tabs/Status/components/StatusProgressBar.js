// screens/Bottom_Tabs/Status/components/StatusProgressBar.js
import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

export default function StatusProgressBar({ duration, isActive, onComplete }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      Animated.timing(progress, {
        toValue: 1,
        duration: duration,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished && onComplete) {
          onComplete();
        }
      });
    } else {
      progress.setValue(0);
    }
  }, [isActive]);

  return (
    <View className="h-1 flex-1 bg-gray-300/30 rounded mx-1">
      <Animated.View
        className="h-full bg-white rounded"
        style={{
          width: progress.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
          }),
        }}
      />
    </View>
  );
}