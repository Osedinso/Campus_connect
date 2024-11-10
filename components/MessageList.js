import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function MessageList({ messages, currentUser, scrollViewRef, isGroupChat }) {
  return (
    <ScrollView ref={scrollViewRef} className="flex-1 px-3 py-2">
      {messages.map((message, index) => {
        const isCurrentUser = message.userId === currentUser.userId;
        return (
          <View
            key={index}
            style={{ alignItems: isCurrentUser ? 'flex-end' : 'flex-start', marginVertical: 5 }}
          >
            {!isCurrentUser && isGroupChat && (
              <Text style={{ fontSize: hp(1.6), color: '#555' }}>{message.senderName}</Text>
            )}
            <View
              style={{
                backgroundColor: isCurrentUser ? '#DCF8C5' : '#FFF',
                borderRadius: 5,
                padding: 10,
                maxWidth: '80%',
              }}
            >
              <Text style={{ fontSize: hp(1.8) }}>{message.text}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}
