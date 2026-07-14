"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Star, MessageSquare, CornerDownRight, Store, Calendar, CheckCircle2, User, Reply } from "lucide-react"
import { useDashboard } from "../DashboardContext"
import { cn } from "@/lib/utils"
import Swal from "sweetalert2"

interface Review {
  id: string
  customerName: string
  customerEmail: string
  rating: number
  comment: string
  date: string
  outlet: string
  reply?: string
  replyDate?: string
  rawOutletId?: string
}

export default function ReviewsPage() {
  const { outlets } = useDashboard()
  const [userRole, setUserRole] = useState("Owner")
  const [userOutlet, setUserOutlet] = useState("")
  const [selectedOutlet, setSelectedOutlet] = useState("all")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [reviews, setReviews] = useState<Review[]>([])
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")

  const fetchReviews = async () => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/reviews?page=1&limit=100`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        const docs = Array.isArray(data.data) ? data.data : (data.data.docs || []);
        const mapped = docs.map((r: any) => {
          const cName = typeof r.customerId === "object" ? r.customerId?.name : "Customer";
          const cEmail = typeof r.customerId === "object" ? r.customerId?.email : "";
          const oName = typeof r.outletId === "object" ? r.outletId?.name : (r.outletName || "Nirago Outlet");
          
          return {
            id: r._id || r.id,
            customerName: cName,
            customerEmail: cEmail,
            rating: r.rating || 5,
            comment: r.comment || "",
            date: r.createdAt ? new Date(r.createdAt).toISOString().substring(0, 10) : "N/A",
            outlet: oName,
            reply: r.outletResponse || undefined,
            replyDate: r.responsePublishedAt ? new Date(r.responsePublishedAt).toISOString().substring(0, 10) : undefined,
            rawOutletId: typeof r.outletId === "object" ? r.outletId?._id : r.outletId,
          };
        });
        setReviews(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch reviews API:", err);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("nirago_user_role") || "Owner"
      const outlet = localStorage.getItem("nirago_user_outlet") || ""
      setUserRole(role)
      setUserOutlet(outlet)
    }
    fetchReviews()
  }, [])

  const filteredReviews = reviews.filter(rev => {
    if (userRole === "Outlet Manager" && userOutlet) {
      if (rev.outlet !== userOutlet && rev.rawOutletId !== userOutlet) return false
    } else {
      if (selectedOutlet !== "all" && rev.outlet !== selectedOutlet) return false
    }

    if (ratingFilter !== "all") {
      if (rev.rating !== parseInt(ratingFilter)) return false
    }

    return true
  })

  const submitReply = async (reviewId: string) => {
    if (!replyText.trim()) {
      Swal.fire("Error", "Reply content cannot be empty.", "error")
      return
    }

    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          outletResponse: replyText.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        Swal.fire("Replied!", "Your response to the review has been published.", "success")
        setActiveReplyId(null)
        setReplyText("")
        fetchReviews()
      } else {
        Swal.fire("Error", data.message || "Failed to publish response.", "error")
      }
    } catch (err) {
      console.error("Failed to submit reply:", err);
      Swal.fire("Error", "Network error updating response.", "error")
    }
  }

  const deleteReply = (reviewId: string) => {
    Swal.fire({
      title: "Remove Reply?",
      text: "Are you sure you want to delete this response?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#556B2F",
      confirmButtonText: "Yes, delete it"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
          const token = tokenMatch ? tokenMatch[2] : null;
          if (!token) return;

          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/reviews/${reviewId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              outletResponse: ""
            })
          });

          const data = await res.json();
          if (res.ok && data.success) {
            Swal.fire("Deleted!", "Response has been removed.", "success")
            fetchReviews()
          } else {
            Swal.fire("Error", data.message || "Failed to delete response.", "error")
          }
        } catch (err) {
          console.error("Failed to delete reply:", err);
          Swal.fire("Error", "Network error removing response.", "error")
        }
      }
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#d2d2c4]/40 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#2d3822]">Customer Reviews</h2>
          <p className="text-xs text-neutral-500 font-semibold">Monitor ratings, feedback comments, and publish responses</p>
        </div>

        {/* Master Admin / Owner Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {userRole !== "Outlet Manager" && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Outlet:</span>
              <Select value={selectedOutlet} onValueChange={setSelectedOutlet}>
                <SelectTrigger className="w-52 bg-white border-[#d2d2c4] text-[#2d3822] font-semibold text-xs rounded-md shadow-xs h-8">
                  <SelectValue placeholder="All Outlets" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#d2d2c4] text-[#2d3822] font-semibold text-xs animate-in fade-in duration-100">
                  <SelectItem value="all">All Outlets</SelectItem>
                  {outlets.map((o) => (
                    <SelectItem key={o.id} value={o.name}>
                      {o.name.split("(")[0].trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Rating:</span>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-32 bg-white border-[#d2d2c4] text-[#2d3822] font-semibold text-xs rounded-md shadow-xs h-8">
                <SelectValue placeholder="All Ratings" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#d2d2c4] text-[#2d3822] font-semibold text-xs animate-in fade-in duration-100">
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {userRole === "Outlet Manager" && userOutlet && (
        <div className="p-3 bg-[#556B2F]/10 border border-[#556B2F]/20 rounded-lg flex items-center gap-2 text-xs font-semibold text-[#556B2F]">
          <Store className="h-4 w-4" />
          <span>Showing customer reviews for your outlet: <strong className="font-extrabold">{userOutlet}</strong></span>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <Card className="border border-dashed border-[#d2d2c4] p-10 text-center bg-white">
            <MessageSquare className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-neutral-500">No reviews found matching the filters.</p>
          </Card>
        ) : (
          filteredReviews.map((rev) => (
            <Card key={rev.id} className="border border-[#d2d2c4] bg-white transition-all duration-200 hover:border-[#556B2F]/30 shadow-2xs">
              <CardContent className="p-5 space-y-4">
                {/* Review Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-neutral-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-neutral-100 flex items-center justify-center text-[#556B2F] border border-neutral-200">
                      <User className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#2d3822] text-sm leading-tight">{rev.customerName}</h4>
                      <span className="text-[10px] text-neutral-400 font-semibold">{rev.customerEmail}</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-1 shrink-0">
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={cn(
                            "h-4 w-4 stroke-[2px]",
                            idx < rev.rating
                              ? "text-amber-500 fill-amber-400"
                              : "text-neutral-200 fill-neutral-100"
                          )}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-bold mt-0.5">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {rev.date}</span>
                      <span className="flex items-center gap-1"><Store className="h-3 w-3" /> {rev.outlet.split("(")[0].trim()}</span>
                    </div>
                  </div>
                </div>

                {/* Review Comment */}
                <p className="text-xs text-neutral-700 font-medium leading-relaxed bg-neutral-50/50 p-3.5 rounded-lg border border-neutral-100">
                  "{rev.comment}"
                </p>

                {/* Reply Section */}
                {rev.reply ? (
                  <div className="bg-[#f5f5e6]/30 border border-[#d2d2c4]/30 rounded-xl p-4 space-y-2 animate-in slide-in-from-top-1 duration-200">
                    <div className="flex items-center justify-between border-b border-[#d2d2c4]/20 pb-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#556B2F]">
                        <CornerDownRight className="h-4.5 w-4.5" />
                        <span>Outlet Response</span>
                        <Badge className="bg-[#556B2F]/10 text-[#556B2F] border-transparent text-[8px] uppercase tracking-wider py-0.5">Published</Badge>
                      </div>
                      <span className="text-[9px] text-neutral-400 font-bold">{rev.replyDate}</span>
                    </div>
                    <p className="text-xs text-neutral-700 font-medium pl-6 leading-relaxed">
                      "{rev.reply}"
                    </p>
                    <div className="flex justify-end pt-1 gap-2">
                      <Button
                        size="xs"
                        variant="ghost"
                        className="text-[#556B2F] hover:bg-[#556B2F]/5 text-[10px] font-bold"
                        onClick={() => {
                          setActiveReplyId(rev.id)
                          setReplyText(rev.reply || "")
                        }}
                      >
                        Edit Response
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        className="text-red-500 hover:bg-red-50 text-[10px] font-bold"
                        onClick={() => deleteReply(rev.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ) : (
                  activeReplyId !== rev.id && (
                    <div className="flex justify-end pt-1">
                      <Button
                        size="xs"
                        variant="outline"
                        className="border-[#556B2F] text-[#556B2F] hover:bg-[#556B2F]/5 text-[10px] font-bold flex items-center gap-1.5 shadow-2xs"
                        onClick={() => {
                          setActiveReplyId(rev.id)
                          setReplyText("")
                        }}
                      >
                        <Reply className="h-3.5 w-3.5" /> Reply to Customer
                      </Button>
                    </div>
                  )
                )}

                {/* Reply Input Form */}
                {activeReplyId === rev.id && (
                  <div className="bg-[#f5f5e6]/25 border border-[#d2d2c4] rounded-xl p-4 space-y-3.5 animate-in slide-in-from-top-1.5 duration-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#556B2F] border-b border-[#d2d2c4]/20 pb-1.5">
                      <CornerDownRight className="h-4.5 w-4.5" />
                      <span>Drafting Response to {rev.customerName}</span>
                    </div>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your response here..."
                      className="w-full min-h-[80px] p-3 text-xs border border-[#d2d2c4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#556B2F] bg-white"
                    />
                    <div className="flex justify-end gap-2 text-xs">
                      <Button
                        size="xs"
                        variant="outline"
                        className="border-neutral-300 text-neutral-500 text-[10px] font-bold"
                        onClick={() => {
                          setActiveReplyId(null)
                          setReplyText("")
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="xs"
                        className="bg-[#556B2F] hover:bg-[#405223] text-white text-[10px] font-bold"
                        onClick={() => submitReply(rev.id)}
                      >
                        Publish Response
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
