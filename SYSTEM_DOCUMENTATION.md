# Technical Documentation: Hybrid AI–Blockchain Mining Supply Chain System

## 1. Project Overview
This system is a prototype for an MPhil IT thesis titled **“A Hybrid AI–Blockchain Model for Enhancing Trust and Traceability in the Mining Supply Chain.”** It integrates Firebase for real-time data, an AI engine for anomaly detection, and Ethereum smart contracts for immutable logging.

---

## 2. File-by-File Technical Breakdown

### 📂 Root Directory

#### `metadata.json`
*   **Function:** Defines the application's identity within the AI Studio environment.
*   **Key Code:** Sets the `name` and `description` which appear in the app's header and metadata.

#### `package.json`
*   **Function:** Manages project dependencies and execution scripts.
*   **Key Code:** 
    *   `"dev": "tsx server.ts"`: Configures the app to run as a full-stack Express server.
    *   `dependencies`: Includes `firebase` (database), `ethers` (blockchain), `axios` (API calls), and `recharts` (data visualization).

#### `server.ts` (The Orchestrator)
*   **Function:** Acts as the backend "brain," bridging the frontend, AI service, and Blockchain.
*   **Key Code:**
    *   `app.post("/api/ai/detect")`: A proxy endpoint that simulates the Isolation Forest AI logic. It calculates an `anomalyScore` based on weight discrepancies.
    *   `app.post("/api/blockchain/notarize")`: Simulates the interaction with an Ethereum node, returning a unique `blockchainHash` for every transaction.
    *   `vite.middlewares`: Integrates the React frontend into the Express server.

#### `firebase-blueprint.json`
*   **Function:** The "Source of Truth" for the database structure.
*   **Key Code:** Defines the `User`, `Batch`, and `Transaction` entities using JSON Schema, ensuring data consistency across the system.

#### `firestore.rules`
*   **Function:** Security layer that prevents unauthorized access to the database.
*   **Key Code:**
    *   `isAuthenticated()`: Ensures only logged-in users can see data.
    *   `hasRole('miner')`: Restricts batch registration to users with the 'miner' role.
    *   `isAdmin()`: Grants full override permissions to the thesis author (your email).

#### `ai_service.py`
*   **Function:** A Python microservice (FastAPI) containing the actual Machine Learning logic.
*   **Key Code:**
    *   `IsolationForest(contamination=0.1)`: The unsupervised ML model used to detect outliers.
    *   `predict_anomaly()`: Calculates the distance of a transaction from the "normal" cluster to generate an anomaly score.

#### `contracts/SupplyChain.sol`
*   **Function:** The Solidity Smart Contract for the Ethereum blockchain.
*   **Key Code:**
    *   `struct Event`: Defines the immutable data structure (Batch ID, Hash, Timestamp).
    *   `logEvent()`: The function called to permanently write a transaction hash to the blockchain.

---

### 📂 /src Directory (Frontend)

#### `src/firebase.ts`
*   **Function:** Initializes the connection to Google Firebase.
*   **Key Code:** Exports `auth` (for login), `db` (for Firestore), and `storage` (for files). It also includes a `testConnection` function to ensure the backend is live.

#### `src/types.ts`
*   **Function:** Centralized TypeScript definitions.
*   **Key Code:** Defines the `Batch` and `Transaction` interfaces, ensuring that the frontend and backend always speak the same "language."

#### `src/App.tsx` (The User Interface)
*   **Function:** The main application file containing the Dashboard, Registration, and Traceability logic.
*   **Key Code:**
    *   `onSnapshot()`: A real-time listener that updates the UI instantly when a new transaction is notarized.
    *   `Dashboard Component`: Uses `recharts` to visualize supply chain volume and AI alerts.
    *   `TraceabilityTimeline`: A complex component that renders the vertical history of a batch, pulling data from both Firestore and the simulated Blockchain.
    *   `Update Stage Form`: The core integration point where a user submits data, calls the AI API, gets a Blockchain hash, and updates Firestore in a single atomic flow.

#### `src/index.css`
*   **Function:** Global styling and typography.
*   **Key Code:** Imports the **Inter** font for UI clarity and **JetBrains Mono** for technical blockchain hashes, creating a professional "Industrial Tech" aesthetic.

---

## 3. Integration Logic (The "Thesis Core")
The most important part of your code is the **Sequential Integration Flow** found in `App.tsx`:
1.  **User Input** → 2. **AI Analysis** (Risk Score) → 3. **Blockchain Hashing** (Immutability) → 4. **Firestore Storage** (Persistence) → 5. **Real-time UI Update**.

This flow demonstrates the "Hybrid" nature of your model, showing how AI provides *intelligence* while Blockchain provides *trust*.
