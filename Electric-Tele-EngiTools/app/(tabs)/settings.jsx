import React from "react";
import {
  SafeAreaView,
  Text,
  View,
  Image,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Link, useRouter } from "expo-router";
import * as Updates from "expo-updates";
import icons from "../../constants/icons";
import { useTheme } from "../../components/ThemeContext"; // Import useTheme

const SettingsItem = ({ icon, label, onPress, href }) => {
  const content = (
    <View className="flex-row items-center bg-secondary p-4 rounded-lg mb-3">
      <Image
        source={icon}
        style={{ width: 24, height: 24, tintColor: "#fff", marginRight: 10 }}
      />
      <Text className="text-white font-pregular">{label}</Text>
    </View>
  );

  return href ? (
    <Link href={href} asChild>
      <TouchableOpacity>{content}</TouchableOpacity>
    </Link>
  ) : (
    <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>
  );
};

const Settings = () => {
  const router = useRouter(); // For navigation
  const { isDarkMode } = useTheme(); // Get theme state
  const appVersion = Updates.manifest?.version || "1.0.0";

  const handleAppUpdate = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        Alert.alert(
          "Update Available",
          "The app will now restart to apply the update.",
          [{ text: "OK", onPress: () => Updates.reloadAsync() }]
        );
      } else {
        Alert.alert("Up-to-date", "You are using the latest version of the app.");
      }
    } catch (error) {
      console.error("Error checking for updates:", error);
      Alert.alert(
        "Error",
        "Unable to check for updates. Please try again later."
      );
    }
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDarkMode ? "bg-primary" : "bg-white"}`}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <ScrollView className="px-4 pt-2">
        {/* Header */}
        <View className="items-center mb-8 mt-12">

       
          <View className="items-center mb-6">
                    <Text className={`text-xl font-pbold ${isDarkMode ? "text-white" : "text-black"}`}>
                      Settings
                    </Text>
                    <Image
                      source={icons.settings}
                      style={{ width: 40, height: 40 }}
                      className="mt-4"
                      tintColor={isDarkMode ? "#fff" : "#353F54"}
                      resizeMode="contain"
                    />
                  </View>
         
        
        </View>

        {/* User Preferences */}
        <View className="mb-5">
          <Text
            className={`text-lg font-psemibold mb-4 ${
              isDarkMode ? "text-white" : "text-black"
            }`}
          >
            User Preferences
          </Text>

          {/* Theme Item */}
          <SettingsItem
            icon={icons.theme}
            label="Theme"
            href="(settings)/theme"
          />

          {/* Check for Updates */}
          <SettingsItem
            icon={icons.update}
            label="Check for Updates"
            onPress={handleAppUpdate}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
