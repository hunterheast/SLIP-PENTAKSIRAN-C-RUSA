import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { SchoolSettings, StudentRow, GradeScale, SubjectInfo } from './types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firestoreDatabaseId from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

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
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test initial connection to Firestore
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline. Checking network...');
    }
  }
}
testConnection();

export interface PersistentSchoolPayload {
  settings: SchoolSettings;
  students: StudentRow[];
  gradeScale: GradeScale;
  gradeOverrides: Record<string, Record<string, string>>;
  resultOverrides: Record<string, 'LULUS' | 'GAGAL'>;
  subjects: SubjectInfo[];
  adminPassword?: string;
  updatedAt?: string;
}

const SCHOOL_DOC_ID = 'main';
const COLLECTION_NAME = 'school_data';

/**
 * Real-time listener for school data from Cloud Firestore
 */
export function subscribeToSchoolData(
  onData: (data: PersistentSchoolPayload) => void,
  onError?: (err: Error) => void
) {
  const docRef = doc(db, COLLECTION_NAME, SCHOOL_DOC_ID);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as PersistentSchoolPayload;
        onData(data);
      }
    },
    (error) => {
      console.error('Firestore snapshot listener error:', error);
      onError?.(error);
      handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${SCHOOL_DOC_ID}`);
    }
  );
}

import { compressImage } from './utils/imageCompressor';

/**
 * Save school data directly to Cloud Firestore with automatic payload optimization
 */
export async function saveSchoolDataToFirestore(payload: PersistentSchoolPayload): Promise<boolean> {
  const path = `${COLLECTION_NAME}/${SCHOOL_DOC_ID}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, SCHOOL_DOC_ID);

    // Safeguard: Compress school logo if present to ensure payload stays well below 1MB limit (< 35KB)
    let sanitizedSettings = { ...payload.settings };
    if (!sanitizedSettings.schoolLogo) {
      sanitizedSettings.schoolLogo = '';
    } else if (sanitizedSettings.schoolLogo.length > 40000) {
      try {
        const compressedLogo = await compressImage(sanitizedSettings.schoolLogo, 260, 0.78);
        sanitizedSettings.schoolLogo = compressedLogo;
      } catch (err) {
        console.warn('Logo compression error:', err);
      }
    }

    await setDoc(
      docRef,
      {
        ...payload,
        settings: sanitizedSettings,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
}

/**
 * Fetch one-time snapshot of school data
 */
export async function fetchSchoolDataOnce(): Promise<PersistentSchoolPayload | null> {
  const path = `${COLLECTION_NAME}/${SCHOOL_DOC_ID}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, SCHOOL_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as PersistentSchoolPayload;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}
