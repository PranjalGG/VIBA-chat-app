
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import VoiceOverlay from './components/VoiceOverlay';
import SettingsView from './components/SettingsView';
import LoginView from './components/LoginView';
import StoryOverlay from './components/StoryOverlay';
import { Contact, Message, MessageSender, ChatSession } from './types';

const INITIAL_CONTACTS: Contact[] = [
  { 
    id: '1', 
    name: 'VIBA AI', 
    status: 'online', 
    avatar: 'https://picsum.photos/seed/viba/200', 
    lastMessage: 'Welcome to VIBA! How can I help today?', 
    hasStory: true,
    stories: [{ id: 's1', type: 'text', content: 'The future of AI is here! 🚀' }]
  },
  { 
    id: '2', 
    name: 'Sarah Chen', 
    status: 'online', 
    avatar: 'https://picsum.photos/seed/sarah/200', 
    lastMessage: 'The project is looking great!', 
    hasStory: true,
    stories: [{ id: 's2', type: 'text', content: 'Check out this sunset! 🌅' }]
  },
  { 
    id: '3', 
    name: 'Support', 
    status: 'online', 
    avatar: 'https://picsum.photos/seed/support/200', 
    lastMessage: 'System online.', 
    hasStory: false 
  }
];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [viewingStoryContactId, setViewingStoryContactId] = useState<string | null>(null);
  
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    avatar: 'https://picsum.photos/seed/user123/200',
    note: 'Living the VIBA life 🚀',
    stories: [] as { id: string; type: 'text' | 'image'; content: string }[]
  });
  
  const [sessions, setSessions] = useState<Record<string, ChatSession>>({
    '1': { contactId: '1', messages: [] },
    '2': { contactId: '2', messages: [] },
    '3': { contactId: '3', messages: [] },
  });
  
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'chats' | 'settings'>('chats');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = (name: string, email: string) => {
    setUserProfile(prev => ({ ...prev, name, email }));
    setIsAuthenticated(true);
  };

  const handleSyncContacts = async () => {
    try {
      if ('contacts' in navigator && 'select' in (navigator as any).contacts) {
        const selectedContacts = await (navigator as any).contacts.select(['name', 'tel'], { multiple: true });
        const newContacts: Contact[] = selectedContacts.map((c: any, index: number) => ({
          id: `synced-${Date.now()}-${index}`,
          name: c.name?.[0] || 'Unknown',
          status: 'offline',
          avatar: `https://picsum.photos/seed/${encodeURIComponent(c.name?.[0] || index)}/200`,
          lastMessage: 'Synced via Phone',
          hasStory: Math.random() > 0.7,
          stories: Math.random() > 0.7 ? [{ id: `s-${index}`, type: 'text', content: 'I love VIBA! 😍' }] : []
        }));
        setContacts(prev => [...prev, ...newContacts]);
        setSessions(prev => {
          const s = { ...prev };
          newContacts.forEach(c => s[c.id] = { contactId: c.id, messages: [] });
          return s;
        });
      } else {
        alert("Syncing requires a compatible Android browser.");
      }
    } catch (err) { console.error(err); }
  };

  const addMessage = useCallback((contactId: string, text: string, sender: MessageSender, mediaUrl?: string) => {
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      sender, text, timestamp: new Date(), mediaUrl
    };
    setSessions(prev => ({
      ...prev,
      [contactId]: { ...prev[contactId], messages: [...(prev[contactId]?.messages || []), newMessage] }
    }));
  }, []);

  const clearChat = useCallback((contactId: string) => {
    setSessions(prev => ({ ...prev, [contactId]: { ...prev[contactId], messages: [] } }));
  }, []);

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  const showChatView = isMobile && activeContactId !== null && activeTab === 'chats';
  const contactViewingStory = contacts.find(c => c.id === viewingStoryContactId);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <div className={`${showChatView ? 'hidden' : 'flex'} md:flex w-full md:w-80 flex-col bg-white h-full border-r border-slate-200`}>
        {activeTab === 'chats' ? (
          <Sidebar 
            contacts={contacts} 
            activeContactId={activeContactId || ''} 
            onSelectContact={setActiveContactId} 
            onSync={handleSyncContacts}
            onViewStory={setViewingStoryContactId}
          />
        ) : (
          <SettingsView 
            profile={userProfile} 
            onUpdateProfile={(update) => setUserProfile(prev => ({ ...prev, ...update }))}
            onBack={!isMobile ? () => setActiveTab('chats') : undefined}
          />
        )}
        
        <div className="md:hidden h-16 border-t border-slate-200 bg-white flex items-center justify-around px-4 shrink-0">
          <button onClick={() => { setActiveTab('chats'); setActiveContactId(null); }} className={`flex flex-col items-center gap-1 flex-1 transition-all ${activeTab === 'chats' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
            <i className={`fa-solid ${activeTab === 'chats' ? 'fa-comment' : 'fa-comment-dots'} text-xl`}></i>
            <span className="text-[10px] font-bold">Chats</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center gap-1 flex-1 transition-all ${activeTab === 'settings' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
            <i className={`fa-solid ${activeTab === 'settings' ? 'fa-user' : 'fa-user-gear'} text-xl`}></i>
            <span className="text-[10px] font-bold">Settings</span>
          </button>
        </div>
      </div>

      <div className={`${!showChatView && isMobile ? 'hidden' : 'flex'} flex-1 flex flex-col min-w-0 bg-white`}>
        {activeTab === 'settings' && !isMobile ? (
          <SettingsView 
            profile={userProfile} 
            onUpdateProfile={(update) => setUserProfile(prev => ({ ...prev, ...update }))}
          />
        ) : activeContactId ? (
          <ChatWindow 
            contact={contacts.find(c => c.id === activeContactId)!} 
            messages={sessions[activeContactId]?.messages || []} 
            onSendMessage={(text, media) => addMessage(activeContactId, text, MessageSender.USER, media)}
            onAiRespond={(text) => addMessage(activeContactId, text, MessageSender.AI)}
            onClearChat={() => clearChat(activeContactId)}
            onStartVoice={() => setIsVoiceActive(true)}
            onBack={isMobile ? () => setActiveContactId(null) : undefined}
          />
        ) : (
          <div className="hidden md:flex flex-col items-center justify-center flex-1 text-slate-400 bg-slate-50">
            <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
              <i className="fa-solid fa-bolt-lightning text-4xl text-indigo-500"></i>
            </div>
            <h2 className="text-xl font-bold text-slate-700">VIBA Messenger</h2>
            <p className="text-sm">Select a contact to start chatting</p>
          </div>
        )}
      </div>

      {isVoiceActive && activeContactId && (
        <VoiceOverlay onClose={() => setIsVoiceActive(false)} contact={contacts.find(c => c.id === activeContactId)!} />
      )}

      {contactViewingStory && (
        <StoryOverlay 
          contact={contactViewingStory} 
          onClose={() => setViewingStoryContactId(null)} 
        />
      )}
    </div>
  );
};

export default App;
