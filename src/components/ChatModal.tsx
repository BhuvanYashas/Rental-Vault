'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ChatModal({
  transactionId,
  itemName,
  onClose,
}: {
  transactionId: string
  itemName: string
  onClose: () => void
}) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Fetch messages and user
  useEffect(() => {
    async function initChat() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: true })

      if (data) setMessages(data)
      setIsLoading(false)
      scrollToBottom()
    }
    initChat()

    // Subscribe to new messages in real-time
    const channel = supabase.channel(`chat-${transactionId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `transaction_id=eq.${transactionId}`
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new])
        scrollToBottom()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [transactionId])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser) return

    const content = newMessage.trim()
    setNewMessage('')

    await supabase.from('messages').insert({
      transaction_id: transactionId,
      sender_id: currentUser.id,
      content: content,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[600px] animate-in zoom-in-95 duration-200">
        
        {/* Chat Header */}
        <div className="bg-[#0F172A] p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#D97706] font-bold mb-1">Transaction Chat</p>
            <h3 className="text-xl font-bold text-white">{itemName}</h3>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white bg-white/10 p-2 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-5 overflow-y-auto bg-[#F8FAFC] space-y-4">
          {isLoading ? (
            <p className="text-center text-[#5C7FA8] font-medium text-sm mt-10">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-[#5C7FA8] font-medium text-sm mt-10">No messages yet. Start the conversation!</p>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === currentUser?.id
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm font-medium shadow-sm ${
                    isMe 
                      ? 'bg-[#0F172A] text-white rounded-br-sm' 
                      : 'bg-white border border-[#E2E8F0] text-[#0F172A] rounded-bl-sm'
                  }`}>
                    {msg.content}
                    <p className={`text-[10px] mt-1.5 opacity-60 ${isMe ? 'text-right' : 'text-left'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={sendMessage} className="p-4 bg-white border-t border-[#E2E8F0] flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#0F172A] focus:outline-none focus:border-[#0F172A]"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="bg-[#D97706] text-white p-3 rounded-xl hover:bg-[#B45309] transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </form>
      </div>
    </div>
  )
}