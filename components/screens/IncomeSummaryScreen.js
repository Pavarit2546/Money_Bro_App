import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';
import 'firebase/firestore';
import { db } from '../../firebase';
import { collection, getDocs,onSnapshot, query, where } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
const IncomeSummaryScreen = () => {
  const [incomeData, setIncomeData] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [flatListData, setFlatListData] = useState([]); // State สำหรับ FlatList
  const [incomeIcons, setIncomeIcons] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isTrantoMonth, setIsTrantoMonth] = useState(true);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setFlatListData([]);
    setTotalIncome(0);
    setIncomeData([]);
  }, [isTrantoMonth]);

  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
    '#9370DB', '#FF7F50', '#FF4500', '#2E8B57',
    '#8A2BE2', '#FF69B4', '#CD5C5C', '#20B2AA',
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
  const years = [2022, 2023, 2024, 2025];


  useEffect(() => {
    const fetchIncomes = async () => {
      setLoading(true);
      try {
        let incomeQuery;
        if (isTrantoMonth) {
          const firstDayOfMonth = new Date(selectedYear, selectedMonth - 1, 1);
          const lastDayOfMonth = new Date(selectedYear, selectedMonth, 0);

          // Convert dates to Firebase Timestamps
          const firstDayOfMonthTimestamp = Timestamp.fromDate(firstDayOfMonth);
          const lastDayOfMonthTimestamp = Timestamp.fromDate(lastDayOfMonth);

          incomeQuery = query(
            collection(db, 'Incomes'),
            where('time', '>=', firstDayOfMonthTimestamp),
            where('time', '<=', lastDayOfMonthTimestamp)
          );
        } else {
          const firstDayOfYear = new Date(selectedYear, 0, 1);
          const lastDayOfYear = new Date(selectedYear, 11, 31);

          const firstDayOfYearTimestamp = Timestamp.fromDate(firstDayOfYear);
          const lastDayOfYearTimestamp = Timestamp.fromDate(lastDayOfYear);

          incomeQuery = query(
            collection(db, 'Incomes'),
            where('time', '>=', firstDayOfYearTimestamp),
            where('time', '<=', lastDayOfYearTimestamp)
          );
        }

        // Real-time listener
        const unsubscribe = onSnapshot(incomeQuery, async (snapshot) => {
          const incomeIconSnapshot = await getDocs(collection(db, 'IncomeCategories'));
          const incomeIconList = incomeIconSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setIncomeIcons(incomeIconList);

          const parsedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setFlatListData(parsedData);

          if (parsedData.length > 0) {
            const categoryTotals = {};
            parsedData.forEach(item => {
              if (!categoryTotals[item.title]) {
                categoryTotals[item.title] = 0;
              }
              categoryTotals[item.title] += item.amount;
            });

            const total = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0);
            setTotalIncome(total);

            const dataWithPercentages = Object.keys(categoryTotals).map((category, index) => ({
              title: category,
              amount: categoryTotals[category],
              percentage: ((categoryTotals[category] / total) * 100).toFixed(2),
              color: colors[index % colors.length],
            }));

            const updatedIncomeList = parsedData.map(income => {
              const matchedIcon = incomeIconList.find(icon => icon.name === income.title);
              return {
                ...income,
                imageUrl: matchedIcon ? matchedIcon.imageUrl : null, // If there's no icon, return null
              };
            });

            setIncomeData(dataWithPercentages);
            setFlatListData(updatedIncomeList);
          } else {
            setFlatListData([]);
            setTotalIncome(0);
            setIncomeData([]);
          }
        });

        return () => unsubscribe();

      } catch (error) {
        console.error('Error fetching incomes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncomes();
  }, [selectedMonth, selectedYear]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, isTrantoMonth && styles.activeTabExpense]}
            onPress={() => setIsTrantoMonth(true)}>
            <Text style={[styles.tabText, isTrantoMonth && styles.activeText]}>เดือน</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, !isTrantoMonth && styles.activeTabIncome]}
            onPress={() => setIsTrantoMonth(false)}>
            <Text style={[styles.tabText, !isTrantoMonth && styles.activeText]}>ปี</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* เลือกเดือนหรือปีตามที่กำหนด */}
      { isTrantoMonth ? (
        <Picker
          selectedValue={selectedMonth}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedMonth(itemValue)}
        >
          {months.map(month => (
            <Picker.Item key={month.value} label={month.label} value={month.value} />
          ))}
        </Picker>
      ) : (
        <Picker
          selectedValue={selectedYear}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedYear(itemValue)}
        >
          {years.map(year => (
            <Picker.Item key={year} label={year.toString()} value={year} />
          ))}
        </Picker>
      )}

      <View style={styles.chartContainer}>
        <PieChart
          data={incomeData.map(item => ({
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
          <Text style={styles.totalText}>{totalIncome.toLocaleString()} บ.</Text>
        </View>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color='red' style={{ transform: [{ scale: 2 }] }} />
      ) : (
        <>
      <FlatList
        data={flatListData}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>ไม่มีรายการรายรับ</Text>
          </View>
        )}
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
                <Text style={styles.amount}>+ {item.amount.toLocaleString()} บ.</Text>
              </View>
              <View style={styles.inobject}>
                <Text style={styles.note}>Note: {item.note || 'N/A'}</Text>
                <Text>{item.time ? new Date(item.time.toDate()).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A'} น.</Text>
              </View>
            </View>
          </View>
        )}
        style={styles.list}
      />
      </>
      )}
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
    color: 'green',
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
    width: '50%',
    height: 50,
    marginBottom: 20,
    paddingHorizontal: 0,
    textAlign: 'left',
    fontSize: 18,
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  emptyText: {
    fontSize: 25,
    color: 'red',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 10,
    overflow: 'hidden',
    width: 250,
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
    fontWeight: 'bold',
    color: 'black',
  },
});

export default IncomeSummaryScreen;
