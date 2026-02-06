import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const db = SQLite.openDatabase('todos.db');

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function TodoScreen() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    initDB();
    loadApiKey();
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });
    return () => subscription?.remove();
  }, []);

  const initDB = () => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT, completed INTEGER DEFAULT 0, priority INTEGER DEFAULT 0, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP);'
      );
      tx.executeSql('CREATE INDEX IF NOT EXISTS idx_priority ON todos(priority);');
    }, null, refreshTodos);
  };

  const loadApiKey = async () => {
    const key = await AsyncStorage.getItem('openrouter_api_key');
    setApiKey(key || '');
  };

  const saveApiKey = async () => {
    await AsyncStorage.setItem('openrouter_api_key', apiKey);
  };

  const refreshTodos = () => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM todos ORDER BY priority DESC, createdAt ASC;', [], (_, { rows }) => {
        setTodos(rows._array);
      });
    });
  };

  const addTodo = () => {
    if (!newTodo.trim()) return;
    db.transaction(tx => {
      tx.executeSql('INSERT INTO todos (text) VALUES (?);', [newTodo], () => {
        setNewTodo('');
        refreshTodos();
      });
    });
  };

  const toggleTodo = (id) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE todos SET completed = 1 - completed WHERE id = ?;',
        [id],
        refreshTodos
      );
    });
  };

  const deleteTodo = (id) => {
    Alert.alert('Delete Todo', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        db.transaction(tx => {
          tx.executeSql('DELETE FROM todos WHERE id = ?;', [id], refreshTodos);
        });
      } },
    ]);
  };

  const updateTodo = (id, text) => {
    db.transaction(tx => {
      tx.executeSql('UPDATE todos SET text = ? WHERE id = ?;', [text, id], () => {
        setEditingId(null);
        setEditingText('');
        refreshTodos();
      });
    });
  };

  const prioritizeWithAI = async () => {
    if (!apiKey) {
      Alert.alert('API Key Required', 'Please set your OpenRouter API key in Settings.');
      return;
    }
    if (todos.length === 0) {
      Alert.alert('No Todos', 'Add some todos to prioritize.');
      return;
    }
    try {
      const prompt = `Prioritize these todos by urgency and importance. Output ONLY a JSON array of IDs in order highest to lowest priority. Example: [1,3,2]

Todos: ${JSON.stringify(todos.map(t => ({id: t.id, text: t.text, completed: t.completed ? 'yes' : 'no'})), null, 2)}`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://aitodolist.app',
          'X-Title': 'AI TodoList Mobile',
        },
        body: JSON.stringify({
          model: 'x-ai/grok-beta',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
        }),
      });

      const data = await response.json();
      const content = data.choices[0].message.content.trim();
      const order = JSON.parse(content);

      // Update priorities
      db.transaction(tx => {
        order.forEach((id, index) => {
          tx.executeSql('UPDATE todos SET priority = ? WHERE id = ?;', [order.length - index, id]);
        });
        refreshTodos();
      });

      Alert.alert('Success', 'Todos prioritized by AI!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'AI prioritization failed. Check API key and network.');
    }
  };

  const scheduleNotification = (todo) => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: 'Todo Reminder',
        body: todo.text,
      },
      trigger: { seconds: 60 }, // 1 min for demo
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>AI TodoList</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add new todo..."
          value={newTodo}
          onChangeText={setNewTodo}
          onSubmitEditing={addTodo}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTodo}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.aiButton} onPress={prioritizeWithAI}>
        <Ionicons name="flash" size={20} color="white" />
        <Text style={styles.aiButtonText}>AI Prioritize</Text>
      </TouchableOpacity>
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.todoItem, item.completed && styles.completedTodo]}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => toggleTodo(item.id)}
            >
              {item.completed ? (
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              ) : (
                <View style={styles.checkboxEmpty} />
              )}
            </TouchableOpacity>
            {editingId === item.id ? (
              <TextInput
                style={styles.editInput}
                value={editingText || item.text}
                onChangeText={setEditingText}
                onBlur={() => updateTodo(item.id, editingText || item.text)}
                onSubmitEditing={() => updateTodo(item.id, editingText || item.text)}
                autoFocus
              />
            ) : (
              <TouchableOpacity style={styles.todoTextContainer} onPress={() => {
                setEditingId(item.id);
                setEditingText(item.text);
              }}>
                <Text style={[styles.todoText, item.completed && styles.completedText]}>
                  {item.text}
                </Text>
              </TouchableOpacity>
            )}
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => scheduleNotification(item)}>
                <Ionicons name="notifications" size={20} color="#F59E0B" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteTodo(item.id)} style={styles.deleteButton}>
                <Ionicons name="trash" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No todos yet. Add one!</Text>}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 12,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiButton: {
    flexDirection: 'row',
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  aiButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedTodo: {
    opacity: 0.7,
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxEmpty: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#cbd5e1',
  },
  todoTextContainer: {
    flex: 1,
  },
  todoText: {
    fontSize: 16,
    color: '#1e293b',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  editInput: {
    flex: 1,
    paddingVertical: 4,
    fontSize: 16,
    color: '#1e293b',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 16,
    marginTop: 50,
  },
});
