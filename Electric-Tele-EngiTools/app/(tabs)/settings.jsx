import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import {
  AppState,
  SafeAreaView,
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Vibration
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useState, useRef, useEffect } from "react";
import * as Clipboard from "expo-clipboard"; 
import { Share } from "react-native";
import Overlay from "../(scan)/overlay";
import icons from "../../constants/icons";
import AsyncStorage from "@react-native-async-storage/async-storage";





const Scan = () => {
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const [scannedData, setScannedData] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
 

  

 
// Load last ad time from AsyncStorage
useEffect(() => {
  AsyncStorage.getItem("lastInterstitialTime").then((time) => {
    setLastAdTime(time ? parseInt(time) : null);
  });
}, []);


  // Request camera permission if not granted
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);



// Handle successful scan
const handleScan = async (data) => {
  if (data && !qrLock.current) {
    qrLock.current = true;
    setScannedData(data);

    // Trigger feedback based on preferences
    if (vibrationEnabled) {
      Vibration.vibrate(100);
    }
    if (soundEnabled && soundObject) {
      await soundObject.replayAsync();
    }
  }
};
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        qrLock.current = false;
        setScannedData(null);
      }
      appState.current = nextAppState;
    });
    return () => {
      subscription.remove();
    };
  }, []);

 

  const handleOpenURL = async (url) => {
    try {
      await Linking.openURL(url);
      setScannedData(null);
      qrLock.current = false;
    } catch (err) {
      console.error("Failed to open URL:", err);
      setScannedData(null);
      qrLock.current = false;
    }
  };

  const handleShare = async (data) => {
    try {
      await Share.share({
        message: data,
        title: "Share QR Code Link"
      });
    } catch (error) {
      console.error("Error sharing link:", error);
      Alert.alert("Error", "Failed to share the link. Please try again.");
    }
  };

 

  const handleCopy = async (data) => {
    try {
      await Clipboard.setStringAsync(data); 
      // Optional: Show a brief toast or message indicating successful copy
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleSearch = async (data) => {
    try {
      await Linking.openURL(`https://www.google.com/search?q=${data}`);
    
      setScannedData(null); 
      qrLock.current = false;
    } catch (err) {
      console.error("Failed to open URL:", err);
      setScannedData(null);
      qrLock.current = false;
    }
  };

  
  // Add this function to save scan history
const saveScanHistory = async (data) => {
  try {
    const historyItem = {
      type: "Scan",
      data: data,
      timestamp: new Date().toLocaleString(),
    };

    const storedHistory = await AsyncStorage.getItem("history");
    const history = storedHistory ? JSON.parse(storedHistory) : [];
    history.unshift(historyItem); // Add new item at the beginning

    await AsyncStorage.setItem("history", JSON.stringify(history));
  } catch (error) {
    console.error("Error saving scan history:", error);
  }
};

// Call this function after setting scannedData
useEffect(() => {
  if (scannedData) {
    saveScanHistory(scannedData);
  }
}, [scannedData]);

const handleCloseModal = () => {
    setScannedData(null);
    qrLock.current = false;
  
};

return (
  <SafeAreaView style={styles.container}>
    <StatusBar style="light" translucent backgroundColor="transparent" />

    <CameraView
      style={StyleSheet.absoluteFillObject}
      facing="back"
      onBarcodeScanned={({ data }) => handleScan(data)}
      barCodeTypes={[
        "aztec",
        "ean13",
        "ean8",
        "qr",
        "pdf417",
        "upc_e",
        "datamatrix",
        "code39",
        "code93",
        "itf14",
        "codabar",
        "code128",
        "upc_a",
      ]}
    />
    <Overlay />

    {/* Enhanced Link Overlay */}
    {scannedData && (
      <View style={styles.overlayContainer} className="font-pregular">
        <View style={styles.linkCard}>
          <Text style={styles.linkText} numberOfLines={3}>
            {scannedData}
          </Text>
          <View style={styles.buttonGrid}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => handleOpenURL(scannedData)}
            >
              <Image source={icons.home} style={{ width: 20, height: 20 }} />
              <Text style={styles.buttonText} className="font-pregular">Open</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.shareButton]}
              onPress={() => handleShare(scannedData)}
            >
              <Image source={icons.home} style={{ width: 20, height: 20 }} />
              <Text style={styles.buttonText} className="font-pregular">Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.copyButton]}
              onPress={() => handleCopy(scannedData)}
            >
              <Image source={icons.home} style={{ width: 20, height: 20 }} />
              <Text style={styles.buttonText} className="font-pregular">Copy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.copyButton]}
              onPress={() => handleSearch(scannedData)}
            >
              <Image source={icons.home} style={{ width: 20, height: 20 }} />
              <Text style={styles.buttonText} className="font-pregular">Search</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCloseModal}
              // onPress={() => {
              //   setScannedData(null);
              //   qrLock.current = false;
              // }}
            >
              <Image source={icons.menu} style={{ width: 20, height: 20 }} />
              <Text style={[styles.buttonText, styles.cancelText]} className="font-pregular">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )}
  </SafeAreaView>
);
};

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: "#000",
},
overlayContainer: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(0,0,0,0.7)",
  justifyContent: "center",
  alignItems: "center",
  padding: 20,
},
linkCard: {
  backgroundColor: "white",
  borderRadius: 12,
  padding: 20,
  width: "90%",
  maxWidth: 400,
  elevation: 5,
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
},
linkText: {
  fontSize: 16,
  color: "#333",
  marginBottom: 20,
  textAlign: "center",
},
buttonGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
  justifyContent: 'space-between',
},
button: {
  flex: 1,
  minWidth: '48%',
  padding: 12,
  borderRadius: 8,
  alignItems: "center",
  marginBottom: 8,
},
primaryButton: {
  backgroundColor: "#007AFF",
},
shareButton: {
  backgroundColor: "#34C759",
},
copyButton: {
  backgroundColor: "#5856D6",
},
cancelButton: {
  backgroundColor: "#f8f9fa",
  borderWidth: 1,
  borderColor: "#dee2e6",
},
buttonText: {
  color: "white",
  fontSize: 16,
  fontWeight: "600",
},
cancelText: {
  color: "#666",
},
});

