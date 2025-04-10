import React, { useState, useRef, useEffect } from "react";
import * as Print from "expo-print";
import CustomButton from "../../components/CustomButton";
import icons from "../../constants/icons";
import { encode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CountryPicker } from "react-native-country-codes-picker";
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
  StatusBar,
} from "react-native";
// import {
//   InterstitialAd,
//   AdEventType,
//   TestIds,
//   BannerAd,
//   BannerAdSize,
//   useForeground,
// } from "react-native-google-mobile-ads";
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

const Whatsapp = () => {
  const bannerAdRef = useRef(null);
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [qrCodeModalVisible, setQRCodeModalVisible] = useState(false);
  const [qrCodeImage, setQRCodeImage] = useState(null);
  const [isSubmittingQR, setIsSubmittingQR] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const qrRef = useRef(null);
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [countryCode, setCountryCode] = useState("+1"); // Default to US
  // const [adLoaded, setAdLoaded] = useState(false);
  // const [adError, setAdError] = useState(null);
  // const [lastAdTime, setLastAdTime] = useState(null);

  // Load last ad time from AsyncStorage
  // useEffect(() => {
  //   AsyncStorage.getItem("lastInterstitialTime").then((time) => {
  //     setLastAdTime(time ? parseInt(time) : null);
  //   });
  // }, []);

  // Interstitial Ad setup
  // useEffect(() => {
  //   const unsubscribeLoaded = interstitial.addAdEventListener(
  //     AdEventType.LOADED,
  //     () => {
  //       setAdLoaded(true);
  //       setAdError(null);
  //       console.log("Interstitial ad loaded");
  //     }
  //   );

  //   const unsubscribeError = interstitial.addAdEventListener(
  //     AdEventType.ERROR,
  //     (error) => {
  //       setAdLoaded(false);
  //       setAdError(error);
  //       console.error("Interstitial ad failed to load:", error);
  //     }
  //   );

  //   const unsubscribeOpened = interstitial.addAdEventListener(
  //     AdEventType.OPENED,
  //     () => {
  //       if (Platform.OS === "ios") {
  //         StatusBar.setHidden(true);
  //       }
  //     }
  //   );

  //   const unsubscribeClosed = interstitial.addAdEventListener(
  //     AdEventType.CLOSED,
  //     () => {
  //       if (Platform.OS === "ios") {
  //         StatusBar.setHidden(false);
  //       }
  //       // Reload ad for next display
  //       setAdLoaded(false);
  //       interstitial.load();
  //     }
  //   );

  //   // Start loading the interstitial
  //   interstitial.load();

  //   return () => {
  //     unsubscribeLoaded();
  //     unsubscribeError();
  //     unsubscribeOpened();
  //     unsubscribeClosed();
  //   };
  // }, []);

  // Reload banner ad on iOS when app comes to foreground
  // useForeground(() => {
  //   if (Platform.OS === "ios" && bannerAdRef.current) {
  //     bannerAdRef.current.load();
  //   }
  // });

  const handleGenerateQRCode = async () => {
    if (!phoneNumber || !countryCode) {
      return alert("Please select a country code and enter a phone number.");
    }

    // Remove any non-digit characters from phoneNumber and combine with countryCode
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, "");
    const cleanCountryCode = countryCode.replace(/\D/g, ""); // removes the '+'
    const whatsappUrl = `https://wa.me/${cleanCountryCode}${cleanPhoneNumber}`;

    setWhatsappUrl(whatsappUrl);
    setIsSubmittingQR(true);

    setQRCodeModalVisible(true); // Show modal first to render QR component

    setTimeout(async () => {
        try {
          const uri = await qrRef.current.capture();
          setQRCodeImage(uri);
          await saveToHistory(whatsappUrl);
        } catch (error) {
          console.error("Error capturing QR Code:", error);
          alert("Failed to generate QR Code.");
        } finally {
          setIsSubmittingQR(false);
        }
      }, 500); // Wait 500ms for rendering
  };

  const saveToHistory = async (whatsappUrl) => {
    const newEntry = {
      type: "WhatsApp QR Code",
      data: whatsappUrl,
      url: whatsappUrl,
      timestamp: new Date().toLocaleString(),
    };

    try {
      const existingHistory = await AsyncStorage.getItem("history");
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      history.unshift(newEntry); // Add to start
      await AsyncStorage.setItem("history", JSON.stringify(history));
    } catch (error) {
      console.error("Error saving to history:", error);
      alert("Failed to save to history.");
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
        html: `
          <html>
            <body style="text-align: center;">
              <img src="${qrCodeImage}" style="width: 300px; height: 300px;" />
              <p>WhatsApp QR Code - QR & BAR Pro</p>
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
    if (!qrCodeImage) return alert("No QR Code to share.");

    try {
      const base64Data = qrCodeImage.replace(/^data:image\/png;base64,/, "");
      const fileUri = `${FileSystem.cacheDirectory}WhatsAppQR_${Date.now()}.png`;
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!(await Sharing.isAvailableAsync())) {
        return alert("Sharing is not available on this device.");
      }
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error("Error sharing QR Code:", error);
      alert("Failed to share QR Code.");
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
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView
        contentContainerStyle={{ padding: 20, flexGrow: 1, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Custom Back Button */}
        <TouchableOpacity
          // onPress={handleBackPress}
          onPress={() => router.back()}
          className="p-4"
          accessibilityLabel="Go Back"
        >
          <Text className="text-white font-pbold">Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View className="items-center mb-8 mt-10">
          <Text className="text-secondary text-3xl font-pbold text-center">
            WhatsApp QR Generator
          </Text>
          <Text className="text-white text-lg font-pregular text-center mt-2">
            Create a QR Code for WhatsApp
          </Text>
          <Image
            source={icons.whatsapp}
            className="w-20 h-20 mt-4"
            tintColor="#fff"
            resizeMode="contain"
          />
        </View>

        {/* Country Code Picker */}
        <TouchableOpacity
          onPress={() => setShowCountryPicker(true)}
          className="w-full bg-gray-800 p-4 rounded-lg mb-4 flex-row items-center justify-between"
        >
          <Text className="text-white text-lg font-pregular">
            {countryCode || "Select Country Code"}
          </Text>
          <Image source={icons.dropdown} className="w-5 h-5" tintColor="#fff" />
        </TouchableOpacity>

        <CountryPicker
          show={showCountryPicker}
          pickerButtonOnPress={(item) => {
            setCountryCode(item.dial_code);
            setShowCountryPicker(false);
          }}
          onBackdropPress={() => setShowCountryPicker(false)}
          style={{
            modal: { height: "50%" },
            line: { backgroundColor: "#3C9EEA" },
            textInput: { color: "#06030b", borderColor: "#3C9EEA", font: "psemibold" },
            countryButtonStyles: { backgroundColor: "#353F54" },
            dialCode: { color: "#fff" },
            countryName: { color: "#fff" },
          }}
        />

        {/* Phone Number Input */}
        <View className="w-full border-2 border-secondary rounded-lg p-4 bg-white mb-6">
          <TextInput
            placeholder="Enter phone number eg. 623456789"
            placeholderTextColor="#888"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            // className="text-primary text-lg font-pregular"
            className="text-black text-lg p-2 font-pregular"
            keyboardType="phone-pad"
            maxLength={15}
          />
        </View>

        {/* Generate Button */}
        <CustomButton
          title="Generate QR Code"
          handlePress={handleGenerateQRCode}
          containerStyles="bg-secondary w-full py-4 rounded-lg"
          textStyles="text-white text-lg font-psemibold"
          isLoading={isSubmittingQR}
        />

        {/* Footer */}
        <View className="items-center mt-10 mb-2">
          <Text className="text-secondary text-sm font-pbold">QR & BAR Pro</Text>
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
          className="flex-1 justify-center items-center bg-black/50"
          onPress={handleCloseModal}
        >
          <View className="bg-white rounded-xl p-6 w-11/12 max-w-md items-center shadow-lg">
            <Text className="text-primary text-xl font-pbold mb-4">
              Your WhatsApp QR Code
            </Text>
                 
            <View className="w-full h-64 mb-4 justify-center items-center">
            <ViewShot ref={qrRef} options={{ format: "png", result: "data-uri" }}>
                <QRCode
                 value={whatsappUrl} size={200} />
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

export default Whatsapp;