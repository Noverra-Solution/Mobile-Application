i am not able to# Noverra Mobile · Real Estate Owner Asset Lifetime Cost & CAFM Platform

**Noverra** is a mobile platform engineered for **Real Estate Asset Owners and Property Investors** to track the **Lifetime Cost & Expense Ratio** of their property portfolios.

---

### Core Concept: Main Assets vs. Sub-Assets

```
[ Real Estate Owner Portfolio ]
       │
       ├── MAIN ASSET: Apartment / Unit (e.g. Unit 204 · 3BHK)
       │     ├── Monthly Rent: ₹48,000/mo
       │     ├── Lifetime Rent Collected: ₹5,76,000
       │     ├── Total Maintenance Spent: ₹56,800
       │     └── Expense Ratio: 9.8% (Healthy <15%)
       │
       └── SUB-ASSETS inside the Apartment:
             ├── ❄️ Living Room AC (Daikin 1.5T Inverter) · Capex: ₹44k · Repairs: ₹14.2k
             ├── ❄️ Master Bed AC (Carrier 1.0T) · Capex: ₹32k · Repairs: ₹3.1k
             ├── 🚰 Bathroom Geyser (AO Smith 25L) · Capex: ₹14.5k · Repairs: ₹850
             ├── [UserFeatures.docx](../../UserFeatures.docx)
[AdminFeatures.docx](../../AdminFeatures.docx)
[Serivce Provider.docx](../../Serivce%20Provider.docx)
[FacilitySupervisor.docx](../../FacilitySupervisor.docx)🧺 Refrigerator (Samsung 345L) · Capex: ₹41k · Repairs: ₹4.2k
             └── ⚡ Smart Distribution Panel (Schneider Easy9) · Capex: ₹18k · Repairs: ₹0
```

#### The Real Estate Owner Bottom Line Formula:
$$\text{Expense Ratio} = \frac{\text{Total Maintenance \& Operating Expenses}}{\text{Total Rental Income Collected}} \times 100\%$$
- **Healthy Benchmark**: $<15\%$ (Green indicator)
- **Moderate Cost**: $15\% - 25\%$ (Amber warning)
- **High Expense Alert**: $>25\%$ (Red alert - identifies which sub-asset like an AC compressor failure is eroding cashflow)

---

### 5-Tab Navigation Architecture (Matching Reference Screenshots)

1. **Home (Dashboard)**:
   - Site/Property selector pill (`🏢 All Sites ▾` / `Palm Residency` / `Cyber Heights`)
   - 4 Operational Metric cards: `16 Total`, `16 Open`, `16 Overdue`, `0 Resolved`
   - Real Estate Owner Lifetime Financial Snapshot: Monthly Rent, Lifetime Spend, and Expense Ratio gauge
   - **Cases by Priority Donut Chart**: `16 Total` (Critical 3, High 1, Medium 7, Low 5)
   - Recent Cases list with colored priority dots, case IDs (`IC260039`, `IC260034`), and location tags
2. **Cases**:
   - Filter tabs: `All 16` | `Open 16` | `Overdue 16` | `Resolved 0` (with active blue indicator)
   - Search bar: "Search cases, location or ID"
   - Ticket cards with priority indicators, apartment locations, and sub-asset tags
   - **`+ Raise a Case`**: Take live photos with device camera, select target apartment and sub-asset, and dispatch tickets
3. **Scan (QR & Barcode Scanner)**:
   - Viewfinder with animated laser sweep line
   - Simulates scanning apartment door tags or equipment sub-asset barcodes to pull up lifetime costs, past repair logs, and warranty/AMC coverage
4. **Assets (Apartments & Sub-Assets Lifetime Cost Engine)**:
   - Portfolio overview: Total Rent Collected vs Total Maintenance Spent
   - Apartment Cards: Unit number, tenant name, monthly rent, lifetime spend, and expense ratio
   - Apartment Detail Modal:
     - Visual breakdown of rental yield vs repair expenses
     - Sub-Assets list inside the unit with individual repair costs
     - **`+ Log Repair / Expense`**: Immediately updates the sub-asset and recalculates the apartment's expense ratio
     - **`+ Add Sub-Asset`**: Register new equipment into any apartment
5. **More**:
   - Account Owner Profile (`Shyju` / `Anto`, `Account Owner`, Email, `TOPMANAGER-100`)
   - Work Orders (interactive status toggles)
   - Materials & Inventory (on-site spare parts)
   - Tenant Handover Inspections
   - AMC Contracts & Maintenance Plans (Daikin AC AMC, Otis Elevator AMC)
   - Contractor & Vendor Roster with ratings and phone numbers
   - Two-Factor Sign-In toggle & Sign Out

---

### How to Run on Your Phone

1. In your terminal, run:
   ```bash
   npx expo start
   ```
2. Scan the QR code using **Expo Go** on your Android or iPhone.
3. The app opens with the **Noverra** hero animation and transitions smoothly into the owner dashboard.
