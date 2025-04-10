// import React, { useState, useRef } from "react";
// import { Picker } from "@react-native-picker/picker";
// import * as Print from "expo-print";
// import CustomButton from "../../components/CustomButton";
// import icons from "../../constants/icons";
// import { encode } from "base64-arraybuffer";
// import * as FileSystem from "expo-file-system";
// import * as Sharing from "expo-sharing";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { View, Text, TextInput, Modal, TouchableOpacity, SafeAreaView, ScrollView,
//   Image, Pressable, Platform } from "react-native";
// import { useRouter } from "expo-router";

// import * as MediaLibrary from 'expo-media-library';


// const barcodeLengthLimits = {
//   "ean13": 13,
//   "ean8": 8,
//   "upc_a": 12,
//   "upc_e": 6,
//   "code39": 50, // Variable length, setting a reasonable max
//   "code93": 50, // Variable length
//   "code128": 50, // Variable length
//   "itf-14": 14,
//   "isbn10": 10,
//   "isbn13": 13,
//   "issn": 13,
//   "msi": 13, // Variable, typically up to 13
//   "pharmacode": 6, // Typically 3-6 digits
//   "codabar": 16, // Variable, up to 16
//   "data_matrix": 3116, // Max for Data Matrix, but we'll limit to 50 for practicality
// };

// const Generate = () => {
  

//   const [barcodeType, setBarcodeType] = useState("ean13");
//   const [inputBar, setInputBar] = useState("");
//   const [qrCodeModalVisible, setQRCodeModalVisible] = useState(false);
//   const [qrCodeImage, setQRCodeImage] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const router = useRouter(); 

 

//   const barcodeOptions = [
//     { value: "ean13", label: "EAN-13" },
//     { value: "ean8", label: "EAN-8" },
//     { value: "upc_a", label: "UPC-A" },
//     { value: "upc_e", label: "UPC-E" },
//     { value: "code39", label: "Code 39" },
//     { value: "code93", label: "Code 93" },
//     { value: "code128", label: "Code 128" },
//     { value: "itf-14", label: "ITF-14" },
//     { value: "isbn10", label: "ISBN-10" },
//     { value: "isbn13", label: "ISBN-13" },
//     { value: "issn", label: "ISSN" },
//     { value: "msi", label: "MSI" },
//     { value: "pharmacode", label: "Pharmacode" },
//     { value: "codabar", label: "Codabar" },
//     { value: "data_matrix", label: "Data Matrix" },
//   ];

//   const saveGenerationHistory = async (data, type) => {
//     try {
//       const historyItem = {
//         type: "Generate",
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

//   const handleGenerateBarcode = async () => {
//     if (!inputBar) {
//       return alert("Please enter text to generate a Barcode.");
//     }

//     setIsSubmitting(true);
//     try {
//       const response = await fetch("https://toolsfusion.onrender.com/generate-barcode/", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           data: inputBar,
//           type: barcodeType,
//         }),
//       });

//       if (response.ok) {
//         const arrayBuffer = await response.arrayBuffer();
//         const base64Barcode = `data:image/png;base64,${encode(arrayBuffer)}`;
//         setQRCodeImage(base64Barcode);
//         setQRCodeModalVisible(true);
//         saveGenerationHistory(inputBar, barcodeType);
//       } else {
//         const errorResponse = await response.json();
//         alert(`Failed to generate Barcode: ${errorResponse.error || "Unknown error"}`);
//       }
//     } catch (error) {
//       console.error("Error generating Barcode:", error);
//       alert("An error occurred while generating the Barcode. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };



//   const handleDownloadQRCode = async () => {
//     if (!qrCodeImage) return alert("No QR Code to download.");
//     try {
//       // Request permissions
//       const { status } = await MediaLibrary.requestPermissionsAsync();
//       if (status !== "granted") {
//         return alert("Permission to access media library is required!");
//       }
  
//       // Prepare QR Code image
//       const base64Data = qrCodeImage.replace(/^data:image\/png;base64,/, "");
//       const fileUri = `${FileSystem.cacheDirectory}QRCode_${Date.now()}.png`;
  
//       // Save image to cache
//       await FileSystem.writeAsStringAsync(fileUri, base64Data, { encoding: FileSystem.EncodingType.Base64 });
  
//       // Move to gallery
//       const asset = await MediaLibrary.createAssetAsync(fileUri);
//       await MediaLibrary.createAlbumAsync("QR Codes", asset, false);
  
//       alert("QR Code saved to your gallery!");
//     } catch (error) {
//       console.error("Error saving QR Code:", error);
//       alert("Failed to download QR Code.");
//     }
//   };
  

//   const handlePrintQRCode = async () => {
//     if (!qrCodeImage) return alert("No Barcode to print.");
//     try {
//       await Print.printAsync({
//         html: `
//           <html>
//             <body style="text-align: center;">
//               <img src="${qrCodeImage}" style="width: 300px; height: 300px;" />
//               <p>Thanks for using QR & BAR Pro</p>
//             </body>
//           </html>
//         `,
//       });
//     } catch (error) {
//       console.error("Error printing Barcode:", error);
//       alert("Failed to print Barcode.");
//     }
//   };

