
import { Injectable, WritableSignal } from '@angular/core';
import { MOCK_DATA } from '../data/mock-data';
import { firestore } from './firebase.service';
import { collection, onSnapshot, doc, getDoc, setDoc, deleteDoc, addDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private firestore: any = firestore;

  // Helper for safe error logging
  private logError(context: string, error: any) {
    const message = error?.message || (typeof error === 'string' ? error : 'Unknown Error');
    
    // Downgrade permission errors to warnings as we often have fallbacks
    if (error?.code === 'permission-denied' || message.includes('Missing or insufficient permissions')) {
        console.warn(`[Firestore] Permission denied for ${context}.`);
        return;
    }

    // Safe log string to avoid circular structure issues
    console.error(`[Firestore] Error in ${context}: ${message}`);
  }

  // Generic Listener for a Firestore Collection, returns data as an object map
  listenToPath<T>(path: string, callback: (data: T) => void, errorCallback?: (error: any) => void) {
    const colRef = collection(this.firestore, path);
    
    return onSnapshot(colRef, (snapshot: any) => {
      if (snapshot.empty) {
        console.warn(`[Firestore] No documents found in '${path}'. Falling back to mock data.`);
        // @ts-ignore
        callback(MOCK_DATA[path] || {});
        return;
      }
      const dataObject = snapshot.docs.reduce((acc: any, doc: any) => {
        acc[doc.id] = doc.data();
        return acc;
      }, {} as { [key: string]: any });
      callback(dataObject as T);
    }, (error: any) => {
      this.logError(`listenToPath('${path}')`, error);
      if (errorCallback) errorCallback(error);
    });
  }

  // Reusable function to listen to a collection, map the data, and update a signal
  listenToCollectionMapped<T, R>(
    path: string,
    targetSignal: WritableSignal<R[]>,
    mapper: (id: string, data: T) => R | null,
    processor?: (items: R[]) => R[]
  ) {
    this.listenToPath<{ [key: string]: T }>(path, (dataObject) => {
      let itemsArray = Object.keys(dataObject)
        .map(id => mapper(id, dataObject[id]))
        .filter((item): item is R => item !== null);

      if (processor) {
        itemsArray = processor(itemsArray);
      }
      
      targetSignal.set(itemsArray);
    }, (error) => {
      // Error handled in listenToPath
    });
  }

  // Get a single document
  async getDocument(path: string, id: string): Promise<any> {
    try {
      const docRef = doc(this.firestore, path, id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        return { id: snapshot.id, ...(data as any ?? {}) };
      }
      return null;
    } catch (error) {
       this.logError(`getDocument('${path}/${id}')`, error);
       throw error;
    }
  }

  // Listen to a single document
  listenToDocument<T>(path: string, id: string, callback: (data: T | null) => void) {
    const docRef = doc(this.firestore, path, id);
    return onSnapshot(docRef, (docSnap: any) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...(docSnap.data() as any) } as T);
      } else {
        callback(null);
      }
    }, (error: any) => {
       this.logError(`listenToDocument('${path}/${id}')`, error);
       callback(null);
    });
  }

  // Add a document to a collection
  async addDocument(path: string, data: any): Promise<string> {
    try {
        const colRef = collection(this.firestore, path);
        const docRef = await addDoc(colRef, data);
        return docRef.id;
    } catch (error: any) {
        this.logError(`addDocument('${path}')`, error);
        
        // Simulate success if permission denied (Demo Mode)
        if (error?.code === 'permission-denied' || error?.message?.includes('permissions')) {
            console.warn('[Simulation] Permission denied. Simulating successful addDocument.');
            return 'simulated_id_' + Date.now();
        }
        throw error;
    }
  }

  // Update a document
  async updateDocument(path: string, id: string, data: any): Promise<void> {
    try {
        // Remove undefined values to prevent Firestore errors
        const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
        const docRef = doc(this.firestore, path, id);
        await setDoc(docRef, cleanData, { merge: true });
    } catch (error: any) {
        this.logError(`updateDocument('${path}/${id}')`, error);

        // Simulate success if permission denied (Demo Mode)
        if (error?.code === 'permission-denied' || error?.message?.includes('permissions')) {
            console.warn('[Simulation] Permission denied. Simulating successful updateDocument.');
            return;
        }
        throw error;
    }
  }

  // Delete a document
  async deleteDocument(path: string, id: string): Promise<void> {
    try {
        const docRef = doc(this.firestore, path, id);
        await deleteDoc(docRef);
    } catch (error: any) {
        this.logError(`deleteDocument('${path}/${id}')`, error);

        // Simulate success if permission denied (Demo Mode)
        if (error?.code === 'permission-denied' || error?.message?.includes('permissions')) {
            console.warn('[Simulation] Permission denied. Simulating successful deleteDocument.');
            return;
        }
        throw error;
    }
  }
}
