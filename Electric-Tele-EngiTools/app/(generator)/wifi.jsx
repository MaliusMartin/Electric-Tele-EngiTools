import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, Modal, TouchableOpacity, SafeAreaView, ScrollView, Image, Pressable, Platform } from "react-native";
import * as Print from "expo-print";
import CustomButton from "../../components/CustomButton";
import icons from "../../constants/icons";
import { encode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Picker } from "@react-native-picker/picker";
import CheckBox from "expo-checkbox";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { InterstitialAd, AdEventType, TestIds, BannerAd, BannerAdSize, useForeground } from "react-native-google-mobile-ads";
import { useRouter } from "expo-router";
import * as MediaLibrary from "expo-media-library";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot";



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

const Wifi = () => {
  const bannerAdRef = useRef(null);
  const router = useRouter();
  const [ssid, setSSID] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [qrCodeModalVisible, setQRCodeModalVisible] = useState(false);
  const [qrCodeImage, setQRCodeImage] = useState(null);
  const [isSubmittingQR, setIsSubmittingQR] = useState(false);
  const [encryption, setEncryption] = useState("WPA");
//   const [adLoaded, setAdLoaded] = useState(false);
//   const [adError, setAdError] = useState(null);
//   const [lastAdTime, setLastAdTime] = useState(null);
//   const [bannerAdFailed, setBannerAdFailed] = useState(false);
  const qrRef = useRef(null);

  const encryptionOptions = [
    { value: "WPA", label: "WPA" },
    { value: "WPA2", label: "WPA2" },
    { value: "WEP", label: "WEP" },
    { value: "", label: "No password" },
  ];

   // Reload banner ad on iOS when app comes to foreground
    // useForeground(() => {
    //   if (Platform.OS === "ios" && bannerAdRef.current) {
    //     bannerAdRef.current.load();
    //   }
    // });

//   useEffect(() => {
//     AsyncStorage.getItem("lastInterstitialTime").then((time) => {
//       setLastAdTime(time ? parseInt(time) : null);
//     });
//   }, []);

//   useEffect(() => {
//     const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
//       setAdLoaded(true);
//       setAdError(null);
//       console.log("Interstitial ad loaded");
//     });

//     const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
//       setAdLoaded(false);
//       setAdError(error);
//       console.error("Interstitial ad failed to load:", error);
//     });

//     const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
//       setAdLoaded(false);
//       interstitial.load();
//     });

//     interstitial.load();

//     return () => {
//       unsubscribeLoaded();
//       unsubscribeError();
//       unsubscribeClosed();
//     };
//   }, []);

  const handleGenerateQRCode = async () => {
    if (!ssid) return alert("Please enter the SSID (Network name).");
    if (encryption && !password) return alert("Please enter a password for the selected encryption type.");

    const dataToEncode = `WIFI:T:${encryption || "nopass"};S:${ssid};P:${password || ""};H:false;`;
    setIsSubmittingQR(true);
    setQRCodeModalVisible(true); // Show modal first to render QR component

    setTimeout(async () => {
        try {
          const uri = await qrRef.current.capture();
          setQRCodeImage(uri);
          await saveToHistory(dataToEncode);
        } catch (error) {
          console.error("Error capturing QR Code:", error);
          alert("Failed to generate QR Code.");
        } finally {
          setIsSubmittingQR(false);
        }
      }, 1000); // Wait 1000ms for rendering
  };

  const handleEncryptionChange = (value) => {
    setEncryption(value);
    if (value === "") setPassword("");
  };

  const saveToHistory = async () => {
    const newEntry = {
      type: "WiFi QR Code",
      data: `SSID: ${ssid}\nPassword: ${password || "None"}\nEncryption: ${encryption || "None"}`,
      timestamp: new Date().toLocaleString(),
    };
    try {
      const existingHistory = await AsyncStorage.getItem("history");
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      history.unshift(newEntry);
      await AsyncStorage.setItem("history", JSON.stringify(history));
      alert("Saved to history!");
    } catch (error) {
      console.error("Error saving to history:", error);
      alert("Failed to save history.");
    }
  };


  const handleDownloadQRCode = async () => {
    if (!qrCodeImage) return alert("No QR Code to download.");
    try {
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        return alert("Permission to access media library is required!");
      }
  
      // Prepare QR Code image
      const base64Data = qrCodeImage.replace(/^data:image\/png;base64,/, "");
      const fileUri = `${FileSystem.cacheDirectory}QRCode_${Date.now()}.png`;
  
      // Save image to cache
      await FileSystem.writeAsStringAsync(fileUri, base64Data, { encoding: FileSystem.EncodingType.Base64 });
  
      // Move to gallery
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await MediaLibrary.createAlbumAsync("QR Codes", asset, false);
  
      alert("QR Code saved to your gallery!");
    } catch (error) {
      console.error("Error saving QR Code:", error);
      alert("Failed to download QR Code.");
    }
  };
  

  const handlePrintQRCode = async () => {
    if (!qrCodeImage) return alert("No QR Code to print.");
    try {
      await Print.printAsync({
        html: `<html><body style="text-align: center;"><img src="${qrCodeImage}" style="width: 300px; height: 300px;" /><p>Thanks for using our app</p></body></html>`,
      });
    } catch (error) {
      console.error("Error printing QR Code:", error);
      alert("Failed to print QR Code.");
    }
  };

  const handleShareQRCode = async () => {
    if (!qrCodeImage) return alert("No QR Code to share.");
    try {
      const base64Data = qrCodeImage.replace(/^data:image\/png;base64,/, "");
      const fileUri = `${FileSystem.cacheDirectory}QRCode_${Date.now()}.png`;
      await FileSystem.writeAsStringAsync(fileUri, base64Data, { encoding: FileSystem.EncodingType.Base64 });
      if (!(await Sharing.isAvailableAsync())) return alert("Sharing is not available on this device.");
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error("Error sharing QR Code:", error);
      alert("Failed to share QR Code.");
    }
  };

  const handleCloseModal = () => {
    setQRCodeModalVisible(false);
    // const now = Date.now();
    // const cooldown = 5 * 60 * 1000; // 5 minutes
    // if (adLoaded && !adError && (!lastAdTime || now - lastAdTime > cooldown)) {
    //   interstitial.show();
    //   setLastAdTime(now);
    //   AsyncStorage.setItem("lastInterstitialTime", now.toString());
    // }
  };


  return (
    <SafeAreaView className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "space-evenly", padding: 20 }} showsVerticalScrollIndicator={false}>
        {/* Custom Back Button */}
                <TouchableOpacity
                  // onPress={handleBackPress}
                  onPress={() => router.back()}
                  className="p-4"
                  accessibilityLabel="Go Back"
                >
                  <Text className="text-white font-pbold">Back</Text>
                </TouchableOpacity>
        <View className="items-center mb-8 mt-10">
          <Text className="text-secondary text-3xl font-pbold text-center">QR Code Generator</Text>
          <Text className="text-white text-lg text-center mt-2 font-pbold">Create QR Code of a WiFi network</Text>
          <Image source={icons.wifi} style={{ width: 80, height: 80 }} className="mt-4" tintColor="#fff" resizeMode="contain" />
        </View>
        <View className="border-2 border-secondary rounded-lg p-2 bg-white mb-6">
          <TextInput
            placeholder="SSID | Network name"
            placeholderTextColor="#888"
            value={ssid}
            onChangeText={setSSID}
           className="text-black text-lg p-2 font-pregular"
          />
        </View>
        <View className="border-2 border-secondary rounded-lg p-2 bg-white mb-6">
          <TextInput
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!passwordVisible}
            className="text-black text-lg p-2 font-pregular"
            editable={encryption !== ""}
          />
          <View className="flex-row items-center mt-2">
            <CheckBox value={passwordVisible} onValueChange={setPasswordVisible} />
            <Text className="ml-2 text-primary text-sm">Show Password</Text>
          </View>
        </View>
        <Text className="text-white text-lg mb-2 font-pregular">Encryption type</Text>
        <View className="bg-white rounded-lg shadow-md mb-6">
          <Picker
            selectedValue={encryption}
            onValueChange={handleEncryptionChange}
            style={{ height: 50, color: "#000", fontFamily: "pregular" }}
          >
            {encryptionOptions.map((option) => (
              <Picker.Item key={option.value} label={option.label} value={option.value} />
            ))}
          </Picker>
        </View>
        
        <CustomButton
          title="Generate QR Code"
          handlePress={handleGenerateQRCode}
          containerStyles="bg-secondary w-full py-4 rounded-lg"
          textStyles="text-white text-lg font-psemibold"
          isLoading={isSubmittingQR}
        />
        <View className="items-center mt-auto mb-2">
          <Text className="text-secondary text-sm font-pbold mt-2 text-center">QR & Bar Pro</Text>
          <Text className="text-white text-sm font-plight">Powered by Buda Technologies</Text>
        </View>
      </ScrollView>
      {/* <View className="absolute bottom-0 left-0 right-0 items-center">
        <BannerAd
          unitId={bannerAdUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{ networkExtras: { collapsible: "bottom" } }}
          onAdFailedToLoad={(error) => {
            console.error("Banner Ad failed to load:", error);
            setBannerAdFailed(true);
          }}
        />
        {bannerAdFailed && <Text className="text-white">Ad failed to load</Text>}
      </View> */}
      <Modal visible={qrCodeModalVisible} transparent={true} animationType="fade" onRequestClose={handleCloseModal}>
        <Pressable
          style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onPress={handleCloseModal}
        >
          <View className="bg-white rounded-lg p-6 w-11/12 items-center shadow-lg">
            <Text className="text-black text-xl font-pbold mb-4">Your QR Code</Text>
            
            <View className="w-full h-64 mb-4 justify-center items-center">
            <ViewShot ref={qrRef} options={{ format: "png", result: "data-uri" }}>
                <QRCode
                 value={`WIFI:T:${encryption || "nopass"};S:${ssid};P:${password || ""};H:false;`} size={200} />
            </ViewShot>
            </View>
            <View className="flex-row flex-wrap justify-between w-full gap-4 mt-4">
              <TouchableOpacity onPress={handleDownloadQRCode} className="flex-1 bg-secondary p-3 rounded-lg items-center flex-row justify-center">
                <Image source={icons.download} className="w-5 h-5 mr-2" tintColor="#fff" />
                <Text className="text-white font-pregular">Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePrintQRCode} className="flex-1 bg-secondary p-3 rounded-lg items-center flex-row justify-center">
                <Image source={icons.printing} className="w-5 h-5 mr-2" tintColor="#fff" />
                <Text className="text-white font-pregular">Print</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShareQRCode} className="flex-1 bg-secondary p-3 rounded-lg items-center flex-row justify-center">
                <Image source={icons.share} className="w-5 h-5 mr-2" tintColor="#fff" />
                <Text className="text-white font-pregular">Share</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleCloseModal} className="mt-6 bg-gray-200 p-3 rounded-lg w-full items-center flex-row justify-center">
              <Image source={icons.closed} className="w-5 h-5 mr-2" />
              <Text className="text-gray-600 font-pregular">Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default Wifi;