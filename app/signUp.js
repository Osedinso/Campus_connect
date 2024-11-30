// screens/SignUp.js

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Pressable,
  Alert,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Octicons } from '@expo/vector-icons';
import { useAuth } from '../context/authContext';
import Loading from '../components/Loading';
import CustomKeyboardView from '../components/CustomKeyboardView';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export default function SignUp() {
  const router = useRouter();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);

  const emailRef = useRef('');
  const passwordRef = useRef('');
  const usernameRef = useRef('');
  const firstNameRef = useRef('');
  const lastNameRef = useRef('');

  const handleRegister = async () => {
    if (!emailRef.current || !passwordRef.current || !usernameRef.current || !firstNameRef.current || !lastNameRef.current) {
      Alert.alert('Sign Up', 'Please fill all the fields!');
      return;
    }
    setLoading(true);

    let response = await register(
      emailRef.current,
      passwordRef.current,
      usernameRef.current,
      firstNameRef.current,
      lastNameRef.current,
      null
    );
    setLoading(false);

    console.log('got result: ', response);
    if (!response.success) {
      Alert.alert('Sign Up', response.msg);
    } else {
      // Navigate to the SignIn page or Dashboard after successful registration
      router.replace('signIn');
    }
  };

  return (
    <CustomKeyboardView>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* SignUp Image */}
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            resizeMode="contain"
            source={require('../assets/images/register.png')}
          />
        </View>

        {/* Sign Up Form */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Create an Account</Text>

          {/* Inputs */}
          <View style={styles.inputContainer}>
            {/* Username Input */}
            <View style={styles.inputWrapper}>
              <Feather name="user" size={hp(2.7)} color="#6B7280" style={styles.icon} />
              <TextInput
                onChangeText={(value) => (usernameRef.current = value)}
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {/* First Name Input */}
            <View style={styles.inputWrapper}>
              <Feather name="user" size={hp(2.7)} color="#6B7280" style={styles.icon} />
              <TextInput
                onChangeText={(value) => (firstNameRef.current = value)}
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {/* Last Name Input */}
            <View style={styles.inputWrapper}>
              <Feather name="user" size={hp(2.7)} color="#6B7280" style={styles.icon} />
              <TextInput
                onChangeText={(value) => (lastNameRef.current = value)}
                style={styles.input}
                placeholder="Last Name"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <Octicons name="mail" size={hp(2.7)} color="#6B7280" style={styles.icon} />
              <TextInput
                onChangeText={(value) => (emailRef.current = value)}
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <Octicons name="lock" size={hp(2.7)} color="#6B7280" style={styles.icon} />
              <TextInput
                onChangeText={(value) => (passwordRef.current = value)}
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Submit Button */}
            <View style={styles.buttonContainer}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Loading size={hp(6.5)} />
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleRegister}
                  style={styles.signUpButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.signUpButtonText}>Sign Up</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Sign In Link */}
            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>Already have an account? </Text>
              <Pressable onPress={() => router.push('signIn')}>
                <Text style={styles.signInLink}>Sign In</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </CustomKeyboardView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: hp(7),
    paddingHorizontal: wp(5),
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: hp(4),
  },
  image: {
    height: hp(25),
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: hp(4),
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1F2937', // Tailwind Gray-800
    marginBottom: hp(4),
  },
  inputContainer: {
    marginBottom: hp(4),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6', // Tailwind Gray-100
    borderRadius: 12,
    paddingHorizontal: wp(4),
    height: hp(7),
    marginBottom: hp(2),
    borderWidth: 1,
    borderColor: '#D1D5DB', // Tailwind Gray-300
  },
  icon: {
    marginRight: wp(2),
  },
  input: {
    flex: 1,
    fontSize: hp(2),
    color: '#374151', // Tailwind Gray-700
  },
  buttonContainer: {
    marginTop: hp(2),
  },
  loadingContainer: {
    alignItems: 'center',
  },
  signUpButton: {
    backgroundColor: '#3B82F6', // Tailwind Blue-500
    borderRadius: 12,
    height: hp(6.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpButtonText: {
    fontSize: hp(2.5),
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: hp(2),
  },
  signInText: {
    fontSize: hp(1.8),
    color: '#6B7280', // Tailwind Gray-500
  },
  signInLink: {
    fontSize: hp(1.8),
    color: '#3B82F6', // Tailwind Blue-500
    fontWeight: 'bold',
  },
});
