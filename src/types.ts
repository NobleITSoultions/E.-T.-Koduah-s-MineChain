export type UserRole = 'miner' | 'transport' | 'warehouse' | 'exporter' | 'regulator' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  createdAt: any;
}

export interface Batch {
  id: string;
  mineralType: string;
  weight: number;
  origin: string;
  createdBy: string;
  createdAt: any;
  currentStage: string;
  status: 'active' | 'flagged' | 'completed';
  lastUpdated: any;
}

export interface Transaction {
  id: string;
  batchId: string;
  stage: string;
  actor: string;
  timestamp: any;
  location: string;
  weightAtStage: number;
  anomalyScore: number;
  isSuspicious: boolean;
  blockchainHash: string;
  dataHash: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: any[];
  }
}
