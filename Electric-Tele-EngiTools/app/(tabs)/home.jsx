import React from "react";
import { View, Text, Image, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { useTheme } from "../../components/ThemeContext"; // Import ThemeContext
import icons from "../../constants/icons";

const Home = () => {
  const { isDarkMode } = useTheme(); // Get theme state

  const options = [
    { label: "Calculator", path: "", image: icons.theme },
    { label: "Schematic", path: "", image: icons.theme },
    { label: "Tools", path: "", image: icons.theme },
    { label: "Reference", path: "", image: icons.theme },
    { label: "Learn & Tutorial", path: "", image: icons.theme },
  ];

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? "bg-primary" : "bg-white"}`}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "space-evenly",
          padding: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center mb-8 ml-12">
          <Image
            source={icons.logo}
            style={{ width: 300, height: 200 }}
            tintColor={isDarkMode ? "#fff" : "#353F54"}
            resizeMode="contain"
            alt="App Logo"
          />
        </View>

        {/* Options */}
        <View className="mr-4">
          <View className="flex-row flex-wrap justify-between items-center">
            {options.map((option, index) => (
              <Link key={index} href={option.path} asChild>
                <TouchableOpacity
                  className={`w-[45%] p-4 mb-4 rounded-lg items-center justify-center ml-4 ${
                    isDarkMode ? "bg-secondary" : "bg-gray-200"
                  }`}
                >
                  <Image
                    source={option.image}
                    style={{ width: 80, height: 80 }}
                    className="mt-4"
                    tintColor={isDarkMode ? "#fff" : "#353F54"}
                    resizeMode="contain"
                  />
                  <Text className={`font-pbold ${isDarkMode ? "text-white" : "text-primary"}`}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              </Link>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
