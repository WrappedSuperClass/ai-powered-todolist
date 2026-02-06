import { Tabs } from 'expo-router/tabs';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{
        title: 'Todos',
        tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>📝</Text>,
      }} />
      <Tabs.Screen name="settings" options={{
        title: 'Settings',
        tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>⚙️</Text>,
      }} />
    </Tabs>
  );
}