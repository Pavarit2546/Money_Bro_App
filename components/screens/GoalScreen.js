import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import Ionicons from 'react-native-vector-icons/Ionicons';

const GoalScreen = ({ navigation }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchGoals = async () => {
      setLoading(true); // Start loading when fetching data
      try {
        const querySnapshot = await getDocs(collection(db, 'Goals'));
        const goalsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date.toDate ? data.date.toDate().toLocaleDateString('th-TH') : data.date,
          };
        });
        setGoals(goalsData);
      } catch (error) {
        console.error('Error fetching goals:', error);
      } finally {
        setLoading(false); // Stop loading after fetching data
      }
    };

    if (isFocused) {
      fetchGoals();
    }
  }, [isFocused]);

  const handleDeleteGoal = async (goal) => {
    Alert.alert(
      "ยืนยันการลบ",
      `คุณต้องการลบเป้าหมาย "${goal.title}" ใช่หรือไม่?`,
      [
        {
          text: "ยกเลิก",
          style: "cancel",
        },
        {
          text: "ลบ",
          onPress: async () => {
            const updatedGoals = goals.filter(g => g.id !== goal.id);
            setGoals(updatedGoals);
            await deleteDoc(doc(db, 'Goals', goal.id));
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderGoalItem = ({ item }) => (
    <View style={styles.goalItem}>
      <Image 
        source={{ uri: item.icon }} 
        style={styles.goalIcon} 
      />
      <View style={styles.goalDetails}>
        <Text style={styles.goalTitle}>{item.title}</Text>
        <Text style={styles.goalAmount}>ยอดเงินเป้าหมาย: {item.amount} บาท</Text>
        <Text style={styles.goalAmount}>ยอดเงินคงเหลือ: {item.remainingAmount} บาท</Text>
        <Text style={styles.goalDate}>วันที่สิ้นสุด: {item.date}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDeleteGoal(item)}>
  <Ionicons name="trash-outline" size={24} color="red" />
</TouchableOpacity>

    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>รายการแสดงยอดคงเหลือ</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => navigation.navigate('AddGoalScreen')} // Navigate to AddGoalScreen
        >
          <Text style={styles.addButtonText}>เพิ่ม</Text>
        </TouchableOpacity>
      </View>

      {/* Show loading spinner below the header */}
      {loading && (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loadingSpinner} />
      )}

      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        renderItem={renderGoalItem}
        contentContainerStyle={styles.goalList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    marginTop: 20,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#B7B7B7',
    paddingStart:10 ,
    paddingEnd:10,
    paddingTop:3,
    paddingBottom:3,
    borderRadius: 10,
    margin: 8,
  },
  addButtonText: {
    color: '#347928',
    fontWeight: 'bold',
    fontSize: 15,
  },
  goalList: {
    paddingHorizontal: 20,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    borderRadius: 10,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  goalIcon: {
    width: 50,
    height: 50,
    marginRight: 20,
    resizeMode: 'contain',
  },
  goalDetails: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  goalAmount: {
    color: 'black',
    marginTop: 5,
  },
  goalDate: {
    color: '#A7A7A7',
    marginTop: 5,
  },
  deleteText: {
    color: 'red',
    fontWeight: 'bold',
  },
  loadingSpinner: {
    marginVertical: 20, // Add spacing between header and spinner
  },
});

export default GoalScreen;
