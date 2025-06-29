import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/Core';
import { toast } from 'sonner';

export default function ProjectChat({ projectId, currentUser }: { projectId: number, currentUser: { id: number, name: string } }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    const { data } = await axios.get(`/api/projects/${projectId}/chats`);
    setMessages(data);
  };

  useEffect(() => { fetchMessages(); }, [projectId]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      await axios.post(`/api/projects/${projectId}/chats`, { message });
      setMessage('');
      fetchMessages();
      toast.success('Message sent');
    } catch (err) {
      toast.error('Error sending message');
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Project Team Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto" style={{ maxHeight: 400 }}>
        <div className="space-y-2">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.user_id === currentUser.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-lg px-3 py-2 ${msg.user_id === currentUser.id ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-900'}`}>
                <div className="text-xs font-semibold">{msg.user?.name || 'User'}</div>
                <div>{msg.message}</div>
                <div className="text-[10px] text-gray-500 text-right">{new Date(msg.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <form onSubmit={handleSend} className="flex gap-2 p-2 border-t">
        <Input value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a message..." className="flex-1" />
        <Button type="submit">Send</Button>
      </form>
    </Card>
  );
}
