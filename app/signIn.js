// screens/SignIn.js

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
import { Octicons } from '@expo/vector-icons';
import { useAuth } from '../context/authContext';
import Loading from '../components/Loading';
import CustomKeyboardView from '../components/CustomKeyboardView';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export default function SignIn() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const emailRef = useRef('');
  const passwordRef = useRef('');

  const handleLogin = async () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert('Sign In', 'Please fill all the fields!');
      return;
    }

    setLoading(true);
    const response = await login(emailRef.current, passwordRef.current);
    setLoading(false);
    console.log('sign in response: ', response);
    if (!response.success) {
      Alert.alert('Sign In', response.msg);
    } else {
      // Replace the current screen with the Dashboard
      router.replace('(app)/Dashboard');

      // Optionally, reset the navigation state to prevent going back
      if (navigationState?.key) {
        router.reset({
          index: 0,
          routes: [{ name: '(app)/Dashboard' }],
        });
      }
    }
  };

  return (
    <CustomKeyboardView>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* SignIn Image */}
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            resizeMode="contain"
            source={require('../assets/images/login.png')}
          />
        </View>

        {/* Welcome Text */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Welcome to Campus Connect!</Text>

          {/* Inputs */}
          <View style={styles.inputContainer}>
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
            <View style={styles.passwordContainer}>
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
              <TouchableOpacity>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <View style={styles.buttonContainer}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Loading size={hp(6.5)} />
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleLogin}
                  style={styles.signInButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.signInButtonText}>Sign In</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Sign Up Text */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <Pressable onPress={() => router.push('signUp')}>
                <Text style={styles.signUpLink}>Sign Up</Text>
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
    paddingTop: hp(8),
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
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeText: {
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
  passwordContainer: {
    marginBottom: hp(2),
  },
  forgotPasswordText: {
    fontSize: hp(1.8),
    color: '#3B82F6', // Tailwind Blue-500
    textAlign: 'right',
    marginTop: hp(1),
  },
  buttonContainer: {
    marginTop: hp(2),
  },
  loadingContainer: {
    alignItems: 'center',
  },
  signInButton: {
    backgroundColor: '#3B82F6', // Tailwind Blue-500
    borderRadius: 12,
    height: hp(6.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInButtonText: {
    fontSize: hp(2.5),
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: hp(2),
  },
  signUpText: {
    fontSize: hp(1.8),
    color: '#6B7280', // Tailwind Gray-500
  },
  signUpLink: {
    fontSize: hp(1.8),
    color: '#3B82F6', // Tailwind Blue-500
    fontWeight: 'bold',
  },
});

