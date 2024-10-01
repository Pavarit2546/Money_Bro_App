import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { doc, deleteDoc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

const IncomeScreen = () => {
  const [income, setIncome] = useState([]);
  const [incomeIcon, setIncomeIcon] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date(); // วันที่ปัจจุบัน
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // วันแรกของเดือน
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // วันสุดท้ายของเดือน

    // ใช้ Timestamp ของ Firebase
    const firstDayOfMonthTimestamp = Timestamp.fromDate(firstDayOfMonth);
    const lastDayOfMonthTimestamp = Timestamp.fromDate(lastDayOfMonth);

    // ตั้งค่า query สำหรับดึงข้อมูลรายรับ
    const incomeQuery = query(
      collection(db, 'Incomes'),
      where('time', '>=', firstDayOfMonthTimestamp),
      where('time', '<=', lastDayOfMonthTimestamp)
    );

    // ฟังการเปลี่ยนแปลงแบบเรียลไทม์จาก Firebase
    const unsubscribe = onSnapshot(incomeQuery, async (incomeSnapshot) => {
      try {
        // ดึงข้อมูลไอคอนรายรับจาก 'IncomeCategories'
        const incomeIconData = await getDocs(collection(db, 'IncomeCategories'));
        const incomeIconList = incomeIconData.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setIncomeIcon(incomeIconList);

        // ดึงข้อมูลรายรับ
        const incomeList = incomeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // เพิ่ม imageUrl ให้กับ incomeList ถ้า title ตรงกับ name
        const updatedIncomeList = incomeList.map(income => {
          const matchedIcon = incomeIconList.find(icon => icon.name === income.title);
          return matchedIcon
            ? { ...income, imageUrl: matchedIcon.imageUrl }
            : income; // ถ้าเจอ name ตรง ก็ใส่ imageUrl, ถ้าไม่เจอ ก็คืนค่า income เดิม
        });

        setIncome(updatedIncomeList); // เก็บรายการรายรับที่อัปเดตแล้วใน state
      } catch (error) {
        console.error('Error fetching income:', error); // แสดง error ถ้ามีปัญหาในการดึงข้อมูล
      } finally {
        setLoading(false); // หยุดการแสดง Loading เมื่อดึงข้อมูลเสร็จแล้ว
      }
    });

    return () => unsubscribe(); // ยกเลิกการสมัครรับข้อมูลเมื่อ component ถูกทำลาย
  }, []);

  // ฟังก์ชันสำหรับลบรายการ
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
              await deleteDoc(doc(db, 'Incomes', item.id)); // ลบรายการใน Firebase โดยใช้ item.id
              setIncome(prev => prev.filter(transaction => transaction.id !== item.id)); // ลบรายการจาก state
            } catch (error) {
              console.error('Error deleting document:', error); // แสดง error ถ้าลบข้อมูลไม่สำเร็จ
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
        <ActivityIndicator size="large" color="green" style={{ transform: [{ scale: 4 }] }} />
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
                  <Text>{item.time ? new Date(item.time.toDate()).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A'} น.</Text>
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
    borderRadius: 8,
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

export default IncomeScreen;
