import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from 'react';

const DB_NAME = 'todos.db';

const db = SQLite.openDatabase(DB_NAME);

export interface Todo {
  id: number;
  title: string;
  completed: 0 | 1;
  created_at: string;
  category?: string;
  nag?: string;
}

export const initDB = (): Promise&lt;void&gt; =&gt; {
  return new Promise((resolve, reject) =&gt; {
    db.transaction(tx =&gt; {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, completed INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)',
        [],
        () =&gt; {
          // Migrate/add columns safely
          tx.executeSql(
            "ALTER TABLE todos ADD COLUMN category TEXT DEFAULT 'chill'",
            [],
            () =&gt; {},
            (_, error) =&gt; {
              console.log('Category column migration ignored:', error);
              return true;
            }
          );
          tx.executeSql(
            "ALTER TABLE todos ADD COLUMN nag TEXT",
            [],
            () =&gt; {},
            (_, error) =&gt; {
              console.log('Nag column migration ignored:', error);
              return true;
            }
          );
          resolve();
        },
        (_, error) =&gt; {
          console.error('DB init error:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getTodos = (): Promise&lt;Todo[]&gt; =&gt; {
  return new Promise((resolve, reject) =&gt; {
    db.transaction(tx =&gt; {
      tx.executeSql(
        'SELECT * FROM todos ORDER BY created_at DESC',
        [],
        (_, result) =&gt; {
          const todos: Todo[] = [];
          for (let i = 0; i &lt; result.rows.length; i++) {
            todos.push(result.rows.item(i));
          }
          resolve(todos);
        },
        (_, error) =&gt; {
          console.error('Get todos error:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

export const addTodo = (title: string, category: string = 'chill', nag: string = ''): Promise&lt;number&gt; =&gt; {
  return new Promise((resolve, reject) =&gt; {
    db.transaction(tx =&gt; {
      tx.executeSql(
        'INSERT INTO todos (title, category, nag) VALUES (?, ?, ?)',
        [title, category, nag],
        (_, result) =&gt; resolve(result.insertId as number),
        (_, error) =&gt; {
          console.error('Add todo error:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

export const toggleTodo = (id: number): Promise&lt;void&gt; =&gt; {
  return new Promise((resolve, reject) =&gt; {
    db.transaction(tx =&gt; {
      tx.executeSql(
        'UPDATE todos SET completed = 1 - completed WHERE id = ?',
        [id],
        () =&gt; resolve(),
        (_, error) =&gt; {
          console.error('Toggle todo error:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

export const deleteTodo = (id: number): Promise&lt;void&gt; =&gt; {
  return new Promise((resolve, reject) =&gt; {
    db.transaction(tx =&gt; {
      tx.executeSql(
        'DELETE FROM todos WHERE id = ?',
        [id],
        () =&gt; resolve(),
        (_, error) =&gt; {
          console.error('Delete todo error:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

export const useTodos = (filterCategory?: string) =&gt; {
  const [todos, setTodos] = useState&lt;Todo[]&gt;([]);
  const [loading, setLoading] = useState(true);

  useEffect(() =&gt; {
    initDB().then(() =&gt; {
      getTodos().then(t =&gt; {
        if (filterCategory) {
          setTodos(t.filter(item =&gt; item.category === filterCategory));
        } else {
          setTodos(t);
        }
      }).finally(() =&gt; setLoading(false));
    });
  }, [filterCategory]);

  const refresh = () =&gt; {
    getTodos().then(t =&gt; {
      if (filterCategory) {
        setTodos(t.filter(item =&gt; item.category === filterCategory));
      } else {
        setTodos(t);
      }
    });
  };

  const add = async (title: string, category?: string, nag?: string) =&gt; {
    await addTodo(title, category || 'chill', nag || '');
    refresh();
  };

  const toggle = async (id: number) =&gt; {
    await toggleTodo(id);
    refresh();
  };

  const del = async (id: number) =&gt; {
    await deleteTodo(id);
    refresh();
  };

  return { todos, loading, add, toggle, del, refresh };
};