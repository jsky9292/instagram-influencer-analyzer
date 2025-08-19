import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Layout } from '../components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useChat } from '../hooks/useApi'
import { formatDateTime } from '../lib/utils'
import { 
  MessageCircle, 
  Send, 
  Paperclip, 
  Search,
  MoreVertical,
  Phone,
  Video,
  FileText
} from 'lucide-react'

// Mock data for demonstration
const mockConversations = [
  {
    id: '1',
    brand_name: '브랜드 A',
    influencer_name: '김인플루',
    campaign_title: '신제품 홍보 캠페인',
    last_message: '안녕하세요! 협업 제안에 관심이 있어서 연락드렸습니다.',
    last_message_at: '2025-01-17T10:30:00Z',
    unread_count: 2,
    status: 'ACTIVE'
  },
  {
    id: '2',
    brand_name: '브랜드 B',
    influencer_name: '요리왕이준',
    campaign_title: '월간 맛집 탐방',
    last_message: '제안서 검토 후 다시 연락드리겠습니다.',
    last_message_at: '2025-01-16T15:45:00Z',
    unread_count: 0,
    status: 'ACTIVE'
  }
]

const mockMessages = [
  {
    id: '1',
    sender_id: 'brand-1',
    sender_name: '브랜드 A',
    message_type: 'TEXT',
    content: '안녕하세요! 협업 제안에 관심이 있어서 연락드렸습니다.',
    created_at: '2025-01-17T09:00:00Z',
    is_read: true
  },
  {
    id: '2',
    sender_id: 'influencer-1',
    sender_name: '김인플루',
    message_type: 'TEXT',
    content: '안녕하세요! 관심 있게 보았습니다. 자세한 내용 듣고 싶어요.',
    created_at: '2025-01-17T09:15:00Z',
    is_read: true
  },
  {
    id: '3',
    sender_id: 'brand-1',
    sender_name: '브랜드 A',
    message_type: 'FILE',
    content: '캠페인 상세 제안서입니다.',
    file_name: '캠페인_제안서.pdf',
    created_at: '2025-01-17T09:30:00Z',
    is_read: true
  },
  {
    id: '4',
    sender_id: 'influencer-1',
    sender_name: '김인플루',
    message_type: 'TEXT',
    content: '제안서 잘 보았습니다! 몇 가지 질문이 있는데 통화로 얼기나 해볼까요?',
    created_at: '2025-01-17T10:30:00Z',
    is_read: false
  }
]

export function ChatPage() {
  const { userProfile } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0])
  const [messageText, setMessageText] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  
  const { sendMessage, isSendingMessage } = useChat()
  
  const handleSendMessage = async () => {
    if (!messageText.trim()) return
    
    // In real implementation, use actual conversation ID
    // await sendMessage({
    //   conversationId: selectedConversation.id,
    //   message: messageText
    // })
    
    console.log('Send message:', messageText)
    setMessageText('')
  }
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }
  
  return (
    <Layout>
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200 bg-white flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">대화</h2>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="대화 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {mockConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation.id === conversation.id ? 'bg-purple-50 border-l-4 border-l-purple-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {(userProfile?.user_type === 'INFLUENCER' ? conversation.brand_name : conversation.influencer_name).charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {userProfile?.user_type === 'INFLUENCER' ? conversation.brand_name : conversation.influencer_name}
                      </h3>
                      <p className="text-xs text-gray-500">{conversation.campaign_title}</p>
                    </div>
                  </div>
                  {conversation.unread_count > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {conversation.unread_count}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate">{conversation.last_message}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDateTime(conversation.last_message_at)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {(userProfile?.user_type === 'INFLUENCER' ? selectedConversation.brand_name : selectedConversation.influencer_name).charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {userProfile?.user_type === 'INFLUENCER' ? selectedConversation.brand_name : selectedConversation.influencer_name}
                      </h3>
                      <p className="text-sm text-gray-500">{selectedConversation.campaign_title}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {mockMessages.map((message) => {
                  const isCurrentUser = message.sender_id.includes(userProfile?.user_type?.toLowerCase() || '')
                  
                  return (
                    <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isCurrentUser 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}>
                        {message.message_type === 'FILE' ? (
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <div>
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs opacity-75">{message.file_name}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm">{message.content}</p>
                        )}
                        <p className={`text-xs mt-1 opacity-75 ${
                          isCurrentUser ? 'text-purple-100' : 'text-gray-500'
                        }`}>
                          {formatDateTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-end space-x-2">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <div className="flex-1">
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="메시지를 입력하세요..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows={2}
                    />
                  </div>
                  <Button 
                    onClick={handleSendMessage}
                    loading={isSendingMessage}
                    disabled={!messageText.trim() || isSendingMessage}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">대화를 선택하세요</h3>
                <p className="text-gray-600">왼쪽에서 대화를 선택하여 메시지를 주고받으세요.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}