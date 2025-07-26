"use client"

import { useState, useEffect } from "react"
import { Inbox, UserCheck, Send, MessageSquare, ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { apiGet, apiPost } from "@/utils/apiInterceptor"
import { API_BASE_URL } from "@/config/api"
import { useToast } from "@/hooks/use-toast"

const campaignSubItems = [
  // { title: "Inbox", id: "inbox", icon: Inbox },
  // { title: "Follow Up", id: "follow-up", icon: UserCheck },
  // { title: "Outreach Mail", id: "outreach", icon: Send },
  // { title: "Message Box", id: "messages", icon: MessageSquare },
]

// Dummy data for visualization
const dummyEmailData = {
  inbox: [
    { id: 1, from: "john@company.com", subject: "Re: Partnership Opportunity", time: "2 hours ago", read: false, conversation_id: "QWqg7bpciVQap6s8EwPG" },
    { id: 2, from: "sarah@startup.io", subject: "Thanks for reaching out!", time: "5 hours ago", read: true, conversation_id: "ABC123XYZ789" },
    { id: 3, from: "mike@business.com", subject: "Meeting Request", time: "1 day ago", read: false, conversation_id: "DEF456UVW012" },
  ],
  "follow-up": [
    { id: 1, contact: "Alice Johnson", company: "TechCorp", lastContact: "3 days ago", status: "pending" },
    { id: 2, contact: "Bob Smith", company: "StartupXYZ", lastContact: "1 week ago", status: "responded" },
    { id: 3, contact: "Carol White", company: "Enterprise Ltd", lastContact: "2 weeks ago", status: "pending" },
  ],
  outreach: [
    { id: 1, campaign: "Q4 Outreach", sent: 150, opened: 75, replied: 12, status: "active" },
    { id: 2, campaign: "Partnership Drive", sent: 200, opened: 120, replied: 25, status: "completed" },
    { id: 3, campaign: "Product Launch", sent: 300, opened: 180, replied: 35, status: "active" },
  ],
  messages: [
    { id: 1, thread: "Re: Collaboration", participants: 3, lastMessage: "1 hour ago", unread: 2 },
    { id: 2, thread: "Follow-up Discussion", participants: 2, lastMessage: "3 hours ago", unread: 0 },
    { id: 3, thread: "Project Proposal", participants: 4, lastMessage: "1 day ago", unread: 1 },
  ]
}

export default function EmailCampaigns() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState("inbox")
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [conversationData, setConversationData] = useState<any>(null)
  const [loadingConversation, setLoadingConversation] = useState(false)
  const [inboxData, setInboxData] = useState<any[]>([])
  const [loadingInbox, setLoadingInbox] = useState(false)
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [replyContent, setReplyContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [displayedMessagesCount, setDisplayedMessagesCount] = useState(5)

  useEffect(() => {
    const fetchInboxData = async () => {
      setLoadingInbox(true)
      try {
        const response = await apiGet(`${API_BASE_URL}/leads?skip=0&limit=50`)
        const data = await response.json()
        // Filter only leads where mail_sent is true
        const sentEmails = data.filter((lead: any) => lead.mail_sent === true)
        setInboxData(sentEmails)
      } catch (error) {
        console.error("Failed to fetch inbox data:", error)
      } finally {
        setLoadingInbox(false)
      }
    }

    fetchInboxData()
  }, [])

  const handleLeadClick = async (lead: any) => {
    console.log('Clicked lead:', lead)
    console.log('Lead conversation_id:', lead.conversation_id)
    console.log('Lead name:', `${lead.first_name} ${lead.last_name}`)
    
    setSelectedLead(lead)
    setSelectedConversation(lead.conversation_id || "no-conversation")
    setReplyContent(lead.final_email || "")
    setDisplayedMessagesCount(5) // Reset to show last 5 messages
    
    if (lead.conversation_id) {
      setLoadingConversation(true)
      try {
        console.log(`Fetching conversation for ID: ${lead.conversation_id}`)
        const response = await apiGet(`${API_BASE_URL}/emails/${lead.conversation_id}`)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        setConversationData(data)
        
        toast({
          title: "Conversation loaded",
          description: `Found ${data.messages?.length || 0} messages`,
        })
      } catch (error) {
        console.error("Failed to fetch conversation:", error)
        setConversationData({ messages: [] })
        
        toast({
          title: "Error loading conversation",
          description: "Failed to fetch conversation history. You can still send a new message.",
          variant: "destructive",
        })
      } finally {
        setLoadingConversation(false)
      }
    } else {
      setConversationData({ messages: [] })
      console.log(`Lead ${lead.first_name} ${lead.last_name} has no conversation_id`)
    }
  }

  const handleBackToInbox = () => {
    setSelectedConversation(null)
    setConversationData(null)
    setSelectedLead(null)
    setReplyContent("")
  }

  const generateReply = async () => {
    if (!selectedLead) return
    setIsGenerating(true)
    try {
      // Format previous messages for the API
      const previousMessages = conversationData?.messages?.map((message: any) => ({
        sender: "agent", // Assuming messages are from agent based on the API example
        content: message.body
      })) || []

      const requestBody = {
        contact_id: selectedLead.id,
        conversation_id: selectedLead.conversation_id,
        previous_messages: previousMessages
      }

      console.log("Sending data to backend API:", requestBody)

      const response = await apiPost(`${API_BASE_URL}/emails/regenerate`, requestBody)
      const data = await response.json()
      
      console.log("API Response:", data)
      
      setReplyContent(data.regenerated_email || "")
    } catch (error) {
      console.error("Failed to generate email:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const sendReply = async () => {
    if (!selectedLead || !replyContent) return
    setIsSending(true)
    try {
      await apiGet(`${API_BASE_URL}/send-mail/${selectedLead.id}`)
      // Handle success
    } catch (error) {
      console.error("Failed to send email:", error)
    } finally {
      setIsSending(false)
    }
  }

  const renderContent = () => {
    switch (activeSection) {
      case "inbox":
        if (selectedConversation && conversationData) {
          return (
            <div className="flex flex-col h-full max-h-[calc(100vh-100px)]">
              <div className="flex items-center space-x-4 pb-4 border-b">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBackToInbox}
                  className="flex items-center space-x-2 border border-slate-200 hover:bg-slate-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Inbox</span>
                </Button>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{selectedLead?.first_name} {selectedLead?.last_name}</h2>
                  <p className="text-sm text-slate-600">{selectedLead?.email}</p>
                </div>
              </div>
              
              {/* Chat Messages Area */}
              <div className="flex-1 overflow-y-auto space-y-3 py-4">
                {loadingConversation ? (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-slate-500 text-sm">Loading conversation...</p>
                  </div>
                ) : conversationData?.messages && conversationData.messages.length > 0 ? (
                  <>
                    {conversationData.messages.length > displayedMessagesCount && (
                      <div className="flex justify-center pb-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setDisplayedMessagesCount(prev => prev + 5)}
                        >
                          Load More Messages ({conversationData.messages.length - displayedMessagesCount} remaining)
                        </Button>
                      </div>
                    )}
                    {conversationData.messages.slice(-displayedMessagesCount).map((message: any, index: number) => (
                      <div key={message.id || index} className="space-y-2">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-blue-700">
                              {selectedLead?.first_name?.[0]}{selectedLead?.last_name?.[0]}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-slate-900">
                                {selectedLead?.first_name} {selectedLead?.last_name}
                              </span>
                              <span className="text-xs text-slate-500">
                                {new Date(message.date).toLocaleString()}
                              </span>
                            </div>
                            <div className="bg-slate-100 rounded-lg p-3">
                              <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">{message.body}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-slate-500 text-sm">No conversation history found. Start a new conversation below.</p>
                  </div>
                )}
              </div>
              
              {/* Reply Field */}
              <div className="border-t pt-4 space-y-3">
                <Textarea
                  placeholder="Type your reply here..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <div className="flex space-x-2">
                  <Button 
                    onClick={generateReply}
                    disabled={isGenerating}
                    variant="outline"
                    size="sm"
                  >
                    {isGenerating ? "Generating..." : "Generate Email"}
                  </Button>
                  <Button 
                    onClick={sendReply}
                    disabled={isSending || !replyContent}
                    size="sm"
                  >
                    {isSending ? "Sending..." : "Send Email"}
                  </Button>
                </div>
              </div>
            </div>
          )
        }


        if (loadingConversation || loadingInbox) {
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Inbox</h2>
                <Badge variant="secondary">{inboxData.length} emails</Badge>
              </div>
              <div className="flex items-center justify-center py-8">
                <p className="text-slate-500">
                  {loadingConversation ? "Loading conversation..." : "Loading inbox..."}
                </p>
              </div>
            </div>
          )
        }

        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Inbox</h2>
              <Badge variant="secondary">{inboxData.length} emails</Badge>
            </div>
            <div className="space-y-2">
              {inboxData.map((lead) => (
                <Card 
                  key={lead.id} 
                  className="cursor-pointer hover:bg-slate-50 border-blue-200 bg-blue-50/30"
                  onClick={() => handleLeadClick(lead)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-blue-900">
                            {lead.first_name} {lead.last_name}
                          </span>
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                        <p className="text-sm text-slate-600">{lead.email}</p>
                      </div>
                      <span className="text-xs text-slate-500">2 hours ago</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      
      case "follow-up":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Follow Up</h2>
              <Badge variant="secondary">{dummyEmailData["follow-up"].length} contacts</Badge>
            </div>
            <div className="space-y-2">
              {dummyEmailData["follow-up"].map((contact) => (
                <Card key={contact.id} className="cursor-pointer hover:bg-slate-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium text-slate-900">{contact.contact}</h3>
                        <p className="text-sm text-slate-600">{contact.company}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge variant={contact.status === "responded" ? "default" : "outline"}>
                          {contact.status}
                        </Badge>
                        <p className="text-xs text-slate-500">{contact.lastContact}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      
      case "outreach":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Outreach Mail</h2>
              <Button>New Campaign</Button>
            </div>
            <div className="space-y-4">
              {dummyEmailData.outreach.map((campaign) => (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{campaign.campaign}</CardTitle>
                      <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                        {campaign.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{campaign.sent}</p>
                        <p className="text-sm text-slate-600">Sent</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{campaign.opened}</p>
                        <p className="text-sm text-slate-600">Opened</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-600">{campaign.replied}</p>
                        <p className="text-sm text-slate-600">Replied</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      
      case "messages":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Message Box</h2>
              <Badge variant="secondary">{dummyEmailData.messages.length} threads</Badge>
            </div>
            <div className="space-y-2">
              {dummyEmailData.messages.map((thread) => (
                <Card key={thread.id} className="cursor-pointer hover:bg-slate-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-slate-900">{thread.thread}</h3>
                          {thread.unread > 0 && (
                            <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                              {thread.unread}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">{thread.participants} participants</p>
                      </div>
                      <span className="text-xs text-slate-500">{thread.lastMessage}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      
      default:
        return <div>Select a section</div>
    }
  }

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Header with Back Button and Email Campaigns Navigation */}
      <div className="border-b border-slate-200 bg-white">
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 border border-slate-200 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <h1 className="text-lg font-semibold text-slate-900">Email Campaigns</h1>
          </div>
          
          <nav className="flex space-x-2">
            {campaignSubItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeSection === item.id
                    ? 'bg-blue-100 text-blue-900 border border-blue-200'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.title}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {renderContent()}
      </div>
    </div>
  )
}
