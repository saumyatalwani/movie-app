import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OMDB_KEY } from '@env';
import {
  Text,
  Image,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';

export default function MovieDetailsScreen({ route }: { route: any }) {
  const { movie } = route.params;
  const [details, setDetails] = useState<any>(movie);

  const styles = StyleSheet.create({
    scrollContainer: { alignItems: "center",flex: 1, padding: 20, backgroundColor: 'white' },
    detailsContainer: { flex: 1, alignItems: 'center', padding: 20 },
    detailsPoster: { width: 200, height: 300, borderRadius: 10, marginTop: 20 },
    detailsTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 10 },
    saveButton: { backgroundColor: '#007BFF', padding: 10, borderRadius: 8, marginTop: 10 },
    saveButtonText: { color: 'white', fontSize: 16 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center',marginTop: 10 },
    detailsYear: { fontSize: 18, color: '#444', marginTop: 5 },
    detailsType: { fontSize: 16, color: '#666', marginTop: 5 },
    detailsIMDB: { fontSize: 16, color: '#888', marginTop: 5 },
    detailsPlot: { fontSize: 16, color: '#222', marginTop: 10, maxWidth: '95%',textAlign:"justify" },

  })

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const url = `https://www.omdbapi.com/?apikey=${OMDB_KEY}&i=${movie.imdbID}&plot=full`;
        const res = await axios.get(url);
        
        if (res.data.Response === "True") {
          setDetails(res.data);
        }
      } catch (error) {
        console.log("❌ Movie Details API Error:", error);
      }
    };

    fetchMovieDetails();
  }, [movie.imdbID]);

  // Save movie to AsyncStorage
  const saveToFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      const favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
      
      // Check if movie is already in favorites
      if (favorites.some((fav: any) => fav.imdbID === details.imdbID)) {
        Alert.alert("Already Saved", "This movie is already in your favorites.");
        return;
      }

      favorites.push(details);
      await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
      Alert.alert("Saved!", "Movie added to favorites.");
    } catch (error) {
      console.log("❌ Error saving movie:", error);
    }
  };

  return (
    <SafeAreaView style={styles.detailsContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image source={{ uri: details.Poster }} style={styles.detailsPoster} />
        <Text style={styles.detailsTitle}>{details.Title}</Text>
        <Text style={styles.detailsYear}>Year: {details.Year}</Text>
        <Text style={styles.detailsType}>Type: {details.Type}</Text>
        <Text style={styles.detailsIMDB}>IMDB ID: {details.imdbID}</Text>
        <Text style={styles.detailsPlot}>{details.Plot || "Plot not available"}</Text>

        <TouchableOpacity style={styles.saveButton} onPress={saveToFavorites}>
          <Text style={styles.saveButtonText}>Save to Favorites</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}