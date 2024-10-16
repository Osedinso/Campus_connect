import { TouchableOpacity, Text, View } from 'react-native';
import React from 'react'
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router'
import HomeHeader from '../../components/HomeHeader'

export default function _layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
            name="home"
            
            options={{
                header: ()=> <HomeHeader />
            }}
        />
    </Stack>
  )
}
