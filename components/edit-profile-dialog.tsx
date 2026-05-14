"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Loader2, 
  User, 
  Camera, 
  Crop, 
  RotateCcw, 
  Check, 
  X,
  Shield,
  Bell,
  ChevronRight,
  Info,
  Sparkles
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { getCroppedImg } from "@/lib/crop-image";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface EditProfileDialogProps {
  children?: React.ReactNode;
  asChild?: boolean;
  initialName?: string | null;
  initialBio?: string | null;
  initialImage?: string | null;
}

const PROFILE_UPDATED_EVENT = "neki:profile-updated";

export function EditProfileDialog({
  children,
  asChild,
  initialName = "",
  initialBio = "",
  initialImage = null,
}: EditProfileDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialName || "");
  const [bio, setBio] = useState(initialBio || "");
  const [imagePreview, setImagePreview] = useState<string | null>(initialImage);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cropping state
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (open) {
      setName(initialName || "");
      setBio(initialBio || "");
      setImagePreview(initialImage);
      setImageFile(null);
      setIsCropping(false);
      setTempImage(null);
    }
  }, [open, initialName, initialBio, initialImage]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const onCropComplete = (_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result as string);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyCrop = async () => {
    if (!tempImage || !croppedAreaPixels) return;

    try {
      const croppedBlob = await getCroppedImg(tempImage, croppedAreaPixels);
      if (croppedBlob) {
        const croppedFile = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
        setImageFile(croppedFile);
        setImagePreview(URL.createObjectURL(croppedBlob));
        setIsCropping(false);
        setTempImage(null);
        toast.success("Image cropped successfully");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to crop image");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("bio", bio);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch("/api/me/profile", {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to update profile");
        return;
      }

      window.dispatchEvent(
        new CustomEvent(PROFILE_UPDATED_EVENT, {
          detail: {
            id: data.id,
            name: data.name,
            image: data.image,
          },
        })
      );

      toast.success("Profile updated successfully");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild={asChild}>
        {children || (
          <Button variant="outline" size="sm" className="rounded-full px-6 font-bold border-2 border-primary/20 text-primary hover:bg-primary/5 transition-all">
            <User className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-[2.5rem] border-none shadow-premium bg-background">
        {isCropping && tempImage ? (
          <div className="flex flex-col h-[600px]">
            <div className="flex items-center justify-between p-6 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Crop className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="font-display text-xl font-black text-primary">Crop Photo</DialogTitle>
                  <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Adjust to fit</DialogDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsCropping(false)} className="rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="relative flex-1 bg-muted/30">
              <Cropper
                image={tempImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                cropShape="round"
                showGrid={false}
              />
            </div>
            
            <div className="p-6 bg-background border-t border-border/40 flex items-center justify-between gap-6">
              <div className="flex-1 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Zoom Level</p>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => setIsCropping(false)} className="rounded-full px-6 font-bold">
                  Cancel
                </Button>
                <Button onClick={handleApplyCrop} className="rounded-full px-8 font-bold shadow-premium">
                  <Check className="h-4 w-4 mr-2" />
                  Apply
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="p-8 border-b border-border/40">
              <DialogTitle className="font-display text-3xl font-black text-primary mb-2">Edit Profile</DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium leading-relaxed">Update your impact profile details and photo.</DialogDescription>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Profile Picture */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative group">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Avatar className="h-32 w-32 md:h-40 md:h-40 border-4 border-primary shadow-xl">
                      <AvatarImage src={imagePreview || ""} className="object-cover" />
                      <AvatarFallback className="text-4xl font-black bg-primary/10 text-primary">
                        {name?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                  </motion.div>
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all"
                  >
                    <Camera className="h-5 w-5" />
                  </Button>
                </div>
                <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Info className="h-3.5 w-3.5" />
                  Click to change photo
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="h-14 rounded-2xl border-border/40 focus:ring-primary focus:border-primary px-6 font-medium text-lg"
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <Label htmlFor="bio" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Bio</Label>
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      bio.length >= 250 ? "text-destructive" : "text-muted-foreground"
                    )}>
                      {bio.length} / 250
                    </span>
                  </div>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell the community about your impact..."
                    rows={4}
                    className="rounded-2xl border-border/40 focus:ring-primary focus:border-primary p-6 font-medium leading-relaxed resize-none"
                    maxLength={250}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1 h-14 rounded-full font-black uppercase tracking-widest border-2"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1 h-14 rounded-full font-black uppercase tracking-widest shadow-premium bg-primary text-primary-foreground"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>

              {/* Bento-style footer highlights */}
              <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-border/20">
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-3">
                  <div className="p-2 bg-card rounded-lg shadow-sm">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-primary">Security</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Verified profile</p>
                  </div>
                </div>
                <div className="p-4 bg-secondary/10 rounded-2xl border border-secondary/20 flex items-start gap-3">
                  <div className="p-2 bg-card rounded-lg shadow-sm">
                    <Bell className="h-4 w-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-secondary">Notifications</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Impact alerts</p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
