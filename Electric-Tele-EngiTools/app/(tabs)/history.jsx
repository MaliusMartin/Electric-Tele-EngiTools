

import React, { useRef, useState } from "react";
import { View, Text, TextInput, Modal, TouchableOpacity, Image, Pressable, SafeAreaView, ScrollView, Alert, Platform } from "react-native";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import * as Print from "expo-print";
import CustomButton from "../../components/CustomButton";
import icons from "../../constants/icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const Generate = () => {
  const [qrValue, setQrValue] = useState("");
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrImage, setQrImage] = useState(null);
  const viewShotRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();


    // Function to save barcode history
    const saveGenerationHistory = async (data, type) => {
      try {
        const historyItem = {
          type: "QRcode",
          data,
          timestamp: new Date().toLocaleString(),
        };
        const storedHistory = await AsyncStorage.getItem("history");
        const history = storedHistory ? JSON.parse(storedHistory) : [];
        history.unshift(historyItem);
        await AsyncStorage.setItem("history", JSON.stringify(history));
      } catch (error) {
        console.error("Error saving generation history:", error);
      }
    };

  // Generate QR Code
  const handleGenerateQRCode = async () => {
    if (!qrValue) {
      Alert.alert("Error", "Please enter text to generate QR code.");
      return;
    }

    try {
      const uri = await viewShotRef.current.capture();
      setQrImage(uri);
      setQrModalVisible(true);
      saveGenerationHistory(qrValue,);
    } catch (error) {
      console.error("Error generating QR Code:", error);
      Alert.alert("Error", "Failed to generate QR code.");
    }
  };

  // Download QR Code
  const handleDownloadQRCode = async () => {
    if (!qrImage) {
      Alert.alert("Error", "No QR Code to download.");
      return;
    }
  
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Error", "Permission to access media library denied");
        return;
      }
  
      const fileUri = `${FileSystem.documentDirectory}QRCode_${Date.now()}.png`;
      await FileSystem.moveAsync({
        from: qrImage,
        to: fileUri,
      });
  
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await MediaLibrary.createAlbumAsync("QR Codes", asset, false);
      
      Alert.alert("Success", "QR Code saved to gallery!");
    } catch (error) {
      console.error("Error saving QR Code:", error);
      Alert.alert("Error", "Failed to save QR code: " + error.message);
    }
  };

  // Print QR Code
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

  // Share QR Code
  const handleShareQRCode = async () => {
    if (!qrImage) {
      Alert.alert("Error", "No QR Code to share.");
      return;
    }
  
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Error", "Sharing is not available on this device");
        return;
      }
  
      const fileUri = `${FileSystem.documentDirectory}QRCode_${Date.now()}.png`;
      await FileSystem.moveAsync({
        from: qrImage,
        to: fileUri,
      });
  
      await Sharing.shareAsync(fileUri, {
        mimeType: 'image/png',
        dialogTitle: 'Share QR Code',
        UTI: 'public.png',
      });
    } catch (error) {
      console.error("Error sharing QR Code:", error);
      Alert.alert("Error", "Failed to share QR code: " + error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView contentContainerStyle={{ padding: 20 }} className="mt-6">
      <View className="justify-center items-center">
        <Text className="text-3xl font-pbold text-white mt-2 justify-center">Generate QR Code</Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-psemibold text-white mb-2">Enter Link url</Text>
          <TextInput
            placeholder="https://www.example.com/"
            placeholderTextColor="#888"
            value={qrValue}
            onChangeText={setQrValue}
            className="bg-white text-black text-sm p-4 rounded-lg font-pregular border-2 border-secondary"
          />
        </View>

        {/* QR Code Display */}
        <View className="justify-center items-center mb-4">
   <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1.0, result: "tmpfile" }}
      style={{ backgroundColor: 'white', padding: 10 }}>
  <QRCode value={qrValue || "Default"} size={200} />
