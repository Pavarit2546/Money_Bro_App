  import React, { useState, useEffect } from 'react';
  import { View, Text, Dimensions, StyleSheet, FlatList, Image } from 'react-native';
  import { PieChart } from 'react-native-chart-kit';
  import { Picker } from '@react-native-picker/picker';
  import firebase from 'firebase/app';
  import 'firebase/firestore';
  import { db } from '../../firebase';
  import { collection, getDocs, query, where } from 'firebase/firestore';

  const ExpenseSummaryScreen = () => {
    const [expenseData, setExpenseData] = useState([]);
    const [totalExpense, setTotalExpense] = useState(0);
    const [flatListData, setFlatListData] = useState([]);
    const [expensesicon, setExpensesicon] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

    const colors = [
      '#FF6347', '#4682B4', '#FFD700', '#40E0D0', '#9370DB', 
      '#FF7F50', '#FF4500', '#2E8B57', '#8A2BE2', '#FF69B4', 
      '#CD5C5C', '#20B2AA'
    ];

    const months = [
      { label: 'มกราคม', value: 1 },
      { label: 'กุมภาพันธ์', value: 2 },
      { label: 'มีนาคม', value: 3 },
      { label: 'เมษายน', value: 4 },
      { label: 'พฤษภาคม', value: 5 },
      { label: 'มิถุนายน', value: 6 },
      { label: 'กรกฎาคม', value: 7 },
      { label: 'สิงหาคม', value: 8 },
      { label: 'กันยายน', value: 9 },
      { label: 'ตุลาคม', value: 10 },
      { label: 'พฤศจิกายน', value: 11 },
      { label: 'ธันวาคม', value: 12 },
    ];

    useEffect(() => {
      const fetchExpenses = async () => {
        try {
          const today = new Date();
          const firstDayOfMonth = new Date(today.getFullYear(), selectedMonth - 1, 1);
          const lastDayOfMonth = new Date(today.getFullYear(), selectedMonth, 0);
          
          const firstDayOfMonthStr = `${(firstDayOfMonth.getMonth() + 1)}/${firstDayOfMonth.getDate()}/${firstDayOfMonth.getFullYear()}`;
          const lastDayOfMonthStr = `${(lastDayOfMonth.getMonth() + 1)}/${lastDayOfMonth.getDate()}/${lastDayOfMonth.getFullYear()}`;

          const expensesQuery = query(
            collection(db, 'Expenses'),
            where('time', '>=', firstDayOfMonthStr),
            where('time', '<=', lastDayOfMonthStr)
          );

          const expensesIconSnapshot = await getDocs(collection(db, 'ExpenseCategories'));
          const expenseIconList = expensesIconSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setExpensesicon(expenseIconList);

          const snapshot = await getDocs(expensesQuery);
          const parsedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setFlatListData(parsedData);

          const categoryTotals = {};
          parsedData.forEach(item => {
            if (!categoryTotals[item.title]) {
              categoryTotals[item.title] = 0;
            }
            categoryTotals[item.title] += item.amount;
          });

          const total = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0);
          setTotalExpense(total);

          const dataWithPercentages = Object.keys(categoryTotals).map((category, index) => ({
            title: category,
            amount: categoryTotals[category],
            percentage: ((categoryTotals[category] / total) * 100).toFixed(2),
            color: colors[index % colors.length],
          }));

          // ปรับการแสดงผลไอคอนในแต่ละรายการ
          const updatedExpenseList = parsedData.map(expense => {
            const matchedIcon = expenseIconList.find(icon => icon.name === expense.title);
            return {
              ...expense,
              imageUrl: matchedIcon ? matchedIcon.imageUrl : null, // ตรวจสอบว่ามีไอคอนไหม
            };
          });

          setExpenseData(dataWithPercentages);
          setFlatListData(updatedExpenseList); // ปรับให้ใช้ updatedExpenseList
        } catch (error) {
          console.error('Error fetching expenses:', error);
        }
      };

      fetchExpenses();
    }, [selectedMonth]);

    return (
      <View style={styles.container}>
        <Picker
          selectedValue={selectedMonth}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedMonth(itemValue)}
          dropdownIconColor="#000" // เปลี่ยนสีของลูกศร
        >
          {months.map(month => (
          <Picker.Item key={month.value} label={month.label} value={month.value} />
          ))}
        </Picker>

        <View style={styles.chartContainer}>
          <PieChart
            data={expenseData.map(item => ({
              name: item.title,
              amount: item.amount,
              color: item.color,
              legendFontColor: '#7F7F7F',
              legendFontSize: 15,
            }))}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#1cc910',
              backgroundGradientFrom: '#eff3ff',
              backgroundGradientTo: '#efefef',
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            relative
          />
          <View style={styles.innerCircle}>
            <Text style={styles.totalText}>{totalExpense}</Text>
          </View>
        </View>

        <FlatList
          data={flatListData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={styles.img}>
                {item.imageUrl ? ( // ตรวจสอบว่า imageUrl มีค่าไหม
                  <Image source={{ uri: item.imageUrl }} style={styles.image} />
                ) : (
                  <View style={styles.placeholderIcon} /> // แสดง Placeholder ถ้าไม่มีไอคอน
                )}
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
            </View>
          )}
          style={styles.list}
        />
      </View>
    );
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  picker: {
    width: '80%',
    marginBottom: 20,
  },
  chartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  innerCircle: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'white',
    left: 42,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  list: {
    width: '100%',
    marginTop: 20,
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
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
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
  image: {
    width: 45,
    height: 45,
    borderRadius: 8,
    backgroundColor: "#f6f6f6",
  },
  placeholderIcon: {
    width: 45,
    height: 45,
    borderRadius: 8,
    backgroundColor: "#f6f6f6",
  },
  title: {
    fontSize: 18,
  },
  note: {
    fontSize: 14,
    color: 'gray',
  },
  picker: {
    width: '80%', // ความกว้างของ Picker
    height: 50, // ความสูงของ Picker
    borderColor: '#ccc', // สีของขอบ
    borderWidth: 1, // ความหนาของขอบ
    borderRadius: 8, // รัศมีของมุม
    backgroundColor: '#f0f0f0', // สีพื้นหลัง
    marginBottom: 20, // ระยะห่างด้านล่าง
    paddingHorizontal: 10, // ระยะห่างด้านข้าง
    textAlign: 'center',
    fontSize: 18,
  },
});

export default ExpenseSummaryScreen;
