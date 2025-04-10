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
  Alert,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import * as Print from "expo-print";
import CustomButton from "../../components/CustomButton";
import icons from "../../constants/icons";
import { encode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Calendar from "expo-calendar";
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
import * as MediaLibrary from "expo-media-library";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot";

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

const EventsPage = () => {
  const bannerAdRef = useRef(null);
  const qrRef = useRef(null);
  const router = useRouter(); // For custom back navigation
  const [event, setEvent] = useState("");
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [qrCodeModalVisible, setQRCodeModalVisible] = useState(false);
  const [qrCodeImage, setQRCodeImage] = useState(null);
  const [isSubmittingQR, setIsSubmittingQR] = useState(false);
  const [selectedCalendarId, setSelectedCalendarId] = useState(null);
  const [calendars, setCalendars] = useState([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
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

//   // Reload banner ad on iOS when app comes to foreground
//   useForeground(() => {
//     if (Platform.OS === "ios" && bannerAdRef.current) {
//       bannerAdRef.current.load();
//     }
//   });

  // Fetch calendars and request permissions
  useEffect(() => {
    const fetchCalendars = async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === "granted") {
        const calendars = await Calendar.getCalendarsAsync();
        setCalendars(calendars);
        if (calendars.length > 0) {
          setSelectedCalendarId(calendars[0].id); // Default to the first calendar
        }
      }
    };

    fetchCalendars();
  }, []);

  const saveToHistory = async () => {
    const newEntry = {
      type: "QR Code",
      data: `Event: ${event}\nStarting Time: ${start.toLocaleString()}\nEnd: ${end.toLocaleString()}\nLocation: ${location}\nDescription: ${description}`,
      timestamp: new Date().toLocaleString(),
    };

    try {
      const existingHistory = await AsyncStorage.getItem("history");
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      history.unshift(newEntry); // Add new item at the beginning
      await AsyncStorage.setItem("history", JSON.stringify(history));
    } catch (error) {
      console.error("Error saving to history:", error);
      alert("Failed to save history. Please try again.");
    }
  };

  // Handle event creation
  const handleCreateEvent = async () => {
    if (!event || !start || !end || !selectedCalendarId) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      const eventDetails = {
        title: event,
        startDate: start,
        endDate: end,
        location: location,
        notes: description,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        calendarId: selectedCalendarId,
      };

      const eventId = await Calendar.createEventAsync(selectedCalendarId, eventDetails);

      if (eventId) {
        Alert.alert("Success", "Event has been added to your calendar!", [
          {
            text: "OK",
            onPress: () => {
              setEvent("");
              setStart(new Date());
              setEnd(new Date());
              setLocation("");
              setDescription("");
            },
          },
        ]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to create event: " + error.message);
    }
  };

  // Generate QR Code for the event
  const dataToEncode = `\n Event: ${event}\nStarting Time: ${start.toLocaleString()}\nEnd: ${end.toLocaleString()}\nLocation: ${location}\nDescription: ${description}`;

  const handleGenerateQRCode = async () => {
    if (!event || !start || !end) {
      return Alert.alert("Error", "Please fill in all required fields.");
    }

    setIsSubmittingQR(true);
    setQRCodeModalVisible(true);
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

  // Download QR Code

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
  

  // Print QR Code
  const handlePrintQRCode = async () => {
    if (!qrCodeImage) {
      return Alert.alert("Error", "No QR Code to print.");
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
      Alert.alert("Error", "Failed to print QR Code.");
    }
  };

  // Share QR Code
  const handleShareQRCode = async () => {
    if (!qrCodeImage) {
      return Alert.alert("Error", "No QR Code to share.");
    }

    try {
      const base64Data = qrCodeImage.replace(/^data:image\/png;base64,/, "");
      const fileUri = `${FileSystem.cacheDirectory}QRCode_${Date.now()}.png`;
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!(await Sharing.isAvailableAsync())) {
        return Alert.alert("Error", "Sharing is not available on this device.");
      }

      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error("Error sharing QR Code:", error);
      Alert.alert("Error", "Failed to share QR Code. Please try again.");
    }
  };

  // Handle Start Date Selection
  const handleStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      const updatedStart = new Date(start);
      updatedStart.setFullYear(selectedDate.getFullYear());
      updatedStart.setMonth(selectedDate.getMonth());
      updatedStart.setDate(selectedDate.getDate());
      setStart(updatedStart);
      if (Platform.OS === "android") {
        setTimeout(() => setShowStartTimePicker(true), 100);
      }
    }
  };

  // Handle Start Time Selection
  const handleStartTimeChange = (event, selectedTime) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      const updatedStart = new Date(start);
      updatedStart.setHours(selectedTime.getHours());
      updatedStart.setMinutes(selectedTime.getMinutes());
      updatedStart.setSeconds(selectedTime.getSeconds());
      setStart(updatedStart);
    }
  };

  // Handle End Date Selection
  const handleEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      const updatedEnd = new Date(end);
      updatedEnd.setFullYear(selectedDate.getFullYear());
      updatedEnd.setMonth(selectedDate.getMonth());
      updatedEnd.setDate(selectedDate.getDate());
      setEnd(updatedEnd);
      if (Platform.OS === "android") {
        setTimeout(() => setShowEndTimePicker(true), 100);
      }
    }
  };

  // Handle End Time Selection
  const handleEndTimeChange = (event, selectedTime) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      const updatedEnd = new Date(end);
      updatedEnd.setHours(selectedTime.getHours());
      updatedEnd.setMinutes(selectedTime.getMinutes());
      updatedEnd.setSeconds(selectedTime.getSeconds());
      setEnd(updatedEnd);
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
          <Text className="text-secondary text-3xl font-pbold text-center">QR Code Generator</Text>
          <Text className="text-white text-lg text-center mt-2 font-pbold">
            Create QR Code of a Calendar Event
          </Text>
          <Image
            source={icons.calendar}
            style={{ width: 80, height: 80 }}
            className="mt-4"
            tintColor="#fff"
            resizeMode="contain"
            accessibilityLabel="Calendar Icon"
          />
        </View>

        {/* Event Form */}
        <View className="border-2 border-secondary rounded-lg p-2 bg-white mb-6">
          <TextInput
            placeholder="Event name"
            placeholderTextColor="#888"
            value={event}
            onChangeText={setEvent}
            className="text-black text-lg p-2 font-pregular"
          />
        </View>

        {/* Start Date and Time Picker */}
        <View className="border-2 border-secondary rounded-lg p-2 bg-white mb-6">
          <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
            <Text className="text-black text-lg p-2 font-pregular">
              Start: {start.toLocaleString()}
            </Text>
          </TouchableOpacity>
          {showStartDatePicker && (
            <DateTimePicker
              value={start}
              mode="date"
              display="default"
              onChange={handleStartDateChange}
            />
          )}
          {showStartTimePicker && (
            <DateTimePicker
              value={start}
              mode="time"
              display="default"
              onChange={handleStartTimeChange}
            />
          )}
        </View>

        {/* End Date and Time Picker */}
        <View className="border-2 border-secondary rounded-lg p-2 bg-white mb-6">
          <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
            <Text className="text-black text-lg p-2 font-pregular">
              End: {end.toLocaleString()}
            </Text>
          </TouchableOpacity>
          {showEndDatePicker && (
            <DateTimePicker
              value={end}
              mode="date"
              display="default"
              onChange={handleEndDateChange}
            />
          )}
          {showEndTimePicker && (
            <DateTimePicker
              value={end}
              mode="time"
              display="default"
              onChange={handleEndTimeChange}
            />
          )}
        </View>

        {/* Location */}
        <View className="border-2 border-secondary rounded-lg p-2 bg-white mb-6">
          <TextInput
            placeholder="Location"
            placeholderTextColor="#888"
            value={location}
            onChangeText={setLocation}
            className="text-black text-lg p-2 font-pregular"
          />
        </View>

        {/* Description */}
        <View className="border-2 border-secondary rounded-lg p-2 bg-white mb-6">
          <TextInput
            placeholder="Description"
            placeholderTextColor="#888"
            value={description}
            onChangeText={setDescription}
            className="text-black text-lg p-2 font-pregular"
          />
        </View>

        {/* Calendar Picker */}
        {calendars.length > 0 && (
          <View className="border-2 border-secondary rounded-lg p-2 bg-white mb-6">
            <Picker
              selectedValue={selectedCalendarId}
              onValueChange={(itemValue) => setSelectedCalendarId(itemValue)}
            >
              {calendars.map((calendar) => (
                <Picker.Item key={calendar.id} label={calendar.title} value={calendar.id} />
              ))}
            </Picker>
          </View>
        )}

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
          <Text className="text-secondary text-sm font-pbold mt-2 text-center">QR & Bar Pro</Text>
          <Text className="text-white text-sm font-plight">Powered by Buda Technologies</Text>
        </View>
      </ScrollView>

      {/* Banner Ad */}
      {/* <View className="items-center mt-2">
        <BannerAd
          ref={bannerAdRef}
          unitId={bannerAdUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          
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
                             value={`Event: ${event}\nStarting Time: ${start.toLocaleString()}\nEnd: ${end.toLocaleString()}\nLocation: ${location}\nDescription: ${description}`} size={200} />
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

export default EventsPage;