import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { Link } from "expo-router";

const CustomButton = ({
  title,
  handlePress,
  containerStyles,
  textStyles,
  isLoading,
  href, // Add href prop
}) => {
  // If href is provided, use Link for navigation
  if (href) {
    return (
      <Link href={href} asChild>
        <TouchableOpacity
          activeOpacity={0.7}
          className={`bg-secondary rounded-xl min-h-[62px] flex flex-row justify-center items-center ${containerStyles} ${
            isLoading ? "opacity-50" : ""
          }`}
          disabled={isLoading}
        >
          <Text className={`text-primary font-psemibold text-lg ${textStyles}`}>
            {title}
          </Text>
          {isLoading && (
            <ActivityIndicator
              animating={isLoading}
              color="#fff"
              size="small"
              className="ml-2"
            />
          )}
        </TouchableOpacity>
      </Link>
    );
  }

  // If no href, use the original onPress behavior
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`bg-secondary rounded-xl min-h-[62px] flex flex-row justify-center items-center ${containerStyles} ${
        isLoading ? "opacity-50" : ""
      }`}
      disabled={isLoading}
    >
      <Text className={`text-primary font-psemibold text-lg ${textStyles}`}>
        {title}
      </Text>
      {isLoading && (
        <ActivityIndicator
          animating={isLoading}
          color="#fff"
          size="small"
          className="ml-2"
        />
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;