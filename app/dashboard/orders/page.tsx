"use client"

import * as React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Clock, ClipboardList, User, MapPin, CreditCard, DollarSign, Eye, AlertTriangle, Bell, Globe, Lightbulb, Volume2, VolumeX, Search } from "lucide-react"
import Swal from "sweetalert2"
import { useDashboard, Order } from "../DashboardContext"
import { TablePagination } from "@/components/ui/pagination"

export default function OrdersPage() {
  const { 
    orders, 
    outlets,
    deliveryStaff, 
    updateOrderStatus, 
    assignStaffToOrder, 
    setOrderEstTime,
    fetchOrders
  } = useDashboard()

  const [selectedFilterOutlet, setSelectedFilterOutlet] = useState("all")

  const [orderSearchQuery, setOrderSearchQuery] = useState("")
  const [assignedRider, setAssignedRider] = useState<{ [orderId: string]: string }>({})
  const [estMinutes, setEstMinutes] = useState<{ [orderId: string]: string }>({})
  const [showRiderDialog, setShowRiderDialog] = useState(false)
  const [selectedOrderForStaff, setSelectedOrderForStaff] = useState<Order | null>(null)
  const [showKotDialog, setShowKotDialog] = useState(false)
  const [selectedOrderForKot, setSelectedOrderForKot] = useState<Order | null>(null)
  const [showReceiptDialog, setShowReceiptDialog] = useState(false)
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null)
  const [isPrintingInvoice, setIsPrintingInvoice] = useState(false)
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false)
  
  const [showOrderDrawer, setShowOrderDrawer] = useState(false)
  const [selectedOrderForDrawer, setSelectedOrderForDrawer] = useState<Order | null>(null)

  const [showManageModal, setShowManageModal] = useState(false)
  const [selectedOrderForManage, setSelectedOrderForManage] = useState<Order | null>(null)

  const [modalEstMinutes, setModalEstMinutes] = useState("")
  const [modalAssignedRider, setModalAssignedRider] = useState("")
  const [showDetailsInModal, setShowDetailsInModal] = useState(false)

  const [userRole, setUserRole] = useState<string>("Owner")
  const [userName, setUserName] = useState<string>("Master Admin")
  const [userOutlet, setUserOutlet] = useState<string>("")
  const isRiderRole = ["Delivery Staff", "Delivery Rider", "Delivery Riders", "Rider", "Riders"].includes(userRole)

  // Siren alert states
  const [isMuted, setIsMuted] = useState(true)
  const audioContextRef = React.useRef<AudioContext | null>(null)
  const alarmIntervalRef = React.useRef<any>(null)

  const playSiren = () => {
    try {
      if (typeof window === "undefined") return
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      
      const ctx = audioContextRef.current || new AudioCtx()
      audioContextRef.current = ctx
      
      if (ctx.state === "suspended") {
        ctx.resume()
      }

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = "sine"
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4)
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.start()
      osc.stop(ctx.currentTime + 0.55)
    } catch (e) {
      console.error("Audio synthesis error:", e)
    }
  }

  const promptCancellation = (orderId: string, onConfirm: (reason: string) => void) => {
    Swal.fire({
      title: "Reject/Cancel Order",
      text: "Select a predefined reason to notify the client app:",
      icon: "warning",
      input: "select",
      inputOptions: {
        "Kitchen too busy / Backlog": "Kitchen too busy / Backlog",
        "Ingredients out of stock": "Ingredients out of stock",
        "Rider staff unavailable": "Rider staff unavailable",
        "Location unserviceable / Outside radius": "Location unserviceable / Outside radius",
        "Customer request": "Customer request",
        "Other system issues": "Other system issues",
      },
      inputPlaceholder: "Select a cancellation reason...",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#556B2F",
      confirmButtonText: "Cancel / Reject Order",
      cancelButtonText: "Keep Active",
      inputValidator: (value) => {
        if (!value) {
          return "Reason selection is mandatory!";
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        onConfirm(result.value)
      }
    })
  }

  React.useEffect(() => {
    if (selectedOrderForManage) {
      setModalEstMinutes(selectedOrderForManage.estimatedMinutes?.toString() || "")
      setModalAssignedRider(selectedOrderForManage.deliveryStaff || "")
      setShowDetailsInModal(isRiderRole)
    }
  }, [selectedOrderForManage, isRiderRole])

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("nirago_user_role") || "Owner")
      setUserName(localStorage.getItem("nirago_user_name") || "Master Admin")
      setUserOutlet(localStorage.getItem("nirago_user_outlet") || "")
    }
  }, [])

  React.useEffect(() => {
    const managerOutletObj = outlets.find(o => o.name === userOutlet);
    const managerOutletId = managerOutletObj ? managerOutletObj.id : "";
    const activeOutletId = userRole === "Outlet Manager" ? managerOutletId : selectedFilterOutlet;
    fetchOrders(activeOutletId);
  }, [selectedFilterOutlet, userOutlet, userRole, outlets])



  const printReceiptHtml = (order: Order) => {
    const printWindow = window.open("", "_blank", "width=500,height=800");
    if (!printWindow) {
      Swal.fire("Pop-up Blocked", "Please allow pop-ups to print the receipt.", "warning");
      return;
    }

    let itemsRowsHtml = "";
    if (order.structuredItems && order.structuredItems.length > 0) {
      order.structuredItems.forEach((item) => {
        itemsRowsHtml += `
          <tr style="align-items: flex-start;">
            <td style="padding: 6px 0; text-align: left; font-weight: 600;">${item.name}</td>
            <td style="padding: 6px 0; text-align: center;">${item.quantity}</td>
            <td style="padding: 6px 0; text-align: right;">₹${item.price}</td>
            <td style="padding: 6px 0; text-align: right;">₹${item.price * item.quantity}</td>
          </tr>
        `;
        if (item.addOns && item.addOns.length > 0) {
          item.addOns.forEach((add) => {
            itemsRowsHtml += `
              <tr>
                <td colspan="4" style="padding-left: 12px; padding-bottom: 2px; font-size: 10px; color: #737373; text-align: left;">• ${add}</td>
              </tr>
            `;
          });
        }
      });
    } else {
      order.items.split(", ").forEach((item) => {
        const match = item.match(/^(\d+)x\s+(.+)$/);
        const qty = match ? parseInt(match[1]) : 1;
        const itemName = match ? match[2] : item;
        const estimatedPrice = 350;
        itemsRowsHtml += `
          <tr style="align-items: flex-start;">
            <td style="padding: 6px 0; text-align: left; font-weight: 600;">${itemName}</td>
            <td style="padding: 6px 0; text-align: center;">${qty}</td>
            <td style="padding: 6px 0; text-align: right;">₹${estimatedPrice}</td>
            <td style="padding: 6px 0; text-align: right;">₹${estimatedPrice * qty}</td>
          </tr>
        `;
      });
    }

    const subtotal = order.subtotal ?? Math.round(order.total * 0.85);
    const gst = order.gst ?? Math.round(order.total * 0.05);
    const packagingCharge = order.packagingCharge ?? 30;
    const deliveryCharge = order.deliveryCharge ?? 40;
    const discountHtml = order.discount && order.discount > 0 ? `
      <div style="display: flex; justify-content: space-between; color: #dc2626; font-weight: bold; margin-bottom: 6px;">
        <span>Discount:</span>
        <span>-₹${order.discount}</span>
      </div>
    ` : "";

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.id}</title>
          <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            @page {
              size: auto;
              margin: 0mm; /* Hides browser default header and footer */
            }
            body {
              font-family: 'Outfit', 'Helvetica Neue', Helvetica, Arial, sans-serif;
              padding: 20px;
              color: #2d3822;
              background: #fff;
              max-width: 400px;
              margin: 0 auto;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .header {
              display: flex;
              flex-direction: column;
              align-items: center;
              border-bottom: 1px dashed #d2d2c4;
              padding-bottom: 12px;
              margin-bottom: 12px;
              text-align: center;
            }
            .logo {
              height: 48px;
              width: 48px;
              object-fit: contain;
              margin-bottom: 4px;
            }
            .title {
              font-family: 'Playfair Display', Georgia, serif;
              font-style: italic;
              font-weight: bold;
              color: #556B2F;
              font-size: 24px;
              letter-spacing: 0.025em;
            }
            .subtitle {
              font-family: monospace;
              font-size: 11px;
              color: #737373;
              line-height: 1.4;
              margin-top: 4px;
            }
            .info {
              font-family: monospace;
              font-size: 12px;
              margin-bottom: 12px;
              line-height: 1.6;
              border-bottom: 1px dashed #d2d2c4;
              padding-bottom: 12px;
              color: #2d3822;
            }
            .info div {
              display: flex;
              justify-content: space-between;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-family: monospace;
              font-size: 12px;
              margin-bottom: 12px;
            }
            th {
              border-bottom: 1px solid #e5e5e5;
              padding-bottom: 6px;
              font-weight: bold;
            }
            .summary {
              font-family: monospace;
              font-size: 12px;
              border-bottom: 1px dashed #d2d2c4;
              padding-bottom: 12px;
              margin-bottom: 12px;
              line-height: 1.6;
            }
            .summary div {
              display: flex;
              justify-content: space-between;
              margin-bottom: 4px;
            }
            .grand-total {
              font-size: 14px;
              font-weight: 800;
              border-top: 1px dashed #e5e5e5;
              padding-top: 8px;
              margin-top: 8px;
              color: #2d3822;
            }
            .delivery {
              font-size: 12px;
              margin-bottom: 20px;
              line-height: 1.4;
              color: #525252;
            }
            .delivery-title {
              font-weight: bold;
              color: #2d3822;
              margin-bottom: 2px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img class="logo" src="/Cafe-logo.png" alt="Cafe De Nira Logo" />
            <div class="title">Cafe De Nira®</div>
            <div class="subtitle">
              ${order.outlet}<br/>
              Ph: +91 98765 43210 | GSTIN: 07AAAAN1234F1Z9
            </div>
          </div>
          <div class="info">
            <div><strong>INVOICE NO:</strong> <span>${order.id}</span></div>
            <div><strong>DATE/TIME:</strong> <span>${new Date().toLocaleString()}</span></div>
            <div><strong>PAYMENT:</strong> <span style="font-weight: bold;">${order.paymentMethod} (${order.paymentStatus || "PAID"})</span></div>
            <div><strong>TYPE:</strong> <span>${order.fulfillmentType || "DELIVERY"}</span></div>
          </div>
          <table>
            <thead>
              <tr style="border-bottom: 1px solid #e5e5e5;">
                <th style="text-align: left; padding-bottom: 6px;">Item Description</th>
                <th style="text-align: center; width: 40px; padding-bottom: 6px;">Qty</th>
                <th style="text-align: right; width: 60px; padding-bottom: 6px;">Rate</th>
                <th style="text-align: right; width: 60px; padding-bottom: 6px;">Amt</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRowsHtml}
            </tbody>
          </table>
          <div class="summary">
            <div>
              <span>Subtotal:</span>
              <span>₹${subtotal}</span>
            </div>
            <div>
              <span>SGST & CGST (5%):</span>
              <span>₹${gst}</span>
            </div>
            <div>
              <span>Packaging Charges:</span>
              <span>₹${packagingCharge}</span>
            </div>
            <div>
              <span>Delivery Charges:</span>
              <span>₹${deliveryCharge}</span>
            </div>
            ${discountHtml}
            <div class="grand-total">
              <span>GRAND TOTAL:</span>
              <span>₹${order.total}</span>
            </div>
          </div>
          <div class="delivery">
            <div class="delivery-title">DELIVER TO:</div>
            <span style="font-weight: 600;">${order.customerName} | ${order.customerPhone ?? "+91 99999 99999"}</span><br/>
            <span style="font-style: italic;">${order.customerAddress ?? "Self-Pickup Order"}</span>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const printKotHtml = (order: Order) => {
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) {
      Swal.fire("Pop-up Blocked", "Please allow pop-ups to print the KOT.", "warning");
      return;
    }

    const itemsFormatted = order.items.replaceAll(", ", "<br/>");

    printWindow.document.write(`
      <html>
        <head>
          <title>KOT - ${order.id}</title>
          <style>
            @page {
              size: auto;
              margin: 0mm; /* Hides browser default header and footer */
            }
            body {
              font-family: monospace;
              padding: 20px;
              color: #000;
              background: #fff;
            }
            .header {
              text-align: center;
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .title {
              font-size: 18px;
              font-weight: bold;
            }
            .subtitle {
              font-size: 12px;
              text-transform: uppercase;
            }
            .info {
              font-size: 13px;
              margin-bottom: 15px;
              line-height: 1.4;
            }
            .items-title {
              font-weight: bold;
              border-bottom: 1px dashed #000;
              padding-bottom: 3px;
              margin-bottom: 5px;
            }
            .items-list {
              font-size: 14px;
              line-height: 1.5;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Cafe De Nira®</div>
            <div class="subtitle">Kitchen Order Ticket (KOT)</div>
          </div>
          <div class="info">
            <strong>Order ID:</strong> ${order.id}<br/>
            <strong>Time:</strong> ${new Date().toLocaleTimeString()}<br/>
            <strong>Outlet:</strong> ${order.outlet}
          </div>
          <div class="items-title">ITEMS:</div>
          <div class="items-list">
            ${itemsFormatted}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrintKot = async (order: Order) => {
    try {
      const tokenMatch = document.cookie.match(/(^| )nirago_admin_token=([^;]+)/);
      const token = tokenMatch ? tokenMatch[2] : null;
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/kots`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: order.dbId || order.id,
          outletId: order.outletId || "6a51c0ebe2c6003316af4483",
          printedBy: localStorage.getItem("nirago_user_id") || "6a51c0ebe2c6003316af4483"
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        printKotHtml(order);
        setShowKotDialog(false);
      } else {
        // Fallback: print locally
        printKotHtml(order);
        setShowKotDialog(false);
      }
    } catch (err) {
      console.error("KOT printing error:", err);
      printKotHtml(order);
      setShowKotDialog(false);
    }
  };

  const handleDownloadKot = async (order: Order) => {
    try {
      const tokenMatch = document.cookie.match(/(^| )nirago_admin_token=([^;]+)/);
      const token = tokenMatch ? tokenMatch[2] : null;
      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/kots`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            orderId: order.dbId || order.id,
            outletId: order.outletId || "6a51c0ebe2c6003316af4483",
            printedBy: localStorage.getItem("nirago_user_id") || "6a51c0ebe2c6003316af4483"
          })
        });
      }
    } catch (err) {
      console.error(err);
    }

    // Download text slip
    const text = `
Cafe De Nira®
KITCHEN ORDER TICKET (KOT)
-------------------------
Order ID: ${order.id}
Time: ${new Date().toLocaleTimeString()}
Outlet: ${order.outlet}
-------------------------
ITEMS:
${order.items.replaceAll(", ", "\n")}
-------------------------
    `.trim();

    const blob = new Blob([text], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `KOT-${order.id.replace("#", "")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    Swal.fire({
      title: "KOT Downloaded",
      text: "KOT slip downloaded successfully as text file!",
      icon: "success",
      confirmButtonColor: "#556B2F"
    });
    setShowKotDialog(false);
  };

  const handlePrintInvoice = async (order: Order) => {
    setIsPrintingInvoice(true);
    try {
      const tokenMatch = document.cookie.match(/(^| )nirago_admin_token=([^;]+)/);
      const token = tokenMatch ? tokenMatch[2] : null;
      if (!token) {
        printReceiptHtml(order);
        setShowReceiptDialog(false);
        setIsPrintingInvoice(false);
        return;
      }

      const orderDbId = order.dbId || order.id;
      const orderNum = order.orderNumber || order.id.replace("#", "");
      const invoiceNum = `INV-${orderNum}-${Date.now().toString().slice(-4)}`;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: orderDbId,
          invoiceNumber: invoiceNum
        })
      });
      const data = await res.json();

      let invoiceUrl = "";
      if (res.status === 409 || data.message?.includes("already exists")) {
        const getRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/invoices?orderId=${orderDbId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const getData = await getRes.json();
        if (getRes.ok && getData.success && getData.data.invoices?.length > 0) {
          invoiceUrl = getData.data.invoices[0].invoiceUrl;
        }
      } else if (res.ok && data.success) {
        invoiceUrl = data.data?.invoiceUrl;
      }

      if (invoiceUrl) {
        window.open(invoiceUrl, "_blank");
        Swal.fire({
          title: "Invoice PDF Opened",
          text: "Opening tax invoice PDF in a new tab for printing.",
          icon: "success",
          confirmButtonColor: "#556B2F"
        });
        setShowReceiptDialog(false);
      } else {
        printReceiptHtml(order);
        setShowReceiptDialog(false);
      }
    } catch (err) {
      console.error("Invoice printing error:", err);
      printReceiptHtml(order);
      setShowReceiptDialog(false);
    } finally {
      setIsPrintingInvoice(false);
    }
  };

  const handleDownloadInvoiceFile = async (order: Order) => {
    setIsDownloadingInvoice(true);
    try {
      const tokenMatch = document.cookie.match(/(^| )nirago_admin_token=([^;]+)/);
      const token = tokenMatch ? tokenMatch[2] : null;
      if (!token) {
        printReceiptHtml(order);
        setShowReceiptDialog(false);
        setIsDownloadingInvoice(false);
        return;
      }

      const orderDbId = order.dbId || order.id;
      const orderNum = order.orderNumber || order.id.replace("#", "");
      const invoiceNum = `INV-${orderNum}-${Date.now().toString().slice(-4)}`;

      let invoiceUrl = "";
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: orderDbId,
          invoiceNumber: invoiceNum
        })
      });
      let data = await res.json();

      if (res.status === 409 || data.message?.includes("already exists")) {
        const getRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/invoices?orderId=${orderDbId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const getData = await getRes.json();
        if (getRes.ok && getData.success && getData.data.invoices?.length > 0) {
          invoiceUrl = getData.data.invoices[0].invoiceUrl;
        }
      } else if (res.ok && data.success) {
        invoiceUrl = data.data?.invoiceUrl;
      }

      if (invoiceUrl) {
        const pdfRes = await fetch(invoiceUrl);
        const blob = await pdfRes.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `Invoice-${orderNum}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);

        Swal.fire({
          title: "Invoice Downloaded!",
          text: "Tax invoice PDF has been downloaded successfully.",
          icon: "success",
          confirmButtonColor: "#556B2F"
        });
        setShowReceiptDialog(false);
      } else {
        printReceiptHtml(order);
        setShowReceiptDialog(false);
      }
    } catch (err) {
      console.error(err);
      printReceiptHtml(order);
      setShowReceiptDialog(false);
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  const visibleOrders = orders.filter(o => {
    if (isRiderRole) {
      if (o.deliveryStaff !== userName) return false
    } else if (userRole === "Outlet Manager" && userOutlet) {
      if (o.outlet !== userOutlet) return false
    }

    if (orderSearchQuery) {
      const q = orderSearchQuery.toLowerCase()
      const matchesId = o.id.toLowerCase().includes(q)
      const matchesCustomer = o.customerName.toLowerCase().includes(q)
      const matchesItems = o.items.toLowerCase().includes(q)
      if (!matchesId && !matchesCustomer && !matchesItems) return false
    }

    return true
  })

  const [currentPage, setCurrentPage] = useState(1)
  const ordersPerPage = 10
  const totalOrdersPages = Math.ceil(visibleOrders.length / ordersPerPage)
  const paginatedOrders = visibleOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  )

  React.useEffect(() => {
    const hasPlaced = visibleOrders.some(o => o.status === "PLACED")
    if (hasPlaced && !isMuted && !isRiderRole) {
      playSiren()
      alarmIntervalRef.current = setInterval(() => {
        playSiren()
      }, 3000)
    } else {
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current)
        alarmIntervalRef.current = null
      }
    }

    return () => {
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current)
      }
    }
  }, [visibleOrders, isMuted, userRole])

  const availableRiders = deliveryStaff.filter(s => {
    if (s.status !== "ACTIVE") return false
    if (userRole === "Outlet Manager" && userOutlet) {
      return !s.assignedOutlet || s.assignedOutlet === userOutlet
    }
    return true
  })

  const handleTableStatusChange = (order: Order, newStatus: Order["status"]) => {
    if (newStatus === "CANCELLED" || newStatus === "REJECTED") {
      promptCancellation(order.id, (reason) => {
        updateOrderStatus(order.id, newStatus, reason)
        Swal.fire({
          title: "Updated",
          text: `Order status updated to ${newStatus}`,
          icon: "success",
          confirmButtonColor: "#556B2F"
        })
      })
    } else if (newStatus === "PREPARING") {
      Swal.fire({
        title: "Estimated Prep Time",
        text: "Enter preparation time in minutes:",
        input: "number",
        inputValue: "25",
        showCancelButton: true,
        confirmButtonColor: "#556B2F",
        confirmButtonText: "Start Preparing",
        inputValidator: (value) => {
          if (!value || parseInt(value) <= 0) {
            return "Please enter a valid preparation time!";
          }
          return null;
        }
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          updateOrderStatus(order.id, "PREPARING", undefined, parseInt(result.value))
          Swal.fire({
            title: "Updated",
            text: `Order status updated to PREPARING`,
            icon: "success",
            confirmButtonColor: "#556B2F"
          })
        }
      })
    } else {
      updateOrderStatus(order.id, newStatus)
      Swal.fire({
        title: "Updated",
        text: `Order status updated to ${newStatus}`,
        icon: "success",
        confirmButtonColor: "#556B2F"
      })
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Controls Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#d2d2c4]">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 h-4 w-4" />
            <Input 
              placeholder="Search orders by ID, customer name..." 
              value={orderSearchQuery}
              onChange={(e) => setOrderSearchQuery(e.target.value)}
              className="pl-10 border-[#d2d2c4] bg-white w-full"
            />
          </div>

          {/* Outlet Filter (Master Admin / Owner only) */}
          {(userRole === "Owner" || userRole === "Master Admin") && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-neutral-500 uppercase">Outlet:</span>
              <Select 
                value={selectedFilterOutlet} 
                onValueChange={(val) => setSelectedFilterOutlet(val)}
              >
                <SelectTrigger className="w-[180px] border-[#d2d2c4] bg-white text-xs h-9">
                  <SelectValue placeholder="All Outlets" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Outlets</SelectItem>
                  {outlets.map((o) => (
                    <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Alarm Toggle (Non-delivery staff) */}
        {!isRiderRole && (
          <Button 
            variant="outline"
            size="sm"
            className={cn(
              "font-bold text-xs uppercase flex items-center gap-2 shrink-0 border-[#d2d2c4]",
              isMuted 
                ? "text-rose-600 hover:bg-rose-50" 
                : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
            )}
            onClick={() => {
              setIsMuted(!isMuted)
              if (isMuted) {
                setTimeout(() => playSiren(), 100)
              }
            }}
          >
            {isMuted ? (
              <>
                <VolumeX className="h-4 w-4 shrink-0" />
                <span>Alarm Muted (Unmute)</span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 shrink-0 text-emerald-600 animate-bounce" />
                <span>Alarm Sounding Enabled</span>
              </>
            )}
          </Button>
        )}
      </div>

      {/* High-Visibility Warning Banner & Sound Alerts */}
      {visibleOrders.some(o => o.status === "PLACED") && !isRiderRole && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse shadow-md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
              <Bell className="h-5 w-5 text-white animate-bounce" />
            </div>
            <div>
              <span className="font-extrabold text-rose-800 text-base block">New Order Alert Panel</span>
              <p className="text-xs text-rose-600 font-medium font-sans">
                Active incoming orders are currently waiting for acceptance protocol. Urgent action required!
              </p>
            </div>
          </div>
        </div>
      )}

      <Card className="border border-[#d2d2c4] bg-white gap-0 py-0">
        <CardContent className="p-0 px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#e6e6d8]/20">
                <TableRow className="border-b border-[#d2d2c4]">
                  <TableHead className="px-6">Order ID</TableHead>
                  <TableHead className="px-6">Customer</TableHead>
                  <TableHead className="px-6">Total Amt</TableHead>
                  <TableHead className="px-6">Status Flow</TableHead>
                  {!isRiderRole && <TableHead className="px-6">Delivery Staff</TableHead>}
                  <TableHead className="text-right px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((o) => (
                    <TableRow key={`order-row-${o.id}`} className="border-b border-[#d2d2c4] hover:bg-[#f5f5e6]/20">
                    <TableCell 
                      className="font-bold text-[#556B2F] hover:underline cursor-pointer transition-all px-6"
                      onClick={() => {
                        setSelectedOrderForDrawer(o)
                        setShowOrderDrawer(true)
                      }}
                    >
                      {o.id}
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="font-medium">{o.customerName}</div>
                    </TableCell>
                    <TableCell className="font-semibold px-6 font-mono">₹{o.total}</TableCell>
                    <TableCell className="px-6">
                      <Select 
                        value={o.status} 
                        onValueChange={(val) => handleTableStatusChange(o, val as Order["status"])}
                        disabled={o.status === "DELIVERED" || o.status === "CANCELLED" || o.status === "REJECTED"}
                      >
                        <SelectTrigger className={cn(
                          "w-[150px] font-semibold text-xs h-8 border border-neutral-300 bg-white",
                          o.status === "PLACED" && "text-blue-800 border-blue-200 bg-blue-50/50",
                          o.status === "ACCEPTED" && "text-sky-800 border-sky-200 bg-sky-50/50",
                          o.status === "PREPARING" && "text-amber-800 border-amber-200 bg-amber-50/50",
                          o.status === "READY" && "text-purple-800 border-purple-200 bg-purple-50/50",
                          o.status === "OUT_FOR_DELIVERY" && "text-indigo-800 border-indigo-200 bg-indigo-50/50",
                          o.status === "DELIVERED" && "text-emerald-800 border-emerald-200 bg-emerald-50/50",
                          o.status === "CANCELLED" && "text-red-800 border-red-200 bg-red-50/50"
                        )}>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="PLACED">Placed</SelectItem>
                          <SelectItem value="ACCEPTED">Accepted</SelectItem>
                          <SelectItem value="PREPARING">Preparing</SelectItem>
                          <SelectItem value="READY">Ready</SelectItem>
                          <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                          <SelectItem value="DELIVERED">Delivered</SelectItem>
                          <SelectItem value="CANCELLED">Cancel / Reject</SelectItem>
                        </SelectContent>
                      </Select>
                      {o.estimatedMinutes && o.estimatedMinutes > 0 ? (
                        <span className="text-[10px] text-neutral-500 flex items-center gap-1 mt-1 font-semibold pl-1">
                           <Clock className="h-3 w-3" /> {o.estimatedMinutes} mins
                        </span>
                      ) : null}
                    </TableCell>
                    {!isRiderRole && (
                      <TableCell className="px-6">
                        {o.fulfillmentType === "PICKUP" ? (
                          <span className="text-xs text-neutral-400 italic font-semibold">Self-Pickup</span>
                        ) : (
                          <Select 
                            value={o.deliveryStaff || "unassigned"} 
                            onValueChange={(val) => {
                              const riderName = val === "unassigned" ? "" : val;
                              assignStaffToOrder(o.id, riderName);
                              Swal.fire({
                                title: "Assigned",
                                text: riderName ? `Rider ${riderName} assigned successfully` : "Rider unassigned",
                                icon: "success",
                                confirmButtonColor: "#556B2F"
                              });
                            }}
                            disabled={o.status === "DELIVERED" || o.status === "CANCELLED" || o.status === "REJECTED"}
                          >
                            <SelectTrigger className="w-[180px] text-xs h-8 border border-neutral-300 bg-white font-medium">
                              <SelectValue placeholder="Assign Rider" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="unassigned">Unassigned</SelectItem>
                              {availableRiders.map((rider) => (
                                <SelectItem key={rider.id} value={rider.name}>
                                  {rider.name} {rider.phone ? `(${rider.phone})` : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                    )}
                    <TableCell className="text-right px-6">
                      <div className="hidden md:flex items-center justify-end gap-1.5">
                        {isRiderRole ? (
                          <Button 
                            size="xs" 
                            className="bg-[#556B2F] hover:bg-[#405223] text-white shrink-0"
                            onClick={() => {
                              setSelectedOrderForManage(o)
                              setShowDetailsInModal(true)
                              setShowManageModal(true)
                            }}
                          >
                            View & Update Status
                          </Button>
                        ) : (
                          <>
                            <Button 
                              size="xs" 
                              variant="outline" 
                              className="border-[#556B2F] text-[#556B2F] hover:bg-[#556B2F]/10 shrink-0 cursor-pointer"
                              onClick={() => {
                                setSelectedOrderForDrawer(o)
                                setShowOrderDrawer(true)
                              }}
                            >
                              Details
                            </Button>
                            <Button 
                              size="xs" 
                              className="bg-[#556B2F] hover:bg-[#405223] text-white shrink-0"
                              onClick={() => {
                                setSelectedOrderForManage(o)
                                setShowManageModal(true)
                              }}
                            >
                              Manage
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-neutral-500 font-medium bg-neutral-50/50">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            </Table>
          </div>
          <TablePagination 
            currentPage={currentPage}
            totalPages={totalOrdersPages || 1}
            onPageChange={setCurrentPage}
            totalEntries={visibleOrders.length}
            startEntry={(currentPage - 1) * ordersPerPage + 1}
            endEntry={currentPage * ordersPerPage}
          />
        </CardContent>
      </Card>

      {/* Dialog for manual rider selection */}
      {showRiderDialog && selectedOrderForStaff && (
        <Dialog open={showRiderDialog} onOpenChange={setShowRiderDialog}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Assign Delivery Rider</DialogTitle>
              <DialogDescription>Manually assign active rider to dispatch order {selectedOrderForStaff.id}</DialogDescription>
            </DialogHeader>
            <Select 
              onValueChange={(val) => setAssignedRider(prev => ({ ...prev, [selectedOrderForStaff.id]: val }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select active rider staff" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {availableRiders.map(s => (
                  <SelectItem key={`staff-opt-${s.id}`} value={s.name}>
                    <span className="flex items-center gap-1.5">
                      <span>{s.name} ({s.phone})</span>
                      <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-0.5 shrink-0 border border-neutral-100 px-1 py-0.5 rounded bg-neutral-50/50">
                        {s.assignedOutlet ? (
                          <>
                            <MapPin className="h-3 w-3 text-[#556B2F]" />
                            <span>{s.assignedOutlet.replace(" Outlet", "")}</span>
                          </>
                        ) : (
                          <>
                            <Globe className="h-3 w-3 text-neutral-400" />
                            <span>Global</span>
                          </>
                        )}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button className="bg-[#556B2F] hover:bg-[#405223] text-white" onClick={() => {
                const rider = assignedRider[selectedOrderForStaff.id]
                if (rider) {
                  assignStaffToOrder(selectedOrderForStaff.id, rider)
                  setShowRiderDialog(false)
                  Swal.fire({
                    title: "Rider Assigned",
                    text: `Successfully assigned ${rider} to order ${selectedOrderForStaff.id}. Status will update when the rider starts delivery.`,
                    icon: "success",
                    confirmButtonColor: "#556B2F"
                  })
                } else {
                  Swal.fire({
                    title: "Rider Required",
                    text: "Please choose a delivery rider.",
                    icon: "warning",
                    confirmButtonColor: "#556B2F"
                  })
                }
              }}>
                Confirm Rider Assignment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Unified Status Flow Dialog Modal */}
      {showManageModal && selectedOrderForManage && (
        <Sheet open={showManageModal} onOpenChange={setShowManageModal}>
          <SheetContent side="right" className="bg-[#FFFFF0] border-l border-[#d2d2c4] sm:!max-w-xl w-full p-6 overflow-y-auto">
            <SheetHeader className="p-0 border-b border-[#d2d2c4] pb-4">
              <SheetTitle className="text-xl font-bold text-[#2d3822] flex items-center gap-2 whitespace-nowrap">
                Order Status Manager — {selectedOrderForManage.id}
              </SheetTitle>
              <SheetDescription className="text-neutral-500">
                Track status progression or perform state updates for {selectedOrderForManage.customerName}'s order.
              </SheetDescription>
            </SheetHeader>

            {/* Visual Status Progress Bar (Desktop / Tablet) */}
            <div className="hidden sm:block relative py-6 my-2">
              {/* Connector line background */}
              <div className="absolute top-1/2 left-6 right-6 h-1 bg-neutral-200 -translate-y-1/2 rounded-full" />
              
              {/* Filled connector line */}
              {(() => {
                const steps = ["PLACED", "ACCEPTED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED"]
                const currentIdx = steps.indexOf(selectedOrderForManage.status)
                if (currentIdx < 0) return null
                return (
                  <div 
                    className="absolute top-1/2 left-6 h-1 bg-[#556B2F] -translate-y-1/2 transition-all duration-300 rounded-full" 
                    style={{ width: `calc(${(currentIdx / 5) * 100}% - 12px)` }}
                  />
                )
              })()}

              {/* Step Circles */}
              <div className="relative flex justify-between">
                {(() => {
                  const steps = [
                    { key: "PLACED", label: "Placed" },
                    { key: "ACCEPTED", label: "Accepted" },
                    { key: "PREPARING", label: "Preparing" },
                    { key: "READY", label: "Ready" },
                    { key: "OUT_FOR_DELIVERY", label: "Dispatched" },
                    { key: "DELIVERED", label: "Delivered" }
                  ]
                  const currentIdx = steps.findIndex(s => s.key === selectedOrderForManage.status)
                  const isTerminated = selectedOrderForManage.status === "CANCELLED" || selectedOrderForManage.status === "REJECTED"

                  return steps.map((step, idx) => {
                    const isCompleted = !isTerminated && currentIdx >= idx
                    const isActive = !isTerminated && currentIdx === idx

                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm z-10 border-2",
                          isCompleted 
                            ? "bg-[#556B2F] border-[#556B2F] text-[#FFFFF0]" 
                            : "bg-white border-neutral-300 text-neutral-400",
                          isActive && "ring-4 ring-[#556B2F]/20 scale-110"
                        )}>
                          {isCompleted && !isActive ? "✓" : idx + 1}
                        </div>
                        <span className={cn(
                          "text-[10px] mt-2 font-semibold tracking-tight whitespace-nowrap",
                          isActive ? "text-[#556B2F] font-bold" : "text-neutral-500"
                        )}>
                          {step.label}
                        </span>
                      </div>
                    )
                  })
                })()}
              </div>
            </div>

            {/* Visual Status Progress Bar (Mobile Stack) */}
            <div className="block sm:hidden relative pl-8 py-4 space-y-5 my-2 border-b border-[#d2d2c4]/20 pb-4">
              {/* Vertical connector line */}
              <div className="absolute top-4 bottom-4 left-3 w-1 bg-neutral-200 rounded-full" />
              
              {/* Filled vertical connector line */}
              {(() => {
                const steps = ["PLACED", "ACCEPTED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED"]
                const currentIdx = steps.indexOf(selectedOrderForManage.status)
                if (currentIdx < 0) return null
                return (
                  <div 
                    className="absolute top-4 left-3 w-1 bg-[#556B2F] transition-all duration-300 rounded-full" 
                    style={{ height: `calc(${(currentIdx / 5) * 100}% - 4px)` }}
                  />
                )
              })()}

              {/* Steps */}
              {(() => {
                const steps = [
                  { key: "PLACED", label: "Placed" },
                  { key: "ACCEPTED", label: "Accepted" },
                  { key: "PREPARING", label: "Preparing" },
                  { key: "READY", label: "Ready" },
                  { key: "OUT_FOR_DELIVERY", label: "Dispatched" },
                  { key: "DELIVERED", label: "Delivered" }
                ]
                const currentIdx = steps.findIndex(s => s.key === selectedOrderForManage.status)
                const isTerminated = selectedOrderForManage.status === "CANCELLED" || selectedOrderForManage.status === "REJECTED"

                return steps.map((step, idx) => {
                  const isCompleted = !isTerminated && currentIdx >= idx
                  const isActive = !isTerminated && currentIdx === idx

                  return (
                    <div key={idx} className="flex items-center gap-3 relative min-h-6">
                      {/* Step Circle */}
                      <div className={cn(
                        "absolute -left-8 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-sm z-10 border-2",
                        isCompleted 
                          ? "bg-[#556B2F] border-[#556B2F] text-[#FFFFF0]" 
                          : "bg-white border-neutral-300 text-neutral-400",
                        isActive && "ring-4 ring-[#556B2F]/20 scale-110"
                      )}>
                        {isCompleted && !isActive ? "✓" : idx + 1}
                      </div>
                      <span className={cn(
                        "text-xs font-semibold tracking-tight",
                        isActive ? "text-[#556B2F] font-bold" : "text-neutral-500"
                      )}>
                        {step.label} {isActive && <span className="text-[10px] bg-[#556B2F]/10 text-[#556B2F] px-1.5 py-0.5 rounded-full ml-1 font-bold">Active</span>}
                      </span>
                    </div>
                  )
                })
              })()}
            </div>

            {/* Order Details Card (Static & High Premium Style) */}
            <div className="space-y-4 my-4">
              {/* Delivery Rider Assignment (Admin only) */}
              {!isRiderRole && (
                <div className="bg-white p-4 rounded-xl border border-[#d2d2c4] space-y-3 shadow-sm">
                  <h3 className="text-sm font-semibold text-[#556B2F] flex items-center gap-2 border-b border-neutral-100 pb-2">
                    <User className="h-4 w-4" /> Assign Delivery Rider
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600">Assign Delivery Rider</label>
                      <Select 
                        value={modalAssignedRider}
                        onValueChange={(val) => {
                          setModalAssignedRider(val)
                          assignStaffToOrder(selectedOrderForManage.id, val)
                          Swal.fire({
                            title: "Rider Assigned",
                            text: `Successfully assigned ${val} to order ${selectedOrderForManage.id}.`,
                            icon: "success",
                            confirmButtonColor: "#556B2F",
                            timer: 1500
                          })
                        }}
                      >
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue placeholder={selectedOrderForManage.deliveryStaff || "Select active rider staff"} />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {availableRiders.map(s => (
                            <SelectItem key={`assign-rider-opt-${s.id}`} value={s.name}>
                              <span className="flex items-center gap-1.5">
                                <span>{s.name} ({s.phone})</span>
                                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-0.5 shrink-0 border border-neutral-100 px-1 py-0.5 rounded bg-neutral-50/50">
                                  {s.assignedOutlet ? (
                                    <>
                                      <MapPin className="h-3 w-3 text-[#556B2F]" />
                                      <span>{s.assignedOutlet.replace(" Outlet", "")}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Globe className="h-3 w-3 text-neutral-400" />
                                      <span>Global</span>
                                    </>
                                  )}
                                </span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer details card */}
              <div className="bg-white p-4 rounded-xl border border-[#d2d2c4] space-y-3 shadow-sm">
                <h3 className="text-sm font-semibold text-[#556B2F] flex items-center gap-2 border-b border-neutral-100 pb-2">
                  <User className="h-4 w-4" /> Customer Details
                </h3>
                <div className="space-y-2 text-sm text-neutral-600">
                  <div className="flex">
                    <span className="w-24 shrink-0 font-medium">Name:</span>
                    <span className="font-semibold text-neutral-800">{selectedOrderForManage.customerName}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 shrink-0 font-medium">Phone:</span>
                    <span className="font-semibold text-neutral-800">{selectedOrderForManage.customerPhone ?? "Not Provided"}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-24 shrink-0 font-medium mt-0.5">Address:</span>
                    <span className="font-semibold text-neutral-800 flex items-start gap-1">
                      <MapPin className="h-4 w-4 shrink-0 text-[#556B2F] mt-0.5" />
                      {selectedOrderForManage.customerAddress ?? "Self-Pickup (No delivery address)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Summary card */}
              <div className="bg-white p-4 rounded-xl border border-[#d2d2c4] space-y-3 shadow-sm">
                <h3 className="text-sm font-semibold text-[#556B2F] flex items-center gap-2 border-b border-neutral-100 pb-2">
                  <ClipboardList className="h-4 w-4" /> Ordered Items
                </h3>
                <div className="divide-y divide-neutral-100">
                  {selectedOrderForManage.structuredItems && selectedOrderForManage.structuredItems.length > 0 ? (
                    selectedOrderForManage.structuredItems.map((item, idx) => (
                      <div key={idx} className="py-2.5 space-y-1 first:pt-0 last:pb-0 text-sm">
                        <div className="flex justify-between font-medium">
                          <span className="text-neutral-800">{item.name}</span>
                          <span className="text-[#556B2F] font-semibold">₹{item.price} x {item.quantity}</span>
                        </div>
                        {item.addOns && item.addOns.length > 0 && (
                          <div className="pl-3 text-xs text-neutral-500 space-y-0.5">
                            <span className="font-semibold block text-[#556B2F]/70">Add-ons:</span>
                            {item.addOns.map((add, aIdx) => (
                              <span key={aIdx} className="block">• {add}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    selectedOrderForManage.items.split(", ").map((item, idx) => {
                      const match = item.match(/^(\d+)x\s+(.+)$/)
                      const qty = match ? match[1] : "1"
                      const itemName = match ? match[2] : item
                      return (
                        <div key={idx} className="flex justify-between py-2 text-sm first:pt-0 last:pb-0">
                          <span className="text-neutral-800">{itemName}</span>
                          <span className="font-semibold text-[#556B2F]">Qty: {qty}</span>
                        </div>
                      )
                    })
                  )}
                </div>

                {selectedOrderForManage.specialInstructions && (
                  <div className="bg-amber-50/50 border border-amber-200/60 p-3 rounded-lg mt-3 text-xs space-y-1">
                    <span className="font-bold text-amber-800 flex items-center gap-1.5">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                      <span>Customer Instructions:</span>
                    </span>
                    <p className="text-neutral-700 italic font-medium">"{selectedOrderForManage.specialInstructions}"</p>
                  </div>
                )}

                <div className="border-t border-dashed border-[#d2d2c4] pt-3 mt-3 flex justify-between items-center text-sm font-bold text-[#2d3822]">
                  <span>Total (to pay via {selectedOrderForManage.paymentMethod}):</span>
                  <span className="text-[#556B2F] text-base font-extrabold">₹{selectedOrderForManage.total}</span>
                </div>
              </div>
            </div>

            {/* Cancelled/Rejected Banner */}
            {(selectedOrderForManage.status === "CANCELLED" || selectedOrderForManage.status === "REJECTED") && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold flex flex-col items-center gap-1 my-2">
                <span className="text-base inline-flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> Order Terminated</span>
                <p className="text-xs text-neutral-500 font-normal">This order has been marked as {selectedOrderForManage.status.toLowerCase()}. No further actions can be performed.</p>
                {selectedOrderForManage.cancellationReason && (
                  <p className="text-xs text-red-600 mt-1 font-bold">Reason: {selectedOrderForManage.cancellationReason}</p>
                )}
              </div>
            )}

            {/* Actions Form Section */}
            {selectedOrderForManage.status !== "CANCELLED" && selectedOrderForManage.status !== "REJECTED" && (
              <div className="bg-[#f5f5e6]/30 border border-[#d2d2c4] p-4 rounded-xl space-y-4 my-2">
                <div className="flex justify-between items-center border-b border-[#d2d2c4]/40 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Current Action Required</span>
                  <Badge className="bg-[#e6e6d8] text-[#2d3822] border-[#d2d2c4]">{selectedOrderForManage.status}</Badge>
                </div>

                {/* State: PLACED */}
                {selectedOrderForManage.status === "PLACED" && (
                  <div className="space-y-3">
                    <p className="text-xs text-neutral-600">Review this order and click "Accept Order" to start preparation, or "Reject Order" if it cannot be fulfilled.</p>
                    {!isRiderRole ? (
                      <div className="flex gap-3">
                        <Button 
                          className="flex-1 bg-[#556B2F] hover:bg-[#405223] text-white"
                          onClick={() => {
                            updateOrderStatus(selectedOrderForManage.id, "ACCEPTED")
                            setSelectedOrderForManage(prev => prev ? { ...prev, status: "ACCEPTED" } : null)
                          }}
                        >
                          Accept Order
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => {
                            promptCancellation(selectedOrderForManage.id, (reason) => {
                              updateOrderStatus(selectedOrderForManage.id, "CANCELLED", reason)
                              setSelectedOrderForManage(prev => prev ? { ...prev, status: "CANCELLED", cancellationReason: reason } : null)
                              Swal.fire("Cancelled", `Order ${selectedOrderForManage.id} was rejected successfully.`, "success")
                            })
                          }}
                        >
                          Reject Order
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs text-amber-700 font-semibold">Waiting for store manager acceptance.</p>
                    )}
                  </div>
                )}

                {/* State: ACCEPTED */}
                {selectedOrderForManage.status === "ACCEPTED" && (
                  <div className="space-y-3">
                    <p className="text-xs text-neutral-600">Enter the estimated food preparation time (in minutes) to progress this order to the preparing kitchen stage.</p>
                    {!isRiderRole ? (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-neutral-600">Prep Time (Minutes)</label>
                          <Input 
                            type="number" 
                            placeholder="e.g. 25" 
                            value={modalEstMinutes}
                            onChange={(e) => setModalEstMinutes(e.target.value)}
                          />
                        </div>
                        <Button 
                          className="w-full bg-[#556B2F] hover:bg-[#405223] text-white"
                          onClick={() => {
                            const mins = parseInt(modalEstMinutes) || 20
                            updateOrderStatus(selectedOrderForManage.id, "PREPARING", undefined, mins)
                            setSelectedOrderForManage(prev => prev ? { ...prev, status: "PREPARING", estimatedMinutes: mins } : null)
                          }}
                        >
                          Start Preparing
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs text-amber-700 font-semibold">Waiting for store manager to configure preparation time.</p>
                    )}
                  </div>
                )}

                {/* State: PREPARING */}
                {selectedOrderForManage.status === "PREPARING" && (
                  <div className="space-y-3">
                    <p className="text-xs text-neutral-600">Kitchen is preparing. Mark as ready once the items are prepared and packed for pickup/delivery.</p>
                    {!isRiderRole ? (
                      <Button 
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => {
                          updateOrderStatus(selectedOrderForManage.id, "READY")
                          setSelectedOrderForManage(prev => prev ? { ...prev, status: "READY" } : null)
                        }}
                      >
                        Mark Ready for Dispatch
                      </Button>
                    ) : (
                      <p className="text-xs text-amber-700 font-semibold">Kitchen is currently preparing food items.</p>
                    )}
                  </div>
                )}

                {/* State: READY */}
                {selectedOrderForManage.status === "READY" && (
                  <div className="space-y-3">
                    <p className="text-xs text-neutral-600">
                      {isRiderRole 
                        ? "The order is ready for pickup in the kitchen. Mark as picked up and leave for delivery."
                        : selectedOrderForManage.deliveryStaff
                          ? `Rider ${selectedOrderForManage.deliveryStaff} has been assigned. Waiting for rider to pick up the order.`
                          : "Select an active delivery agent to assign this order."
                      }
                    </p>
                    {!isRiderRole ? (
                      selectedOrderForManage.deliveryStaff ? (
                        <div className="bg-[#556B2F]/10 border border-[#556B2F]/20 p-3.5 rounded-xl text-center text-xs font-semibold text-[#556B2F] flex flex-col gap-2">
                           <span className="flex items-center justify-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>Assigned to: {selectedOrderForManage.deliveryStaff}</span>
                          </span>
                          <span className="text-neutral-500 font-normal">Waiting for rider to click "Pick Up & Left for Delivery" on their portal.</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-neutral-600">Select Delivery Rider</label>
                            <Select 
                              value={modalAssignedRider}
                              onValueChange={setModalAssignedRider}
                            >
                              <SelectTrigger className="w-full bg-white">
                                <SelectValue placeholder="Select active rider staff" />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                {availableRiders.map(s => (
                                  <SelectItem key={`modal-staff-opt-${s.id}`} value={s.name}>
                                    <span className="flex items-center gap-1.5">
                                      <span>{s.name} ({s.phone})</span>
                                      <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-0.5 shrink-0 border border-neutral-100 px-1 py-0.5 rounded bg-neutral-50/50">
                                        {s.assignedOutlet ? (
                                          <>
                                            <MapPin className="h-3 w-3 text-[#556B2F]" />
                                            <span>{s.assignedOutlet.replace(" Outlet", "")}</span>
                                          </>
                                        ) : (
                                          <>
                                            <Globe className="h-3 w-3 text-neutral-400" />
                                            <span>Global</span>
                                          </>
                                        )}
                                      </span>
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button 
                            className="w-full bg-[#556B2F] hover:bg-[#405223] text-white"
                            onClick={() => {
                              if (modalAssignedRider) {
                                assignStaffToOrder(selectedOrderForManage.id, modalAssignedRider)
                                setSelectedOrderForManage(prev => prev ? { ...prev, deliveryStaff: modalAssignedRider } : null)
                                Swal.fire({
                                  title: "Rider Assigned",
                                  text: `Successfully assigned ${modalAssignedRider} to order ${selectedOrderForManage.id}. Status remains READY until rider picks it up.`,
                                  icon: "success",
                                  confirmButtonColor: "#556B2F"
                                })
                              } else {
                                Swal.fire("Rider Required", "Please choose a rider to assign.", "warning")
                              }
                            }}
                          >
                            Confirm Rider Assignment
                          </Button>
                        </div>
                      )
                    ) : (
                      <Button 
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                        onClick={() => {
                          updateOrderStatus(selectedOrderForManage.id, "OUT_FOR_DELIVERY")
                          setSelectedOrderForManage(prev => prev ? { ...prev, status: "OUT_FOR_DELIVERY" } : null)
                          Swal.fire({
                            title: "Picked Up!",
                            text: "Order status marked as Left for Delivery.",
                            icon: "success",
                            confirmButtonColor: "#556B2F"
                          })
                        }}
                      >
                        Pick Up & Left for Delivery
                      </Button>
                    )}
                  </div>
                )}

                {/* State: OUT_FOR_DELIVERY */}
                {selectedOrderForManage.status === "OUT_FOR_DELIVERY" && (
                  <div className="space-y-3">
                    <p className="text-xs text-neutral-600">Rider {selectedOrderForManage.deliveryStaff} is currently delivering. Click complete once items reach the destination.</p>
                    
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => {
                        updateOrderStatus(selectedOrderForManage.id, "DELIVERED")
                        setSelectedOrderForManage(prev => prev ? { ...prev, status: "DELIVERED" } : null)
                        Swal.fire({
                          title: "Delivered!",
                          text: `Order ${selectedOrderForManage.id} marked as delivered successfully.`,
                          icon: "success",
                          confirmButtonColor: "#556B2F"
                        })
                      }}
                    >
                      Mark Delivered Successfully
                    </Button>
                  </div>
                )}

                {/* Force Cancel Order Action */}
                {["ACCEPTED", "PREPARING", "READY", "OUT_FOR_DELIVERY"].includes(selectedOrderForManage.status) && !isRiderRole && (
                  <div className="pt-3 border-t border-dashed border-[#d2d2c4]/40 mt-3">
                    <Button 
                      variant="destructive" 
                      className="w-full text-xs py-1"
                      onClick={() => {
                        promptCancellation(selectedOrderForManage.id, (reason) => {
                          updateOrderStatus(selectedOrderForManage.id, "CANCELLED", reason)
                          setSelectedOrderForManage(prev => prev ? { ...prev, status: "CANCELLED", cancellationReason: reason } : null)
                          Swal.fire("Cancelled", `Order ${selectedOrderForManage.id} has been cancelled successfully.`, "success")
                        })
                      }}
                    >
                      Cancel Order (Force Halt)
                    </Button>
                  </div>
                )}

                {/* State: DELIVERED */}
                {selectedOrderForManage.status === "DELIVERED" && (
                  <div className="space-y-1 text-center py-2">
                    <p className="text-sm font-semibold text-emerald-700">🎉 Order Delivered successfully!</p>
                    <p className="text-xs text-neutral-500">All stages of fulfillment have been verified and processed.</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex sm:justify-between items-center mt-6 pt-4 border-t border-[#d2d2c4] gap-2 flex-wrap">
              {!isRiderRole && (
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    className="border-neutral-300 text-neutral-600 cursor-pointer"
                    onClick={() => {
                      setSelectedOrderForKot(selectedOrderForManage)
                      setShowKotDialog(true)
                    }}
                  >
                    Print KOT Slip
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    className="border-[#556B2F] text-[#556B2F] hover:bg-[#556B2F]/5 cursor-pointer font-semibold"
                    onClick={() => {
                      setSelectedOrderForReceipt(selectedOrderForManage)
                      setShowReceiptDialog(true)
                    }}
                  >
                    Print Delivery Receipt
                  </Button>
                </div>
              )}
              <Button type="button" className="bg-[#556B2F] hover:bg-[#405223] text-white" onClick={() => setShowManageModal(false)}>
                Close
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Dialog for KOT Preview */}
      {showKotDialog && selectedOrderForKot && (
        <Dialog open={showKotDialog} onOpenChange={setShowKotDialog}>
          <DialogContent className="bg-[#FFFFF0] border-2 border-dashed border-[#556B2F] text-neutral-900 max-w-sm">
            <DialogHeader className="flex flex-col items-center pb-2 border-b border-dashed border-[#556B2F]/30 text-center">
              <img src="/Cafe-logo.png" alt="Cafe De Nira Logo" className="h-12 w-12 object-contain mb-1" />
              <DialogTitle className="font-playfair italic font-bold text-[#556B2F] tracking-wide text-2xl">Cafe De Nira®</DialogTitle>
              <DialogDescription className="text-[11px] uppercase font-mono tracking-wider font-extrabold text-neutral-500 mt-1">KITCHEN ORDER TICKET (KOT)</DialogDescription>
            </DialogHeader>
            <div className="border-t border-b border-[#556B2F]/30 py-4 my-2 text-sm space-y-1 font-mono">
              <p><strong>Order ID:</strong> {selectedOrderForKot.id}</p>
              <p><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
              <p><strong>Fulfillment:</strong> Delivery (Manual assignment)</p>
              <p><strong>Outlet:</strong> {selectedOrderForKot.outlet}</p>
              <div className="border-t border-dashed border-[#556B2F]/30 my-3 pt-3">
                <p className="font-bold text-[#556B2F] mb-1">ITEMS:</p>
                <p className="text-sm whitespace-pre-line">{selectedOrderForKot.items.replaceAll(", ", "\n")}</p>
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              <Button 
                variant="outline"
                className="border-neutral-300 text-neutral-600 flex-1"
                onClick={() => handleDownloadKot(selectedOrderForKot)}
              >
                Download KOT
              </Button>
              <Button 
                className="bg-[#556B2F] hover:bg-[#405223] text-white flex-1" 
                onClick={() => handlePrintKot(selectedOrderForKot)}
              >
                Print KOT
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog for Customer/Delivery Receipt Preview */}
      {showReceiptDialog && selectedOrderForReceipt && (
        <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
          <DialogContent className="bg-white border-2 border-neutral-300 text-neutral-900 max-w-md p-0 font-sans max-h-[90vh] flex flex-col overflow-hidden">
            <div className="overflow-y-auto flex-1 p-6 pb-0">
            <DialogHeader className="flex flex-col items-center pb-2 border-b border-dashed border-neutral-300">
              <img src="/Cafe-logo.png" alt="Cafe De Nira Logo" className="h-12 w-12 object-contain mb-1" />
              <DialogTitle className="font-playfair italic font-bold text-[#556B2F] tracking-wide text-2xl">Cafe De Nira®</DialogTitle>
              <DialogDescription className="text-xs text-neutral-500 font-medium font-mono text-center mt-1">
                {selectedOrderForReceipt.outlet}<br />
                Ph: +91 98765 43210 | GSTIN: 07AAAAN1234F1Z9
              </DialogDescription>
            </DialogHeader>

            {/* Receipt metadata */}
            <div className="py-3 text-xs space-y-1 border-b border-dashed border-neutral-300 font-mono">
              <div className="flex justify-between text-left"><strong>INVOICE NO:</strong> <span>{selectedOrderForReceipt.id}</span></div>
              <div className="flex justify-between text-left"><strong>DATE/TIME:</strong> <span>{new Date().toLocaleString()}</span></div>
              <div className="flex justify-between text-left"><strong>PAYMENT:</strong> <span className="font-bold">{selectedOrderForReceipt.paymentMethod} ({selectedOrderForReceipt.paymentStatus || "PAID"})</span></div>
              <div className="flex justify-between text-left"><strong>TYPE:</strong> <span>{selectedOrderForReceipt.fulfillmentType || "DELIVERY"}</span></div>
            </div>

            {/* Items details table */}
            <div className="py-3 border-b border-dashed border-neutral-300 text-xs">
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="border-b border-neutral-200 font-bold">
                    <th className="pb-1 text-left">Item Description</th>
                    <th className="pb-1 text-center">Qty</th>
                    <th className="pb-1 text-right">Rate</th>
                    <th className="pb-1 text-right">Amt</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrderForReceipt.structuredItems && selectedOrderForReceipt.structuredItems.length > 0 ? (
                    selectedOrderForReceipt.structuredItems.map((item, idx) => (
                      <React.Fragment key={`receipt-item-${idx}`}>
                        <tr className="align-top">
                          <td className="py-1 font-semibold text-left">{item.name}</td>
                          <td className="py-1 text-center">{item.quantity}</td>
                          <td className="py-1 text-right">₹{item.price}</td>
                          <td className="py-1 text-right">₹{item.price * item.quantity}</td>
                        </tr>
                        {item.addOns && item.addOns.map((add, aIdx) => (
                          <tr key={`receipt-add-${aIdx}`} className="text-[10px] text-neutral-500 text-left">
                            <td colSpan={4} className="pl-3 pb-0.5">• {add}</td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))
                  ) : (
                    selectedOrderForReceipt.items.split(", ").map((item, idx) => {
                      const match = item.match(/^(\d+)x\s+(.+)$/)
                      const qty = match ? parseInt(match[1]) : 1
                      const itemName = match ? match[2] : item
                      const estimatedPrice = 350
                      return (
                        <tr key={`receipt-raw-item-${idx}`} className="align-top">
                          <td className="py-1 font-semibold text-left">{itemName}</td>
                          <td className="py-1 text-center">{qty}</td>
                          <td className="py-1 text-right">₹{estimatedPrice}</td>
                          <td className="py-1 text-right">₹{estimatedPrice * qty}</td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Billing Summary breakdown */}
            <div className="py-3 border-b border-dashed border-neutral-300 text-xs font-mono space-y-1.5">
              <div className="flex justify-between text-left">
                <span>Subtotal:</span>
                <span>₹{selectedOrderForReceipt.subtotal ?? Math.round(selectedOrderForReceipt.total * 0.85)}</span>
              </div>
              <div className="flex justify-between text-left">
                <span>SGST & CGST (5%):</span>
                <span>₹{selectedOrderForReceipt.gst ?? Math.round(selectedOrderForReceipt.total * 0.05)}</span>
              </div>
              <div className="flex justify-between text-left">
                <span>Packaging Charges:</span>
                <span>₹{selectedOrderForReceipt.packagingCharge ?? 30}</span>
              </div>
              <div className="flex justify-between text-left">
                <span>Delivery Charges:</span>
                <span>₹{selectedOrderForReceipt.deliveryCharge ?? 40}</span>
              </div>
              {selectedOrderForReceipt.discount !== undefined && selectedOrderForReceipt.discount > 0 && (
                <div className="flex justify-between text-red-600 font-bold text-left">
                  <span>Discount:</span>
                  <span>-₹{selectedOrderForReceipt.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold border-t border-dashed border-neutral-200 pt-2 text-[#2d3822] text-left">
                <span>GRAND TOTAL:</span>
                <span>₹{selectedOrderForReceipt.total}</span>
              </div>
            </div>

            {/* Delivery address details */}
            <div className="py-3 text-xs space-y-1 text-neutral-600 text-left">
              <p className="font-bold text-[#2d3822]">DELIVER TO:</p>
              <p className="font-semibold">{selectedOrderForReceipt.customerName} | {selectedOrderForReceipt.customerPhone ?? "+91 99999 99999"}</p>
              <p className="italic">{selectedOrderForReceipt.customerAddress ?? "Self-Pickup Order"}</p>
            </div>

            {/* Mock QR / Footer */}
            {/* <div className="pt-4 border-t border-dashed border-neutral-300 text-center space-y-3 shrink-0">
              <div className="inline-block p-1 border border-neutral-200 rounded-md">
                <div className="h-16 w-16 bg-neutral-100 flex items-center justify-center text-[7px] font-bold text-neutral-400 border border-neutral-200 border-dashed font-mono">
                  [ SCAN QR FOR DETAILS ]
                </div>
              </div>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">*** THANK YOU ***</p>
            </div> 
            */}
            </div>
            <DialogFooter className="gap-2 border-t pt-4 p-6 shrink-0 flex-wrap sm:flex-nowrap">
              <Button 
                className="bg-[#556B2F] hover:bg-[#405223] text-white flex-1 w-full sm:w-auto"
                disabled={isPrintingInvoice}
                onClick={() => handlePrintInvoice(selectedOrderForReceipt)}
              >
                {isPrintingInvoice ? "Generating PDF..." : "Print Receipt"}
              </Button>
              <Button 
                variant="ghost"
                className="text-neutral-500 hover:bg-neutral-100 w-full sm:w-auto"
                onClick={() => setShowReceiptDialog(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog Modal for Order Details */}
      <Dialog open={showOrderDrawer} onOpenChange={setShowOrderDrawer}>
        <DialogContent className="bg-[#FFFFF0] border border-[#d2d2c4] max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar p-6">
          {selectedOrderForDrawer && (
            <div className="space-y-6">
              <DialogHeader className="p-0 border-b border-[#d2d2c4] pb-4">
                <div className="flex items-center justify-between pr-8">
                  <span className="text-xs uppercase font-semibold text-neutral-500 tracking-wider">Order Verification</span>
                  <Badge className={cn(
                    "font-semibold",
                    selectedOrderForDrawer.status === "PLACED" && "bg-blue-100 text-blue-800 border-blue-200",
                    selectedOrderForDrawer.status === "ACCEPTED" && "bg-sky-100 text-sky-800 border-sky-200",
                    selectedOrderForDrawer.status === "PREPARING" && "bg-amber-100 text-amber-800 border-amber-200",
                    selectedOrderForDrawer.status === "READY" && "bg-purple-100 text-purple-800 border-purple-200",
                    selectedOrderForDrawer.status === "OUT_FOR_DELIVERY" && "bg-indigo-100 text-indigo-800 border-indigo-200",
                    selectedOrderForDrawer.status === "DELIVERED" && "bg-emerald-100 text-emerald-800 border-emerald-200",
                    selectedOrderForDrawer.status === "CANCELLED" && "bg-red-100 text-red-800 border-red-200"
                  )}>
                    {selectedOrderForDrawer.status}
                  </Badge>
                </div>
                <DialogTitle className="text-2xl font-bold text-[#2d3822] mt-2 flex items-center gap-2">
                  <ClipboardList className="h-6 w-6 text-[#556B2F]" />
                  Order {selectedOrderForDrawer.id}
                </DialogTitle>
                <DialogDescription className="text-neutral-600 mt-1">
                  Placed at {selectedOrderForDrawer.outlet}
                </DialogDescription>
              </DialogHeader>

              {/* Customer Info Section */}
              <div className="bg-white p-4 rounded-xl border border-[#d2d2c4] space-y-3 shadow-sm">
                <h3 className="text-sm font-semibold text-[#556B2F] flex items-center gap-2 border-b border-neutral-100 pb-2">
                  <User className="h-4 w-4" /> Customer Details
                </h3>
                <div className="space-y-2 text-sm text-neutral-600">
                  <div className="flex">
                    <span className="w-24 shrink-0 font-medium">Name:</span>
                    <span className="font-semibold text-neutral-800">{selectedOrderForDrawer.customerName}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 shrink-0 font-medium">Phone:</span>
                    <span className="font-semibold text-neutral-800">{selectedOrderForDrawer.customerPhone ?? "Not Provided"}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-24 shrink-0 font-medium mt-0.5">Address:</span>
                    <span className="font-semibold text-neutral-800 flex items-start gap-1">
                      <MapPin className="h-4 w-4 shrink-0 text-[#556B2F] mt-0.5" />
                      {selectedOrderForDrawer.customerAddress ?? "Self-Pickup (No delivery address)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="bg-white p-4 rounded-xl border border-[#d2d2c4] space-y-3 shadow-sm">
                <h3 className="text-sm font-semibold text-[#556B2F] flex items-center gap-2 border-b border-neutral-100 pb-2">
                  <ClipboardList className="h-4 w-4" /> Ordered Items
                </h3>
                <div className="divide-y divide-neutral-100">
                  {selectedOrderForDrawer.structuredItems && selectedOrderForDrawer.structuredItems.length > 0 ? (
                    selectedOrderForDrawer.structuredItems.map((item, idx) => (
                      <div key={idx} className="py-2.5 space-y-1 first:pt-0 last:pb-0 text-sm">
                        <div className="flex justify-between font-medium">
                          <span className="text-neutral-800">{item.name}</span>
                          <span className="text-[#556B2F] font-semibold">₹{item.price} x {item.quantity}</span>
                        </div>
                        {item.addOns && item.addOns.length > 0 && (
                          <div className="pl-3 text-xs text-neutral-500 space-y-0.5">
                            <span className="font-semibold block text-[#556B2F]/70">Add-ons:</span>
                            {item.addOns.map((add, aIdx) => (
                              <span key={aIdx} className="block">• {add}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    selectedOrderForDrawer.items.split(", ").map((item, idx) => {
                      const match = item.match(/^(\d+)x\s+(.+)$/)
                      const qty = match ? match[1] : "1"
                      const itemName = match ? match[2] : item
                      return (
                        <div key={idx} className="flex justify-between py-2 text-sm first:pt-0 last:pb-0">
                          <span className="text-neutral-800">{itemName}</span>
                          <span className="font-semibold text-[#556B2F]">Qty: {qty}</span>
                        </div>
                      )
                    })
                  )}
                </div>

                {selectedOrderForDrawer.specialInstructions && (
                  <div className="bg-amber-50/50 border border-amber-200/60 p-3 rounded-lg mt-3 text-xs space-y-1">
                    <span className="font-bold text-amber-800 flex items-center gap-1.5">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                      <span>Customer Instructions:</span>
                    </span>
                    <p className="text-neutral-700 italic font-medium">"{selectedOrderForDrawer.specialInstructions}"</p>
                  </div>
                )}
              </div>

              {/* Payment & Charges Section */}
              <div className="bg-white p-4 rounded-xl border border-[#d2d2c4] space-y-3 shadow-sm">
                <h3 className="text-sm font-semibold text-[#556B2F] flex items-center gap-2 border-b border-neutral-100 pb-2">
                  <CreditCard className="h-4 w-4" /> Billing Summary
                </h3>
                <div className="space-y-2 text-sm text-neutral-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium text-neutral-800">₹{selectedOrderForDrawer.subtotal ?? (selectedOrderForDrawer.total - (selectedOrderForDrawer.gst ?? 0) - (selectedOrderForDrawer.packagingCharge ?? 0) - (selectedOrderForDrawer.deliveryCharge ?? 0))}</span>
                  </div>
                  {selectedOrderForDrawer.gst !== undefined && (
                    <div className="flex justify-between">
                      <span>GST (Tax):</span>
                      <span className="font-medium text-neutral-800">₹{selectedOrderForDrawer.gst}</span>
                    </div>
                  )}
                  {selectedOrderForDrawer.packagingCharge !== undefined && (
                    <div className="flex justify-between">
                      <span>Packaging Charges:</span>
                      <span className="font-medium text-neutral-800">₹{selectedOrderForDrawer.packagingCharge}</span>
                    </div>
                  )}
                  {selectedOrderForDrawer.deliveryCharge !== undefined && (
                    <div className="flex justify-between">
                      <span>Delivery Charges:</span>
                      <span className="font-medium text-neutral-800 font-mono">
                        {selectedOrderForDrawer.deliveryCharge === 0 ? "FREE" : `₹${selectedOrderForDrawer.deliveryCharge}`}
                      </span>
                    </div>
                  )}
                  {selectedOrderForDrawer.discount !== undefined && selectedOrderForDrawer.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Coupon Discount:</span>
                      <span>-₹{selectedOrderForDrawer.discount}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-dashed border-[#d2d2c4] pt-2 mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span>Payment Status:</span>
                      <Badge className={cn(
                        "font-semibold text-[10px] py-0 px-2",
                        selectedOrderForDrawer.paymentStatus === "PAID" && "bg-emerald-100 text-emerald-800 border-emerald-200",
                        selectedOrderForDrawer.paymentStatus === "PENDING" && "bg-amber-100 text-amber-800 border-amber-200",
                        selectedOrderForDrawer.paymentStatus === "FAILED" && "bg-red-100 text-red-800 border-red-200"
                      )}>
                        {selectedOrderForDrawer.paymentStatus ?? "PAID"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Method:</span>
                      <span className="font-bold text-neutral-800 uppercase">{selectedOrderForDrawer.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fulfillment:</span>
                      <span className="font-bold text-neutral-800 uppercase">{selectedOrderForDrawer.fulfillmentType ?? "DELIVERY"}</span>
                    </div>
                    {selectedOrderForDrawer.fulfillmentType !== "PICKUP" && (
                      <div className="flex justify-between">
                        <span>Delivery Rider:</span>
                        <span className="font-bold text-[#556B2F]">
                          {selectedOrderForDrawer.deliveryStaff || "Unassigned"}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pt-1 border-t border-neutral-100">
                      <span className="font-bold text-[#2d3822]">Grand Total:</span>
                      <span className="font-extrabold text-[#556B2F] text-lg">₹{selectedOrderForDrawer.total}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery / Status Details */}
              <div className="bg-white p-4 rounded-xl border border-[#d2d2c4] space-y-3 shadow-sm">
                <h3 className="text-sm font-semibold text-[#556B2F] flex items-center gap-2 border-b border-neutral-100 pb-2">
                  <Clock className="h-4 w-4" /> Dispatch Logistics
                </h3>
                <div className="space-y-2 text-sm text-neutral-600">
                  <div className="flex">
                    <span className="w-24 shrink-0 font-medium">Prep Time:</span>
                    <span className="font-semibold text-neutral-800">
                      {selectedOrderForDrawer.estimatedMinutes ? `${selectedOrderForDrawer.estimatedMinutes} mins` : "Not set"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-24 shrink-0 font-medium">Assigned Rider:</span>
                    <span className="font-semibold text-neutral-800">
                      {selectedOrderForDrawer.deliveryStaff || "Unassigned"}
                    </span>
                  </div>
                  {selectedOrderForDrawer.status === "CANCELLED" && selectedOrderForDrawer.cancellationReason && (
                    <div className="flex flex-col pt-1.5 border-t border-dashed border-rose-100 text-rose-700 mt-1">
                      <span className="font-bold text-[11px] block">Cancellation Reason:</span>
                      <span className="text-xs font-semibold">"{selectedOrderForDrawer.cancellationReason}"</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button className="bg-[#556B2F] hover:bg-[#405223] text-white cursor-pointer font-bold text-xs" onClick={() => setShowOrderDrawer(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