export default Scan;






// import React from "react";
// import {
//   SafeAreaView,
//   Text,
//   View,
//   Image,
//   ScrollView,
//   Alert,
//   TouchableOpacity,
// } from "react-native";
// import { StatusBar } from "expo-status-bar";
// import { Link, useRouter } from "expo-router";
// import * as Updates from "expo-updates";
// import icons from "../../constants/icons";
// import { useTheme } from "../../components/ThemeContext"; // Import useTheme

// const SettingsItem = ({ icon, label, onPress, href }) => {
//   const content = (
//     <View className="flex-row items-center bg-secondary p-4 rounded-lg mb-3">
//       <Image
//         source={icon}
//         style={{ width: 24, height: 24, tintColor: "#fff", marginRight: 10 }}
//       />
//       <Text className="text-white font-pregular">{label}</Text>
//     </View>
//   );

//   return href ? (
//     <Link href={href} asChild>
//       <TouchableOpacity>{content}</TouchableOpacity>
//     </Link>
//   ) : (
//     <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>
//   );
// };

// const Settings = () => {
//   const router = useRouter(); // For navigation
//   const { isDarkMode } = useTheme(); // Get theme state
//   const appVersion = Updates.manifest?.version || "1.0.0";

//   const handleAppUpdate = async () => {
//     try {
//       const update = await Updates.checkForUpdateAsync();
//       if (update.isAvailable) {
//         await Updates.fetchUpdateAsync();
//         Alert.alert(
//           "Update Available",
//           "The app will now restart to apply the update.",
//           [{ text: "OK", onPress: () => Updates.reloadAsync() }]
//         );
//       } else {
//         Alert.alert("Up-to-date", "You are using the latest version of the app.");
//       }
//     } catch (error) {
//       console.error("Error checking for updates:", error);
//       Alert.alert(
//         "Error",
//         "Unable to check for updates. Please try again later."
//       );
//     }
//   };

//   return (
//     <SafeAreaView
//       className={`flex-1 ${isDarkMode ? "bg-primary" : "bg-white"}`}
//     >
//       <StatusBar style={isDarkMode ? "light" : "dark"} />
//       <ScrollView className="px-4 pt-2">
//         {/* Header */}
//         <View className="items-center mb-8 mt-12">

       
//           <View className="items-center mb-6">
//                     <Text className={`text-xl font-pbold ${isDarkMode ? "text-white" : "text-black"}`}>
//                       Settings
//                     </Text>
//                     <Image
//                       source={icons.settings}
//                       style={{ width: 40, height: 40 }}
//                       className="mt-4"
//                       tintColor={isDarkMode ? "#fff" : "#353F54"}
//                       resizeMode="contain"
//                     />
//                   </View>
         
        
//         </View>

//         {/* User Preferences */}
//         <View className="mb-5">
//           <Text
//             className={`text-lg font-psemibold mb-4 ${
//               isDarkMode ? "text-white" : "text-black"
//             }`}
//           >
//             User Preferences
//           </Text>

//           {/* Theme Item */}
//           <SettingsItem
//             icon={icons.theme}
//             label="Theme"
//             href="(settings)/theme"
//           />

//           {/* Check for Updates */}
//           <SettingsItem
//             icon={icons.update}
//             label="Check for Updates"
//             onPress={handleAppUpdate}
//           />
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default Settings;
