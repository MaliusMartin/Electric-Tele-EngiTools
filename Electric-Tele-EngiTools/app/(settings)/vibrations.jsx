import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    Image,
    Switch,
    Vibration,
    Platform,
    TouchableOpacity,
  } from "react-native";
  import React, { useState, useEffect, useRef } from "react";
  import icons from "../../constants/icons";
  import AsyncStorage from "@react-native-async-storage/async-storage";
  import { useRouter } from "expo-router";
  
  
  
  const VibrationScreen = () => {
    const bannerAdRef = useRef(null);
    const router = useRouter();
    const [vibrationEnabled, setVibrationEnabled] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(false);
  
 
  
    useEffect(() => {
      const loadPreferences = async () => {
        try {
          const vibrationPref = await AsyncStorage.getItem("vibrationEnabled");
          const soundPref = await AsyncStorage.getItem("soundEnabled");
  
          setVibrationEnabled(vibrationPref !== null ? JSON.parse(vibrationPref) : false);
          setSoundEnabled(soundPref !== null ? JSON.parse(soundPref) : false);
        } catch (error) {
          console.error("Error loading preferences:", error);
        }
      };
  
      loadPreferences();
    }, []);
  
    const toggleVibration = async () => {
      const newValue = !vibrationEnabled;
      setVibrationEnabled(newValue);
      await AsyncStorage.setItem("vibrationEnabled", JSON.stringify(newValue));
      if (newValue) Vibration.vibrate(100); // Feedback only on enabling
    };
  
    const toggleSound = async () => {
      const newValue = !soundEnabled;
      setSoundEnabled(newValue);
      await AsyncStorage.setItem("soundEnabled", JSON.stringify(newValue));
      // Note: Sound playback is not implemented. Add sound playback logic here if needed.
    };
  
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
          {/* Custom Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-4"
            accessibilityLabel="Go Back"
          >
            <Text className="text-white font-pbold">Back</Text>
          </TouchableOpacity>
  
          {/* Header */}
          <View className="items-center mb-6">
            <Text className="text-3xl font-pbold text-white">Sounds & Vibrations</Text>
            <Image
              source={icons.volume}
              className="w-20 h-20 mt-4"
              tintColor="#fff"
              resizeMode="contain"
              accessibilityLabel="Volume Icon"
            />
          </View>
  
          {/* Description */}
          <Text className="text-center text-gray-300 font-pregular mb-6">
            Notification after a successful code scan.
          </Text>
  
          {/* Settings */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center bg-secondary p-4 rounded-lg mb-4">
              <Text className="text-lg text-white font-pregular">
                Vibrate on Successful Scan
              </Text>
              <Switch
                trackColor={{ false: "#ccc", true: "#4ade80" }}
                thumbColor={vibrationEnabled ? "#22c55e" : "#f4f3f4"}
                onValueChange={toggleVibration}
                value={vibrationEnabled}
              />
            </View>
            <View className="flex-row justify-between items-center bg-secondary p-4 rounded-lg">
              <Text className="text-lg text-white font-pregular">
                Sound on Successful Scan
              </Text>
              <Switch
                trackColor={{ false: "#ccc", true: "#4ade80" }}
                thumbColor={soundEnabled ? "#22c55e" : "#f4f3f4"}
                onValueChange={toggleSound}
                value={soundEnabled}
              />
            </View>
          </View>
        </ScrollView>
  
       
        
      </SafeAreaView>
    );
  };
  
  export default VibrationScreen;