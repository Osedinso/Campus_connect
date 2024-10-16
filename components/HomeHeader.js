import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { MenuItem } from './CustomMenuItems';
import { AntDesign, Feather, FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../context/authContext';
import { useNavigation } from '@react-navigation/native';
import { blurhash } from '../utils/common';

export default function HomeHeader() {
    const { user, logout } = useAuth();
    const { top } = useSafeAreaInsets();
    const navigation = useNavigation();

    const handleLogout = async () => {
        await logout();
    }

    const navigateToAcademics = () => {
        navigation.navigate('Academics');
    }

    return (
        <View style={{ paddingTop: top }} className="flex-row justify-between items-center px-4 pb-3 bg-white border-b border-gray-400">
            <TouchableOpacity onPress={navigateToAcademics}>
                <AntDesign name="book" size={24} color="black" />
            </TouchableOpacity>
            
            <View className="flex-1 items-center">
                <Image
                    source={require('../assets/images/login.png')}
                    style={{ width: wp(16), height: hp(8) }}
                    resizeMode="contain"
                />
            </View>
            
            <Menu>
                <MenuTrigger customStyles={{
                    triggerWrapper: {
                        // Add any custom styles for the trigger wrapper here
                    }
                }}>
                    <Image
                        source={{ uri: user?.profileUrl }}
                        style={{ width: hp(4), height: hp(4), borderRadius: hp(2) }}
                        placeholder={blurhash}
                        contentFit="cover"
                        transition={500}
                    />
                </MenuTrigger>
                <MenuOptions customStyles={{
                    optionsContainer: {
                        borderRadius: 10,
                        marginTop: 30,
                        marginLeft: -30,
                        backgroundColor: 'white',
                        shadowOpacity: 0.2,
                        shadowOffset: { width: 0, height: 0 },
                        width: 160
                    }
                }}>
                    <MenuItem
                        text="Sign Out"
                        action={handleLogout}
                        value={null}
                        icon={<AntDesign name="logout" size={hp(2.5)} color="#737373" />}
                    />
                </MenuOptions>
            </Menu>
        </View>
    )
}
