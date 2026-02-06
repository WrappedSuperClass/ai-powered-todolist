import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from 'react';

const DB_NAME = 'todos.db';

const db = SQLite.openDatabase(DB_NAME);

export interface Todo {
  id: number;
  title: string;
  completed: 0 | 1;
  created_at: string;
}

export const initDB = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, completed INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)',
        [],
        () => resolve(),
        (_, error) => {
          console.error('DB init error:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getTodos = (): Promise<Todo[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM todos ORDER BY created_at DESC',
        [],
        (_, result) => {
          const todos: Todo[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            todos.push(result.rows.item(i));
          }
          resolve(todos);
        },
        (_, error) => {
          console.error('Get todos error:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

export const addTodo = (title: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO todos (title) VALUES (?)',
        [title],
        (_, result) => resolve(result.insertId),
        (_, error) => {
          console.error('Add todo error:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

export const toggleTodo = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE todos SET completed = 1 - completed WHERE id = ?',
        [id],
        () => resolve(),
        (_, error) => {
          console.error('Toggle todo error:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

export const deleteTodo = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM todos WHERE id = ?',
        [id],
        () => resolve(),
        (_, error) => {
          console.error('Delete todo error:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

// Hook for todos
export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initDB().then(() => {
      getTodos().then(setTodos).finally(() => setLoading(false));
    });
  }, []);

  const refresh = () => {
    getTodos().then(setTodos);
  };

  const add = async (title: string) => {
    await addTodo(title);
    refresh();
  };

  const toggle = async (id: number) => {
    await toggleTodo(id);
    refresh();
  };

  const del = async (id: number) => {
    await deleteTodo(id);
    refresh();
  };

  return { todos, loading, add, toggle, del, refresh };
};
