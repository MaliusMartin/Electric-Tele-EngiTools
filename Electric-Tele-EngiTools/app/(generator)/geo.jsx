import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Pressable,
  Platform,
} from "react-native";
import * as Print from "expo-print";
import CustomButton from "../../components/CustomButton";
import icons from "../../constants/icons";
import { encode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   BannerAd,
//   BannerAdSize,
//   TestIds,
//   useForeground,
//   InterstitialAd,
//   AdEventType,
// } from "react-native-google-mobile-ads";
import { useRouter } from "expo-router"; // Added for custom back
import { StatusBar } from "expo-status-bar";

// Dynamic ad unit IDs
// const bannerAdUnitId = __DEV__
//   ? TestIds.BANNER
//   : "ca-app-pub-3940256099942544/9214589741"; // Replace with your real Banner ad unit ID
// const interstitialAdUnitId = __DEV__
//   ? TestIds.INTERSTITIAL
//   : "ca-app-pub-3940256099942544/1033173712"; // Replace with your real Interstitial ad unit ID

// const interstitial = InterstitialAd.createForAdRequest(interstitialAdUnitId, {
//   requestNonPersonalizedAdsOnly: true,
//   keywords: ["tools", "productivity"],
// });

const Generate = () => {
  const bannerAdRef = useRef(null);
  const router = useRouter(); // For custom back navigation
  const [latitude, setLatitude] = useState(""); // Fixed spelling
  const [longitude, setLongitude] = useState(""); // Fixed spelling
  const [query, setQuery] = useState("");
  const [qrCodeModalVisible, setQRCodeModalVisible] = useState(false);
  const [qrCodeImage, setQRCodeImage] = useState(null);
  const [isSubmittingQR, setIsSubmittingQR] = useState(false);
  const qrRef = useRef(null);
 
//   const [adLoaded, setAdLoaded] = useState(false);
//   const [adError, setAdError] = useState(null);
//   const [lastAdTime, setLastAdTime] = useState(null);

  // Load last ad time from AsyncStorage
//   useEffect(() => {
//     AsyncStorage.getItem("lastInterstitialTime").then((time) => {
//       setLastAdTime(time ? parseInt(time) : null);
//     });
//   }, []);

  // Interstitial Ad setup
//   useEffect(() => {
//     const unsubscribeLoaded = interstitial.addAdEventListener(
//       AdEventType.LOADED,
//       () => {
//         setAdLoaded(true);
//         setAdError(null);
//         console.log("Interstitial ad loaded");
//       }
//     );

//     const unsubscribeError = interstitial.addAdEventListener(
//       AdEventType.ERROR,
//       (error) => {
//         setAdLoaded(false);
//         setAdError(error);
//         console.error("Interstitial ad failed to load:", error);
//       }
//     );

//     const unsubscribeOpened = interstitial.addAdEventListener(
//       AdEventType.OPENED,
//       () => {
//         if (Platform.OS === "ios") {
//           StatusBar.setHidden(true);
//         }
//       }
//     );

//     const unsubscribeClosed = interstitial.addAdEventListener(
//       AdEventType.CLOSED,
//       () => {
//         if (Platform.OS === "ios") {
//           StatusBar.setHidden(false);
//         }
//         // Reload ad for next display
//         setAdLoaded(false);
//         interstitial.load();
//       }
//     );

//     // Start loading the interstitial
//     interstitial.load();

//     return () => {
//       unsubscribeLoaded();
//       unsubscribeError();
//       unsubscribeOpened();
//       unsubscribeClosed();
//     };
//   }, []);

  // Reload banner ad on iOS when app comes to foreground
//   useForeground(() => {
//     if (Platform.OS === "ios" && bannerAdRef.current) {
//       bannerAdRef.current.load();
//     }
//   });

  const handleGenerateQRCode = async () => {
    if (!latitude && !longitude && !query) {
      return alert("Please enter a latitude and longitude to generate a QR Code.");
    }

    const dataToEncode = `Latitude: ${latitude}\nLongitude: ${longitude}\nQuery: ${query}`; // Fixed spelling
    

   
    setQRCodeModalVisible(true);
    setIsSubmittingQR(true);
    
    // Increased timeout to ensure component is fully rendered
    setTimeout(async () => {
      try {
        if (!qrRef.current) {
          throw new Error("QR reference not available");
        }
        
        console.log("Attempting to capture QR code...");
        const uri = await qrRef.current.capture();
        console.log("QR code captured successfully:", uri.substring(0, 50) + "...");
        
        setQRCodeImage(uri);
        await saveToHistory(dataToEncode); // or await saveToHistory(phoneUrl) in the first file
        console.log("QR code saved to history");
      } catch (error) {
        console.error("Error capturing QR Code:", error);
        alert(`Failed to generate QR Code: ${error.message}`);
      } finally {
        setIsSubmittingQR(false);
      }
    }, 1000); // Increased to 1 second
  };

  const saveToHistory = async () => {
    const newEntry = {
      type: "Geo QR Code",
      data: `Latitude: ${latitude}\nLongitude: ${longitude}\nQuery: ${query}`,
      timestamp: new Date().toLocaleString(),
    };

    try {
      const existingHistory = await AsyncStorage.getItem("history");
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      history.unshift(newEntry); // Add new item at the beginning
      await AsyncStorage.setItem("history", JSON.stringify(history));
      alert("Saved to history!");
    } catch (error) {
      console.error("Error saving to history:", error);
      alert("Failed to save history. Please try again.");
    }
  };



  const handleDownloadQRCode = async () => {
    if (!qrCodeImage) {
      return alert("No QR Code to download.");
    }
    
    try {
      console.log("Requesting media library permissions...");
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        return alert("Permission to access media library is required!");
      }
      
      console.log("Permissions granted, preparing image data...");
      // Handle the base64 data correctly - removing prefix if it exists
      let base64Data = qrCodeImage;
      if (base64Data.startsWith('data:image/png;base64,')) {
        base64Data = base64Data.replace('data:image/png;base64,', '');
      }
      
      const fileUri = `${FileSystem.cacheDirectory}QRCode_${Date.now()}.png`;
      console.log("Saving to cache:", fileUri);
      
      // Write the file to cache
      await FileSystem.writeAsStringAsync(fileUri, base64Data, { 
        encoding: FileSystem.EncodingType.Base64 
      });
      
      console.log("File written to cache, creating asset...");
      // Create the asset
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      console.log("Asset created:", asset.id);
      
      // Check if album exists first
      let album = await MediaLibrary.getAlbumAsync("QR Codes");
      
      if (album) {
        console.log("Album exists, adding asset to album...");
        await MediaLibrary.addAssetsToAlbumAsync([asset.id], album.id, false);
      } else {
        console.log("Creating new album...");
        await MediaLibrary.createAlbumAsync("QR Codes", asset, false);
      }
      
      console.log("QR Code saved successfully");
      alert("QR Code saved to your gallery in the 'QR Codes' album!");
    } catch (error) {
      console.error("Error saving QR Code:", error);
      alert(`Failed to download QR Code: ${error.message}`);
    }
  };


  const handlePrintQRCode = async () => {
    if (!qrCodeImage) {
      return alert("No QR Code to print.");
    }

    try {
      await Print.printAsync({
        html: `
          <html>
            <body style="text-align: center;">
              <img src="${qrCodeImage}" style="width: 300px; height: 300px;" />
              <p>Thanks for using our app</p>
            </body>
          </html>
        `,
      });
    } catch (error) {
      console.error("Error printing QR Code:", error);
      alert("Failed to print QR Code.");
    }
  };

  const handleShareQRCode = async () => {
    if (!qrCodeImage) {
      return alert("No QR Code to share.");
    }

    try {
      const base64Data = qrCodeImage.replace(/^data:image\/png;base64,/, "");
      const fileUri = `${FileSystem.cacheDirectory}QRCode_${Date.now()}.png`;
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!(await Sharing.isAvailableAsync())) {
        return alert("Sharing is not available on this device.");
      }

      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error("Error sharing QR Code:", error);
      alert("Failed to share QR Code. Please try again.");
    }
  };

  const handleCloseModal = () => {
    setQRCodeModalVisible(false);
    // const now = Date.now();
    // const cooldown = 5 * 60 * 1000; // 5 minutes cooldown
    // if (adLoaded && (!lastAdTime || now - lastAdTime > cooldown)) {
    //   interstitial.show();
    //   setLastAdTime(now);
    //   AsyncStorage.setItem("lastInterstitialTime", now.toString());
    // }
  };

  return (
    <SafeAreaView className="bg-primary flex-1">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "space-evenly", padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Custom Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-4"
          accessibilityLabel="Go Back"
        >
          <Text className="text-white font-pbold">Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View className="items-center mb-8 mt-10">
          <Text className="text-secondary text-3xl font-pbold text-center">
            QR Code Generator
          </Text>
          <Text className="text-white text-lg text-2xl text-center mt-2 font-pbold">
            Create QR Code of a geo location
          </Text>
          <Image
            source={icons.location}
            style={{ width: 80, height: 80 }}
            className="mt-4"
            tintColor="#fff"
            resizeMode="contain"
            accessibilityLabel="Location Icon"
          />
        </View>

        {/* Latitude Input */}
        <View className="border-2 border-secondary rounded-lg p-2 bg-white mb-6">
          <TextInput
            placeholder="Latitude example 39° N"
            placeholderTextColor="#888"
            value={latitude}
            onChangeText={setLatitude}
            className="text-black text-lg p-2 font-pregular"
          />
        </View>

        {/* Longitude Input */}
        <View className="border-2 border-secondary rounded-lg p-2 bg-white mb-6">
          <TextInput
            placeholder="Longitude example 77° W"
            placeholderTextColor="#888"
            value={longitude}
            onChangeText={setLongitude}
            className="text-black text-lg p-2 font-pregular"
          />
        </View>

        {/* Query Input */}
        <View className="border-2 border-secondary rounded-lg p-2 bg-white mb-6">
          <TextInput
            placeholder="Query"
            placeholderTextColor="#888"
            value={query}
            onChangeText={setQuery}
            className="text-black text-lg p-2 font-pregular"
            keyboardType="default"
          />
        </View>

        {/* Generate QR Code Button */}
        <CustomButton
          title="Generate QR Code"
          handlePress={handleGenerateQRCode}
          containerStyles="bg-secondary w-full py-4 rounded-lg"
          textStyles="text-white text-lg font-psemibold"
          isLoading={isSubmittingQR}
        />

        {/* Footer */}
        <View className="items-center mt-auto mb-2">
          <Text className="text-secondary text-sm font-pbold mt-2 text-center">
            QR & Bar Pro
          </Text>
          <Text className="text-white text-sm font-plight">
            Powered by Buda Technologies
          </Text>
        </View>
      </ScrollView>

      {/* Banner Ad */}
      {/* <View className="items-center mt-2">
        <BannerAd
          ref={bannerAdRef}
          unitId={bannerAdUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            networkExtras: {
              collapsible: "bottom",
            },
          }}
          onAdFailedToLoad={(error) => {
            console.error("Banner Ad failed to load:", error);
          }}
          onAdLoaded={() => {
            console.log("Banner Ad loaded successfully");
          }}
        />
      </View> */}

      {/* QR Code Modal */}
      <Modal
        visible={qrCodeModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <Pressable
          style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onPress={handleCloseModal}
        >
          <View className="bg-white rounded-lg p-6 w-11/12 items-center shadow-lg">
            <Text className="text-black text-xl font-pbold mb-4">Your QR Code</Text>

            <View className="w-full h-64 mb-4 justify-center items-center">
            <ViewShot ref={qrRef} options={{ format: "png", result: "data-uri" }}>
                <QRCode
                 value={`Latitude: ${latitude}\nLongitude: ${longitude}\nQuery: ${query}`} size={200} />
            </ViewShot>
            </View>

            <View className="flex-row flex-wrap justify-between w-full gap-4">
              <TouchableOpacity
                onPress={handleDownloadQRCode}
                className="flex-1 bg-secondary p-3 rounded-lg items-center flex-row justify-center"
              >
                <Image source={icons.download} className="w-5 h-5 mr-2" tintColor="#fff" />
                <Text className="text-white font-pregular">Save</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePrintQRCode}
                className="flex-1 bg-secondary p-3 rounded-lg items-center flex-row justify-center"
              >
                <Image source={icons.printing} className="w-5 h-5 mr-2" tintColor="#fff" />
                <Text className="text-white font-pregular">Print</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShareQRCode}
                className="flex-1 bg-secondary p-3 rounded-lg items-center flex-row justify-center"
              >
                <Image source={icons.share} className="w-5 h-5 mr-2" tintColor="#fff" />
                <Text className="text-white font-pregular">Share</Text>
              </TouchableOpacity>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              onPress={handleCloseModal}
              className="mt-6 bg-gray-200 p-3 rounded-lg w-full items-center flex-row justify-center"
            >
              <Image source={icons.closed} className="w-5 h-5 mr-2" />
              <Text className="text-gray-600 font-pregular">Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default Generate;