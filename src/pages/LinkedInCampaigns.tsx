
"use client"

import { useState } from "react"
import { Inbox, UserCheck, Send, MessageSquare } from "lucide-react"
import { Sidebar } from "@/components/Sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const campaignSubItems = [
  { title: "Inbox", id: "inbox", icon: Inbox },
  { title: "Follow Up", id: "follow-up", icon: UserCheck },
  { title: "Outreach Message", id: "outreach", icon: Send },
  { title: "Message Box", id: "messages", icon: MessageSquare },
]

// Dummy data for visualization
const dummyLinkedInData = {
  inbox: [
    { id: 1, from: "Alex Thompson", company: "Tech Solutions", message: "Interested in your proposal", time: "1 hour ago", read: false },
    { id: 2, from: "Maria Garcia", company: "Innovation Hub", message: "Let's schedule a call", time: "4 hours ago", read: true },
    { id: 3, from: "David Chen", company: "Global Ventures", message: "Thanks for connecting!", time: "1 day ago", read: false },
  ],
  "follow-up": [
    { id: 1, contact: "Jennifer Lee", company: "StartupCo", lastContact: "2 days ago", status: "pending", connectionLevel: "2nd" },
    { id: 2, contact: "Robert Johnson", company: "Enterprise Inc", lastContact: "5 days ago", status: "responded", connectionLevel: "1st" },
    { id: 3, contact: "Emily Davis", company: "Growth Partners", lastContact: "1 week ago", status: "pending", connectionLevel: "3rd" },
  ],
  outreach: [
    { id: 1, campaign: "Executive Outreach", sent: 120, accepted: 45, replied: 18, status: "active" },
    { id: 2, campaign: "Industry Connect", sent: 180, accepted: 72, replied: 28, status: "completed" },
    { id: 3, campaign: "Startup Founders", sent: 95, accepted: 38, replied: 15, status: "active" },
  ],
  messages: [
    { id: 1, thread: "Partnership Discussion", participants: 2, lastMessage: "2 hours ago", unread: 1 },
    { id: 2, thread: "Product Demo Request", participants: 3, lastMessage: "5 hours ago", unread: 0 },
    { id: 3, thread: "Investment Opportunity", participants: 2, lastMessage: "2 days ago", unread: 2 },
  ]
}

export default function LinkedInCampaigns() {
  const [activeSection, setActiveSection] = useState("inbox")

  const renderContent = () => {
    switch (activeSection) {
      case "inbox":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">LinkedIn Inbox</h2>
              <Badge variant="secondary">{dummyLinkedInData.inbox.length} messages</Badge>
            </div>
            <div className="space-y-2">
              {dummyLinkedInData.inbox.map((message) => (
                <Card key={message.id} className={`cursor-pointer hover:bg-slate-50 ${!message.read ? 'border-blue-200 bg-blue-50/30' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium ${!message.read ? 'text-blue-900' : 'text-slate-900'}`}>
                            {message.from}
                          </span>
                          <Badge variant="outline" className="text-xs">{message.company}</Badge>
                          {!message.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                        </div>
                        <p className="text-sm text-slate-600">{message.message}</p>
                      </div>
                      <span className="text-xs text-slate-500">{message.time}</span>
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
              <h2 className="text-2xl font-bold">LinkedIn Follow Up</h2>
              <Badge variant="secondary">{dummyLinkedInData["follow-up"].length} connections</Badge>
            </div>
            <div className="space-y-2">
              {dummyLinkedInData["follow-up"].map((contact) => (
                <Card key={contact.id} className="cursor-pointer hover:bg-slate-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-slate-900">{contact.contact}</h3>
                          <Badge variant="outline" className="text-xs">{contact.connectionLevel}</Badge>
                        </div>
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
              <h2 className="text-2xl font-bold">LinkedIn Outreach</h2>
              <Button>New Campaign</Button>
            </div>
            <div className="space-y-4">
              {dummyLinkedInData.outreach.map((campaign) => (
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
                        <p className="text-2xl font-bold text-green-600">{campaign.accepted}</p>
                        <p className="text-sm text-slate-600">Accepted</p>
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
              <h2 className="text-2xl font-bold">LinkedIn Messages</h2>
              <Badge variant="secondary">{dummyLinkedInData.messages.length} threads</Badge>
            </div>
            <div className="space-y-2">
              {dummyLinkedInData.messages.map((thread) => (
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar />
        
        <SidebarInset className="flex">
          {/* Inner Sidebar for Campaign Sub-items */}
          <div className="w-64 border-r border-slate-200 bg-slate-50/50">
            <div className="p-6">
              <h1 className="text-lg font-semibold text-slate-900 mb-4">LinkedIn Campaigns</h1>
              <nav className="space-y-2">
                {campaignSubItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
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
          <div className="flex-1 p-6">
            {renderContent()}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