</ViewShot>
        </View>

        <CustomButton
          title="Generate QR Code"
          handlePress={handleGenerateQRCode}
          containerStyles="bg-secondary w-full py-4 rounded-lg"
          textStyles="text-white text-lg font-psemibold"
        />
      </ScrollView>

      {/* Modal for QR Code actions */}
     
      <Modal
        visible={qrModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setQrModalVisible(false)}
      >
        <Pressable
          className="flex-1 justify-center items-center bg-black/50"
          onPress={() => setQrModalVisible(false)}
        >
         
          <View className="bg-white rounded-xl p-6 w-11/12 max-w-md items-center  justify-center shadow-lg">
          <TouchableOpacity
          
          onPress={() => router.back()}
          className="p-4"
          accessibilityLabel="Go Back"
        >
          <Text className="text-white font-pbold">Back</Text>
        </TouchableOpacity>

            <Text className="text-primary text-xl font-pbold mt-4">
              Generated QRCode
            </Text>
            {qrImage && (
              
                 <View className="bg-white p-4 rounded-lg border border-gray-200 mb-4 w-full items-center">
               <Image
                 source={{ uri: qrImage }}
                 style={{ width: 250, height: 150 }}
                 resizeMode="contain"
               />
               
               
            
              </View>
            )}
            
            <View className="flex-row flex-wrap justify-between w-full gap-4">
              <TouchableOpacity
                onPress={handleDownloadQRCode}
                className="flex-1 bg-secondary p-3 rounded-lg items-center flex-row justify-center"
              >
                <Image source={icons.download} className="w-5 h-5 mr-2" tintColor="#fff" />
                <Text className="text-white font-pregular">Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePrintQRCode }
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
            <Pressable onPress={() => setQrModalVisible(false)} className="mt-4">
              <Text className="text-red-500 text-xl font-pbold">Close</Text>
            </Pressable>

          </View>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
};

export default Generate;












// import React, { useState, useRef } from "react";
// import { Picker } from "@react-native-picker/picker";
// import * as Print from "expo-print";
// import CustomButton from "../../components/CustomButton";
// import icons from "../../constants/icons";
// import * as FileSystem from "expo-file-system";
// import * as Sharing from "expo-sharing";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   View, Text, TextInput, Modal, TouchableOpacity, SafeAreaView, ScrollView,
//   Image, Pressable, Platform
// } from "react-native";
// import { useRouter } from "expo-router";
// import * as MediaLibrary from "expo-media-library";
// import { Barcode } from "expo-barcode-generator";
// import ViewShot from "react-native-view-shot";

// // Barcode length limits for validation
// const barcodeLengthLimits = {
//   ean13: 12, 
//   ean8: 7,   
//   // upc_a: 11, 
//   upc_e: 6,  
//   code39: 50,
//   code93: 50,
//   code128: 50,
//   "itf-14": 13, 
//   msi: 13,
//   pharmacode: 6,
//   codabar: 16,

// };

// // Barcode format mapping for expo-barcode-generator
// const formatMap = {
//   "itf-14": "ITF14",
//   "ean13": "EAN13",
//   "ean8": "EAN8",
//   // "upc_a": "UPCA",
//   "upc_e": "UPCE",
//   "code39": "CODE39",
//   "code93": "CODE93",
//   "code128": "CODE128",
//   "msi": "MSI",
//   "pharmacode": "PHARMACODE",
//   "codabar": "CODABAR",
  
// };

// const Generate = () => {
//   const [barcodeType, setBarcodeType] = useState("ean13");
//   const [inputBar, setInputBar] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const router = useRouter();
//   const viewShotRef = useRef(null);
//   const [resultModalVisible, setResultModalVisible] = useState(false);
//   const [generatedBarcode, setGeneratedBarcode] = useState(null);


//   // Function to save barcode history
//   const saveGenerationHistory = async (data, type) => {
//     try {
//       const historyItem = {
//         type: "Generate Barcode",
//         data,
//         barcodeType: type,
//         timestamp: new Date().toLocaleString(),
//       };
//       const storedHistory = await AsyncStorage.getItem("history");
//       const history = storedHistory ? JSON.parse(storedHistory) : [];
//       history.unshift(historyItem);
//       await AsyncStorage.setItem("history", JSON.stringify(history));
//     } catch (error) {
//       console.error("Error saving generation history:", error);
//     }
//   };

//   // Input validation
//   const validateInput = () => {
//     const maxLength = barcodeLengthLimits[barcodeType] || 50;
//     const isNumericOnly = /^[0-9]*$/.test(inputBar);

