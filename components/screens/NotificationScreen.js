import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity , ScrollView} from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

const NotificationScreen = () => {
  const handleDeleteGoal = (item) => {
    // Add your delete logic here
  };

  return (
    <ScrollView style={styles.container}>
      {Array.from({ length: 7 }).map((_, index) => (
        <View style={styles.card} key={index}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>การแจ้งเตือนการใช้งาน</Text>
            <Text style={styles.description}>จำนวนยอดเงินในหมวดหมู่ {getCategory(index)} </Text>
            <Text style={styles.description}>ใกล้ถึงกำหนดแล้ว</Text>
            <TouchableOpacity onPress={() => handleDeleteGoal(index)}>
              <AntDesign name="delete" size={18} color="red" style={styles.deleteNoti} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

// Helper function to get category name based on index
const getCategory = (index) => {
  const categories = ["ยา", "การเดินทาง", "แฟชั่น", "การศึกษา", "ยา", "ที่อยู่อาศัย", "สังคม"];
  return categories[index % categories.length];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  deleteNoti: {
    color: 'red',
    fontSize: 16,
    alignSelf: 'flex-end',
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -40 }],
  },
});

export default NotificationScreen;
