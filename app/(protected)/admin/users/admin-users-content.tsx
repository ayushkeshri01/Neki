"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, CheckCircle, MessageSquare, Shield, UserX } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";

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
  _count: {
    posts: number;
    memberships: number;
  };
}

interface AdminUsersContentProps {
  initialUsers: User[];
  currentUserId: string;
}

type UserAction = "blacklist" | "remove";

export function AdminUsersContent({
  initialUsers: users,
  currentUserId,
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
    toast.success("Message sent.");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Users</h2>
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="space-y-4">
        {filteredUsers.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No users found.</p>
        ) : (
          filteredUsers.map((user) => (
            <Card
              key={user.id}
              className={user.status !== "ACTIVE" ? "opacity-70 border-destructive/40" : ""}
            >
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.image || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{user.name || "Anonymous"}</h3>
                      {user.role === "ADMIN" && (
                        <Badge variant="secondary" className="gap-1">
                          <Shield className="h-3 w-3" />
                          Admin
                        </Badge>
                      )}
                      {user.status === "BLACKLISTED" && (
                        <Badge variant="destructive">Blacklisted</Badge>
                      )}
                      {user.status === "REMOVED" && (
                        <Badge variant="destructive">Removed</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{user.points} points</span>
                      <span>{user._count.posts} posts</span>
                      <span>Joined {formatDate(user.createdAt)}</span>
                    </div>
                    {user.statusReason && (
                      <p className="mt-1 text-xs text-muted-foreground">Reason: {user.statusReason}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Dialog onOpenChange={(open) => {
                    if (!open) {
                      setSelectedUser(null);
                      setMessage("");
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedUser(user);
                          setMessage("");
                        }}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Send Message to {user.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <Textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Enter your message..."
                          rows={4}
                        />
                        <Button onClick={handleSendMessage} className="w-full">
                          Send Message
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {user.id !== currentUserId && (
                    <>
                      {user.status === "ACTIVE" ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openActionDialog("blacklist", user)}
                            className="gap-2 text-destructive hover:text-destructive"
                          >
                            <Ban className="h-4 w-4" />
                            Blacklist
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openActionDialog("remove", user)}
                            className="gap-2 text-destructive hover:text-destructive"
                          >
                            <UserX className="h-4 w-4" />
                            Remove
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReinstate(user.id)}
                          className="gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Reinstate
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={actionDialog.open} onOpenChange={(open) => !open && closeActionDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === "blacklist" ? "Blacklist User" : "Remove User"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-medium">Reason</label>
            <Textarea
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              rows={3}
              placeholder="Explain this moderation action..."
            />
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={closeActionDialog} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="button" onClick={submitUserAction} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
