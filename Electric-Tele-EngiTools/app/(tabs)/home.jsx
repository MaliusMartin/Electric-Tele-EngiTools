
import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, FlatList, TouchableOpacity, Alert, SafeAreaView, Image, RefreshControl,
  Linking, Modal, Platform, Pressable, ScrollView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import { Share } from "react-native";

import icons from "../../constants/icons";



const History = () => {
  const [history, setHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);


  const fetchHistory = async () => {
    try {
      const storedHistory = await AsyncStorage.getItem("history");
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const confirmClearHistory = () => {
    Alert.alert("Confirm", "Are you sure you want to clear history?", [
      { text: "Cancel", style: "cancel" },
      { text: "Yes", onPress: clearHistory },
    ]);
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem("history");
      setHistory([]);
      Alert.alert("Success", "History cleared.");
    } catch (error) {
      console.error("Error clearing history:", error);
      Alert.alert("Error", "Failed to clear history.");
    }
  };

  const confirmClearIndividualItem = (index) => {
    Alert.alert("Confirm", "Are you sure you want to delete?", [
      { text: "Cancel", style: "cancel" },
      { text: "Yes", onPress: () => clearIndividualItem(index) },
    ]);
  };

  const clearIndividualItem = async (index) => {
    try {
      const updatedHistory = [...history];
      updatedHistory.splice(index, 1);
      await AsyncStorage.setItem("history", JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
    } catch (error) {
      console.error("Error deleting item:", error);
      Alert.alert("Error", "Failed to delete item.");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  const handleShare = async (data) => {
    try {
      if (!data) throw new Error("No data to share");
      await Share.share({ message: data });
    } catch (error) {
      console.error("Error sharing:", error);
      Alert.alert("Error", "Failed to share.");
    }
  };

  const handleCopy = async (data) => {
    try {
      if (!data) throw new Error("No data to copy");
      await Clipboard.setStringAsync(data);
      Alert.alert("Success", "Data copied to clipboard.");
    } catch (error) {
      console.error("Copy failed:", error);
      Alert.alert("Error", "Failed to copy data.");
    }
  };

  const handleSearch = async (data) => {
    try {
      if (!data) throw new Error("No data to search");
      await Linking.openURL(`https://www.google.com/search?q=${encodeURIComponent(data)}`);
    } catch (err) {
      console.error("Failed to open URL:", err);
      Alert.alert("Error", "Failed to search.");
    }
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      className="bg-secondary p-4 mb-2 rounded-lg"
      onPress={() => {
        console.log("Selected item:", item);
        setSelectedItem(item);
      }}
    >
     

      <Text className="text-primary font-pbold">Type: {item.type}   <Text className="text-white-500 text-xs font-pbold">Time: {item.timestamp}</Text></Text>
      <Text className="text-white mt-2 font-psemibold" numberOfLines={1}>
        Data: {item.data} 
      </Text>
      <TouchableOpacity onPress={() => confirmClearIndividualItem(index)}>
        <Image source={icons.home} style={{ width: 24, height: 24, tintColor: "red" }} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <>
      <SafeAreaView className="flex-1 bg-primary p-4">
        {/* Header with Clear History Button */}
        <View className="flex-row justify-between items-center mb-2 mt-4 ">
          <Text className="text-2xl font-pbold text-white">History</Text>
          <TouchableOpacity onPress={confirmClearHistory} className="bg-red-600 px-3 py-1 rounded-lg">
            <Text className="text-white font-pbold text-sm">Clear History</Text>
          </TouchableOpacity>
        </View>

        {/* History List */}
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={(_, index) => index.toString()}
          ListEmptyComponent={<Text className="text-white text-center">No history available.</Text>}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        />

        {/* Modal for Details */}
        {selectedItem && (
          <Modal visible={!!selectedItem} animationType="fade" transparent={true} onRequestClose={() => setSelectedItem(null)}>
            <View className="flex-1 justify-center items-center bg-black/50 p-4">
              <ScrollView className="bg-white rounded-lg p-5 w-full max-w-lg">
                <Text className="text-black text-xl font-pbold mb-4">Details</Text>
                <Text className="text-black mb-2 font-pregular">Type: {selectedItem.type || "N/A"}</Text>
                <Text className="text-black font-pregular">Data: {selectedItem.data || "No data available"}</Text>

                <View className="flex-row justify-between mt-4">
                  <TouchableOpacity onPress={() => handleCopy(selectedItem?.data)} className="flex-1 bg-gray-700 p-3 rounded-lg items-center mx-1">
                    <Image source={icons.copy} style={{ width: 20, height: 20, tintColor: "#fff" }} />
                    <Text className="text-white text-sm font-pregular">Copy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleSearch(selectedItem?.data)} className="flex-1 bg-gray-700 p-3 rounded-lg items-center mx-1">
                    <Image source={icons.search} style={{ width: 20, height: 20, tintColor: "#fff" }} />
                    <Text className="text-white text-sm font-pregular">Search</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleShare(selectedItem?.data)} className="flex-1 bg-gray-700 p-3 rounded-lg items-center mx-1">
                    <Image source={icons.share} style={{ width: 20, height: 20, tintColor: "#fff" }} />
                    <Text className="text-white text-sm font-pregular">Share</Text>
                  </TouchableOpacity>
                </View>

                <Pressable onPress={() => setSelectedItem(null)} className="mt-5 bg-red-600 py-3 rounded-lg items-center">
                  <Text className="text-white font-psemibold">Close</Text>
                </Pressable>
              </ScrollView>
            </View>
          </Modal>
        )}
      </SafeAreaView>

    
    </>
  );
};

export default History;




// import React from "react";
// import { View, Text, Image, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
// import { Link } from "expo-router";
// import { useTheme } from "../../components/ThemeContext"; // Import ThemeContext
// import icons from "../../constants/icons";

// const Home = () => {
//   const { isDarkMode } = useTheme(); // Get theme state

//   const options = [
//     { label: "Calculator", path: "", image: icons.theme },
//     { label: "Schematic", path: "", image: icons.theme },
//     { label: "Tools", path: "", image: icons.theme },
//     { label: "Reference", path: "", image: icons.theme },
//     { label: "Learn & Tutorial", path: "", image: icons.theme },
//   ];

//   return (
//     <SafeAreaView className={`flex-1 ${isDarkMode ? "bg-primary" : "bg-white"}`}>
//       <ScrollView
//         contentContainerStyle={{
//           flexGrow: 1,
//           justifyContent: "space-evenly",
//           padding: 20,
//         }}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Header */}
//         <View className="items-center mb-8 ml-12">
//           <Image
//             source={icons.logo}
//             style={{ width: 300, height: 200 }}
//             tintColor={isDarkMode ? "#fff" : "#353F54"}
//             resizeMode="contain"
//             alt="App Logo"
//           />
//         </View>

//         {/* Options */}
//         <View className="mr-4">
//           <View className="flex-row flex-wrap justify-between items-center">
//             {options.map((option, index) => (
//               <Link key={index} href={option.path} asChild>
//                 <TouchableOpacity
//                   className={`w-[45%] p-4 mb-4 rounded-lg items-center justify-center ml-4 ${
//                     isDarkMode ? "bg-secondary" : "bg-gray-200"
//                   }`}
//                 >
//                   <Image
//                     source={option.image}
//                     style={{ width: 80, height: 80 }}
//                     className="mt-4"
//                     tintColor={isDarkMode ? "#fff" : "#353F54"}
//                     resizeMode="contain"
//                   />
//                   <Text className={`font-pbold ${isDarkMode ? "text-white" : "text-primary"}`}>
//                     {option.label}
//                   </Text>
//                 </TouchableOpacity>
//               </Link>
//             ))}
//           </View>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default Home;
