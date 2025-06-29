import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { type Loan, type Customer } from './types';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };

  if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
    throw new Error('Firebase credentials not found in environment variables. Firebase features will be disabled. Please add FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL to your .env file.');
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: `${serviceAccount.projectId}.appspot.com`,
      });
    } catch (error) {
      console.error('Firebase admin initialization error:', error);
    }
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
    const loans: Loan[] = loansSnapshot.docs.map(doc => {
      const data = doc.data();
      const loanDate = data.loanDate;
      let serializableLoanDate: string;

      // Check if it's a Firestore Timestamp by checking for the toDate method
      if (loanDate && typeof loanDate.toDate === 'function') { 
        serializableLoanDate = loanDate.toDate().toISOString().split('T')[0]; // "YYYY-MM-DD"
      } else {
        serializableLoanDate = String(loanDate || '');
      }
      
      return {
        id: doc.id,
        name: data.name || '',
        amount: data.amount || 0,
        interestRate: data.interestRate || 0,
        loanDate: serializableLoanDate,
        address: data.address || '',
        documents: data.documents || [],
        status: data.status || 'Pending',
        verificationResult: data.verificationResult || null
      };
    });
    return loans;
  } catch(error) {
    console.error("Error fetching loans:", error);
    // Return an empty array if there's an issue, e.g. permissions.
    return [];
  }
};

export const getCustomers = async (): Promise<Customer[]> => {
    if (!db) {
        console.log("Firestore is not initialized. Returning empty array.");
        return [];
    }

    const customersSnapshot = await db.collection('customers').orderBy('name').get();
    const customers = customersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name,
            address: data.address,
            phone: data.phone || '',
            totalLoans: 0,
            totalLoanAmount: 0,
        } as Customer;
    });
    
    if (customers.length === 0) {
        return [];
    }

    const customerMap = new Map(customers.map(c => [c.name, c]));
    const loans = await getLoans();

    loans.forEach(loan => {
        if (customerMap.has(loan.name)) {
            const customer = customerMap.get(loan.name)!;
            customer.totalLoans += 1;
            customer.totalLoanAmount += loan.amount;
        }
    });

    return Array.from(customerMap.values());
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

export const addCustomer = async (customer: Omit<Customer, 'id' | 'totalLoans' | 'totalLoanAmount'>) => {
    if (!db) {
        throw new Error('Firestore is not initialized.');
    }
    const customerQuery = await db.collection('customers').where('name', '==', customer.name).limit(1).get();
    if (!customerQuery.empty) {
        throw new Error('A customer with this name already exists.');
    }
    await db.collection('customers').add(customer);
};

export const addLoan = async (loan: Omit<Loan, 'id' | 'status' | 'documents'> & { documents: { name: string; data: string }[] }): Promise<Loan> => {
  if (!db) {
    throw new Error('Firestore is not initialized.');
  }

  // Check if customer exists, if not create one
  const customerQuery = await db.collection('customers').where('name', '==', loan.name).limit(1).get();
  if (customerQuery.empty) {
      await db.collection('customers').add({ name: loan.name, address: loan.address, phone: '' });
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
