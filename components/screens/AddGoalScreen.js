import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, TextInput, Alert, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../firebase'; 
import { collection, getDocs, updateDoc, addDoc, doc } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons'; 

const AddGoalScreen = ({ navigation }) => {
  const [goalAmount, setGoalAmount] = useState(''); 
  const [expenseCategories, setExpenseCategories] = useState([]); 
  const [selectedCategory, setSelectedCategory] = useState(null); 
  const [endDate, setEndDate] = useState(new Date()); 
  const [showDatePicker, setShowDatePicker] = useState(false); 

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1); 

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const expenseSnapshot = await getDocs(collection(db, 'ExpenseCategories'));
        const expenses = expenseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setExpenseCategories(expenses); 
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories(); 
  }, []);

  const handleSaveGoal = async () => {
    if (goalAmount && selectedCategory) {
      try {
        const goalsSnapshot = await getDocs(collection(db, 'Goals'));
        const goals = goalsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const existingGoal = goals.find(goal => goal.title === selectedCategory.name);

        if (existingGoal) {
          // อัพเดตข้อมูลเป้าหมายที่มีอยู่
          await updateDoc(doc(db, 'Goals', existingGoal.id), {
            amount: parseFloat(goalAmount),
            remainingAmount: parseFloat(goalAmount),
            date: endDate.toLocaleDateString('th-TH'), 
          });
        } else {
          // สร้างเป้าหมายใหม่
          const newGoal = {
            title: selectedCategory.name,
            amount: parseFloat(goalAmount),
            remainingAmount: parseFloat(goalAmount),
            date: endDate.toLocaleDateString('th-TH'), 
            icon: selectedCategory.imageUrl,
            createdAt: new Date(), 
          };

          await addDoc(collection(db, 'Goals'), newGoal);
        }

        navigation.navigate('GoalScreen', { refresh: true });
        setGoalAmount('');
        setSelectedCategory(null);
        setEndDate(new Date()); 
      } catch (error) {
        console.error('Error saving goal to Firestore:', error);
        Alert.alert('Error', 'An error occurred while saving the goal.');
      }
    } else {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณาเลือกหมวดหมู่และกรอกจำนวนเงิน');
    }
  };

  const handleAddAmount = async () => {
    if (goalAmount && selectedCategory) {
      try {
        const goalsSnapshot = await getDocs(collection(db, 'Goals'));
        const goals = goalsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const existingGoal = goals.find(goal => goal.title === selectedCategory.name);

        if (existingGoal) {
          // เพิ่มจำนวนเงินในเป้าหมายที่มีอยู่
          const updatedAmount = parseFloat(existingGoal.amount) + parseFloat(goalAmount);
          const updatedRemainingAmount = parseFloat(existingGoal.remainingAmount) + parseFloat(goalAmount);

          await updateDoc(doc(db, 'Goals', existingGoal.id), {
            amount: updatedAmount,
            remainingAmount: updatedRemainingAmount,
          });

          navigation.navigate('GoalScreen', { refresh: true });
        } else {
          await handleSaveGoal(); 
        }

        setGoalAmount('');
        setSelectedCategory(null);
      } catch (error) {
        console.error('Error updating goal:', error);
        Alert.alert('Error', 'An error occurred while updating the goal.');
      }
    } else {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณาเลือกหมวดหมู่และกรอกจำนวนเงิน');
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category); 
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false); 
    if (selectedDate) {
      setEndDate(selectedDate); 
    }
  };

  return (
<KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 75}>
  
  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.container}>
      <Text style={styles.subTitle}>หมวดหมู่</Text>
      <ScrollView contentContainerStyle={styles.categoryContainer}>
        {expenseCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory?.id === category.id && styles.selectedCategory
            ]}
            onPress={() => handleCategorySelect(category)}>
            {category.imageUrl && (
              <Image source={{ uri: category.imageUrl }} style={styles.categoryImage} />
            )}
            <Text style={styles.categoryText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.amountContainer}>
        <Image source={require('../../assets/money-bag.png')} style={styles.moneyIcon} />
        <View style={styles.amountInputContainer}>
          <Text style={styles.label}>จำนวนเงินที่อยากใช้:</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="0"
              keyboardType="numeric"
              value={goalAmount}
              onChangeText={setGoalAmount}
            />
            <Text style={styles.unitText}>บาท</Text>
          </View>
        </View>
        <TouchableOpacity onPress={showDatepicker} style={styles.calendarIconContainer}>
          <Icon name="calendar" size={30} color="#347928" />
        </TouchableOpacity>
      </View>

      <View style={styles.datePickerContainer}>
        <Text>วันที่สิ้นสุด: {endDate.toLocaleDateString('th-TH')}</Text>
        {showDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={tomorrowDate} 
          />
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddAmount}>
          <Text style={styles.buttonText}>เพิ่ม</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveGoal}>
          <Text style={styles.buttonText}>บันทึก</Text>
        </TouchableOpacity>
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
    backgroundColor: '#f9f9f9',
  },
  subTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    marginBottom: 10,
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
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  categoryImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#B7B7B7',
    borderRadius: 10,
  },
  moneyIcon: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  amountInputContainer: {
    flex: 1,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
    color: '#234D25',
    textAlign: 'right',
    marginRight: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    color: '#234D25',
  },
  input: {
    fontSize: 20,
    padding: 10,
    textAlign: 'right',
    marginRight: 5,
    color: '#234D25',
  },
  unitText: {
    marginRight: 20,
    fontSize: 20,
    color: '#234D25',

  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: '#B7B7B7',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    width: 100,
  },
  addButton: {
    backgroundColor: '#B7B7B7',
    padding: 10,
    borderRadius: 10,
    marginRight: 20,
    alignItems: 'center',
    width: 100,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#347928',
  },
});

export default AddGoalScreen;
