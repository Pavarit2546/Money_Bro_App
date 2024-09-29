import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../firebase'; // Ensure your Firebase configuration is correct
import { collection, getDocs, query, where } from 'firebase/firestore';
import { doc, deleteDoc } from 'firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import dayjs from 'dayjs'; // Day.js for consistent date handling
import customParseFormat from 'dayjs/plugin/customParseFormat'; 

dayjs.extend(customParseFormat); // Enable custom parse formats

const ExpenseScreen = () => {
  const [expenses, setExpenses] = useState([]);
  const [expensesIcon, setExpensesIcon] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to remove a transaction
  const removeTransaction = async (item, type) => {
    try {
      const existingData = await AsyncStorage.getItem(type);
      const currentData = existingData ? JSON.parse(existingData) : [];
      const updatedData = currentData.filter(transaction => transaction.title !== item.title && transaction.amount !== item.amount);
      await AsyncStorage.setItem(type, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error removing data:', error);
    }
  };

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const today = new Date(); // Get the current date
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // First day of the current month
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of the current month

        // Convert dates to strings
        const firstDayOfMonthStr = `${(firstDayOfMonth.getMonth() + 1)}/${firstDayOfMonth.getDate()}/${firstDayOfMonth.getFullYear()}, ${firstDayOfMonth.toLocaleTimeString()}`;
        const lastDayOfMonthStr = `${(lastDayOfMonth.getMonth() + 1)}/${lastDayOfMonth.getDate()}/${lastDayOfMonth.getFullYear()}, ${lastDayOfMonth.toLocaleTimeString()}`;

        const expensesQuery = query(
          collection(db, 'Expenses'),
          where('time', '>=', firstDayOfMonthStr),
          where('time', '<=', lastDayOfMonthStr)
        );

        // Fetch expense icons
        const expensesIconSnapshot = await getDocs(collection(db, 'ExpenseCategories'));
        const expensesIconList = expensesIconSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setExpensesIcon(expensesIconList);

        // Fetch expenses
        const expenseSnapshot = await getDocs(expensesQuery);
        const expenseList = expenseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Update expense list with matching icons
        const updatedExpenseList = expenseList.map(expense => {
          const matchedIcon = expensesIconList.find(icon => icon.name === expense.title);
          return matchedIcon ? { ...expense, imageUrl: matchedIcon.imageUrl } : expense;
        });

        setExpenses(updatedExpenseList);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const handleDelete = async (item) => {
    Alert.alert(
      'ยืนยันการลบ',
      `คุณต้องการลบรายการ "${item.title}" จำนวน ฿${item.amount.toLocaleString()} ใช่หรือไม่?`,
      [
        {
          text: 'ยกเลิก',
          style: 'cancel',
        },
        {
          text: 'ลบ',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'Expenses', item.id)); // Delete document from Firestore
              setExpenses(prev => prev.filter(transaction => transaction.id !== item.id)); // Update state
            } catch (error) {
              console.error('Error deleting document:', error);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Utility to parse and format time
  const formatTimeThai = (time) => {
    // Attempt to parse the time using common formats
    const parsedDate = dayjs(time, ['M/D/YYYY, h:mm:ss A', 'DD/MM/YYYY, HH:mm:ss'], true);

    if (parsedDate.isValid()) {
      // Format the time in Thai locale with the correct format
      return parsedDate.format('HH:mm น.'); // Only show the time in 24-hour format with 'น.' for Thai
    } else {
      return 'Invalid Date'; // Fallback for invalid dates
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="red" style={{ transform: [{ scale: 4 }] }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {expenses.length === 0 ? (
        <Text style={styles.text}>ไม่มีรายจ่าย</Text>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const formattedTime = formatTimeThai(item.time); // Format the time to Thai

            return (
              <View style={styles.item}>
                <View style={styles.img}>
                  <Image source={{ uri: item.imageUrl }} style={styles.image} />
                </View>
                <View style={styles.object2}>
                  <View style={styles.inobject}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.amount}>- {item.amount.toLocaleString()} บ.</Text>
                  </View>
                  <View style={styles.inobject}>
                    <Text style={styles.note}>Note: {item.note || 'N/A'}</Text>
                    <Text>{formattedTime}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.object3}>
                  <Ionicons name="trash-outline" size={24} color="red" />
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 6,
    paddingTop: 5,
    paddingHorizontal: 0,
    backgroundColor: '#f8f8f8',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
  },
  delete: {
    color: 'red',
    fontWeight: 'bold',
  },
  img: {
    flex: 1,
  },
  object2: {
    flex: 4,
  },
  inobject: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    width: '100%',
  },
  object3: {
    flex: 1,
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    fontSize: 20,
    color: 'red',
  },
  note: {
    fontSize: 14,
    color: '#666',
  },
  time: {
    fontSize: 12,
    color: '#888',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 45,
    height: 45,
    borderRadius: 8,
    backgroundColor: '#f6f6f6',
  },
});

export default ExpenseScreen;
