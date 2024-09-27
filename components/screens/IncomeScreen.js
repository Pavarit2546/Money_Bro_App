import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator,Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../firebase'; // เส้นทางที่ถูกต้องไปยังไฟล์ firebase.js
import { collection, getDocs ,query, where} from 'firebase/firestore';
import { doc, deleteDoc } from 'firebase/firestore';

// ฟังก์ชันสำหรับลบรายการ
const removeTransaction = async (item, type) => {
  try {
    const existingData = await AsyncStorage.getItem(type);
    const currentData = existingData ? JSON.parse(existingData) : [];
    const updatedData = currentData.filter(transaction => transaction.title !== item.title || transaction.amount !== item.amount);
    await AsyncStorage.setItem(type, JSON.stringify(updatedData));
  } catch (error) {
    console.error('Error removing data:', error);
  }
};

const IncomeScreen = () => {
  const [income, setIncome] = useState([]);
  const [incomeicon, seticon] = useState([]);
  const [loading, setLoading] = useState(true); // สถานะการโหลด

  useEffect(() => {
    const fetchIncome = async () => {
      try {

        const today = new Date(); // วันที่ปัจจุบัน
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // วันแรกของเดือน
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // วันสุดท้ายของเดือน

        // แปลง firstDayOfMonth และ lastDayOfMonth ให้เป็นสตริงในรูปแบบเดียวกันกับที่เก็บใน Firestore
        const firstDayOfMonthStr = `${(firstDayOfMonth.getMonth() + 1)}/${firstDayOfMonth.getDate()}/${firstDayOfMonth.getFullYear()}, ${firstDayOfMonth.toLocaleTimeString()}`;
        const lastDayOfMonthStr = `${(lastDayOfMonth.getMonth() + 1)}/${lastDayOfMonth.getDate()}/${lastDayOfMonth.getFullYear()}, ${lastDayOfMonth.toLocaleTimeString()}`;
        
        const IncomeQuery = query(
          collection(db, 'Incomes'),
          where('time', '>=', firstDayOfMonthStr),
          where('time', '<=', lastDayOfMonthStr)
          );

        // ดึงข้อมูลจาก 'IncomeCategories'
        const incomeicon = await getDocs(collection(db, 'IncomeCategories'));
        const incomeiconlist = incomeicon.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Fetched icon income data:', incomeiconlist); 
        setIncomeicon(incomeiconlist); // ไม่แน่ใจว่าใช้ setExpensesicon ถูกต้องหรือไม่ อาจจะใช้ setIncomeicon
  
        // ดึงข้อมูลจาก 'Incomes'
        const incomeSnapshot = await getDocs(IncomeQuery);
        const incomeList = incomeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Fetched income data:', incomeList); 
  
        // เพิ่ม imageUrl ให้กับ incomeList ถ้า title ตรงกับ name
        const updatedIncomeList = incomeList.map(income => {
          const matchedIcon = incomeiconlist.find(icon => icon.name === income.title);
          return matchedIcon 
            ? { ...income, imageUrl: matchedIcon.imageUrl } 
            : income;  
        });
  
        console.log('Updated income data with imageUrl:', updatedIncomeList);
        setIncome(updatedIncomeList);
        
      } catch (error) {
        console.error('Error fetching income:', error);
      } finally {
        setLoading(false); 
      }
    };
  
    fetchIncome();
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
              await deleteDoc(doc(db, 'Income', item.id));

              // ลบรายการจาก AsyncStorage
              await removeTransaction(item, 'income');

              // อัปเดตสถานะใน React
              setIncome(prev => prev.filter(transaction => transaction.id !== item.id));
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
        <ActivityIndicator size="large" color="green" style={{ transform: [{ scale: 4 }] }}/>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {income.length === 0 ? (
        <Text style={styles.text}>ไม่มีรายรับ</Text>
      ) : (
        <FlatList
          data={income}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={styles.img}> 
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
              </View>
              <View style={styles.object2}>
                <View style={styles.inobject}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.amount}>+ ฿{item.amount.toLocaleString()}</Text>
                </View>
                <View style={styles.inobject}>
                  <Text style={styles.note}>Note: {item.note || 'N/A'}</Text>
                  <Text>{item.time ? new Date(item.time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A'} น.</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item)} style={styles.object3}>
                <Text style={styles.delete}>ลบ</Text>
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
    flex: 1,
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
    color: 'green',
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
    backgroundColor:"#f6f6f6",
  },
});

export default IncomeScreen;