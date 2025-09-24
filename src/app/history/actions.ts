
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp, orderBy, limit, doc, setDoc } from 'firebase/firestore';
import { z } from 'zod';

const MessageSchema = z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
});

const ChatSessionSchema = z.object({
    userId: z.string(),
    messages: z.array(MessageSchema),
});

export async function saveChatSession(userId: string, messages: z.infer<typeof MessageSchema>[]) {
    if (!userId) {
        return { success: false, error: 'User not authenticated.' };
    }
    
    try {
        // Find existing chat by first user message
        const title = messages[0]?.content.substring(0, 30) || 'New Chat';
        const q = query(
            collection(db, 'chatSessions'),
            where('userId', '==', userId),
            where('title', '==', title),
            limit(1)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // Update existing chat
            const docRef = querySnapshot.docs[0].ref;
            await setDoc(docRef, {
                messages,
                updatedAt: serverTimestamp(),
            }, { merge: true });
        } else {
            // Create new chat
            await addDoc(collection(db, 'chatSessions'), {
                userId,
                messages,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                title: messages[0]?.content.substring(0, 30) || 'New Chat'
            });
        }
        return { success: true };
    } catch (error) {
        console.error('Error saving chat session: ', error);
        return { success: false, error: 'Failed to save chat session.' };
    }
}

export async function getChatHistory(userId: string) {
    if (!userId) {
        return { success: false, error: 'User not authenticated.', history: [] };
    }

    try {
        const q = query(
            collection(db, 'chatSessions'),
            where('userId', '==', userId),
            orderBy('updatedAt', 'desc'),
            limit(50)
        );

        const querySnapshot = await getDocs(q);
        const history = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title,
                createdAt: data.createdAt.toDate().toISOString(),
                updatedAt: data.updatedAt.toDate().toISOString(),
                messages: data.messages
            };
        });
        
        return { success: true, history };
    } catch (error) {
        console.error('Error getting chat history: ', error);
        return { success: false, error: 'Failed to retrieve chat history.', history: [] };
    }
}
