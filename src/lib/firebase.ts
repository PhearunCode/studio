import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { type Loan } from './types';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };

    if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
        console.warn('Firebase service account credentials are not fully set in environment variables. Firebase features will be disabled.');
    } else {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          storageBucket: `${serviceAccount.projectId}.appspot.com`,
        });
    }
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}


const db = getApps().length ? getFirestore() : null;
const storage = getApps().length ? getStorage().bucket() : null;

export const getLoans = async (): Promise<Loan[]> => {
  if (!db) {
    console.log("Firestore is not initialized. Returning empty array.");
    return [];
  }
  try {
    const loansSnapshot = await db.collection('loans').orderBy('loanDate', 'desc').get();
    if (loansSnapshot.empty) {
      return [];
    }
    return loansSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Loan));
  } catch(error) {
    console.error("Error fetching loans:", error);
    // Return an empty array if there's an issue, e.g. permissions.
    return [];
  }
};

export const uploadFile = async (file: { name: string; data: string }, path: string): Promise<{ name: string; url: string }> => {
    if (!storage) {
        throw new Error('Firebase Storage is not initialized.');
    }
    const mimeType = file.data.match(/data:(.*);base64,/)?.[1];
    if (!mimeType) {
        throw new Error('Invalid data URI format for file upload.');
    }

    const base64Data = file.data.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    const filePath = `${path}/${Date.now()}_${file.name}`; // Add timestamp to avoid overwrites
    const fileUpload = storage.file(filePath);

    await fileUpload.save(buffer, {
        metadata: {
            contentType: mimeType,
        },
    });

    await fileUpload.makePublic();
    return { name: file.name, url: fileUpload.publicUrl() };
};

export const addLoan = async (loan: Omit<Loan, 'id' | 'status' | 'documents'> & { documents: { name: string; data: string }[] }): Promise<Loan> => {
  if (!db) {
    throw new Error('Firestore is not initialized.');
  }
  const newDocRef = db.collection('loans').doc();
  const newId = newDocRef.id;

  const uploadedDocuments = await Promise.all(
      loan.documents.map(doc => uploadFile(doc, `loans/${newId}`))
  );

  const newLoan: Omit<Loan, 'id'> = {
    ...loan,
    status: 'Pending',
    documents: uploadedDocuments,
  };

  await newDocRef.set(newLoan);

  return { ...newLoan, id: newId };
};
