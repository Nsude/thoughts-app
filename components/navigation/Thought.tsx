import DefaultIcon from "@/public/icons/DefaultIcon";
import FreshThoughtIcon from "@/public/icons/FreshThoughtIcon";
import ThreeDotIcon from "@/public/icons/ThreeDotsIcon";

interface Props {
  fresh?: boolean;
  label: string
}

export default function Thought({ label, fresh = false}: Props) {
  return (
    <div className="snap-start">
      <button
        data-fresh={fresh}
        className="my-thoughtItem relative flex gap-x-1.5 items-center justify-between h-[2.5rem] w-full rounded-[0.375rem] px-2.5 overflow-clip">
        {
          fresh &&
          <span>
            <FreshThoughtIcon />
          </span>
        }

        <span className="z-[1] w-[90%] leading-[2] text-left truncate text-ellipsis">
          { fresh ? "Fresh Thought" : label }
        </span>

        {
          !fresh &&
          <span role="button">
            <ThreeDotIcon />
          </span>
        }
        <span role="button">
        </span>
      </button>
    </div>
  )
}