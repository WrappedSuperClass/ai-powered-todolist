import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const [apiKey, setApiKey] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    const key = await SecureStore.getItemAsync('openrouter_api_key');
    if (key) setApiKey(key);
  };

  const saveApiKey = async () => {
    await SecureStore.setItemAsync('openrouter_api_key', apiKey);
    Alert.alert('Saved!', 'OpenRouter API key saved securely.');
  };

  const clearApiKey = async () => {
    await SecureStore.deleteItemAsync('openrouter_api_key');
    setApiKey('');
    Alert.alert('Cleared', 'API key removed.');
  };

  return (
    <ScrollView className="flex-1 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
      <View className="items-center mb-8">
        <Text className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
          settings
        </Text>
        <Text className="text-lg text-gray-600 dark:text-gray-400 text-center">
          set your openrouter api key for sassy grok magic
        </Text>
      </View>
      <View className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl mb-8">
        <Text className="text-xl font-bold text-gray-900 dark:text-white mb-6">openrouter api key</Text>
        <TextInput
          className="w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl text-lg mb-6 text-gray-900 dark:text-white"
          value={apiKey}
          onChangeText={setApiKey}
          placeholder="sk-or-v1-..."
          placeholderTextColor="#9CA3AF"
          secureTextEntry={true}
          multiline={true}
          numberOfLines={4}
        />
        <TouchableOpacity 
          className="w-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-5 items-center mb-4"
          onPress={saveApiKey}
        >
          <Text className="text-xl font-bold text-white">save key</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-5 items-center"
          onPress={loadApiKey}
        >
          <Text className="text-xl font-bold text-white">reload saved key</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity 
        className="w-full bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl p-5 items-center"
        onPress={clearApiKey}
      >
        <Text className="text-xl font-bold text-white">clear key</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        className="mt-8 p-4 bg-blue-500 rounded-2xl items-center"
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
        <Text className="text-white font-bold mt-1">back to chaos</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}