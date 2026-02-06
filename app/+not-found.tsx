import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function NotFound() {
  return (
    <View className="flex-1 items-center justify-center p-20">
      <Text className="text-6xl font-bold text-red-500 mb-4">404</Text>
      <Text className="text-2xl mb-8 text-gray-500">This screen doesn't exist.</Text>
      <Link href="/" className="bg-blue-500 px-6 py-3 rounded-lg">
        <Text className="text-white text-xl font-bold">Go Home</Text>
      </Link>
    </View>
  );
}