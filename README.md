# Invoice and Budget Management App 📱

**Invoice Management App** allows you to effortlessly create invoices, convert them to PDF, save them on your device, and send them via email—all from a single app!

---
<p float="left">
 <img src="https://github.com/user-attachments/assets/ea709b0f-9cc5-4c0b-b142-7eda63e965f4" width="32%" />
  <img src="https://github.com/user-attachments/assets/0b096446-95d1-4374-a4e0-b7726c4572a3" width="32%" />
  <img src="https://github.com/user-attachments/assets/67575461-472b-4f82-8c4a-85097725d5c5" width="32%" />


</p>
---

## 🌟 Features

1. **Generate PDF Invoices**
   - Create professional, formatted PDF files for each invoice directly within the app.

2. **Save Invoices Locally**
   - Securely store invoices in local storage using SQLite, enabling easy access and offline functionality.

3. **Send Invoices via Email**
   - Streamline your invoicing process by sending invoices through email directly from the app.

4. **View Income Charts**
   - Visualize your invoicing history with interactive charts, providing insights into income trends from sent invoices.

5. **Track Budget (Income & Expenses)**
   - Manage your finances by tracking income and expenses, helping you stay on top of your budget.

---

## 🛠️ Technology Stack

This app leverages the following tools and libraries:

1. [**React Native**](https://reactnative.dev/docs/getting-started) - For building cross-platform mobile applications.
2. [**Expo**](https://docs.expo.dev/) - A platform for universal React applications, simplifying development.
3. [**Drizzle ORM**](https://orm.drizzle.team/docs/overview) - Lightweight ORM for TypeScript, enabling efficient data handling.
4. [**SQLite**](https://www.sqlite.org/docs.html) - A lightweight, relational database for local data storage.
5. [**React Hook Form**](https://react-hook-form.com/get-started) - Simplifies form management and validation.
6. [**React Native Chart Kit**](https://github.com/indiespirit/react-native-chart-kit) - For creating visually appealing, interactive charts.
7. [**Tailwind CSS**](https://tailwindcss.com/docs) - Utility-first CSS framework for styling with ease and flexibility.

---

## 📱 App Structure
```
app/
├── (tabs)/
│   ├── home.tsx                      # Main dashboard
│   ├── charts.tsx                    # Financial analytics
│   ├── budget.tsx                    # Budget Tab
│   └── invoices.tsx                  # Invoice listing
├── (stack)/
│   ├── clientInfo.tsx                # Client management
│   ├── addTransaction.tsx            # Transaction for budget
│   ├── createInvoice.tsx             # Invoice creation
│   └── (user)/
│       ├── userInfo.tsx              # User profile
│       └── bankDetailsForm.tsx       # Bank details for User
│
├── index.tsx                         # Entry of the App
├── _layout.tsx                       # Main layout file
│
└── components/
    ├── InvoiceCard.tsx
    ├── InvoiceList.tsx
    ├── BaseCard.tsx
    └── ...

  ```

---

## 🚧 Work in Progress

### Upcoming Features

- **Sync Engine for Database Synchronization**
  - Adding a sync engine to enable real-time synchronization between the local SQLite database and a remote database, ensuring data is consistent across devices.

---
