
import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import * as Linking from "expo-linking";
import * as ImageManipulator from "expo-image-manipulator";
import jsQR from "jsqr";
import Quagga from "quagga";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomButton from "../../components/CustomButton";
import icons from "../../constants/icons";
import { useRouter } from "expo-router";

const UploadedScan = () => {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required", "You need to grant permission to access the gallery.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleScanImage = async () => {
    if (!selectedImage) {
      Alert.alert("Error", "Please select an image to scan.");
      return;
    }

    setIsScanning(true);
    try {
      // Resize image for better processing
      const manipResult = await ImageManipulator.manipulateAsync(
        selectedImage,
        [{ resize: { width: 800 } }],
        { format: "png", compress: 1 }
      );

      // Attempt QR Code scanning
      const qrResult = await scanQRCode(manipResult.uri);
      if (qrResult) {
        setScanResult({ type: "QR Code", data: qrResult });
        setModalVisible(true);
        await saveGenerationHistory(qrResult, "QR Code");
        setIsScanning(false);
        return;
      }

      // Attempt Barcode scanning
      const barcodeResult = await scanBarcode(manipResult.uri);
      if (barcodeResult) {
        setScanResult({ type: "Barcode", data: barcodeResult });
        setModalVisible(true);
        await saveGenerationHistory(barcodeResult, "Barcode");
      } else {
        Alert.alert("Error", "No QR Code or Barcode detected in the image.");
      }
    } catch (error) {
      console.error("Error scanning image:", error);
      Alert.alert("Error", "Failed to scan the image: " + error.message);
    } finally {
      setIsScanning(false);
    }
  };

  // QR Code scanning function
  const scanQRCode = async (uri) => {
    try {
      // Convert image to base64 and then to a format jsQR can use
      const base64 = await fetch(uri).then((res) => res.blob());
      const img = await ImageManipulator.manipulateAsync(uri, [], { format: "png", base64: true });
      const imageData = await base64ToImageData(img.base64, img.width, img.height);
      const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
      return qrCode ? qrCode.data : null;
    } catch (error) {
      console.error("QR scan error:", error);
      return null;
    }
  };

  // Barcode scanning function
  const scanBarcode = async (uri) => {
    return new Promise((resolve) => {
      Quagga.decodeSingle(
        {
          src: uri,
          numOfWorkers: 0, // Must be 0 in React Native
          inputStream: {
            size: 800,
            singleChannel: false,
          },
          decoder: {
            readers: [
              "code_128_reader",
              "ean_reader",
              "ean_8_reader",
              "code_39_reader",
              "codabar_reader",
              "upc_reader",
              "upc_e_reader",
            ],
          },
        },
        (result) => {
          resolve(result?.codeResult?.code || null);
        }
      );
    });
  };

  // Convert base64 to ImageData-like structure for jsQR
  const base64ToImageData = async (base64, width, height) => {
    // This is a simplified version - in a real app, you'd need to decode the base64 to raw pixel data
    const img = new Uint8ClampedArray(width * height * 4); // RGBA
    // Note: This is a placeholder - actual base64 decoding to pixel data is complex
    // You might need a library like 'image-decode' or implement custom logic
    return { data: img, width, height };
  };

  const saveGenerationHistory = async (data, type) => {
    try {
      const historyItem = {
        type,
        data,
        timestamp: new Date().toLocaleString(),
      };
      const storedHistory = await AsyncStorage.getItem("history");
      const history = storedHistory ? JSON.parse(storedHistory) : [];
      history.unshift(historyItem);
      await AsyncStorage.setItem("history", JSON.stringify(history));
    } catch (error) {
      console.error("Error saving scan history:", error);
    }
  };

  const handleAction = async (action) => {
    if (!scanResult?.data) return;

    const data = scanResult.data;

    switch (action) {
      case "open":
        Linking.openURL(data).catch(() => Alert.alert("Error", "Failed to open the URL."));
        break;
      case "copy":
        Clipboard.setStringAsync(data)
          .then(() => Alert.alert("Copied", "Text copied to clipboard."))
          .catch(() => Alert.alert("Error", "Failed to copy text."));
        break;
      case "share":
        Sharing.shareAsync(selectedImage, { dialogTitle: "Share scanned code" })
          .catch(() => Alert.alert("Error", "Failed to share."));
        break;
      case "search":
        Linking.openURL(`https://www.google.com/search?q=${encodeURIComponent(data)}`)
          .catch(() => Alert.alert("Error", "Failed to open search."));
        break;
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <TouchableOpacity onPress={() => router.back()} className="p-4">
          <Text className="text-white font-pbold">Back</Text>
        </TouchableOpacity>

        <View className="items-center mb-8">
          <Text className="text-2xl font-pbold text-white text-center mt-6">
            Upload & Scan
          </Text>
          <Image
            source={icons.gallery}
            style={{ width: 80, height: 80 }}
            className="mt-4"
            tintColor="#fff"
          />
        </View>

        <View className="items-center mb-6">
          <TouchableOpacity onPress={pickImage} className="bg-secondary p-4 rounded-lg">
            <Text className="text-white font-psemibold text-lg">
              {selectedImage ? "Change Image" : "Select Image"}
            </Text>
          </TouchableOpacity>

          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={{ width: 200, height: 200, marginVertical: 20 }}
              resizeMode="contain"
            />
          )}
        </View>

        <CustomButton
          title={isScanning ? "Scanning..." : "Scan Image"}
          handlePress={handleScanImage}
          containerStyles="bg-secondary"
          textStyles="text-primary"
          isLoading={isScanning}
        />
      </ScrollView>

      <View className="items-center mt-auto mb-2">
        <Text className="text-secondary text-sm font-pbold mt-2 text-center">
          QR & Bar Pro
        </Text>
        <Text className="text-white text-sm font-plight">
          Powered by Buda Technologies
        </Text>
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg p-6 w-11/12 max-w-md">
            <Text className="text-black text-xl font-pbold mb-4 text-center">
              Scan Result
            </Text>

            {scanResult?.data ? (
              <>
                <Text className="text-black text-sm font-pregular mb-2">
                  Type: {scanResult.type}
                </Text>
                <ScrollView className="max-h-40 mb-4">
                  <Text className="text-black text-base font-pregular">
                    {scanResult.data}
                  </Text>
                </ScrollView>

                <View className="flex-row flex-wrap justify-between gap-4">
                  <TouchableOpacity
                    className="flex-1 items-center p-3 bg-secondary rounded-lg"
                    onPress={() => handleAction("open")}
                  >
                    <Image source={icons.link} style={{ width: 24, height: 24 }} tintColor="#fff" />
                    <Text className="text-white font-pregular mt-2 text-sm">Open</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 items-center p-3 bg-secondary rounded-lg"
                    onPress={() => handleAction("copy")}
                  >
                    <Image source={icons.copy} style={{ width: 24, height: 24 }} tintColor="#fff" />
                    <Text className="text-white font-pregular mt-2 text-sm">Copy</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 items-center p-3 bg-secondary rounded-lg"
                    onPress={() => handleAction("share")}
                  >
                    <Image source={icons.share} style={{ width: 24, height: 24 }} tintColor="#fff" />
                    <Text className="text-white font-pregular mt-2 text-sm">Share</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 items-center p-3 bg-secondary rounded-lg"
                    onPress={() => handleAction("search")}
                  >
                    <Image source={icons.search} style={{ width: 24, height: 24 }} tintColor="#fff" />
                    <Text className="text-white font-pregular mt-2 text-sm">Search</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Text className="text-black text-center font-pregular">
                No QR Code or Barcode found.
              </Text>
            )}

            <CustomButton
              title="Close"
              handlePress={handleCloseModal}
              containerStyles="bg-red-600 mt-6"
              textStyles="text-white"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default UploadedScan;


