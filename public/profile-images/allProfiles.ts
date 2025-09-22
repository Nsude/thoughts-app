import profile1 from "@/public/profile-images/profile-1.webp";
import profile2 from "@/public/profile-images/profile-2.webp";
import profile3 from "@/public/profile-images/profile-3.webp";
import profile4 from "@/public/profile-images/profile-4.webp";
import profile5 from "@/public/profile-images/profile-5.webp";
import profile6 from "@/public/profile-images/profile-6.webp";
import profile7 from "@/public/profile-images/profile-7.webp";
import profile8 from "@/public/profile-images/profile-8.webp";
import defaultImage from "@/public/profile-images/default-image.webp";

const defaultAvatars = [
  profile1,
  profile2,
  profile3,
  profile4,
  profile5,
  profile6,
  profile7,
  profile8,
];

export {defaultImage};

export const getRandomAvatar = () => {
  const randomIndex = Math.floor(Math.random() * defaultAvatars.length);
  return defaultAvatars[randomIndex];
};