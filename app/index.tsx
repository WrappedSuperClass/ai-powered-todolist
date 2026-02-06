import React from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useSharedValue, useAnimatedStyle, withSpring, Animated } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const AnimatedView = Animated.createAnimatedComponent(View);

const placeholderTodos = [
  { id: '1', title: 'Learn React Native', completed: false },
  { id: '2', title: 'Build todo app', completed: true },
  { id: '3', title: 'Integrate AI', completed: false },
];

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

const TodoItem: React.FC<{ todo: Todo; onToggle: () => void; onDelete: () => void }> = ({ todo, onToggle, onDelete }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.95);
  };

  const onPressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedView style={animatedStyle} className="flex-row items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md mb-3">
      <TouchableOpacity 
        className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 items-center justify-center mr-4" 
        onPress={onToggle}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Text className={`text-lg font-bold ${todo.completed ? 'text-green-500' : 'text-gray-400'}`}>
          {todo.completed ? '✓' : '○'}
        </Text>
      </TouchableOpacity>
      <View className="flex-1">
        <Text className={`text-lg font-semibold ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
          {todo.title}
        </Text>
      </View>
      <TouchableOpacity onPress={onDelete} className="p-2">
        <Ionicons name="trash-outline" size={24} color="#ef4444" />
      </TouchableOpacity>
    </AnimatedView>
  );
};

export default function HomeScreen() {
  const [todos, setTodos] = React.useState(placeholderTodos);
  const [text, setText] = React.useState('');
  const fabScale = useSharedValue(1);

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const onFABPressIn = () => {
    fabScale.value = withSpring(0.95);
  };

  const onFABPressOut = () => {
    fabScale.value = withSpring(1);
  };

  const addTodo = () => {
    if (text.trim()) {
      const newTodo: Todo = {
        id: Date.now().toString(),
        title: text.trim(),
        completed: false,
      };
      setTodos(prev => [newTodo, ...prev]);
      setText('');
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const renderTodo = ({ item }: { item: Todo }) => (
    <TodoItem 
      todo={item} 
      onToggle={() => toggleTodo(item.id)} 
      onDelete={() => deleteTodo(item.id)} 
    />
  );

  const EmptyState = () => (
    <View className="flex-1 justify-center items-center p-20">
      <Ionicons name="clipboard-outline" size={80} color="gray" />
      <Text className="text-2xl font-bold text-gray-400 mt-4 mb-2">No Todos</Text>
      <Text className="text-gray-500 text-center">Add a todo to get started!</Text>
    </View>
  );

  return (
    <GestureHandlerRootView className="flex-1 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <View className="flex-1 p-6">
        <View className="flex-row items-center mb-8">
          <Text className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Todos
          </Text>
        </View>
        <View className="flex-row mb-6">
          <TextInput
            className="flex-1 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-lg shadow-sm"
            placeholder="What needs to be done?"
            placeholderTextColor="#9CA3AF"
            value={text}
            onChangeText={setText}
            onSubmitEditing={addTodo}
          />
        </View>
        <FlatList
          data={todos}
          renderItem={renderTodo}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={EmptyState}
        />
      </View>
      <AnimatedView 
        className="absolute bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl items-center justify-center shadow-2xl"
        style={fabAnimatedStyle}
      >
        <TouchableOpacity 
          className="flex-1 items-center justify-center" 
          onPressIn={onFABPressIn}
          onPressOut={onFABPressOut}
          onPress={addTodo}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </AnimatedView>
    </GestureHandlerRootView>
  );
}