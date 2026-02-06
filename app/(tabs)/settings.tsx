import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const [apiKey, setApiKey] = useState('');

  const loadApiKey = async () => {
    const key = await AsyncStorage.getItem('openrouter_api_key');
    setApiKey(key || '');
  };

  const saveApiKey = async () => {
    await AsyncStorage.setItem('openrouter_api_key', apiKey);
    Alert.alert('Saved', 'OpenRouter API key saved!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>OpenRouter API Key</Text>
        <TextInput
          style={styles.input}
          value={apiKey}
          onChangeText={setApiKey}
          placeholder="sk-or-v1-..."
          secureTextEntry
          multiline
        />
        <TouchableOpacity style={styles.saveButton} onPress={saveApiKey}>
          <Text style={styles.saveButtonText}>Save API Key</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.loadButton} onPress={loadApiKey}>
        <Text style={styles.loadButtonText}>Load Saved Key</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f8fafc',
    textAlignVertical: 'top',
    height: 100,
  },
  saveButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  loadButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  loadButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
