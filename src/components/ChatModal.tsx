'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
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
  const [error, setError] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    async function initChat() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        supabase.realtime.setAuth(session.access_token)
      }

      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: true })

      if (data) setMessages(data)
      setIsLoading(false)
    }
    initChat()

    const channel = supabase.channel(`chat-${transactionId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `transaction_id=eq.${transactionId}`
      }, (payload) => {
        setMessages((prev) => {
          if (prev.some(msg => msg.id === payload.new.id)) return prev;
          const tempIndex = prev.findIndex(msg => 
            msg.id.startsWith('temp-') && 
            msg.content === payload.new.content && 
            msg.sender_id === payload.new.sender_id
          );
          if (tempIndex !== -1) {
            const newMessages = [...prev];
            newMessages[tempIndex] = payload.new;
            return newMessages;
          }
          return [...prev, payload.new];
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [transactionId, supabase])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser) return

    const content = newMessage.trim()
    setNewMessage('')
    setError(null)

    const tempMessage = {
      id: 'temp-' + crypto.randomUUID(), 
      transaction_id: transactionId,
      sender_id: currentUser.id,
      content: content,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, tempMessage])

    const { error: insertError } = await supabase.from('messages').insert({
      transaction_id: transactionId,
      sender_id: currentUser.id,
      content: content,
    })

    if (insertError) {
      setError(`Failed to send: ${insertError.message}`)
      setMessages((prev) => prev.filter(msg => msg.id !== tempMessage.id))
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[600px] animate-in zoom-in-95 duration-200">
        
        <div className="bg-[#0F172A] p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#D97706] font-bold mb-1">Transaction Chat</p>
            <h3 className="text-xl font-bold text-white">{itemName}</h3>
          </div>
          <button type="button" onClick={onClose} className="text-white/70 hover:text-white bg-white/10 p-2 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 p-5 overflow-y-auto bg-[#F8FAFC] space-y-4">
          {isLoading ? (
            <p className="text-center text-[#5C7FA8] font-medium text-sm mt-10">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-[#5C7FA8] font-medium text-sm mt-10">No messages yet. Start the conversation!</p>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === currentUser?.id
              const senderName = isMe ? "You" : (msg.sender_name || "test speaker")

              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && (
                    <div className="flex items-center gap-2 mb-1 ml-1">
                      <div className="w-6 h-6 rounded-full bg-[#D97706] flex items-center justify-center text-[10px] text-white font-bold">
                        {senderName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs text-[#5C7FA8] font-semibold">
                        {senderName}
                      </span>
                    </div>
                  )}

                  <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm font-medium shadow-sm ${
                    isMe 
                      ? 'bg-[#0F172A] text-white rounded-br-sm' 
                      : 'bg-white border border-[#E2E8F0] text-[#0F172A] rounded-bl-sm'
                  } ${msg.id.startsWith('temp-') ? 'opacity-70' : 'opacity-100'}`}>
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

        <div className="p-4 bg-white border-t border-[#E2E8F0]">
          {error && <p className="text-xs text-red-600 mb-2 font-medium bg-red-50 p-2 rounded">{error}</p>}
          <form onSubmit={sendMessage} className="flex gap-2">
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
    </div>
  )
}