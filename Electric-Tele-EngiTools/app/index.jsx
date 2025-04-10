import { SafeAreaView, Text, View, Image, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import { useTheme } from "../components/ThemeContext"; // Import ThemeContext
import icons from "../constants/icons";
import CustomButton from "../components/CustomButton";

export default function Index() {
  const [greeting, setGreeting] = useState("");
  const { isDarkMode } = useTheme(); // Get theme state

  // Set greeting based on time
  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting("Good Morning");
    } else if (currentHour < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }
  }, []);

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? "bg-primary" : "bg-white"}`}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center items-center px-4">
          {/* Greeting Text */}
          <Text
            className={`text-3xl font-pbital text-center ${
              isDarkMode ? "text-white" : "text-primary"
            }`}
          >
            {greeting}!
          </Text>

          {/* Welcome Text */}
          <Text
            className={`text-xl font-pbold text-center ${
              isDarkMode ? "text-white" : "text-primary"
            }`}
          >
            Welcome to
          </Text>

          {/* Logo */}
          <Image
            source={icons.logo}
            style={{ width: 300, height: 200 }}
            tintColor={isDarkMode ? "#fff" : "#353F54"}
            resizeMode="contain"
            accessibilityLabel="App Logo"
          />

          {/* App Title */}
          <View className="mt-5">
            <Text className="text-3xl font-pbold text-center">
              <Text className="text-secondary">Quick & Useful Materials </Text>
              {"\n"}
              <Text
                className={`text-sm font-pregular ${
                  isDarkMode ? "text-white" : "text-primary"
                }`}
              >
                Electric & Telecom mobile app
              </Text>
            </Text>
          </View>

          {/* Continue Button */}
          <CustomButton
            title="Continue"
            handlePress={() => router.push("/history")}
            containerStyles="mt-7 w-full"
          />
        </View>

        {/* Footer */}
        <Text
          className={`text-sm font-pregular mt-7 text-center pb-4 ${
            isDarkMode ? "text-white" : "text-primary"
          }`}
        >
          Powered by Buda Technologies
        </Text>
      </ScrollView>

      <StatusBar backgroundColor={isDarkMode ? "#161622" : "#FFFFFF"} style={isDarkMode ? "light" : "dark"} />
    </SafeAreaView>
  );
}
