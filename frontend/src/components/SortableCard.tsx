import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "./Card";

interface SortableCardProps {
    id: string;
    content: any;
    onDelete: () => void;
    onEdit: () => void;
    onPin: () => void;
    onExpand: () => void;
    onChange?: (updatedContent: any) => void;
}

export const SortableCard = ({ id, content, onDelete, onEdit, onPin, onExpand, onChange }: SortableCardProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="h-full">
            <Card
                {...content}
                onDelete={onDelete}
                onEdit={onEdit}
                onPin={onPin}
                onExpand={onExpand}
                onChange={onChange}
                isPinned={content.isPinned}
                dragHandleProps={{ ...attributes, ...listeners }}
            />
        </div>
    );
};
