'use client'

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store';
import type { Message } from '@/types';
import Messages from '@/components/Messages';
import { collection, query, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/tools/firebase';
import { addMessage } from '@/store/thread';
import { useParams } from 'next/navigation';

export default function VisitPage() {
  const params = useParams<{ slug: string }>()
  const sessionId = params.slug;
  const dispatch = useDispatch();
  const messages = useSelector((state: RootState) => state.thread.messages);
  const [chatDuration, setChatDuration] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionItems, setActionItems] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchActionItems = async () => {
      const docRef = doc(db, "actionItems", sessionId);
      const docSnap = await getDoc(docRef);
      
      
      if (!docSnap.exists()) {
        setTimeout(fetchActionItems, 1000);
        return;
      }

      const data = docSnap.data() as any;
      for (const item in data.analysis) {
        if (data.analysis[item]) {
          setActionItems((prev) => [...prev, item]);
        }
      }
    };
    
    fetchActionItems();
  }, []);

  // Load messages from Firestore
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const messagesRef = collection(db, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'asc'));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach( (doc) => {
          const messageData =  doc.data() as Omit<Message, 'id'>;
          dispatch(addMessage({
            id: doc.id,
            isClinician: messageData.isClinician,
            original: messageData.original,
            translated: messageData.translated,
            language: messageData.language,
            createdAt: messageData.createdAt
          }));
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [dispatch]);

  // Calculate chat duration
  useEffect(() => {
    if (messages.length >= 2) {
      const firstMessage = messages[0].createdAt?.toMillis();
      const lastMessage = messages[messages.length - 1].createdAt?.toMillis();
      
      if (firstMessage && lastMessage) {
        const firstTime = messages[0].createdAt?.toDate().getTime();
        const lastTime = messages[messages.length - 1].createdAt?.toDate().getTime();
        const durationMs = lastTime - firstTime;
        const minutes = Math.floor(durationMs / 60000);
        const seconds = Math.floor((durationMs % 60000) / 1000);
        setChatDuration(`${minutes}m ${seconds}s`);
      }
    }
  }, [messages]);

  return (
    <div className="p-4">
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">Chat Statistics</h2>
        {isLoading ? (
          <p>Loading messages...</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Total Messages</p>
              <p className="text-2xl font-bold">{messages.length}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Chat Duration</p>
              <p className="text-2xl font-bold">{chatDuration || '-'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Avg. Time Between Messages</p>
              <p className="text-2xl font-bold">
                {messages.length >= 2 && chatDuration
                  ? `${Math.round(Number(chatDuration.split('m')[0]) * 60 / messages.length)}s` 
                  : '-'}
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">Action Items</h2>
        <div className="bg-gray-50 p-4 rounded-md">
          {actionItems.length > 0 ? (
            <ul>
              {actionItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No action items</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Messages sendClientEvent={() => {}} />
      </div>
    </div>
  );
}
