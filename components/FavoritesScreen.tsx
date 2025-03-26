import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
    StyleSheet,
    SafeAreaView,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    View
 } from 'react-native';

export default function FavoritesScreen({ navigation }: { navigation: any }) {
    const [favorites, setFavorites] = useState<any>([]);

    const styles = StyleSheet.create({
        container: { flex: 1, padding: 10 },
        sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center',marginTop: 10 },
        movieCard: { flexDirection: 'row', padding: 10, marginVertical: 6, borderRadius: 10, alignItems: 'center' },
        poster: { width: 80, height: 120, borderRadius: 5, marginRight: 10 },
        movieDetails: { flex: 1 },
        movieTitle: { fontSize: 16, fontWeight: 'bold' },
        movieYear: { fontSize: 14, color: '#666' },
        noResults: { textAlign: 'center', fontSize: 18, color: '#888', marginTop: 20 },
    })
  
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