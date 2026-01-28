import { Injectable, WritableSignal } from '@angular/core';
import { firestore } from './firebase.service';
import { collection, onSnapshot, doc, getDoc, setDoc, Firestore, QuerySnapshot, DocumentData, deleteDoc, addDoc } from 'firebase/firestore';
import { MOCK_DATA } from '../data/mock-data';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private firestore: Firestore = firestore;

  // Generic Listener for a Firestore Collection, returns data as an object map
  listenToPath<T>(path: string, callback: (data: T) => void, errorCallback?: (error: any) => void) {
    const colRef = collection(this.firestore, path);
    
    // FIX: Explicitly type snapshot as QuerySnapshot to ensure access to .docs property
    return onSnapshot(colRef, (snapshot: QuerySnapshot<DocumentData, DocumentData>) => {
      const dataObject = snapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data();
        return acc;
      }, {} as { [key: string]: any });
      callback(dataObject as T);
    }, (error) => {
      // Mock data fallback logic, returns the object directly
      const mock = (MOCK_DATA as any)[path];
      if (mock && typeof mock === 'object' && !Array.isArray(mock)) {
          callback(mock as T);
          return; 
      }
      
      // FIX: Combine into a single string to prevent circular structure errors when logging complex Firebase errors.
      console.error(`Firestore read error on path '${path}': ${error?.message || 'Unknown Error'}`);
      
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
      // The error is already logged by listenToPath, which is now robust against circular errors.
      // We just need to handle the state update here.
      targetSignal.set([]);
    });
  }

  // Get a single document
  async getDocument(path: string, id: string): Promise<any> {
    try {
      const docRef = doc(this.firestore, path, id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        // FIX: Ensure data is an object before spreading to satisfy TypeScript strictness
        const data = snapshot.data();
        return { id: snapshot.id, ...(data ?? {}) };
      }
      return null;
    } catch (error) {
       // Mock fallback for single doc
       const mockCollection = (MOCK_DATA as any)[path];
       if (mockCollection) {
          if (Array.isArray(mockCollection)) {
             return mockCollection.find((i: any) => i.id === id);
          } else {
             return mockCollection[id] ? { id, ...mockCollection[id] } : null;
          }
       }
       throw error;
    }
  }

  // Listen to a single document
  listenToDocument<T>(path: string, id: string, callback: (data: T | null) => void) {
    const docRef = doc(this.firestore, path, id);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as T);
      } else {
        // Fallback to mock if doc doesn't exist in Firestore (for development)
        const mockCollection = (MOCK_DATA as any)[path];
        if (mockCollection && mockCollection[id]) {
            callback({ id, ...mockCollection[id] } as T);
        } else {
            callback(null);
        }
      }
    }, (error) => {
       // FIX: Combine into a single string to prevent circular structure errors.
       console.error(`Error listening to doc '${path}/${id}': ${error.message || 'Unknown error'}`);
       // Fallback on error
       const mockCollection = (MOCK_DATA as any)[path];
        if (mockCollection && mockCollection[id]) {
            callback({ id, ...mockCollection[id] } as T);
        } else {
            callback(null);
        }
    });
  }

  // Add a document to a collection
  async addDocument(path: string, data: any): Promise<string> {
    const colRef = collection(this.firestore, path);
    const docRef = await addDoc(colRef, data);
    return docRef.id;
  }

  // Update a document
  async updateDocument(path: string, id: string, data: any): Promise<void> {
    // Update internal Mock Data for session persistence
    // This ensures that even if the backend write fails (permissions), the app acts as if it succeeded for the session
    const mockCollection = (MOCK_DATA as any)[path];
    if (mockCollection) {
        if (Array.isArray(mockCollection)) {
            const index = mockCollection.findIndex((i: any) => i.id === id);
            if (index >= 0) {
                mockCollection[index] = { ...mockCollection[index], ...data };
            }
        } else if (mockCollection[id]) {
            mockCollection[id] = { ...mockCollection[id], ...data };
        }
    }

    // Directly return the promise so the caller can handle try/catch and specific error codes
    const docRef = doc(this.firestore, path, id);
    await setDoc(docRef, data, { merge: true });
  }

  // Delete a document
  async deleteDocument(path: string, id: string): Promise<void> {
    // Also remove from mock data for local consistency
    const mockCollection = (MOCK_DATA as any)[path];
    if (mockCollection && mockCollection[id]) {
      delete mockCollection[id];
    }
    
    const docRef = doc(this.firestore, path, id);
    await deleteDoc(docRef);
  }
}