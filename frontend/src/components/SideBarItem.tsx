import { ReactElement } from "react";

export const SideBardItem = ({text, icon} : {
    text : string,
    icon : ReactElement,
}) => {
    return (
        <div className="flex pt-5 color text-gray-700 cursor-pointer pb-2">
            <div className="pl-2">
                {icon}
            </div>
            <div className="pl-2 text-xl" >
                {text}
            </div>
        </div>
    )
}