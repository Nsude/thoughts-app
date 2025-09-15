// ✅ SEPARATE: Dedicated placeholder component
interface Props {
  placeholderRef: React.RefObject<HTMLDivElement | null>;
  placeholderState: {
    show: boolean;
    type: 'default' | 'heading';
    headingLevel: number;
    position: number
  };
}

export const PlaceholderDisplay = ({ placeholderRef, placeholderState }: Props) => {
  const getPlaceholderText = () => {
    if (placeholderState.type === 'heading') {
      return `Heading ${placeholderState.headingLevel}`;
    }
    return "Let's hear it...";
  };

  const getPlaceholderStyle = () => {
    if (placeholderState.type === 'heading') {
      const sizes = {
        1: "text-4xl font-bold",
        2: "text-3xl font-semibold",
        3: "text-2xl font-medium"
      };
      return sizes[placeholderState.headingLevel as keyof typeof sizes] || "text-base";
    }
    return "text-base";
  };

  return (
    <div
      className="w-full overflow-clip"
      style={{
        pointerEvents: placeholderState.show ? "all" : 'none',
        opacity: placeholderState.show ? "1" : '0',
        top: placeholderState.headingLevel === 0 ?
          "unset" : placeholderState.position + "px",
        position: placeholderState.headingLevel === 0 ? "absolute" : "fixed"
      }}
    >
      <div 
        ref={placeholderRef} 
        className={`leading-[1.5] ${getPlaceholderStyle()} relative flex flex-col text-dark-gray-label`}>
        <span>
          {getPlaceholderText()}
        </span>
        <span className="absolute -bottom-[150%]">
          Write or type '/' for commands...
        </span>
      </div>
    </div>
  );
};