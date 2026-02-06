import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSharedValue, useAnimatedStyle, withSpring, Animated } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Audio } from 'expo-av';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import { useTodos } from '../../lib/db';
import { useRouter } from 'expo-router';

const AnimatedView = Animated.createAnimatedComponent(View);

interface ParsedTodo {
  title: string;
  category: 'now' | 'soon' | 'chill';
  nag: string;
}

const TodoItem = ({ todo, onToggle, onDelete }: any) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const onPressIn = () => scale.value = withSpring(0.95);
  const onPressOut = () => scale.value = withSpring(1);
  const isCompleted = todo.completed === 1;
  const catColor = todo.category || 'chill';
  const bgColor = catColor === 'now' ? 'bg-now-100' : catColor === 'soon' ? 'bg-soon-100' : 'bg-chill-100';

  return (
    <AnimatedView style={animatedStyle} className={`flex-row items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md mb-3 ${bgColor}`}>
      <TouchableOpacity 
        className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 items-center justify-center mr-4" 
        onPress={onToggle}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Text className={`text-lg font-bold ${isCompleted ? 'text-green-500' : 'text-gray-400'}`}>
          {isCompleted ? '✓' : '○'}
        </Text>
      </TouchableOpacity>
      <View className="flex-1 pr-2">
        <Text className={`text-lg font-semibold ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
          {todo.title}
        </Text>
        {todo.nag && <Text className="text-sm text-gray-500 italic">{todo.nag}</Text>}
        <View className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1 ${catColor === 'now' ? 'bg-now-200 text-now-800' : catColor === 'soon' ? 'bg-soon-200 text-soon-800' : 'bg-chill-200 text-chill-800'}`}>
          {catColor.toUpperCase()}
        </View>
      </View>
      <TouchableOpacity onPress={onDelete} className="p-2">
        <Ionicons name="trash-outline" size={24} color="#ef4444" />
      </TouchableOpacity>
    </AnimatedView>
  );
};

