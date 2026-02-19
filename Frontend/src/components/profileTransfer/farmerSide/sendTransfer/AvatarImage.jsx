// components/profile-transfer/farmer-side/send-transfer/components/AvatarImage.jsx
export default function AvatarImage({ src, name }) {
  return (
    <div className="relative">
      <img 
        src={src}
        alt={name}
        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
      />
    </div>
  );
}
