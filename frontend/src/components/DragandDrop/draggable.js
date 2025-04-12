import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export const  DraggableItem=({ id, children,node })=> {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id, // Unique ID for the draggable item
    data:{node}
  });

  const style = {
    transform: CSS.Translate.toString(transform), // Apply movement
    cursor: "grab", 
    padding: "10px",
    background: "lightblue",
    // margin: "5px",
    borderRadius: "5px",
  };

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
      {children}
    </div>
  );
}
