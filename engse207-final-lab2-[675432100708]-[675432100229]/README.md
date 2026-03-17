# ENGSE207 Software Architecture
## Final Lab Set 2 — Microservices Scale-Up + Cloud Deployment (Railway)

---

## 1. ข้อมูลรายวิชาและสมาชิก

**รายวิชา:** ENGSE207 Software Architecture
**ชื่องาน:** Final Lab — ชุดที่ 2: Microservices Scale-Up + Cloud Deployment (Railway)

**สมาชิกในกลุ่ม**
| รหัสนักศึกษา | ชื่อ-นามสกุล | หน้าที่ |
|---|---|---|
| 67543210022-9 | นายภูริณัฐ เต๋จ๊ะ | Auth Service + Deploy Aut + Task Service |
| 67543210070-8 | นายธนพล ตรีรัตนานุภาพ | User Service + Frontend + Deploy + Docs |

---

## 2. Service URLs บน Railway

| Service | URL |
|---|---|
| Frontend | `https://frontend-production-f797.up.railway.app` |
| Auth Service | `https://auth-service-production-4c89.up.railway.app/api/auth/health` |
| Task Service | `https://task-service-production-6814.up.railway.app/api/tasks/health` |
| User Service | `https://user-service-production-5ad5.up.railway.app/api/users/health` |

> แทนที่ `[...]` ด้วย URL จริงจาก Railway หลัง Deploy

---

## 3. Project Overview

ใน Set 2 มีการพัฒนาระบบต่อจาก Set 1 โดยมีการปรับปรุงโครงสร้างและเพิ่มความสามารถของระบบให้มีความเป็น Microservices มากยิ่งขึ้น ดังนี้

- เพิ่มจำนวน `service` จากเดิม 2 ส่วน ขยายเป็น `3 services` ได้แก่ `Auth`, `Task` และ `User` เพื่อแยกความรับผิดชอบของแต่ละระบบให้ชัดเจนขึ้น
- ปรับรูปแบบการจัดเก็บข้อมูล จากเดิมที่ใช้ฐานข้อมูลร่วมกัน เปลี่ยนเป็นแนวทาง `Database-per-Service` โดยแต่ละ `service` มี `database `ของตัวเองทั้งหมด 3 ฐานข้อมูล
- เพิ่มความสามารถในการสมัครสมาชิก ผ่านการสร้าง `endpoint` `Register` `API` ภายใน `Auth Service`
- พัฒนา `User Service` ขึ้นมาใหม่ เพื่อรองรับการจัดการข้อมูลโปรไฟล์ของผู้ใช้งานโดยเฉพาะ
- ตัดการใช้งาน `Nginx` และ `Log Service` ออก เนื่องจาก `Railway` รองรับการเข้าถึงแต่ละ `service` ผ่าน `URL` ได้โดยตรงอยู่แล้ว
- นำทุก `service` ขึ้น `deploy` บน `Railway Cloud` เพื่อให้ระบบสามารถใช้งานได้จริงในสภาพแวดล้อมออนไลน์

---

## 4. Architecture Diagram (Cloud)

```text
🌐 Client (Browser / Postman / Internet)
│
│
├── 🔐 Auth Service
│     🌍 https://auth-service-production-d7a0.up.railway.app
│     ⚙️ PORT 3001
│     │
│     └── 🗄️ auth-db (PostgreSQL)
│           📄 users
│           📝 logs
│
│
├── 📋 Task Service
│     🌍 https://task-service-production-cbc1.up.railway.app
│     ⚙️ PORT 3002
│     │
│     └── 🗄️ task-db (PostgreSQL)
│           📄 tasks
│           📝 logs
│
│
├── 👤 User Service
│     🌍 https://user-service-production-f14a.up.railway.app
│     ⚙️ PORT 3003
│     │
│     └── 🗄️ user-db (PostgreSQL)
│           📄 user_profiles
│           📝 logs
│
│
└── 🎨 Frontend (Web UI)
      🌍 https://frontend-production-47ba.up.railway.app/index.html
      ⚡ ให้บริการผ่าน nginx
🔑 ทุก service ภายในระบบใช้ค่า JWT_SECRET เดียวกัน เพื่อให้สามารถตรวจสอบและยืนยันตัวตนของผู้ใช้ได้อย่างสอดคล้องกันทั้งระบบ
🧩 ค่า user_id ถูกใช้เป็นตัวอ้างอิงข้าม service ในเชิงตรรกะ (logical reference) โดยไม่มีการกำหนด Foreign Key เชื่อมระหว่าง database ของแต่ละ service
```

