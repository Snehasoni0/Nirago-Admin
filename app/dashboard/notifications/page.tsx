"use client"

import * as React from "react"
import { useState } from "react"
import { useDashboard } from "../DashboardContext"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Swal from "sweetalert2"
import { 
  ShoppingBag, 
  Settings, 
  Wallet, 
  Store, 
  Check, 
  Trash2, 
  Bell,
  BellOff
} from "lucide-react"

export default function NotificationsPage() {
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    deleteNotification 
  } = useDashboard()

  const [activeTab, setActiveTab] = useState<"all" | "unread" | "order" | "system" | "wallet" | "outlet">("all")

  // Filter Logic
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !n.read
    return n.type === activeTab
  })

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id)
  }

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead()
    Swal.fire({
      title: "Success!",
      text: "All notifications marked as read.",
      icon: "success",
      confirmButtonColor: "#556B2F"
    })
  }

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this action!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#556B2F",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    }).then((result) => {
      if (result.isConfirmed) {
        deleteNotification(id)
        Swal.fire({
          title: "Deleted!",
          text: "Notification has been deleted successfully.",
          icon: "success",
          confirmButtonColor: "#556B2F"
        })
      }
    })
  }

  // Get Notification Icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingBag className="h-5 w-5 text-amber-600" />
      case "system":
        return <Settings className="h-5 w-5 text-blue-600" />
      case "wallet":
        return <Wallet className="h-5 w-5 text-emerald-600" />
      case "outlet":
        return <Store className="h-5 w-5 text-purple-600" />
      default:
        return <Bell className="h-5 w-5 text-neutral-600" />
    }
  }

  // Get Notification Badge Style
  const getBadgeStyle = (type: string) => {
    switch (type) {
      case "order":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "system":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "wallet":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "outlet":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200"
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#2d3822]">Notifications Center</h2>
          <p className="text-sm text-neutral-600">
            Monitor real-time system activities, wallet updates, and incoming order actions.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button 
            onClick={handleMarkAllAsRead}
            className="bg-[#556B2F] hover:bg-[#2d3822] text-[#FFFFF0] text-xs font-semibold py-2 px-4 rounded-md transition-all self-start sm:self-auto cursor-pointer"
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Tabs / Filters */}
      <div className="flex flex-wrap gap-2 border-b border-[#d2d2c4] pb-2">
        {[
          { id: "all", label: "All Alerts" },
          { id: "unread", label: `Unread (${unreadCount})` },
          { id: "order", label: "Orders" },
          { id: "system", label: "System Config" },
          { id: "wallet", label: "Wallet" },
          { id: "outlet", label: "Outlets" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-t-md transition-all border-b-2 -mb-2.5 cursor-pointer ${
              activeTab === tab.id
                ? "border-[#556B2F] text-[#556B2F] font-bold"
                : "border-transparent text-neutral-500 hover:text-[#556B2F]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification Lists */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-[#d2d2c4] text-center space-y-3">
            <div className="p-4 bg-[#f5f5e6] rounded-full text-[#556B2F]">
              <BellOff className="h-10 w-10 stroke-[1.5]" />
            </div>
            <h3 className="font-bold text-lg text-[#2d3822]">No notifications found</h3>
            <p className="text-xs text-neutral-500 max-w-sm">
              All caught up! There are no notifications under this filter at the moment.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <Card 
              key={`notif-${notif.id}`} 
              className={`border transition-all duration-150 ${
                notif.read 
                  ? "border-[#d2d2c4] bg-white opacity-75" 
                  : "border-[#556B2F]/40 bg-[#f5f5e6]/20 shadow-sm border-l-4 border-l-[#556B2F]"
              }`}
            >
              <CardContent className="p-4 sm:p-5 flex items-start gap-4">
                {/* Status Indicator Icon */}
                <div className={`p-2.5 rounded-lg border bg-white shadow-sm shrink-0 border-[#d2d2c4]`}>
                  {getNotificationIcon(notif.type)}
                </div>

                {/* Content Area */}
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className={`text-sm font-bold truncate ${notif.read ? "text-[#2d3822]/85" : "text-[#2d3822]"}`}>
                      {notif.title}
                    </h4>
                    <Badge variant="outline" className={`text-[9px] uppercase font-bold shrink-0 py-0.2 px-1.5 ${getBadgeStyle(notif.type)}`}>
                      {notif.type}
                    </Badge>
                    {!notif.read && (
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" title="New notification" />
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-600 line-clamp-2">
                    {notif.description}
                  </p>
                  <span className="text-[10px] font-mono font-semibold text-neutral-400 block pt-1">
                    {notif.timestamp}
                  </span>
                </div>

                {/* Action Controls */}
                <div className="flex items-center gap-1 shrink-0 self-center">
                  {!notif.read && (
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="h-8 w-8 text-[#556B2F] border-[#d2d2c4] hover:bg-[#f5f5e6] hover:text-[#2d3822] cursor-pointer"
                      title="Mark as Read"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleDelete(notif.id)}
                    className="h-8 w-8 text-red-600 border-[#d2d2c4] hover:bg-red-50 hover:text-red-700 cursor-pointer"
                    title="Delete Notification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
