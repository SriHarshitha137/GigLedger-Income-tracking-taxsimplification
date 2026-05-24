# GigLedger

GigLedger is a full-stack income tracker for Indian gig workers who earn across platforms like Ola, Uber, Swiggy, Zomato, Dunzo, Rapido, and Urban Company. It helps workers record income and expenses, estimate taxes under the Indian presumptive taxation scheme, get simple AI guidance, and generate self-reported income certificates.
India has over 15 million gig workers powering the country’s on-demand economy — driving cabs, delivering food, and running errands across platforms like Ola, Swiggy, and Dunzo.

They earn consistently.

But financially, they remain invisible.

A gig worker might earn ₹35,000 per month across multiple apps — yet struggle to:

rent a house apply for a loan show proof of income file taxes correctly

Because their income is scattered, unstructured, and undocumented.

🚨 The Problem

Today, gig workers face three major challenges:

No formal income proof Banks and landlords require salary slips or ITRs — which gig workers don’t have. Poor financial visibility Earnings are split across platforms with no unified view. Tax confusion & overpayment Most workers are unaware of deductions like fuel, phone, or maintenance. 💡 The Solution — GigLedger

GigLedger is a fintech dashboard built specifically for Indian gig workers.

It helps them:

📊 Track income across multiple platforms 💸 Log expenses and reduce taxable income 📈 Visualize earnings with simple analytics 🧾 Calculate tax liability automatically 📄 Generate professional income certificates

All in one place

## Prerequisites

- Node.js 20+
- MongoDB Atlas account and connection string

## Quick Start

1. Clone repo.
2. Run `npm run install:all`.
3. Copy `server/.env.example` to `server/.env` and fill in `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL`.
4. Copy `client/.env.example` to `client/.env`.
5. Run `npm run seed` to load optional test data.
6. Run `npm run dev`.
7. Open `http://localhost:5173`.
8.  IMPORTANT : Test login: phone `9876543210`, password `test123` Name:'Ravi Kumar'
9. Advised to open in laptop for better features and UI

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Register a worker account |
| POST | `/api/auth/login` | Log in and receive JWT |
| GET | `/api/auth/me` | Fetch current profile |
| PATCH | `/api/auth/onboarding` | Complete onboarding |
| GET | `/api/income` | List income entries |
| POST | `/api/income` | Create income entry |
| PUT | `/api/income/:id` | Update income entry |
| DELETE | `/api/income/:id` | Delete income entry |
| POST | `/api/income/parse-sms` | Parse payout SMS using local rules |
| GET | `/api/expenses` | List expenses |
| POST | `/api/expenses` | Create expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/analytics/summary` | Dashboard and tax summary |
| GET | `/api/analytics/monthly-trend` | Last 12 months income trend |
| GET | `/api/analytics/platform-comparison` | Platform contribution breakdown |
| GET | `/api/analytics/earning-heatmap` | Average earning by weekday |
| GET | `/api/ai/tax-advisory` | AI tax advice |
| GET | `/api/pdf/certificate` | Download income certificate PDF |

## Project Structure

```text
gigledger/
├── server/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── seed.js
│   ├── server.js
│   └── .env.example
├── client/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── charts/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
├── package.json
└── README.md
```
The UI is as follows ,it is present in both Dark and Light mode

This is when it is in the dark mode

<img width="1351" height="601" alt="image" src="https://github.com/user-attachments/assets/51097c50-af31-41ad-9fd5-44c798b2c4f6" />

Authentication is required and validation also

<img width="1351" height="604" alt="image" src="https://github.com/user-attachments/assets/d8e33068-ed80-4dfb-b2d8-64d335027517" />
<img width="1353" height="614" alt="image" src="https://github.com/user-attachments/assets/e057353a-da7f-46a9-ac91-97af0666221c" />

Authentication is required

<img width="1360" height="604" alt="image" src="https://github.com/user-attachments/assets/27c67459-a826-4764-9d2d-aceb7b37e3cc" />
<img width="1358" height="609" alt="image" src="https://github.com/user-attachments/assets/20006fa3-b6c0-4add-83da-613115317181" />



<img width="1356" height="599" alt="image" src="https://github.com/user-attachments/assets/aa141f81-d554-4f10-850c-bacc54e71a07" />
<img width="1359" height="604" alt="image" src="https://github.com/user-attachments/assets/b2f30005-a5ba-4bf4-aa12-adcdb2486c19" />
<img width="1352" height="603" alt="image" src="https://github.com/user-attachments/assets/5b31637a-d65e-4801-a9b8-3122ea408d6f" />
<img width="1364" height="604" alt="image" src="https://github.com/user-attachments/assets/36c70a37-1b19-4571-ad6d-99fc957a06ac" />
<img width="1365" height="604" alt="image" src="https://github.com/user-attachments/assets/566308f4-9977-480e-967b-d338de0c26f4" />
<img width="1360" height="606" alt="image" src="https://github.com/user-attachments/assets/36127e71-cd57-4aa2-ab0d-1e3e90412822" />

Particularly if i need a vehicle expenses it is as follows

<img width="1360" height="600" alt="image" src="https://github.com/user-attachments/assets/0134298a-5663-4d50-8551-553ce050a4b3" />

Analytics section

<img width="1365" height="606" alt="image" src="https://github.com/user-attachments/assets/ad4decb1-5c72-484c-9980-ebc3a4daf4bf" />
<img width="1365" height="607" alt="image" src="https://github.com/user-attachments/assets/87c0fb4a-e3f1-4102-b656-614392293792" />
<img width="1365" height="609" alt="image" src="https://github.com/user-attachments/assets/0629f38e-45e4-4bf4-87d2-b38933214f4a" />

Income proof

<img width="1364" height="595" alt="image" src="https://github.com/user-attachments/assets/7f8e2313-92c7-4f7e-a203-c603706d8c54" />

Certificate will be as follows(it will be downloaded in the form of pdf)

<img width="797" height="540" alt="image" src="https://github.com/user-attachments/assets/27a6e53a-cc0f-4df0-a924-d1e354e9a7d1" />
<img width="792" height="540" alt="image" src="https://github.com/user-attachments/assets/47359d3c-b3e1-42ec-beca-08cfb470d1d4" />

THE BELOW THINGS ARE IN THE LIGHT MODE 


<img width="1349" height="600" alt="image" src="https://github.com/user-attachments/assets/61b63835-ca83-49b7-a218-db75ec6fbbaf" />
<img width="1330" height="612" alt="image" src="https://github.com/user-attachments/assets/33341cee-2c2e-4cfe-9353-e1727b1ce8ab" />
<img width="1365" height="606" alt="image" src="https://github.com/user-attachments/assets/b04a39eb-893c-4987-a659-38a5febbe058" />
<img width="1342" height="608" alt="image" src="https://github.com/user-attachments/assets/160aba9e-74b1-482a-a800-d7e4f50f1011" />
<img width="1352" height="601" alt="image" src="https://github.com/user-attachments/assets/8deaf7c6-1eec-41e6-af80-e0d8d52c4490" />
<img width="1357" height="600" alt="image" src="https://github.com/user-attachments/assets/25432224-70d4-433b-9b85-4c5b8f6b6b64" />
<img width="1351" height="599" alt="image" src="https://github.com/user-attachments/assets/599e3c89-9105-414a-b641-64e985162696" />
<img width="1365" height="610" alt="image" src="https://github.com/user-attachments/assets/a1ab2b01-45fd-4014-a2c7-493fbbca6ea1" />
<img width="1348" height="599" alt="image" src="https://github.com/user-attachments/assets/000860ff-b710-40e3-b8f2-af4a242b8d5b" />

