import React from 'react';
import { View, Text, StyleSheet, Image,TouchableOpacity } from 'react-native';

const NotificationScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image source={require('../../assets/Health-icon.png')} style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>การแจ้งเตือนการใช้งาน</Text>
          <Text style={styles.description}>จำนวนยอดเงินในหมวดหมู่ ยา </Text>
          <Text style={styles.description}>ใกล้ถึงกำหนดแล้ว </Text>
          <TouchableOpacity onPress={() => handleDeleteGoal(item)}>
        <Text style={styles.deleteNoti}>ลบ</Text>  </TouchableOpacity>
        </View>
      </View>
      <View style={styles.card}>
        <Image source={require('../../assets/Transport-icon.png')} style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>การแจ้งเตือนการใช้งาน</Text>
          <Text style={styles.description}>จำนวนยอดเงินในหมวดหมู่ การเดินทาง </Text>
          <Text style={styles.description}>ใกล้ถึงกำหนดแล้ว </Text>
          <TouchableOpacity onPress={() => handleDeleteGoal(item)}>
        <Text style={styles.deleteNoti}>ลบ</Text>  </TouchableOpacity>
        </View>
      </View>
      <View style={styles.card}>
        <Image source={require('../../assets/Fashion-icon.png')} style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>การแจ้งเตือนการใช้งาน</Text>
          <Text style={styles.description}>จำนวนยอดเงินในหมวดหมู่ แฟชั่น </Text>
          <Text style={styles.description}>ใกล้ถึงกำหนดแล้ว </Text>
          <TouchableOpacity onPress={() => handleDeleteGoal(item)}>
        <Text style={styles.deleteNoti}>ลบ</Text>  </TouchableOpacity>
        </View>
      </View>
      <View style={styles.card}>
        <Image source={require('../../assets/Edu-icon.png')} style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>การแจ้งเตือนการใช้งาน</Text>
          <Text style={styles.description}>จำนวนยอดเงินในหมวดหมู่ การศึกษา </Text>
          <Text style={styles.description}>ใกล้ถึงกำหนดแล้ว</Text>
          <TouchableOpacity onPress={() => handleDeleteGoal(item)}>
        <Text style={styles.deleteNoti}>ลบ</Text>  </TouchableOpacity>
        </View>
      </View>
      <View style={styles.card}>
        <Image source={require('../../assets/Health-icon.png')} style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>การแจ้งเตือนการใช้งาน</Text>
          <Text style={styles.description}>จำนวนยอดเงินในหมวดหมู่ ยา </Text>
          <Text style={styles.description}> ใกล้ถึงกำหนดแล้ว</Text>
          <TouchableOpacity onPress={() => handleDeleteGoal(item)}>
        <Text style={styles.deleteNoti}>ลบ</Text>  </TouchableOpacity>
        </View>
      </View>
      <View style={styles.card}>
        <Image source={require('../../assets/House-icon.png')} style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>การแจ้งเตือนการใช้งาน</Text>
          <Text style={styles.description}>จำนวนยอดเงินในหมวดหมู่ ที่อยู่อาศัย </Text>
          <Text style={styles.description}>ใกล้ถึงกำหนดแล้ว</Text>
          <TouchableOpacity onPress={() => handleDeleteGoal(item)}>
        <Text style={styles.deleteNoti}>ลบ</Text>  </TouchableOpacity>
        </View>
      </View>
      <View style={styles.card}>
        <Image source={require('../../assets/Social-icon.png')} style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>การแจ้งเตือนการใช้งาน</Text>
          <Text style={styles.description}>จำนวนยอดเงินในหมวดหมู่ สังคม </Text>
          <Text style={styles.description}>ใกล้ถึงกำหนดแล้ว</Text>
          <TouchableOpacity onPress={() => handleDeleteGoal(item)}>
        <Text style={styles.deleteNoti}>ลบ</Text>  </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  deleteNoti: {
    color: 'red',
    fontSize: 16,
    alignSelf: 'flex-end',
    position: 'absolute',
    right: 10,
    top: '50%',  
    transform: [{ translateY: -40 }] 
  },

});

export default NotificationScreen;