//     if (!inputBar) {
//       alert("Please enter text to generate a Barcode.");
//       return false;
//     }
//     if (inputBar.length !== maxLength) {
//       alert(`Input must be exactly ${maxLength} digits for ${barcodeType.toUpperCase()}.`);
//       return false;
//     }
//     if (!isNumericOnly && ["ean13", "ean8", "upc_a", "upc_e", "itf-14", "msi", "pharmacode"].includes(barcodeType)) {
//       alert(`${barcodeType.toUpperCase()} requires numeric input only.`);
//       return false;
//     }
//     return true;
//   };

//   // Barcode generation handler
//   const handleGenerateBarcode = async () => {
//     if (!validateInput()) return;
  
//     setIsSubmitting(true);
//     try {
//       const uri = await viewShotRef.current.capture();
//       setGeneratedBarcode(uri);
//       setResultModalVisible(true);
//       saveGenerationHistory(inputBar, barcodeType);
//     } catch (error) {
//       console.error("Error generating Barcode:", error);
//       alert("Failed to generate Barcode.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleDownloadQRCode = async () => {
//     if (!generatedBarcode) return alert("No barcode to download.");
    
//     try {
//       // Request permissions
//       const { status } = await MediaLibrary.requestPermissionsAsync();
//       if (status !== "granted") {
//         return alert("Permission to access media library is required!");
//       }
      
//       // Save file directly from the URI - no Base64 conversion needed
//       const asset = await MediaLibrary.createAssetAsync(generatedBarcode);
//       await MediaLibrary.createAlbumAsync("Barcodes", asset, false);
  
//       alert("Barcode saved to your gallery!");
//     } catch (error) {
//       console.error("Error saving Barcode:", error);
//       alert(`Failed to download Barcode: ${error.message}`);
//     }
//   };

//   const handlePrintQRCode = async () => {
//     if (!generatedBarcode) return alert("No barcode to print.");
    
//     try {
//       await Print.printAsync({
//         html: `
//           <html>
//             <body style="text-align: center;">
//               <img src="${generatedBarcode}" style="width: 80%; max-width: 300px;" />
//               <p>Thanks for using QR & BAR Pro</p>
//             </body>
//           </html>
//         `,
//       });
//     } catch (error) {
//       console.error("Error printing Barcode:", error);
//       alert(`Failed to print Barcode: ${error.message}`);
//     }
//   };

//   const handleShareQRCode = async () => {
//     if (!generatedBarcode) return alert("No barcode to share.");
    
//     try {
//       if (!(await Sharing.isAvailableAsync())) {
//         return alert("Sharing is not available on this device.");
//       }
      
//       // Share the image file directly
//       await Sharing.shareAsync(generatedBarcode);
//     } catch (error) {
//       console.error("Error sharing Barcode:", error);
//       alert(`Failed to share Barcode: ${error.message}`);
//     }
//   };
  

//   return (
//     <SafeAreaView className="flex-1 bg-primary">
//       <ScrollView contentContainerStyle={{ padding: 20 }} className="mt-6">
//         <TouchableOpacity
//           onPress={() => router.back()}
//           className="p-4"
//           accessibilityLabel="Go Back"
//         >
//           <Text className="text-white font-pbold">Back</Text>
//         </TouchableOpacity>

//         {/* Header */}
//         <View className="items-center mb-4">
//         <Text className="text-3xl font-pbold text-white mt-2">Generate Barcode</Text>
//           <Image
//             source={icons.barcode}
//             className="w-20 h-20"
//             tintColor="#fff"
//             resizeMode="contain"
//           />
          
//         </View>

//         {/* Barcode Type Picker */}
//         <View className="mb-6">
//           <Text className="text-sm font-pregular text-white mb-2">Select Barcode Type</Text>
//           <View className="bg-white shadow-md border-2 border-secondary rounded-lg">
//             <Picker
//               selectedValue={barcodeType}
//               onValueChange={(itemValue) => {
//                 setBarcodeType(itemValue);
//                 setInputBar("");
//               }}
//               style={{ height: 50, color: "#000" }}
//             >
//               {Object.keys(formatMap).map((type) => (
//                 <Picker.Item key={type} label={type.toUpperCase()} value={type} />
//               ))}
//             </Picker>
//           </View>
//         </View>