export default function HomeScreen() {
  const { todos, loading, add, toggle, del, refresh } = useTodos();
  const [text, setText] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [parsing, setParsing] = useState(false);
  const fabScale = useSharedValue(1);
  const router = useRouter();

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  useEffect(() => {
    loadApiKey();
    Notifications.requestPermissionsAsync();
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }, []);

  const loadApiKey = async () => {
    const key = await SecureStore.getItemAsync('openrouter_api_key');
    setApiKey(key || '');
  };

  const parseWithGrok = async (inputText: string): Promise<ParsedTodo | null> => {
    if (!apiKey) {
      Alert.alert('API Key Needed', 'Set your OpenRouter API key in Settings.');
      return null;
    }
    try {
      const prompt = `you are a lowercase sassy chaotic todo gremlin. parse this dump into ONLY valid JSON: {"title": "sassy lowercase title max 50 chars", "category": "now|soon|chill", "nag": "short sassy lowercase nag msg"}. be fun chaotic lowercase no caps. example: {"title": "fix that damn leak lol", "category": "now", "nag": "do it now or regret lazybones"}`;
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${apiKey}\`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://aitodolist.app',
          'X-Title': 'Sassy AI TodoList',
        },
        body: JSON.stringify({
          model: 'x-ai/grok-beta',
          messages: [{ role: 'user', content: prompt + '\\n\\n' + inputText }],
          temperature: 0.8,
        }),
      });
      const data = await response.json();
      const content = data.choices[0].message.content.trim();
      return JSON.parse(content);
    } catch (error) {
      console.error(error);
      Alert.alert('Parse Error', 'Failed to parse with Grok. Check API key.');
      return null;
    }
  };

  const addTodo = async () => {
    if (!text.trim()) return;
    setParsing(true);
    const parsed = await parseWithGrok(text.trim());
    setParsing(false);
    if (parsed) {
      await add(parsed.title, parsed.category, parsed.nag);
      scheduleNotification(parsed.title, parsed.nag, parsed.category);
      setText('');
    }
  };

  const startRecording = async () => {
    try {
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync();
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    await recording!.stopAndUnloadingAsync();
    const uri = recording!.getURI();
    const base64 = await Audio.getAudioBytesAsync(uri!);
    const transcribed = await transcribeAudio(base64!);
    if (transcribed) {
      setParsing(true);
      const parsed = await parseWithGrok(transcribed);
      setParsing(false);
      if (parsed) {
        await add(parsed.title, parsed.category, parsed.nag);
        scheduleNotification(parsed.title, parsed.nag, parsed.category);
      }
    }
    setRecording(null);
  };

  const transcribeAudio = async (audioBase64: string) => {
    if (!apiKey) return null;
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: `data:audio/m4a;base64,${audioBase64}`,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);
      formData.append('model', 'openai/whisper-large-v3-turbo');
      const response = await fetch('https://openrouter.ai/api/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${apiKey}\`,
        },
        body: formData,
      });
      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error(error);
      Alert.alert('Transcription Error', 'Failed to transcribe audio.');
      return null;
    }
  };

  const scheduleNotification = async (title: string, nag: string, category: string) => {
    let seconds = 600; // 10min default
    if (category === 'now') seconds = 300; // 5min
    if (category === 'soon') seconds = 3600; // 1h
    if (category === 'chill') seconds = 86400; // 24h
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'sassy todo nag',
        body: \`\${nag} - \${title}\`,
      },
      trigger: { seconds },
    });
  };

  const onFABPressIn = () => fabScale.value = withSpring(0.95);
  const onFABPressOut = () => fabScale.value = withSpring(1);

  const renderTodo = ({ item }: any) => (
    <TodoItem todo={item} onToggle={() => toggle(item.id)} onDelete={() => del(item.id)} />
  );

  return (
    <GestureHandlerRootView className="flex-1 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <View className="flex-1 p-6">
        <View className="flex-row items-center mb-8">
          <Text className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            sassy ai todos
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/settings')} className="ml-auto p-2">
            <Ionicons name="settings-outline" size={28} color="#6b7280" />
          </TouchableOpacity>
        </View>
        <View className="flex-row mb-6">
          <TextInput
            className="flex-1 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-lg shadow-sm mr-2"
            placeholder="text dump or tap voice..."
            placeholderTextColor="#9CA3AF"
            value={text}
            onChangeText={setText}
            editable={!loading || !parsing}
          />
          <TouchableOpacity 
            className={`w-12 h-12 rounded-2xl items-center justify-center ${parsing ? 'bg-gray-400' : 'bg-blue-500'}`}
            onPress={parsing ? undefined : addTodo}
            disabled={parsing}
          >
            {parsing ? <ActivityIndicator color="white" size="small" /> : <Ionicons name="send" size={20} color="white" />}
          </TouchableOpacity>
        </View>
        {isRecording ? (
          <TouchableOpacity className="w-20 h-20 bg-red-500 rounded-full items-center justify-center mx-auto mb-6" onPress={stopRecording}>
            <Text className="text-3xl text-white font-bold">⏹️</Text>
            <Text className="text-white text-sm mt-1">stop</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mx-auto mb-6" onPress={startRecording}>
            <Ionicons name="mic" size={32} color="white" />
            <Text className="text-white text-xs mt-1">voice</Text>
          </TouchableOpacity>
        )}
        <FlatList
          data={todos}
          renderItem={renderTodo}
          keyExtractor={(item: any) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={loading ? <ActivityIndicator size="large" className="my-20" /> : <View className="flex-1 justify-center items-center p-20"><Ionicons name="clipboard-outline" size={80} color="gray" /><Text className="text-2xl font-bold text-gray-400 mt-4 mb-2">no todos</Text><Text className="text-gray-500 text-center">voice or text dump to start chaos</Text></View>}
        />
      </View>
    </GestureHandlerRootView>
  );
}