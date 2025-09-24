
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp, orderBy, limit, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { z } from 'zod';

const MessageSchema = z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
});

const ChatSessionInputSchema = z.object({
    userId: z.string(),
    messages: z.array(MessageSchema),
    chatId: z.string().optional(),
});

type ChatSessionInput = z.infer<typeof ChatSessionInputSchema>;

export async function saveChatSession(input: ChatSessionInput) {
    const parseResult = ChatSessionInputSchema.safeParse(input);
    if (!parseResult.success) {
        console.error('Invalid input for saveChatSession:', parseResult.error);
        return { success: false, error: 'Invalid input.' };
    }
    const { userId, messages, chatId } = parseResult.data;

    if (!userId) {
        return { success: false, error: 'User not authenticated.' };
    }
    
    try {
        let currentChatId = chatId;
        
        if (currentChatId) {
            // A chat already exists, update it with the new messages
            const docRef = doc(db, 'chatSessions', currentChatId);
            await updateDoc(docRef, {
                messages,
                updatedAt: serverTimestamp(),
            });
            return { success: true, chatId: currentChatId };
        } else {
            // This is a new chat, create a new document
            const title = messages.find(m => m.role === 'user')?.content.substring(0, 30) || 'New Chat';
            const newDocRef = await addDoc(collection(db, 'chatSessions'), {
                userId,
                messages,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                title,
            });
            return { success: true, chatId: newDocRef.id };
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error saving chat session: ', errorMessage);
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
            const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date();
            const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
            return {
                id: doc.id,
                title: data.title || 'Chat',
                createdAt: createdAt.toISOString(),
                updatedAt: updatedAt.toISOString(),
                messages: data.messages || []
            };
        });
        
        return { success: true, history };
    } catch (error) {
        console.error('Error getting chat history: ', error);
        return { success: false, error: 'Failed to retrieve chat history.', history: [] };
    }
}
