"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Ban, 
  CheckCircle, 
  MessageSquare, 
  Shield, 
  UserX, 
  MoreVertical, 
  Search,
  Filter,
  ArrowUpDown,
  Mail,
  Calendar,
  Award,
  Heart,
  FileText,
  Download,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BADGE_DEFINITIONS } from "@/lib/badges";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  status: "ACTIVE" | "BLACKLISTED" | "REMOVED";
  statusReason: string | null;
  points: number;
  banned: boolean;
  banReason: string | null;
  createdAt: string;
  badges: string[];
  likesReceived: number;
  _count: {
    posts: number;
    memberships: number;
  };
}

interface AdminUsersContentProps {
  initialUsers: User[];
  currentUserId: string;
  filters: {
    range: string;
    from?: string;
    to?: string;
  };
}

type UserAction = "blacklist" | "remove";

export function AdminUsersContent({
  initialUsers: users,
  currentUserId,
  filters,
}: AdminUsersContentProps) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [actionReason, setActionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: UserAction;
    user: User | null;
  }>({
    open: false,
    action: "blacklist",
    user: null,
  });

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function openActionDialog(action: UserAction, user: User) {
    setActionDialog({ open: true, action, user });
    setActionReason(
      action === "blacklist"
        ? "Account blacklisted by administrator"
        : "Account removed by administrator"
    );
  }

  function closeActionDialog() {
    setActionDialog({ open: false, action: "blacklist", user: null });
    setActionReason("");
  }

  async function submitUserAction() {
    if (!actionDialog.user) {
      return;
    }

    const reason = actionReason.trim();
    if (!reason) {
      toast.error("Please provide a reason.");
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint =
        actionDialog.action === "blacklist"
          ? `/api/admin/users/${actionDialog.user.id}/ban`
          : `/api/admin/users/${actionDialog.user.id}/remove`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to update user status.");
        return;
      }

      toast.success("User moderation updated.");
      closeActionDialog();
      router.refresh();
    } catch {
      toast.error("Failed to update user status.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReinstate(userId: string) {
    const res = await fetch(`/api/admin/users/${userId}/unban`, {
      method: "POST",
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || "Failed to reinstate user.");
      return;
    }

    toast.success("User reinstated.");
    router.refresh();
  }

  async function handleSendMessage() {
    if (!selectedUser || !message.trim()) {
      return;
    }

    const res = await fetch(`/api/admin/users/${selectedUser.id}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message.trim() }),
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || "Failed to send message.");
      return;
    }

    setSelectedUser(null);
    setMessage("");
    router.refresh();
  }

  function handleRangeChange(value: string) {
    const params = new URLSearchParams(window.location.search);
    params.set("range", value);
    params.delete("from");
    params.delete("to");
    router.push(`${window.location.pathname}?${params.toString()}`);
  }

  function handleCustomDateChange(from?: string, to?: string) {
    const params = new URLSearchParams(window.location.search);
    params.set("range", "custom");
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    router.push(`${window.location.pathname}?${params.toString()}`);
  }

  function handleExport() {
    if (users.length === 0) {
      toast.error("No data to export.");
      return;
    }

    const exportData = users.map((u) => ({
      Name: u.name || "Anonymous",
      Email: u.email,
      Credits: u.points,
      Posts: u._count.posts,
      Likes: u.likesReceived,
      Badges: u.badges.map(id => BADGE_DEFINITIONS[id]?.name || id).join(", "),
      Joined: formatDate(u.createdAt),
      Status: u.status,
      Role: u.role,
      "Moderation Reason": u.statusReason || "N/A"
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Community Users");

    // Auto-size columns
    const max_width = exportData.reduce((w, r) => Math.max(w, r.Name.length), 10);
    worksheet["!cols"] = [ { wch: max_width + 5 } ];

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
    saveAs(data, `Neki_Users_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast.success("Excel report generated successfully.");
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-card/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/40 shadow-premium">
        <div>
          <h2 className="font-display text-3xl font-black text-primary tracking-tight">User Intelligence</h2>
          <p className="text-muted-foreground font-medium mt-1">Manage community members and monitor impact metrics.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <Select value={filters.range} onValueChange={handleRangeChange}>
            <SelectTrigger className="h-12 w-[140px] rounded-2xl border-border/40 font-bold">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <SelectValue placeholder="Range" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/40 shadow-premium">
              <SelectItem value="all" className="font-bold">All Time</SelectItem>
              <SelectItem value="7" className="font-bold">Last 7 Days</SelectItem>
              <SelectItem value="30" className="font-bold">Last 30 Days</SelectItem>
              <SelectItem value="90" className="font-bold">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative flex-1 lg:w-64 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 rounded-2xl border-border/40 focus:ring-primary focus:border-primary font-medium"
            />
          </div>

          <Button 
            onClick={handleExport}
            variant="outline" 
            className="h-12 px-6 rounded-2xl border-border/40 font-black uppercase tracking-widest text-xs gap-2 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      <Card className="rounded-[2.5rem] border-border/40 shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-border/40">
                <TableHead className="w-[300px] font-black uppercase text-[10px] tracking-[0.2em] px-8 h-16">User Details</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] h-16">Credits</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] h-16">Activity</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] h-16">Badges</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] h-16">Joined</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] h-16">Status</TableHead>
                <TableHead className="text-right px-8 h-16 font-black uppercase text-[10px] tracking-[0.2em]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-3 opacity-50">
                        <UserX className="h-12 w-12" />
                        <p className="font-black uppercase tracking-widest text-xs">No users found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <motion.tr
                      key={user.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        "group transition-colors hover:bg-muted/30 border-border/20",
                        user.status !== "ACTIVE" && "opacity-60 bg-muted/10"
                      )}
                    >
                      <TableCell className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 border-2 border-border/40 group-hover:border-primary transition-colors">
                            <AvatarImage src={user.image || ""} />
                            <AvatarFallback className="bg-primary/10 text-primary font-black">
                              {user.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-black text-sm truncate group-hover:text-primary transition-colors">
                                {user.name || "Anonymous"}
                              </p>
                              {user.role === "ADMIN" && (
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-black text-[8px] px-2 py-0.5 uppercase">
                                  Admin
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground font-medium truncate flex items-center gap-1.5 mt-0.5">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-display text-xl font-black text-primary">{user.points}</span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">GDC Earned</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-[11px] font-bold">
                            <FileText className="h-3.5 w-3.5 text-blue-500" />
                            <span>{user._count.posts} posts</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                            <Heart className="h-3.5 w-3.5 text-rose-500" />
                            <span>{user.likesReceived} likes</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <TooltipProvider delayDuration={0}>
                            <div className="flex -space-x-2">
                              {user.badges.slice(0, 5).map((badgeId) => {
                                const definition = BADGE_DEFINITIONS[badgeId];
                                return (
                                  <Tooltip key={badgeId}>
                                    <TooltipTrigger asChild>
                                      <div className="h-9 w-9 rounded-full border-2 border-background bg-card flex items-center justify-center text-xs shadow-sm hover:z-10 hover:scale-110 transition-all cursor-help hover:border-primary">
                                        <Award className="h-4 w-4 text-primary" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="rounded-xl p-3 border-border/40 shadow-premium">
                                      <div className="flex flex-col gap-1">
                                        <p className="font-black text-xs text-primary">{definition?.name || badgeId}</p>
                                        <p className="text-[10px] text-muted-foreground font-medium">{definition?.description || "Achievement badge"}</p>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                );
                              })}
                              {user.badges.length > 5 && (
                                <div className="h-9 w-9 rounded-full border-2 border-background bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black z-10 shadow-sm">
                                  +{user.badges.length - 5}
                                </div>
                              )}
                            </div>
                          </TooltipProvider>
                          {user.badges.length === 0 && (
                            <span className="text-[10px] font-bold text-muted-foreground italic">No badges</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(user.createdAt)}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {user.status === "ACTIVE" ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[9px] px-2 py-0.5 uppercase w-fit">Active</Badge>
                          ) : (
                            <Badge variant="destructive" className="font-black text-[9px] px-2 py-0.5 uppercase w-fit">
                              {user.status}
                            </Badge>
                          )}
                          {user.statusReason && (
                            <span className="text-[10px] text-muted-foreground italic truncate max-w-[120px]">
                              {user.statusReason}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="px-8 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/5 transition-colors">
                              <MoreVertical className="h-5 w-5 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-border/40 shadow-premium">
                            <DropdownMenuLabel className="font-black uppercase text-[10px] tracking-widest text-muted-foreground px-3 py-2">Account Actions</DropdownMenuLabel>
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedUser(user);
                                setMessage("");
                              }}
                              className="rounded-xl px-3 py-2.5 cursor-pointer focus:bg-primary/5"
                            >
                              <MessageSquare className="mr-3 h-4 w-4 text-primary" />
                              <span className="font-bold text-sm">Send Direct Message</span>
                            </DropdownMenuItem>
                            
                            {user.id !== currentUserId && (
                              <>
                                <DropdownMenuSeparator className="my-2 bg-border/40" />
                                {user.status === "ACTIVE" ? (
                                  <>
                                    <DropdownMenuItem 
                                      onClick={() => openActionDialog("blacklist", user)}
                                      className="rounded-xl px-3 py-2.5 cursor-pointer text-destructive focus:bg-destructive/5 focus:text-destructive"
                                    >
                                      <Ban className="mr-3 h-4 w-4" />
                                      <span className="font-bold text-sm">Restrict / Blacklist</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => openActionDialog("remove", user)}
                                      className="rounded-xl px-3 py-2.5 cursor-pointer text-destructive focus:bg-destructive/5 focus:text-destructive"
                                    >
                                      <UserX className="mr-3 h-4 w-4" />
                                      <span className="font-bold text-sm">Remove Account</span>
                                    </DropdownMenuItem>
                                  </>
                                ) : (
                                  <DropdownMenuItem 
                                    onClick={() => handleReinstate(user.id)}
                                    className="rounded-xl px-3 py-2.5 cursor-pointer text-emerald-600 focus:bg-emerald-500/5 focus:text-emerald-600"
                                  >
                                    <CheckCircle className="mr-3 h-4 w-4" />
                                    <span className="font-bold text-sm">Reinstate Member</span>
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Message Dialog */}
      <Dialog open={!!selectedUser && !actionDialog.open} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-premium p-8">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-black text-primary">Direct Communication</DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground">
              Sending an official administrator message to {selectedUser?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Message Content</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={6}
                className="rounded-2xl border-border/40 focus:ring-primary focus:border-primary p-6 font-medium leading-relaxed resize-none"
              />
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setSelectedUser(null)} className="flex-1 h-12 rounded-full font-black uppercase tracking-widest border-2">
                Cancel
              </Button>
              <Button onClick={handleSendMessage} className="flex-1 h-12 rounded-full font-black uppercase tracking-widest shadow-premium bg-primary text-white">
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => !open && closeActionDialog()}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-premium p-8">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-black text-destructive">
              {actionDialog.action === "blacklist" ? "Restrict Member" : "Remove Member"}
            </DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground">
              This action will restrict {actionDialog.user?.name}&apos;s access to the community.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Official Reason</label>
              <Textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                rows={4}
                className="rounded-2xl border-border/40 focus:ring-destructive focus:border-destructive p-6 font-medium leading-relaxed resize-none"
                placeholder="Explain this moderation action..."
              />
            </div>

            <div className="flex gap-4">
              <Button variant="outline" type="button" onClick={closeActionDialog} disabled={isSubmitting} className="flex-1 h-12 rounded-full font-black uppercase tracking-widest border-2">
                Cancel
              </Button>
              <Button variant="destructive" type="button" onClick={submitUserAction} disabled={isSubmitting} className="flex-1 h-12 rounded-full font-black uppercase tracking-widest shadow-premium">
                {isSubmitting ? "Processing..." : "Confirm Action"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