---

## 5. Services และ Databases

### Services
| Service | Port | หน้าที่ |
|---|---|---|
| auth-service | 3001 | Register, Login, Verify JWT |
| task-service | 3002 | CRUD Tasks + JWT Auth |
| user-service | 3003 | Profile Management + JWT Auth |
| frontend | 8080 | Web UI |

### Databases
| Database | ตาราง | เก็บข้อมูล |
|---|---|---|
| auth-db | users, logs | username, email, password_hash, role |
| task-db | tasks, logs | user_id, title, description, status, priority |
| user-db | user_profiles, logs | user_id, display_name, bio, avatar_url |

---

## 6. API Endpoints

### Auth Service
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | สมัครสมาชิก | ❌ |
| POST | `/api/auth/login` | เข้าสู่ระบบ | ❌ |
| GET | `/api/auth/me` | ดูข้อมูลตัวเอง | ✅ JWT |
| GET | `/api/auth/verify` | ตรวจสอบ token | ✅ JWT |
| GET | `/api/auth/health` | Health check | ❌ |

### Task Service
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/tasks` | ดู tasks ของตัวเอง | ✅ JWT |
| POST | `/api/tasks` | สร้าง task | ✅ JWT |
| PUT | `/api/tasks/:id` | แก้ไข task | ✅ JWT |
| DELETE | `/api/tasks/:id` | ลบ task | ✅ JWT |
| GET | `/api/tasks/health` | Health check | ❌ |

### User Service
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/users/me` | ดู profile ตัวเอง | ✅ JWT |
| PUT | `/api/users/me` | แก้ไข profile | ✅ JWT |
| GET | `/api/users` | ดูผู้ใช้ทั้งหมด | ✅ JWT + Admin |
| GET | `/api/users/health` | Health check | ❌ |

---

## 7. Gateway Strategy

Set 2 ใช้ **Direct Service URL** แทน API Gateway เพราะ Railway ให้ URL แยกให้แต่ละ service อยู่แล้ว Client เรียกแต่ละ service โดยตรง ซึ่งเหมาะสมสำหรับการ Deploy บน Cloud ที่แต่ละ service มี domain เป็นของตัวเอง

**ข้อดี:** ง่าย ไม่มี single point of failure, deploy แยกกันได้
**ข้อเสีย:** Client ต้องรู้ URL ของทุก service, ไม่มี centralized routing

---

## 8. วิธีรัน Local ด้วย Docker Compose

```bash
# 1. Clone repo
git clone https://github.com/queyyz/Final-Lab/tree/main/engse207-final-lab2-%5B675432100708%5D-%5B675432100229%5D
cd engse207-final-lab2-[675432100708]-[675432100229]

# 2. สร้าง .env
cp .env.example .env

# 3. รัน
docker compose up --build

# 4. เปิดหน้าเว็บ
# http://localhost:8080

# 5. ทดสอบ Health Check
curl http://localhost:3001/api/auth/health
curl http://localhost:3002/api/tasks/health
curl http://localhost:3003/api/users/health
```

---

## 9. วิธี Deploy บน Railway

