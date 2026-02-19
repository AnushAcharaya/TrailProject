// components/profile-transfer/receiver-side/received-requests/components/SenderAvatar.jsx
export default function SenderAvatar({ src }) {
  return (
    <div className="relative">
      <img 
        src={src}
        alt="Sender"
        className="w-16 h-16 rounded-2xl object-cover ring-4 ring-orange-200/50 shadow-xl"
      />
    </div>
  );
}
