import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Keyboard, TouchableWithoutFeedback, 
  TouchableOpacity, ScrollView, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { app, db } from '../../firebase'; // เส้นทางที่ถูกต้องไปยังไฟล์ firebase.js
import { collection, getDocs, addDoc,updateDoc,doc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { Timestamp } from 'firebase/firestore';

// ฟังก์ชันสำหรับบันทึกรายการ
const saveTransaction = async (transaction, type, navigation) => {
  try {
    const { title, amount, note, date } = transaction;

    // แปลง amount เป็นตัวเลขและเพิ่ม note, time
    const transactionData = { 
      title, 
      amount: parseFloat(amount), 
      note: note || 'N/A',
      date: date ? Timestamp.fromDate(new Date(date)) : Timestamp.now() 
    };
    console.log('Saving transaction data:', transactionData);
    
    // บันทึกลง Firestore
    const docRef = await addDoc(collection(db, type === 'expense' ? 'Expenses' : 'Incomes'), transactionData);
    console.log('Transaction saved with ID:', docRef.id); // แสดง ID ของรายการที่บันทึก

    // อัปเดตยอดเงินคงเหลือของเป้าหมายหากเป็นรายการรายจ่าย
    if (type === 'expense') {
      await updateGoalRemainingAmount(transactionData);
    }

    navigation.navigate('หน้าแรก', {
      transaction: { id: docRef.id, ...transactionData }, // ส่ง ID กลับไปด้วย
      type
    });
  } catch (error) {
    console.error('Error saving transaction:', error);
  }
};

// ฟังก์ชันอัปเดตยอดเงินคงเหลือใน Firestore
const updateGoalRemainingAmount = async (transaction) => {
  const { title, amount } = transaction;

  try {
    // ดึงข้อมูลทั้งหมดจาก Firestore คอลเลกชัน 'Goals'
    const goalsSnapshot = await getDocs(collection(db, 'Goals'));
    const goals = goalsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // ตรวจสอบว่าเป้าหมายในหมวดหมู่นี้มีอยู่หรือไม่
    const existingGoal = goals.find(goal => goal.title === title);

    if (existingGoal) {
      // อัปเดตยอดเงินคงเหลือ
      const updatedRemainingAmount = parseFloat(existingGoal.remainingAmount) - parseFloat(amount);

      // อัปเดตเป้าหมายใน Firestore
      await updateDoc(doc(db, 'Goals', existingGoal.id), {
        remainingAmount: updatedRemainingAmount >= 0 ? updatedRemainingAmount : 0, // ป้องกันไม่ให้ยอดคงเหลือติดลบ
      });
    }
  } catch (error) {
    console.error('Error updating goal remaining amount:', error);
  }
};

const AddTransactionScreen = ({ navigation }) => {
  const [isShowingExpenses, setIsShowingExpenses] = useState(true);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const inputRef = useRef(null);
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      // เมื่อเข้ามาที่หน้า "เพิ่ม" ให้คีย์บอร์ดโผล่ขึ้นมาโดยโฟกัสที่ TextInput
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, [])
  );

  useEffect(() => { // useEffect นี้เอาไว้รีเซ็ตสถานะเมื่อเข้าหน้า
    const unsubscribe = navigation.addListener('focus', () => {
      resetForm(); // เรียกใช้ฟังก์ชันรีเซ็ต
    });

    return unsubscribe;
  }, [navigation]);

  const resetForm = () => {
    setSelectedCategory(null); 
    setTitle('');
    setAmount('');
    setNote('');
    setDate('');
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const expenseSnapshot = await getDocs(collection(db, 'ExpenseCategories'));
        const expenses = expenseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const incomeSnapshot = await getDocs(collection(db, 'IncomeCategories'));
        const incomes = incomeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setExpenseCategories(expenses);
        setIncomeCategories(incomes);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const categories = isShowingExpenses ? expenseCategories : incomeCategories;

  const handleSave = async () => {
    if (title && amount && selectedCategory) { 
      if (isNaN(amount) || parseFloat(amount) <= 0) {
        Alert.alert('จำนวนเงินไม่ถูกต้อง', 'กรุณากรอกจำนวนเงินที่ถูกต้อง');
        return;
      }
      const transaction = { 
        title, 
        amount: parseFloat(amount), 
        category: selectedCategory.name, 
        note: note || 'N/A', 
        date: date || new Date().toISOString()
        
      }; 
      const type = isShowingExpenses ? 'expense' : 'income';

      await saveTransaction(transaction, type, navigation);
      resetForm(); // รีเซ็ตฟอร์มหลังจากบันทึก
    } else {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกข้อมูลให้ครบถ้วน');
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category); 
    setTitle(category.name); 
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 100}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.tabContainer}>  
              <TouchableOpacity
                style={[styles.tab, isShowingExpenses && styles.activeTabExpense]}
                onPress={() => setIsShowingExpenses(true)}>
                <Text style={[styles.tabText, isShowingExpenses && styles.activeText]}>รายจ่าย</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, !isShowingExpenses && styles.activeTabIncome]}
                onPress={() => setIsShowingExpenses(false)}>
                <Text style={[styles.tabText, !isShowingExpenses && styles.activeText]}>รายรับ</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.categoryContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryButton, selectedCategory?.id === category.id && styles.selectedCategory, { flexBasis: '23%', margin: '1%' }]}
                onPress={() => handleCategorySelect(category)}
              >
                {category.imageUrl && (
                  <Image source={{ uri: category.imageUrl }} style={styles.categoryImage} />
                )}
                <Text style={styles.categoryText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.numContainer}>  
            <Text style={styles.label}>จำนวนเงิน:</Text>
            <TextInput
              style={styles.input}
              ref={inputRef} 
              placeholder="0" 
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              onFocus={() => inputRef.current.focus()}
            />
            <TextInput 
              style={styles.input} 
              placeholder="เขียนโน้ต" 
              value={note} 
              onChangeText={setNote} 
            />
            <Button title="บันทึก" onPress={handleSave} />
          </View> 
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  numContainer: {
    padding: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    width: 80,
    height: 80,
  },
  selectedCategory: {
    backgroundColor: '#B7B7B7',
    borderColor: 'transparent',
    borderWidth: 1,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 2,
  },
  categoryText: {
    fontSize: 10,
    textAlign: 'center',
    paddingTop: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 10,
    overflow: 'hidden',
    width: 250,
    justifyContent: 'center',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
  },
  activeTabExpense: {
    backgroundColor: 'black',
    borderBottomLeftRadius: 7,
    borderTopLeftRadius: 7,
  },
  activeTabIncome: {
    backgroundColor: 'black',
    borderBottomRightRadius: 7,
    borderTopRightRadius: 7,
  },
  activeText: {
    color: 'white',
  },
  tabText: {
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  categoryImage: {
    width: 40,
    height: 40,
    marginBottom: 5,
  },
});

export default AddTransactionScreen;