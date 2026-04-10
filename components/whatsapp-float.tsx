import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '237692714985';

export function WhatsAppFloat() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-green-500 px-4 py-3 text-sm font-semibold text-white shadow-xl"
    >
      <MessageCircle size={18} /> WhatsApp
    </a>
  );
}
