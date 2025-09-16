import DefaultIcon from "@/public/icons/DefaultIcon";
import { AccountTypes } from "../app.models"

interface Props {
  userName: string;
  accoutType: AccountTypes;
  avatarUrl?: string;
}

export default function ProfileDisplay ({userName, accoutType, avatarUrl}: Props) {
  return (
    <div className="flex gap-x-2.5 items-center">
      <div className="w-[2.25rem] aspect-square bg-myGray rounded-full flex items-center justify-center">
        {
          !avatarUrl && <DefaultIcon />
        }
      </div>
      <div className="flex flex-col items-start gap-y-0.5">
        <span>{userName}</span>
        <span className="text-label-small tracking-label-small text-dark-gray-label">{accoutType}</span>
      </div>
    </div>
  )
}