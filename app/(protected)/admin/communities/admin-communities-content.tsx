"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Plus, Trash2, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";


interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  admin: {
    id: string;
    name: string | null;
    email: string;
  };
  _count: {
    members: number;
    posts: number;
  };
}

interface AdminCommunitiesContentProps {
  initialCommunities: Community[];
}

export function AdminCommunitiesContent({
  initialCommunities: communities,
}: AdminCommunitiesContentProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [communityToDelete, setCommunityToDelete] = useState<Community | null>(null);
  const [communityToEdit, setCommunityToEdit] = useState<Community | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (res.ok) {
        setIsCreating(false);
        setName("");
        setDescription("");
        toast.success("Community created successfully.");
        router.refresh();
        return;
      }

      const data = await res
        .json()
        .catch(() => ({ error: `Request failed (${res.status})` }));
      toast.error(data.error || "Failed to create community.");
    } catch {
      toast.error("Failed to create community.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!communityToDelete) return;

    setIsDeleting(communityToDelete.id);
    try {
      const res = await fetch(`/api/admin/communities/${communityToDelete.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const data = await res
          .json()
          .catch(() => null) as {
          details?: {
            membersRemoved?: number;
            postLinksRemoved?: number;
            childPostsDeleted?: number;
            sharedPostsKept?: number;
          };
        } | null;

        const details = data?.details;

        toast.success(
          details
            ? `Community deleted. Removed ${details.membersRemoved ?? 0} members, ${details.postLinksRemoved ?? 0} post links, and deleted ${details.childPostsDeleted ?? 0} child posts.`
            : "Community deleted."
        );
        setCommunityToDelete(null);
        router.refresh();
        return;
      }

      const data = await res
        .json()
        .catch(() => ({ error: `Request failed (${res.status})` }));
      toast.error(data.error || "Failed to delete community.");
    } catch {
      toast.error("Failed to delete community.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEdit = async () => {
    if (!communityToEdit || !editName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/communities/${communityToEdit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, slug: editSlug, description: editDescription }),
      });

      if (res.ok) {
        toast.success("Community updated.");
        setCommunityToEdit(null);
        setEditName("");
        setEditSlug("");
        setEditDescription("");
        router.refresh();
        return;
      }

      const data = await res.json().catch(() => ({ error: "Failed" }));
      toast.error(data.error || "Failed to update community.");
    } catch {
      toast.error("Failed to update community.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Communities</h2>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Community
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Community</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Community name"
                  className="mt-1"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  className="mt-1"
                  disabled={isSubmitting}
                />
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={isSubmitting || !name.trim()}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {communities.map((community) => (
          <Card key={community.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {community.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{community.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {community.description || "No description"}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="secondary">
                      {community._count.members} members
                    </Badge>
                    <Badge variant="outline">
                      {community._count.posts} posts
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setCommunityToEdit(community);
                    setEditName(community.name);
                    setEditSlug(community.slug);
                    setEditDescription(community.description || "");
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCommunityToDelete(community)}
                  className="text-destructive hover:text-destructive"
                  disabled={isDeleting === community.id}
                >
                  {isDeleting === community.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog
        open={!!communityToDelete}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setCommunityToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete {communityToDelete?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently remove the community, all member relationships, and all post links in this community.
              Child posts that are no longer linked to any community will also be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {communityToDelete && (
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{communityToDelete._count.members} members</Badge>
              <Badge variant="outline">{communityToDelete._count.posts} post links</Badge>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={!communityToDelete || !!isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Community"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Community Dialog */}
      <Dialog open={!!communityToEdit} onOpenChange={(open) => {
        if (!open) {
          setCommunityToEdit(null);
          setEditName("");
          setEditSlug("");
          setEditDescription("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Community</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Community name"
                className="mt-1"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Slug (URL)</label>
              <Input
                value={editSlug}
                onChange={(e) => setEditSlug(e.target.value)}
                placeholder="community-slug"
                className="mt-1"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Optional description"
                className="mt-1"
                disabled={isSubmitting}
              />
            </div>
            <Button onClick={handleEdit} className="w-full" disabled={isSubmitting || !editName.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
