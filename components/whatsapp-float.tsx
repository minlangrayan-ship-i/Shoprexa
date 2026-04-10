import { MessageCircle } from 'lucide-react';

export function WhatsAppFloat() {
  return (
    <a
      href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '237690000000'}`}
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-green-500 px-4 py-3 text-sm font-semibold text-white shadow-xl"
    >
      <MessageCircle size={18} /> WhatsApp
    </a>
  );
}
