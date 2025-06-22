"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Sidebar } from "@/components/Sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Edit, Save, Send, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const MailEditor = () => {
  const { leadId } = useParams()
  const [emailContent, setEmailContent] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadEmail()
  }, [leadId])

  const loadEmail = async () => {
    try {
      toast({
        title: "Loading Email",
        description: `Loading email content for lead ${leadId}...`,
      })

      const response = await fetch(`http://localhost:8000/leads`)
      const leads = await response.json()

      if (!Array.isArray(leads)) {
        toast({
          title: "Load Failed",
          description: "Failed to load leads data",
          variant: "destructive",
        })
        return
      }

      const lead = leads.find((l) => l.id === Number(leadId))
      if (lead) {
        const emailToShow = lead.final_email || lead.generated_email || ""
        setEmailContent(emailToShow)

        if (emailToShow) {
          toast({
            title: "Email Loaded",
            description: `Email content loaded for lead ${leadId}`,
          })
        } else {
          toast({
            title: "No Email Found",
            description: `No existing email found for lead ${leadId}. Generate a new one!`,
          })
        }

        console.log("Loaded email for lead:", leadId)
      } else {
        toast({
          title: "Lead Not Found",
          description: `Lead ${leadId} not found in database`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading email:", error)
      toast({
        title: "Load Error",
        description: "Error loading email content",
        variant: "destructive",
      })
    }
  }

  const generateEmail = async () => {
    setLoading(true)

    toast({
      title: "Email Generation Started",
      description: `Generating sales email for lead ${leadId}...`,
    })

    try {
      const response = await fetch(`http://localhost:8000/generate-mail/${leadId}`, {
        method: "POST",
      })
      const data = await response.json()
      setEmailContent(data.email || "")

      toast({
        title: "Email Generated Successfully",
        description: `Sales email has been generated for lead ${leadId}`,
      })
    } catch (error) {
      console.error("Error generating email:", error)
      toast({
        title: "Generation Failed",
        description: `Failed to generate email for lead ${leadId}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleEdit = () => {
    setIsEditing(!isEditing)

    toast({
      title: isEditing ? "Edit Mode Disabled" : "Edit Mode Enabled",
      description: isEditing ? "Email content is now locked" : "You can now edit the email content",
    })

    console.log("Toggling edit mode:", isEditing ? "Locking" : "Editing")
  }

  const saveDraft = async () => {
    if (!emailContent.trim()) {
      toast({
        title: "Save Failed",
        description: "Email content is empty - nothing to save",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    toast({
      title: "Saving Draft",
      description: `Saving email draft for lead ${leadId}...`,
    })

    try {
      const response = await fetch(`http://localhost:8000/save-mail/${leadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_body: emailContent }),
      })
      const data = await response.json()

      toast({
        title: "Draft Saved Successfully",
        description: data.message || `Email draft saved for lead ${leadId}`,
      })
    } catch (error) {
      console.error("Error saving draft:", error)
      toast({
        title: "Save Failed",
        description: `Failed to save email draft for lead ${leadId}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const sendEmail = async () => {
    if (!emailContent.trim()) {
      toast({
        title: "Send Failed",
        description: "Email content is empty - cannot send",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    toast({
      title: "Sending Email",
      description: `Sending email to lead ${leadId}...`,
    })

    try {
      const response = await fetch(`http://localhost:8000/send-mail/${leadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_body: emailContent }),
      })
      const data = await response.json()

      toast({
        title: "Email Sent Successfully",
        description: data.message || `Email has been sent to lead ${leadId}`,
      })
    } catch (error) {
      console.error("Error sending email:", error)
      toast({
        title: "Send Failed",
        description: `Failed to send email to lead ${leadId}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-slate-100">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Email Generator & Sender</h1>
                <p className="text-slate-600 mt-1">Lead ID: {leadId}</p>
              </div>
              <Button onClick={generateEmail} disabled={loading} className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Generate Sales Email</span>
                {loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                )}
              </Button>
            </div>

            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Email Content</span>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={toggleEdit} className="flex items-center space-x-1">
                      {isEditing ? <Lock className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                      <span>{isEditing ? "Lock" : "Edit"}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={saveDraft}
                      disabled={loading || isEditing}
                      className="flex items-center space-x-1"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Draft</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={sendEmail}
                      disabled={loading || isEditing}
                      className="flex items-center space-x-1"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send Email</span>
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  readOnly={!isEditing}
                  className={`min-h-[400px] resize-none ${!isEditing ? "bg-slate-50" : "bg-white"}`}
                  placeholder="Email content will appear here..."
                />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

export default MailEditor

