import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../firebase'; // เส้นทางที่ถูกต้องไปยังไฟล์ firebase.js
import { collection, getDocs, query, where } from 'firebase/firestore';
import { doc, deleteDoc } from 'firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ExpenseScreen = () => {
  const [expenses, setExpenses] = useState([]);
  const [expensesicon, setExpensesicon] = useState([]);
  const [loading, setLoading] = useState(true); // ย้ายการประกาศ useState มาที่นี่

  // ฟังก์ชันสำหรับลบรายการ
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

        const today = new Date(); // วันที่ปัจจุบัน
        // อันนี้คือทดลองดู
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // วันแรกของเดือน
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // วันสุดท้ายของเดือน

        // แปลง firstDayOfMonth และ lastDayOfMonth ให้เป็นสตริงในรูปแบบเดียวกันกับที่เก็บใน Firestore
        const firstDayOfMonthStr = `${(firstDayOfMonth.getMonth() + 1)}/${firstDayOfMonth.getDate()}/${firstDayOfMonth.getFullYear()}, ${firstDayOfMonth.toLocaleTimeString()}`;
        const lastDayOfMonthStr = `${(lastDayOfMonth.getMonth() + 1)}/${lastDayOfMonth.getDate()}/${lastDayOfMonth.getFullYear()}, ${lastDayOfMonth.toLocaleTimeString()}`;

        const expensesQuery = query(
          collection(db, 'Expenses'),
          where('time', '>=', firstDayOfMonthStr),
          where('time', '<=', lastDayOfMonthStr)
        );

        // ดึงข้อมูลจาก 'ExpenseCategories'
        const expensesicon = await getDocs(collection(db, 'ExpenseCategories'));
        const expenseiconlist = expensesicon.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Fetched icon expense data:', expenseiconlist);
        setExpensesicon(expenseiconlist);

        // ดึงข้อมูลจาก 'Expenses'
        const expenseSnapshot = await getDocs(expensesQuery);
        let expenseList = expenseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Fetched expense data:', expenseList);

        // เพิ่ม imageUrl ให้กับ expenseList ถ้า title ตรงกับ name
        const updatedExpenseList = expenseList.map(expense => {
          const matchedIcon = expenseiconlist.find(icon => icon.name === expense.title);
          return matchedIcon
            ? { ...expense, imageUrl: matchedIcon.imageUrl }
            : expense;  // ถ้าเจอ name ตรง ก็ใส่ imageUrl, ถ้าไม่เจอ ก็คืนค่า expense เดิม
        });

        console.log('Updated expense data with imageUrl:', updatedExpenseList);
        setExpenses(updatedExpenseList);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      } finally {
        setLoading(false); // หยุดการแสดง Loading เมื่อดึงข้อมูลเสร็จแล้ว
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
              // ลบรายการจาก Firebase
              await deleteDoc(doc(db, 'Expenses', item.id)); // ใช้ item.id เพื่อระบุเอกสารที่จะลบ

              // อัปเดตสถานะใน React
              setExpenses(prev => prev.filter(transaction => transaction.id !== item.id));
            } catch (error) {
              console.error('Error deleting document:', error);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color='red' style={{ transform: [{ scale: 4 }] }} />
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
          renderItem={({ item }) => (
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
                  <Text>{item.time ? new Date(item.time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A'} น.</Text>

                </View>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item)} style={styles.object3}>
                <Ionicons name="trash-outline" size={24} color="red" />
              </TouchableOpacity>
            </View>
          )}
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
    backgroundColor: "#f6f6f6",
  },
});

export default ExpenseScreen;