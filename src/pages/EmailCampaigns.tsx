
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
  { title: "Outreach Mail", id: "outreach", icon: Send },
  { title: "Message Box", id: "messages", icon: MessageSquare },
]

// Dummy data for visualization
const dummyEmailData = {
  inbox: [
    { id: 1, from: "john@company.com", subject: "Re: Partnership Opportunity", time: "2 hours ago", read: false },
    { id: 2, from: "sarah@startup.io", subject: "Thanks for reaching out!", time: "5 hours ago", read: true },
    { id: 3, from: "mike@business.com", subject: "Meeting Request", time: "1 day ago", read: false },
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
  const [activeSection, setActiveSection] = useState("inbox")

  const renderContent = () => {
    switch (activeSection) {
      case "inbox":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Inbox</h2>
              <Badge variant="secondary">{dummyEmailData.inbox.length} emails</Badge>
            </div>
            <div className="space-y-2">
              {dummyEmailData.inbox.map((email) => (
                <Card key={email.id} className={`cursor-pointer hover:bg-slate-50 ${!email.read ? 'border-blue-200 bg-blue-50/30' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium ${!email.read ? 'text-blue-900' : 'text-slate-900'}`}>
                            {email.from}
                          </span>
                          {!email.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                        </div>
                        <p className="text-sm text-slate-600">{email.subject}</p>
                      </div>
                      <span className="text-xs text-slate-500">{email.time}</span>
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar />
        
        <SidebarInset className="flex">
          {/* Inner Sidebar for Campaign Sub-items */}
          <div className="w-64 border-r border-slate-200 bg-slate-50/50">
            <div className="p-6">
              <h1 className="text-lg font-semibold text-slate-900 mb-4">Email Campaigns</h1>
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
