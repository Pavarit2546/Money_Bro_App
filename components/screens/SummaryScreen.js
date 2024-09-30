import React, { useState, useEffect, useContext } from 'react'; 
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import IncomeSummaryScreen from './IncomeSummaryScreen';
import ExpenseSummaryScreen from './ExpenseSummaryScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TypeContext } from '../../TypeContext';

const loadTransactions = async (type) => {
  try {
    const data = await AsyncStorage.getItem(type);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading data:', error);
    return [];
  }
};

// const filterByMonthOrYear = (transactions, isYearly) => {
//   const currentDate = new Date();
//   if (isYearly) {
//     console.log('ifcurrentDate', currentDate);
//     return transactions.filter(t => new Date(t.date).getFullYear() === currentDate.getFullYear());
//   } else {
//     console.log('ifcurrentDate', currentDate);
//     return transactions.filter(t => 
//       new Date(t.date).getMonth() === currentDate.getMonth() &&
//       new Date(t.date).getFullYear() === currentDate.getFullYear()
//     );
//   }
// };

const SummaryScreen = ({ route }) => {
  const [isShowingExpenses, setIsShowingExpenses] = useState(true);
  const [expense, setExpense] = useState([]);
  const [income, setIncome] = useState([]);
  const [isYearly, setIsYearly] = useState(false);//
  const { type } = useContext(TypeContext);
  console.log('Type:', type);
  useEffect(() => {
    const fetchData = async () => {
      const expenseData = await loadTransactions('expense');
      setExpense(expenseData);
      const incomeData = await loadTransactions('income');
      setIncome(incomeData);
    };
    fetchData();
  }, []);

  // useEffect(() => {
  //   if (route.params?.transaction) {
  //     const { title, amount } = route.params.transaction;
  //     const type = route.params.type;
  //     if (type === 'expense') {
  //       setExpense(prevExpense => [...prevExpense, { title, amount }]);
  //       saveTransaction({ title, amount }, 'expense');
  //       setIsShowingExpenses(true);
  //     } else if (type === 'income') {
  //       setIncome(prevIncome => [...prevIncome, { title, amount }]);
  //       saveTransaction({ title, amount }, 'income');
  //       setIsShowingExpenses(false);
  //     }
  //     // Clear route params
  //     route.params = {};
  //   }
  // }, [route.params?.transaction, type]);
  useEffect(() => {
    const { transaction } = route.params || {};
    console.log('Transaction', transaction);
    if (transaction) {
      const { title, amount } = transaction;
      if (type === 'expense') {
        setExpense(prev => [...prev, { title, amount }]);
        saveTransaction({ title, amount }, 'expense');
        setIsShowingExpenses(true);
      } else if (type === 'income') {
        setIncome(prev => [...prev, { title, amount }]);
        saveTransaction({ title, amount }, 'income');
        setIsShowingExpenses(false);
      }
      
      // Clear the transaction after processing it
      navigation.setParams({ transaction: undefined });
    }
  }, [route.params?.transaction, type]);

  const saveTransaction = async (transaction, type) => {
    try {
      if (!transaction.title || transaction.amount === undefined) {
        console.error('Transaction data is incomplete:', transaction);
        return;
      }
  
      const existingData = await AsyncStorage.getItem(type);
      const currentData = existingData ? JSON.parse(existingData) : [];
      const updatedData = [...currentData, transaction];
      await AsyncStorage.setItem(type, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };
  //const filteredExpenses = filterByMonthOrYear(expense, isYearly);
  //const filteredIncome = filterByMonthOrYear(income, isYearly);

  return (
    <View style={styles.container}>
      {/* <View style={styles.header}>
        <View style={styles.tabContainer}>
        <TouchableOpacity
            style={[styles.tab, !isYearly && styles.activeTabExpense]}
            onPress={() => setIsYearly(false)}>
            <Text style={[styles.tabText, !isYearly && styles.activeText]}>เดือน</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, isYearly && styles.activeTabIncome]}
            onPress={() => setIsYearly(true)}>
            <Text style={[styles.tabText, isYearly && styles.activeText]}>ปี</Text>
          </TouchableOpacity>
        </View>
      </View> */}

      
      {type === 'income' ? (
        <IncomeSummaryScreen income={income}/> 
      ) : (
        <ExpenseSummaryScreen expense={expense}/>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7F7F7',
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
  activeTab: {
    borderBottomColor: 'black',
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
    color: '#333',
  },
});

export default SummaryScreen;
