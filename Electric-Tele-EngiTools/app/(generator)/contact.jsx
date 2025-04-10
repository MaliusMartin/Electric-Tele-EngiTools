import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, Modal, TouchableOpacity, SafeAreaView, ScrollView, Image, Pressable, Platform } from "react-native";
import * as Print from "expo-print";
import CustomButton from "../../components/CustomButton";
import icons from "../../constants/icons";
import { encode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
// import { BannerAd, BannerAdSize, useForeground, TestIds } from "react-native-google-mobile-ads";
import * as MediaLibrary from "expo-media-library";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot";

// const adUnitId = __DEV__ ? TestIds.BANNER : "ca-app-pub-3940256099942544/9214589741"; // Replace with your ID

const Generate = () => {
  const bannerAdRef = useRef(null);
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [qrCodeModalVisible, setQRCodeModalVisible] = useState(false);
  const [qrCodeImage, setQRCodeImage] = useState(null);
  const [isSubmittingQR, setIsSubmittingQR] = useState(false);
  const qrRef = useRef(null);
//   const [adFailed, setAdFailed] = useState(false);


   // Reload banner ad on iOS when app comes to foreground
    // useForeground(() => {
    //   if (Platform.OS === "ios" && bannerAdRef.current) {
    //     bannerAdRef.current.load();
    //   }
    // });

  

    const handleGenerateQRCode = async () => {
        if (!fullName && !organizationName && !address && !email && !phoneNumber && !message) {
          return alert("Please fill in at least one field to generate a QR Code.");
        }
      
        if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          return alert("Please enter a valid email address.");
        }
      
        if (phoneNumber && !phoneNumber.match(/^\+?\d+$/)) {
          return alert("Please enter a valid phone number.");
        }
      
        setIsSubmittingQR(true);
        setQRCodeModalVisible(true); // Show modal first to render QR component
      
        // Delay to ensure modal and QR component render
        setTimeout(async () => {
          try {
            const uri = await qrRef.current.capture();
            setQRCodeImage(uri);
            await saveToHistory();
          } catch (error) {
            console.error("Error capturing QR Code:", error);
            alert("Failed to generate QR Code.");
          } finally {
            setIsSubmittingQR(false);
          }
        }, 500); // Wait 500ms for rendering
      };
      
    

  const saveToHistory = async () => {
    const newEntry = {
      type: "Contact QR Code",
      data: `Full Name: ${fullName}\nOrganization: ${organizationName}\nAddress: ${address}\nEmail: ${email}\nPhone: ${phoneNumber}\nMessage: ${message}`,
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

  return (
    <SafeAreaView className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "space-evenly", padding: 20 }} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} className="p-4 ">
          <Text className="text-white font-pbold">Back</Text>
        </TouchableOpacity>
        <View className="items-center mb-8 mt-10">
          <Text className="text-secondary text-3xl font-pbold text-center">
            QR Code Generator
          </Text>
          <Text className="text-white text-lg text-2xl text-center mt-2 font-pbold">
            Create QR Code of contact information
          </Text>
          <Image
            source={icons.contact}
            style={{ width: 80, height: 80 }}
            className="mt-4"
            tintColor="#fff"
            resizeMode="contain"
            accessibilityLabel="Contact Icon"
          />
        </View>
        <View className="border-2 border-secondary rounded-lg p-2 bg-white mb-6">
          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#888"
            value={fullName}
            onChangeText={setFullName}
            className="text-black text-lg p-2 font-pregular"
          />
        </View>
        <View className="border-2 border-secondary rounded-lg p-2 bg-white mb-6">
          <TextInput
            placeholder="Organization's Name"
            placeholderTextColor="#888"
            value={organizationName}
            onChangeText={setOrganizationName}
            className="text-black text-lg p-2 font-pregular"
          />
        </View>
        <View className="border-2 border-secondary rounded-lg p-2 bg-white mb-6">
          <TextInput
            placeholder="Address"
            placeholderTextColor="#888"
            value={address}
            onChangeText={setAddress}
            className="text-black text-lg p-2 font-pregular"
          />
        </View>
        <View className="border-2 border-secondary rounded-lg p-2 bg-white mb-6">
          <TextInput
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            className="text-black text-lg p-2 font-pregular"
            keyboardType="email-address"
          />
        </View>
        <View className="border-2 border-secondary rounded-lg p-2 bg-white mb-6">
          <TextInput
            placeholder="Phone Number"
            placeholderTextColor="#888"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            className="text-black text-lg p-2 font-pregular"
            keyboardType="phone-pad"
          />
        </View>
        <View className="border-2 border-secondary rounded-lg p-2 bg-white flex-1 mb-6">
          <TextInput
            placeholder="Write Notes here..."
            value={message}
            onChangeText={setMessage}
            multiline={true}
            scrollEnabled={true}
            placeholderTextColor="#888"
            textAlignVertical="top"
            className="text-black text-lg p-2 font-pregular"
            keyboardType="default"
            numberOfLines={6}
          />
        </View>
        <CustomButton
          title="Generate QR Code"
          handlePress={handleGenerateQRCode}
          containerStyles="bg-secondary w-full py-4 rounded-lg"
          textStyles="text-white text-lg font-psemibold"
        />
        <View className="items-center mt-auto mb-2">
          <Text className="text-secondary text-sm font-pbold mt-2 text-center">QR & Bar Pro</Text>
          <Text className="text-white text-sm font-plight">Powered by Buda Technologies</Text>
        </View>
      </ScrollView>
      {/* <View className="absolute bottom-0 left-0 right-0 items-center">
        <BannerAd
          ref={bannerAdRef}
          unitId={adUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{ networkExtras: { collapsible: "bottom" } }}
          onAdFailedToLoad={(error) => {
            console.error("Banner Ad failed to load:", error);
            setAdFailed(true);
          }}
        />
        {adFailed && <Text className="text-white">Ad failed to load</Text>}
      </View> */}
      <Modal visible={qrCodeModalVisible} transparent={true} animationType="fade" onRequestClose={() => setQRCodeModalVisible(false)}>
        <Pressable
          style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onPress={() => setQRCodeModalVisible(false)}
        >
          <View className="bg-white rounded-lg p-6 w-11/12 items-center shadow-lg">
            <Text className="text-black text-xl font-pbold mb-4">Your QR Code</Text>
            <ViewShot ref={qrRef} options={{ format: "png", result: "data-uri" }}>
                <QRCode
                    value={`BEGIN:VCARD
                VERSION:3.0
                N:${fullName}
                ORG:${organizationName}
                ADR:${address}
                EMAIL:${email}
                TEL:${phoneNumber}
                NOTE:${message}
                END:VCARD`}
                    size={200}
                />
            </ViewShot>

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
            <TouchableOpacity
              onPress={() => setQRCodeModalVisible(false)}
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