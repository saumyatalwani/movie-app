import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    FlatList,
    Text,
    TextInput,
    View,
    Image,
    SafeAreaView,
    TouchableOpacity,
    StyleSheet,
  } from 'react-native';
import { OMDB_KEY } from '@env';

export default function HomeScreen({ navigation }: { navigation: any }) {
    const [query, setQuery] = useState("");
    const [input, setInputValue] = useState('');
    const [results, setResults] = useState<any>([]);

    const styles = StyleSheet.create({
        container: { flex: 1, padding: 10 },
        movieCard: { flexDirection: 'row', padding: 10, marginVertical: 6, borderRadius: 10, alignItems: 'center' },
        poster: { width: 80, height: 120, borderRadius: 5, marginRight: 10 },
        movieDetails: { flex: 1 },
        movieTitle: { fontSize: 16, fontWeight: 'bold' },
        movieYear: { fontSize: 14, color: '#666' },
        searchInput: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 8 },
        noResults: { textAlign: 'center', fontSize: 18, color: '#888', marginTop: 20 },
    })
  
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