//   const handleShareQRCode = async () => {
//     if (!qrCodeImage) return alert("No Barcode to share.");
//     try {
//       const base64Data = qrCodeImage.replace(/^data:image\/png;base64,/, "");
//       const fileUri = `${FileSystem.cacheDirectory}Barcode_${Date.now()}.png`;
//       await FileSystem.writeAsStringAsync(fileUri, base64Data, {
//         encoding: FileSystem.EncodingType.Base64,
//       });
//       if (!(await Sharing.isAvailableAsync())) {
//         return alert("Sharing is not available on this device.");
//       }
//       await Sharing.shareAsync(fileUri);
//     } catch (error) {
//       console.error("Error sharing Barcode:", error);
//       alert("Failed to share Barcode.");
//     }
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-primary">
//       <ScrollView contentContainerStyle={{ padding: 20 }} className="mt-6">
//         <TouchableOpacity
//                   onPress={() => router.back()}
//                   className="p-4"
//                   accessibilityLabel="Go Back"
//                 >
//                   <Text className="text-white font-pbold">Back</Text>
//                 </TouchableOpacity>
//         {/* Header */}
//         <View className="items-center mb-6">
//           <Image
//             source={icons.barcode}
//             className="w-20 h-20"
//             tintColor="#fff"
//             resizeMode="contain"
//           />
//           <Text className="text-3xl font-pbold text-white mt-4">Generate Barcode</Text>
//           <Text className="text-lg font-pregular text-gray-300 text-center">
//             Create a barcode by entering the required details
//           </Text>
//         </View>

//         {/* Barcode Type Picker */}
//         <View className="mb-6">
//           <Text className="text-lg font-psemibold text-white mb-2">Select Barcode Type</Text>
//           <View className="bg-white shadow-md border-2 border-secondary rounded-lg ">
//             <Picker
//               selectedValue={barcodeType}
//               onValueChange={(itemValue) => {
//                 setBarcodeType(itemValue);
//                 setInputBar(""); // Reset input when type changes
//               }}
//               style={{ height: 50, color: "#000" }}
//             >
//               {barcodeOptions.map((option) => (
//                 <Picker.Item
//                   key={option.value}
//                   label={option.label}
//                   value={option.value}
//                 />
//               ))}
//             </Picker>
//           </View>
//         </View>

//         {/* Barcode Input */}
//         <View className="mb-6 ">
        
//           <Text className="text-lg font-psemibold text-white mb-2">Enter Barcode Data</Text>
//           <TextInput
//             placeholder={`Enter ${barcodeType.toUpperCase()} digits`}
//             placeholderTextColor="#888"
//             value={inputBar}
//             onChangeText={setInputBar}
//             // keyboardType="numeric"
//             maxLength={barcodeLengthLimits[barcodeType] || 50} // Default to 50 if not specified
//             className="bg-white text-black text-lg p-4 rounded-lg font-pregular border-2 border-secondary rounded-lg p-2"
//           />
//         </View>

//         {/* Generate Button */}
//         <CustomButton
//           title="Generate Barcode"
//           handlePress={handleGenerateBarcode}
//           containerStyles="bg-secondary w-full py-4 rounded-lg"
//           textStyles="text-white text-lg font-psemibold"
//           isLoading={isSubmitting}
//         />

      
//       </ScrollView>

//         {/* Footer */}
//         <View className="items-center mb-6">
//           <Text className="text-secondary text-sm font-pbold">QR & BAR Pro</Text>
//           <Text className="text-white text-sm font-plight">
//             Powered by Buda Technologies
//           </Text>
//         </View>

        

//       {/* Barcode Modal */}
//       <Modal
//         visible={qrCodeModalVisible}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setQRCodeModalVisible(false)}
//       >
//         <Pressable
//           className="flex-1 justify-center items-center bg-black/50"
//           onPress={() => setQRCodeModalVisible(false)}
//         >
//           <View className="bg-white rounded-xl p-6 w-11/12 max-w-md items-center shadow-lg">
//             <Text className="text-primary text-xl font-pbold mb-4">
//               Your Barcode
//             </Text>
//             {qrCodeImage && (
//               <Image
//                 source={{ uri: qrCodeImage }}
//                 className="w-48 h-48 mb-6"
//                 resizeMode="contain"
//               />
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
//               onPress={() => setQRCodeModalVisible(false)}
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







































import React from "react";
import { View, Text, Image, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { useTheme } from "../../components/ThemeContext"; // Import ThemeContext
import icons from "../../constants/icons";

const Menu = () => {
  const { isDarkMode } = useTheme(); // Get theme state

  const options = [
    { label: "Whatsapp", path: "(generator)/whatsapp", image: icons.theme },
    { label: "My QR", path: "(generator)/myqr", image: icons.theme },
    { label: "Email", path: "(generator)/email", image: icons.theme },
    { label: "Instagram", path: "(generator)/instagram", image: icons.theme },
    { label: "Url", path: "(generator)/url", image: icons.theme },
    { label: "contact", path: "(generator)/contact", image: icons.theme },
    { label: "facebook", path: "(generator)/facebook", image: icons.theme },
    { label: "youtube", path: "(generator)/youtube", image: icons.theme },
    { label: "linkedin", path: "(generator)/linkedin", image: icons.theme },
    { label: "x", path: "(generator)/x", image: icons.theme },
    { label: "sms", path: "(generator)/sms", image: icons.theme },
    { label: "text", path: "(generator)/text", image: icons.theme },
    { label: "phone", path: "(generator)/phone", image: icons.theme },
    { label: "geo", path: "(generator)/geo", image: icons.theme },
    { label: "wifi", path: "(generator)/wifi", image: icons.theme },
    { label: "events", path: "(generator)/events", image: icons.theme },
    { label: "upload", path: "(generator)/upload", image: icons.theme },
    { label: "vibrations", path: "(settings)/vibrations", image: icons.theme },
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

export default Menu;
