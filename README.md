# Money Bro App

## ภาพรวมของโปรเจค
Money Bro App เป็นแอปพลิเคชันสำหรับติดตามการเงิน ที่ช่วยให้ผู้ใช้สามารถจัดการรายรับรายจ่ายได้อย่างมีประสิทธิภาพ ด้วยฟีเจอร์ต่าง ๆ ดังนี้:
- สามารถเพิ่มและจัดการธุรกรรมทางการเงินของคุณ
- มีการจัดหมวดหมู่รายจ่ายและรายรับเพื่อการติดตามที่ชัดเจน และยังสามารถเพิ่มรายละเอียดและเวลาที่ทำการเพิ่มรายการได้อีกด้วย
- ดูสรุปรายการที่เป็นแผนภูมิวงกลมเพื่อดูยอดรวมตามหมวดหมู่ที่คุณต้องการ โดยที่จะแยกตามเดือนหรือปีอย่างชัดเจน
-  สามาถเพิ่มเป้าหมายการใช้จ่ายในแต่ละหมวดหมู่ เพื่อเป็นหลักการใช้จ่ายให้คุณสามารถรู้ว่าใช้จ่ายไปเท่าไหร่ในหมวดหมู่นั้น
- สามารถแจ้งเตือนภายในแอพได้ว่าคุณมีการใช้จ่ายในหมวดหมู่นั้นๆ หากใช้จ่ายใกล้ถึงขีดจำกัด

## ฟีเจอร์
- ในหน้าของหน้าแรก: มีการจัดการรายรับและรายจ่าย โดยสามารถแสดงรายละเอียดของหมวดหมู่ จำนวนเงิน โน้ตที่อยากเพิ่ม และเวลาที่ทำการเพิ่มไป รวมถึงสามารถลบรายการธุรกรรมได้อย่างง่ายดาย
- ในหน้าของสรุป: มีการแสดงแผนภูมิที่ชัดเจน โดยที่มีการแบ่งรายเดือนและรายปีอย่างชัดเจนตามประเภทของธุรกรรมที่เลือกจากหน้าแรก จัดหมวดหมู่ธุรกรรมเพื่อดูธุรกรรมที่เป็นระเบียบ
- ในหน้าเพิ่ม: สามารถเพิ่มข้อมูลธุรกรรมทางการเงิน โดยที่สามารถเลือกประเภทของธุรกรรมจากในหน้านี้ เพื่อเพิ่มหมวดหมู่ที่จะเพิ่ม เพิ่มจำนวนเงิน และเพิ่มโน้ตได้
- ในหน้าของเป้าหมาย: จะแสดงรายการธุกรรมที่เพิ่มจากภายในหน้านี้ โดยหมวดหมู่ที่เลือก ยอดเงินเป้าหมาย ยอดเงินคงเหลือ พร้อมวันที่สิ้นสุด และยังสามารถลบเป้าหมายธุรกรรมได้ด้วย
- ในหน้าของแจ้งเตือน: จะแสดงการแจ้งเตือนภายในหน้านี้ หากเป้าหมายที่ตั้งเป้าไว้ในหน้าของเป้าหมายมียอดเงินคงเหลือใกล้หมดแล้ว

## วิธีการติดตั้งและรันโปรเจค
1. คัดลอก repository ลงเครื่องของคุณโดยใช้คำสั่ง:
   ```bash
   git clone https://github.com/Pavarit2546/Money_Bro_App.git
   ```
      
      หากยังไม่มี git ให้ทำการติดตั้ง git ก่อนจากลิงค์ต่อไปนี้ https://git-scm.com/downloads
    
2. หากติดตั้งเสร็จแล้วให้ทำการเข้าโฟลเดอร์ โดยใช้คำสั่ง:
    ```bash
   cd Money_Bro_App
   ```

3. หากเข้าไปยังโฟลเดอร์แล้ว ติดตั้ง dependencies ที่จำเป็น โดยใช้คำสั่ง:
    ```bash
   npm install
   ```

4. หากทำการติดตั้งเสร็จแล้ว คุณสามารถเปิดรันแอพได้เลย โดยใช้คำสั่ง:
    ```bash
   npx expo start
    ```
	
## ข้อมูลเพิ่มเติม

Money Bro App เป็นแอปพลิเคชันสำหรับติดตามการเงินที่ช่วยให้ผู้ใช้จัดการรายรับรายจ่ายได้ง่ายขึ้น โปรเจคนี้อยู่ใน branch ที่ชื่อว่า final_develop ซึ่งเป็นเวอร์ชันที่เสร็จสมบูรณ์และพร้อมใช้งานจริง วิธีการใช้งาน Branch final_develop โดยค่าเริ่มต้น เมื่อคุณ clone โปรเจคจาก GitHub, Git จะอยู่ใน branch หลัก (main) แต่เวอร์ชันโปรเจคที่เสร็จสมบูรณ์จริงอยู่ใน branch final_develop คุณสามารถเปลี่ยนไปที่ branch นี้ได้โดยทำตามขั้นตอนด้านล่างดังนี้

1. เปลี่ยนไปที่ branch final_develop โดยใช้คำสั่ง: 
    ```bash
	git checkout final_develop
    ```
2. ตรวจสอบว่าคุณอยู่ใน branch final_develop โดยใช้คำสั่ง:
    ```bash
	git branch
    ```
      
      ซึ่งผลลัพธ์จะต้องเป็นดังนี้:
  	Final
  	Pond_test
  	develop
  * final_develop
  	master
  ระบบจะแสดง branch ที่คุณอยู่ หากคุณอยู่ใน branch final_develop จะมีเครื่องหมาย * อยู่ข้างหน้า
3. หลังจากที่อยู่ใน branch ที่ถูกต้องแล้ว ให้ติดตั้ง dependencies โดยใช้คำสั่ง:
    ```bash
    npm install
      ```

4. หากทำการติดตั้งเสร็จแล้ว คุณสามารถเปิดรันแอพได้เลย โดยใช้คำสั่ง:
    ```bash
    npx expo start
      ```