1. ไปที่ [railway.app](https://railway.app) → New Project
2. สร้าง **PostgreSQL** สำหรับแต่ละ service (auth-db, task-db, user-db)
3. สร้าง **Service จาก GitHub** → เลือก repo → ตั้ง Root Directory เป็น `auth-service/`, `task-service/`, `user-service/`
4. ตั้ง **Environment Variables** ทุก service:

```
DATABASE_URL = (จาก Railway PostgreSQL)
JWT_SECRET   = engse207-super-secret-change-in-production-abc123
PORT         = 3001 / 3002 / 3003
```

---

## 10. Environment Variables

| Variable | Description | ตัวอย่าง |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgres://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret สำหรับ sign/verify JWT (ต้องเหมือนกันทุก service) | `engse207-super-secret-...` |
| `JWT_EXPIRES_IN` | อายุ token | `1h` |
| `PORT` | Port ที่ service รัน | `3001` / `3002` / `3003` |

---

## 11. วิธีทดสอบด้วย curl

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@test.com","password":"123456"}'

# Login → เก็บ token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}' \
  | python -c "import sys,json; print(json.load(sys.stdin)['token'])")

# Auth Me
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Get Profile (auto-create ครั้งแรก)
curl http://localhost:3003/api/users/me \
  -H "Authorization: Bearer $TOKEN"

# Update Profile
curl -X PUT http://localhost:3003/api/users/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"display_name":"Test User","bio":"Hello Set 2"}'

# Create Task
curl -X POST http://localhost:3002/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My first task","status":"TODO","priority":"high"}'

# Get Tasks
curl http://localhost:3002/api/tasks \
  -H "Authorization: Bearer $TOKEN"

# Test 401 — ไม่มี Token
curl http://localhost:3002/api/tasks

# Test 403 — Member เข้า Admin endpoint
curl http://localhost:3003/api/users \
  -H "Authorization: Bearer $TOKEN"

# Admin Login
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lab.local","password":"adminpass"}' \
  | python -c "import sys,json; print(json.load(sys.stdin)['token'])")

# Admin — ดูผู้ใช้ทั้งหมด
curl http://localhost:3003/api/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 12. Screenshots

| ไฟล์ | รายละเอียด |
|---|---|
| `01_railway_dashboard.png` | Register สำเร็จ 201 |
| `02_auth_register_cloud.png` | Login ได้ token |
| `03_auth_login_cloud.png` | GET /api/auth/me |
| `04_auth_me_cloud.png` | สร้าง task สำเร็จ |
| `05_user_me_cloud.png` | ดูรายการ tasks |
| `06_user_update_cloud.png` | แก้ไข task |
| `07_task_create_cloud.png` | ลบ task |
| `08_task_list_cloud.png` | GET /api/users/me |
| `09_protected_401.png` | PUT /api/users/me |
| `10_member_403.png` | Member เข้า /api/users → 403 |
| `11_admin_users_200-1.png` | Admin เข้า /api/users → 200 |
| `11_admin_users_200-2.png` | Admin เข้า /api/users → 200 |
| `12_readme_architecture.png` | Architecture diagram |

---

## 13. Known Limitations

- โครงสร้างฐานข้อมูลของแต่ละ `service` ถูกแยกออกจากกัน ทำให้ไม่สามารถกำหนด `Foreign Key` ข้าม database ได้ โดย `user_id` ที่อยู่ใน `task-db` และ `user-db` จะอ้างอิงถึงข้อมูลใน `auth-db` ในลักษณะเชิงตรรกะเท่านั้น (logical reference)
- เมื่อมีการลบข้อมูลผู้ใช้ใน auth-db จะไม่ส่งผลต่อข้อมูลที่เกี่ยวข้องใน task-db และ user-db ส่งผลให้เกิดข้อมูลค้าง (orphan data) ที่ยังไม่ถูกลบตาม
- ระบบไม่มี `API Gateway` เป็นตัวกลางรวมการเรียกใช้งาน ทำให้ฝั่ง `client` จำเป็นต้องเรียก `API` ของแต่ละ `service` แยกกันโดยตรง
- การจัดเก็บ `log` ยังเป็นแบบแยกส่วน โดยแต่ละ `service` จะบันทึกข้อมูลลงใน `table logs` ของ `database` ตัวเอง ยังไม่มีระบบรวม `log` จากทุก service มาไว้ในศูนย์กลางเดียวกัน

---

## 14. การแบ่งงานของทีม

รายละเอียดการแบ่งงานอยู่ในไฟล์ `TEAM_SPLIT.md`
- `INDIVIDUAL_REPORT_67543210070-8.md`
- `INDIVIDUAL_REPORT_67543210022-9.md`
