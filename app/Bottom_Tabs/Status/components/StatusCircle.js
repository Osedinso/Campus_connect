// screens/Bottom_Tabs/Status/components/StatusCircle.js
import React from 'react';
import { View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function StatusCircle({ imageUrl, hasUnviewed, size = 48 }) {
  return (
    <View className="items-center justify-center">
      {hasUnviewed ? (
        <LinearGradient
          colors={['#00c6ff', '#0072ff']}
          className="rounded-full p-[2px]"
          style={{ width: size + 4, height: size + 4 }}
        >
          <Image
            source={{ uri: imageUrl }}
            style={{ width: size, height: size }}
            className="rounded-full"
          />
        </LinearGradient>
      ) : (
        <View className="rounded-full p-[2px] bg-gray-300">
          <Image
            source={{ uri: imageUrl }}
            style={{ width: size, height: size }}
            className="rounded-full"
          />
        </View>
      )}
    </View>
  );
}