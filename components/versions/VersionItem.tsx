"use client";

import FreshThoughtIcon from "@/public/icons/FreshThoughtIcon";
import { Version } from "../app.models";
import { Id } from "@/convex/_generated/dataModel";
import React from "react";

interface Props {
  version: Version;
  selectedVersion: Id<"versions">;
  handleClick: (e: React.MouseEvent, id: Id<"versions">) => void;
}


const VersionItem = React.memo(function VersionItem({
  version: { isCore, versionNumber, changeLabel, _id },
  selectedVersion,
  handleClick,
}: Props) {

  const isSelected = selectedVersion === _id;

  return (
    <button
      data-selected={isSelected}
      data-version-id={_id}
      onClick={(e) => handleClick(e, _id)}
      style={{ opacity: isSelected ? 1 : .45 }}
      className="my-versionItem focus:outline-none text-myWhite lg:text-[unset]">
      {
        isCore ?
          <div className="flex items-center gap-0.5">
            <span className="hidden lg:inline-flex"><FreshThoughtIcon /></span>
            <span className="lg:hidden inline-flex"><FreshThoughtIcon color="#fff" /></span>
            <span>Core</span>
          </div>
          :
          <div className="flex flex-col items-end gap-y-1.5 relative h-[2.5rem]" >
            <span className="flex items-center gap-x-1">
              <span>Version</span>
              <span>
                {versionNumber > 9 ? "" : "0"}
                {versionNumber}
              </span>
            </span>

            {/* change label */}
            <span
              style={{color: isSelected ? "var(--black)" : ""}}
              className={` absolute bottom-0
                ${isSelected ? "rounded-[20px] px-[0.5rem] py-0.5 leading-[1]" : ""} 
                text-label-small tracking-label-small pointer-events-none
                ${changeLabel === "Light" && isSelected ? "bg-border-gray"
                  : changeLabel === "Mid" && isSelected ? "bg-sec-accent"
                    : changeLabel === "Heavy" && isSelected ? "bg-accent" : "bg-none"}
              `}>
              {changeLabel}
            </span>
          </div>
      }
    </button>
  )
})

export default VersionItem;