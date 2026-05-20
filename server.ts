import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import { ethers } from "ethers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  // AI Anomaly Detection Proxy
  app.post("/api/ai/detect", async (req, res) => {
    try {
      const transactionData = req.body;
      
      // In a real production environment, this would call the FastAPI service
      // For this prototype, we implement a robust simulation logic
      // that mimics an Isolation Forest / Random Forest result
      
      let anomalyScore = 0.1; // Default low risk
      
      // Simple heuristic for demo: 
      // 1. Weight discrepancy > 5%
      // 2. Unusual time of day (e.g. midnight)
      // 3. Rapid succession of stages
      
      if (transactionData.weightAtStage && transactionData.originalWeight) {
        const diff = Math.abs(transactionData.weightAtStage - transactionData.originalWeight);
        const percentDiff = (diff / transactionData.originalWeight) * 100;
        if (percentDiff > 5) anomalyScore += 0.5;
      }
      
      // Random noise to simulate AI variance
      anomalyScore += Math.random() * 0.2;
      
      const isSuspicious = anomalyScore > 0.6;
      
      res.json({
        anomalyScore: Math.min(anomalyScore, 1.0),
        isSuspicious,
        classification: isSuspicious ? "suspicious" : "normal",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("AI Service Error:", error);
      res.status(500).json({ error: "AI Service Unavailable" });
    }
  });

  // Blockchain Notarization Proxy
  app.post("/api/blockchain/notarize", async (req, res) => {
    try {
      const { dataHash } = req.body;
      
      // In a real environment, we would use a private key from env
      // For the demo, we simulate the blockchain transaction hash
      // as we don't have a live Ethereum node/wallet configured here
      
      const simulatedTxHash = "0x" + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
      
      res.json({
        blockchainHash: simulatedTxHash,
        status: "confirmed",
        blockNumber: Math.floor(Math.random() * 1000000)
      });
    } catch (error) {
      res.status(500).json({ error: "Blockchain Service Unavailable" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
