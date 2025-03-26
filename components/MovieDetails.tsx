import React, { useEffect, useState } from "react";
import { View, Text, Button, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MovieDetails = ({ route }:any) => {
  const movie = route.params?.movie || {};
  const [isFavorite, setIsFavorite] = useState(false);

  // Load favorite status from AsyncStorage
  useEffect(() => {
    checkFavoriteStatus();
  }, []);

  const checkFavoriteStatus = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem("favorites");
      const favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
      setIsFavorite(favorites.some((fav:any) => fav.id === movie.id));
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  // Toggle favorite status
  const toggleFavorite = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem("favorites");
      let favorites = storedFavorites ? JSON.parse(storedFavorites) : [];

      if (isFavorite) {
        favorites = favorites.filter((fav:any) => fav.id !== movie.id);
        Alert.alert("Removed from Favorites", `${movie.title} has been removed.`);
      } else {
        favorites.push(movie);
        Alert.alert("Added to Favorites", `${movie.title} has been added.`);
      }

      await AsyncStorage.setItem("favorites", JSON.stringify(favorites));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>{movie.title}</Text>
      <Text>{movie.description}</Text>
      <Button
        title={isFavorite ? "Remove from Favorites ❤️" : "Add to Favorites 🤍"}
        onPress={toggleFavorite}
      />
    </View>
  );
};

export default MovieDetails;