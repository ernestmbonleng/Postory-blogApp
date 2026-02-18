import { Button } from "../ui/button";
import { X } from "lucide-react";
import Link from "next/link";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthRequiredModal({ isOpen, onClose }: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white w-full h-full md:h-auto md:max-w-[560px] md:rounded-lg md:shadow-[0_2px_10px_rgba(0,0,0,0.15)] relative flex flex-col items-center justify-center p-4 md:p-5 text-center">
        
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors"
        >
          <X size={24} strokeWidth={1} />
        </button>
        
        <div className="max-w-[300px] mx-auto">
          <h2 className="text-3xl md:text-[32px] font-serif font-medium tracking-tight text-gray-900 mb-6">
            Join Wordoo.
          </h2>
          
          <p className="text-sm md:text-base text-gray-600 mb-10 leading-relaxed">
            Create an account or login to join our community.
          </p>
          
          <div className="flex flex-col gap-3 w-full">
            <Link href="/register" onClick={onClose}>
              <Button className="w-full bg-black hover:bg-zinc-800 text-white rounded-full py-6 text-sm font-medium transition-all">
                Sign up
              </Button>
            </Link>
            
            <Link href="/login" onClick={onClose}>
              <Button variant="outline" className="w-full border-gray-200 hover:border-gray-900 rounded-full py-6 text-sm font-medium transition-all text-black">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}