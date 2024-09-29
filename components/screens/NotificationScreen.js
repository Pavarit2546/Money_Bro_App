import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust the path to your firebase configuration
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
import moment from 'moment'; // Optional for date formatting

const NotificationScreen = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state

  useFocusEffect(
    useCallback(() => {
      const fetchGoals = async () => {
        setLoading(true); // Show loading spinner
        try {
          const querySnapshot = await getDocs(collection(db, 'Goals'));
          const goalsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date || moment(doc.data().createdAt.toDate()).format('DD/MM/YYYY'),
          }));

          // Filter only goals where remainingAmount is less than or equal to 20% of the amount
          const filteredGoals = goalsData.filter(item => (item.remainingAmount / item.amount) * 100 <= 20);

          setGoals(filteredGoals);
        } catch (error) {
          console.error('Error fetching goals:', error);
        } finally {
          setLoading(false); // Hide loading spinner
        }
      };

      fetchGoals();

      return () => {
        // Clean up if needed when leaving the screen
        setGoals([]); // Optional: Clear the data when the screen is unfocused
      };
    }, []) // Empty dependency array ensures it runs only when screen is focused/unfocused
  );

  const renderGoalItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <Image source={{ uri: item.icon }} style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>การแจ้งเตือนการใช้จ่าย</Text>
          <Text style={styles.alertText}>
            จำนวนยอดเงินในหมวดหมู่ {item.title} ใกล้ถึงกำหนดแล้ว
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loadingSpinner} />
      ) : goals.length > 0 ? (
        <FlatList
          data={goals}
          keyExtractor={(item) => item.id}
          renderItem={renderGoalItem}
          contentContainerStyle={styles.goalList}
        />
      ) : (
        <Text style={styles.noGoalsText}>ไม่มีข้อมูลการแจ้งเตือน</Text>
      )}
    </View>
  );
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
  icon: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 16,
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
    marginBottom: 4,
  },
  alertText: {
    fontSize: 14,
    color: '#49454F', // Warning color
    fontWeight: 'bold',
    marginTop: 4,
  },
  deleteIcon: {
    marginTop: 8,
  },
  noGoalsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
  goalList: {
    paddingHorizontal: 20,
  },
  loadingSpinner: {
    marginTop: 20,
  },
});

export default NotificationScreen;
