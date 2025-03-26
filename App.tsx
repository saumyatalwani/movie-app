import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OMDB_KEY } from '@env';
import {
  FlatList,
  Text,
  TextInput,
  View,
  Image,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeScreen({ navigation }: { navigation: any }) {
  const [query, setQuery] = useState("");
  const [input, setInputValue] = useState('');
  const [results, setResults] = useState<any>([]);

  const handleChange = (text: string) => {
    setInputValue(text);
    setQuery(text);
  };

  useEffect(() => {
    if (!query) return;

    const fetchMovies = async () => {
      try {
        const url = `https://www.omdbapi.com/?apikey=${OMDB_KEY}&s=${query}`;
        console.log(url);
        const res = await axios.get(url);

        if (res.data.Response === "True") {
          setResults(res.data.Search || []);
        } else {
          setResults([]);
        }
      } catch (error: any) {
        console.log("❌ API Error:", error.message || error);
      }
    };

    fetchMovies();
  }, [query]);

  return (
    <SafeAreaView style={styles.container}>
      <TextInput 
        value={input} 
        onChangeText={handleChange} 
        placeholder="Search for a movie..." 
        style={styles.searchInput}
      />

      {results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(movie) => movie.imdbID}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.movieCard} 
              onPress={() => navigation.navigate('MovieDetails', { movie: item })}
            >
              <Image source={{ uri: item.Poster }} style={styles.poster} />
              <View style={styles.movieDetails}>
                <Text style={styles.movieTitle}>{item.Title}</Text>
                <Text style={styles.movieYear}>{item.Year}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : query ? (
        <Text style={styles.noResults}>No results found.</Text>
      ) : null}
    </SafeAreaView>
  );
}

function MovieDetailsScreen({ route }: { route: any }) {
  const { movie } = route.params;
  const [details, setDetails] = useState<any>(movie);

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

// Favorites Screen
function FavoritesScreen({ navigation }: { navigation: any }) {
  const [favorites, setFavorites] = useState<any>([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem('favorites');
        const favoritesList = storedFavorites ? JSON.parse(storedFavorites) : [];
        setFavorites(favoritesList);
      } catch (error) {
        console.log("❌ Error fetching favorites:", error);
      }
    };

    fetchFavorites();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.sectionTitle}>Your Favorite Movies</Text>
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          keyExtractor={(movie) => movie.imdbID}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.movieCard} 
              onPress={() => navigation.navigate('MovieDetails', { movie: item })}
            >
              <Image source={{ uri: item.Poster }} style={styles.poster} />
              <View style={styles.movieDetails}>
                <Text style={styles.movieTitle}>{item.Title}</Text>
                <Text style={styles.movieYear}>{item.Year}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.noResults}>No favorites yet.</Text>
      )}
    </SafeAreaView>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
    </Tab.Navigator>
  );
}

// Main App Stack
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="MovieDetails" component={MovieDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// 📌 Styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  searchInput: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 8 },
  movieCard: { flexDirection: 'row', padding: 10, marginVertical: 6, borderRadius: 10, alignItems: 'center' },
  poster: { width: 80, height: 120, borderRadius: 5, marginRight: 10 },
  noResults: { textAlign: 'center', fontSize: 18, color: '#888', marginTop: 20 },
  scrollContainer: { alignItems: "center",flex: 1, padding: 20, backgroundColor: 'white' },
  movieDetails: { flex: 1 },
  movieTitle: { fontSize: 16, fontWeight: 'bold' },
  movieYear: { fontSize: 14, color: '#666' },
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
});