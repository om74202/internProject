import { useDroppable } from "@dnd-kit/core";

export function DropZone({ id, children }) {
  const { isOver, setNodeRef } = useDroppable({ id });

  const style = {

    background: isOver ? "lightgreen" : "lightgray", // Change color when dragging over

    borderRadius: "10px",
  };

  return (
    <div className="w-full" ref={setNodeRef} style={style}>
      {children}
    </div>
  );
}
