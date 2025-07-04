import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


const reactions = [
    { name: 'Like', emoji: '👍' },
    { name: 'Cheer', emoji: '👏🏻' },
    { name: 'Celebrate', emoji: '🎉' },
    { name: 'Appreciate', emoji: '✨' },
    { name: 'Smile', emoji: '🙂' },
];

const ReactionButtons = () => {
  return (
    <TooltipProvider delayDuration={0}>
        <div className="hover:scale-x-105 transition-all duration-300 *:transition-all *:duration-300 flex justify-start text-2xl items-center shadow-xl z-10 bg-[#e8e4df] dark:bg-[#191818] gap-2 p-2 rounded-full">
        {reactions.map((reaction) => (
            <Tooltip key={reaction.name}>
                <TooltipTrigger asChild>
                    <button className="transition-transform duration-300 hover:-translate-y-5 cursor-pointer hover:scale-125 bg-white dark:bg-[#191818] rounded-full p-2 px-3">
                        {reaction.emoji}
                    </button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{reaction.name}</p>
                </TooltipContent>
            </Tooltip>
        ))}
        </div>
    </TooltipProvider>
  );
}

export default ReactionButtons;