//         {/* Barcode Input */}
//         <View className="mb-6">
//           <Text className="text-sm font-pregular text-white mb-2">Enter Barcode Data</Text>
//           <TextInput
//             placeholder={`Enter ${barcodeType.toUpperCase()} digits`}
//             placeholderTextColor="#888"
//             value={inputBar}
//             onChangeText={setInputBar}
//             keyboardType="numeric"
//             maxLength={barcodeLengthLimits[barcodeType] || 50}
//             className="bg-white text-black text-lg p-4 rounded-lg font-pregular border-2 border-secondary"
//           />
//         </View>

//         {/* Hidden Barcode for Generation */}
//         {/* Render Barcode only if input is valid */}
//        <View className="justify-center items-center mb-4">
//        {inputBar.length === barcodeLengthLimits[barcodeType] && (
//   <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1 }}>
//     <Barcode
//       value={inputBar}
//       options={{
//         format: formatMap[barcodeType] || barcodeType.toUpperCase(),
//         background: "#ffffff",
//         lineColor: "#000000",
//         height: 100,
//         width: 2,
//         displayValue: true,
//         className: "font-psemibold",
//       }}
//     />
//   </ViewShot>
// )}
//        </View>


//         {/* Generate Button */}
//         <CustomButton
//           title="Barcode"
//           handlePress={handleGenerateBarcode}
//           containerStyles="bg-secondary w-full py-4 rounded-lg"
//           textStyles="text-white text-lg font-psemibold"
//           isLoading={isSubmitting}
//         />
//       </ScrollView>

//       <Modal
//         visible={resultModalVisible}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setResultModalVisible(false)}
//       >
//         <Pressable
//           className="flex-1 justify-center items-center bg-black/50"
//           onPress={() => setResultModalVisible(false)}
//         >
//           <View className="bg-white rounded-xl p-6 w-11/12 max-w-md items-center shadow-lg">
//             <Text className="text-primary text-xl font-pbold mb-4">
//               Generated Barcode
//             </Text>
//             {generatedBarcode && (
//                <View className="bg-white p-4 rounded-lg border border-gray-200 mb-4 w-full items-center">
//                <Image
//                  source={{ uri: generatedBarcode }}
//                  style={{ width: 250, height: 150 }}
//                  resizeMode="contain"
//                />
               
//                <Text className="text-sm mt-2 font-pregular"> Barcode type: {barcodeType.toUpperCase()}</Text>
//                <Text className="text-sm font-pregular">Data: {inputBar}</Text>
//              </View>
//             )}
//             <View className="flex-row flex-wrap justify-between w-full gap-4">
//               <TouchableOpacity
//                 onPress={handleDownloadQRCode}
//                 className="flex-1 bg-secondary p-3 rounded-lg items-center flex-row justify-center"
//               >
//                 <Image source={icons.download} className="w-5 h-5 mr-2" tintColor="#fff" />
//                 <Text className="text-white font-pregular">Save</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 onPress={handlePrintQRCode}
//                 className="flex-1 bg-secondary p-3 rounded-lg items-center flex-row justify-center"
//               >
//                 <Image source={icons.printing} className="w-5 h-5 mr-2" tintColor="#fff" />
//                 <Text className="text-white font-pregular">Print</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 onPress={handleShareQRCode}
//                 className="flex-1 bg-secondary p-3 rounded-lg items-center flex-row justify-center"
//               >
//                 <Image source={icons.share} className="w-5 h-5 mr-2" tintColor="#fff" />
//                 <Text className="text-white font-pregular">Share</Text>
//               </TouchableOpacity>
//             </View>
//             <TouchableOpacity
//               onPress={() => setResultModalVisible(false)}
//               className="mt-6 bg-gray-200 p-3 rounded-lg w-full items-center flex-row justify-center"
//             >
//               <Image source={icons.closed} className="w-5 h-5 mr-2" />
//               <Text className="text-gray-600 font-pregular">Close</Text>
//             </TouchableOpacity>
//           </View>
//         </Pressable>
//       </Modal>

      
//     </SafeAreaView>
//   );
// };

// export default Generate;

