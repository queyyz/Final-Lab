# TEAM_SPLIT — ENGSE207 Final Lab Set 2

**รายวิชา:** ENGSE207 Software Architecture
**งาน:** Final Lab ชุดที่ 2: Microservices Scale-Up + Cloud Deployment (Railway)

---

## สมาชิกกลุ่ม

| รหัสนักศึกษา | ชื่อ-สกุล |
|---|---|
| 67543210022-9 | นายภูริณัฐ เต๋จ๊ะ |
| 67543210070-8 | นายธนพล ตรีรัตนานุภาพ |

---

## การแบ่งงาน

### สมาชิกคนที่ 1: นายภูริณัฐ เต๋จ๊ะ (67543210022-9) — Auth Side + Task

**รับผิดชอบหลัก:**
- ควบคุมและพัฒนาในส่วน `auth-service/` 
- สร้าง `endpoint` ใหม่ `POST /api/auth/register` สำหรับรองรับการสมัครสมาชิก
- ดูแล `endpoint` เดิมให้ใช้งานได้ปกติ ได้แก่
 - `POST /api/auth/login`
 - `GET /api/auth/me`
 - `GET /api/auth/verify`
 - `GET /api/auth/health`
- จัดแยกไฟล์ `init.sql` สำหรับฐานข้อมูล `auth-db` โดยเฉพาะ (ไม่ใช้ฐานข้อมูลร่วมแบบเดิม)
- ปรับปรุง `task-service/`
- `task-service/` — ปรับให้ทำงานกับ `task-db` แยกออกมา (ตัด JOIN กับ users table ออก ใช้ข้อมูลจาก JWT แทน)
- Deploy `auth-service` + `auth-db` และ `task-service` + `task-db` บน Railway
- ตั้งค่า Environment Variables บน Railway สำหรับ auth-service และ task-service
- ทดสอบ T2, T3, T4 และส่วนของ task บน Cloud และ screenshot
- เขียน `INDIVIDUAL_REPORT_67543210022-9.md`

---

### สมาชิกคนที่ 2: นายธนพล ตรีรัตนานุภาพ (67543210070-8) — User Side + Front + docs

**รับผิดชอบหลัก:**
- พัฒนา `user-service/` ขึ้นมาใหม่ทั้งหมด
  - `GET /api/users/me` พร้อม auto-create profile เมื่อผู้ใช้ใหม่เรียกครั้งแรก
  - `PUT /api/users/me` ใช้สำหรับแก้ไขข้อมูล profile
  - `GET /api/users` จำกัดสิทธิ์ให้เฉพาะ admin
  - `GET /api/users/health`
- `frontend/` รวมถึง `config.js`
- `docker-compose.yml` สำหรับ local testing (3 services + 3 databases)
- `.env.example`
- Deploy `user-service` + `user-db` บน Railway
- Gateway Strategy (Option A)
- ทดสอบ T5–T11 (ยกเว้นส่วน task) บน Cloud และ screenshot
- เขียน `README.md`, `TEAM_SPLIT.md`
- เขียน `INDIVIDUAL_REPORT_67543210070-8.md`

---

## งานที่ทำร่วมกัน

- เริ่มต้นระบบร่วมกันด้วยการ build และ run ผ่าน docker compose เพื่อให้มั่นใจว่าแต่ละ service ทำงานสอดคล้องกันตั้งแต่ต้น
- ตกลงและกำหนดค่า JWT_SECRET ให้เหมือนกันทุก service เพื่อให้ระบบ authentication ใช้งานร่วมกันได้อย่างถูกต้อง
- ตรวจสอบภาพรวมของระบบหลัง deploy บน Railway ว่าทุก service และ database ทำงานครบถ้วน
- ร่วมกันจัดทำและคัดเลือก screenshot ที่จำเป็นสำหรับส่งงาน เช่น ภาพ dashboard และ architecture
- ช่วยกันตรวจสอบความถูกต้องของระบบโดยรวมก่อนทำการ push ขึ้น Git เป็นเวอร์ชันสุดท้าย

---

## เหตุผลในการแบ่งงาน

- แบ่งตาม “ขอบเขตของระบบ” เพื่อให้แต่ละคนโฟกัสในส่วนของตัวเองได้ชัดเจน เช่น ฝั่ง authentication, user และ frontend
- ลดการทำงานซ้ำซ้อน และป้องกันการแก้โค้ดทับกัน โดยแยก service และ database ออกจากกันอย่างชัดเจน
- รองรับการพัฒนาแบบขนาน (parallel) ทำให้สามารถทำงานพร้อมกันได้โดยไม่ต้องรออีกฝ่าย
- เพิ่มความเข้าใจเชิงลึกในแต่ละส่วนของระบบ เนื่องจากแต่ละคนรับผิดชอบ module ของตัวเองแบบ end-to-end
- ทำให้การ debug และแก้ไขปัญหาทำได้ง่ายขึ้น เพราะรู้ชัดว่าแต่ละส่วนเป็นหน้าที่ของใคร

---

## สรุปการเชื่อมโยงงานของสมาชิก

- auth-service ทำหน้าที่จัดการตัวตนของผู้ใช้ และออก JWT ซึ่งเป็นหัวใจสำคัญของระบบ
- user-service ใช้ข้อมูลจาก JWT เพื่อจัดการข้อมูลโปรไฟล์ โดยไม่ต้องพึ่งฐานข้อมูลร่วมกับ service อื่น
- task-service อ้างอิงผู้ใช้ผ่าน JWT เช่นเดียวกัน ทำให้สามารถทำงานแยก database ได้อย่างอิสระ
- frontend ทำหน้าที่เป็นตัวกลางในการเรียกใช้ API จากทุก service ให้ผู้ใช้งานใช้งานได้สะดวก
- ทุก service ถูก deploy แยกกัน แต่ยังสามารถสื่อสารกันได้ผ่าน API และ token ที่กำหนดร่วมกัน