import { useState, useRef, useEffect } from "react";
import {
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Link2,
  Check,
  X,
  Share2,
} from "lucide-react";

interface ShareDropdownProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  onClose?: () => void;
  isOpen?: boolean;
  trigger?: React.ReactNode;
}

export default function ShareDropdown({
  url,
  title,
  description = "",
  image = "",
  onClose,
  isOpen: controlledIsOpen,
  trigger,
}: ShareDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

 
  const open = controlledIsOpen !== undefined ? controlledIsOpen : isOpen;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        if (controlledIsOpen !== undefined) {
          onClose?.();
        } else {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [controlledIsOpen, onClose]);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      title
    )}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url
    )}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      url
    )}`,
    instagram: `https://www.instagram.com/`, // Instagram doesn't have direct sharing, open app
    email: `mailto:?subject=${encodeURIComponent(
      title
    )}&body=${encodeURIComponent(description + "\n\n" + url)}`,
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    if (platform === "instagram") {
      // Instagram doesn't have direct web sharing, suggest copying link
      handleCopyLink();
      return;
    }
    window.open(
      shareLinks[platform],
      "_blank",
      "noopener,noreferrer,width=600,height=400"
    );
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: url,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
     
      if (controlledIsOpen !== undefined) {
        onClose?.();
      } else {
        setIsOpen(!isOpen);
      }
    }
  };

  return (
    <div className="relative">
      {trigger ? (
        <div
          onClick={() =>
            controlledIsOpen !== undefined ? onClose?.() : setIsOpen(!isOpen)
          }
        >
          {trigger}
        </div>
      ) : (
        <button
          ref={buttonRef}
          onClick={handleNativeShare}
          className="flex items-center gap-2 text-gray-900 hover:text-indigo-600 transition-colors text-sm font-medium cursor-pointer"
          title="Share"
        >
          <Share2 size={18} />
          <span>Share</span>
        </button>
      )}

      {open && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
            <span className="text-xs font-black uppercase tracking-widest text-gray-400">
              Share
            </span>
            {controlledIsOpen !== undefined && onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 gap-1 p-2">
            <button
              onClick={() => handleShare("twitter")}
              className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-black/5 group-hover:bg-black/10 flex items-center justify-center mb-1">
                <Twitter size={18} className="text-black/60" />
              </div>
              <span className="text-[10px] font-bold text-gray-500">
                Twitter
              </span>
            </button>

            <button
              onClick={() => handleShare("facebook")}
              className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-[#1877F2]/5 group-hover:bg-[#1877F2]/10 flex items-center justify-center mb-1">
                <Facebook size={18} className="text-[#1877F2]" />
              </div>
              <span className="text-[10px] font-bold text-gray-500">
                Facebook
              </span>
            </button>

            <button
              onClick={() => handleShare("linkedin")}
              className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-[#0A66C2]/5 group-hover:bg-[#0A66C2]/10 flex items-center justify-center mb-1">
                <Linkedin size={18} className="text-[#0A66C2]" />
              </div>
              <span className="text-[10px] font-bold text-gray-500">
                LinkedIn
              </span>
            </button>

            <button
              onClick={() => handleShare("instagram")}
              className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#833AB4] to-[#FCAF45] bg-opacity-5 group-hover:bg-opacity-10 flex items-center justify-center mb-1">
                <Instagram size={18} className="text-[#262222a9]" />
              </div>
              <span className="text-[10px] font-bold text-gray-500">
                Instagram
              </span>
            </button>
          </div>

          <div className="border-t border-gray-100 mt-1 pt-2 px-2">
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  {copied ? (
                    <Check size={16} className="text-green-600" />
                  ) : (
                    <Link2 size={16} className="text-gray-600" />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {copied ? "Copied!" : "Copy link"}
                </span>
              </div>
              {copied && <Check size={16} className="text-green-600" />}
            </button>

            <button
              onClick={() => handleShare("email")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Mail size={16} className="text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Email</span>
            </button>
          </div>
        </div>
      )}
      
    </div>
  
  );
}
