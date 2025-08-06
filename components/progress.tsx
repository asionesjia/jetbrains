import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/utils/cn"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
    type?: 'default' | 'danger';
}

const Progress = React.forwardRef<
    React.ElementRef<typeof ProgressPrimitive.Root>,
    ProgressProps
>(({ className, value, type = 'default', ...props }, ref) => {
    const indicatorClass = type === 'danger' ? 'bg-red-500' : 'bg-indigo-500';

    return (
        <ProgressPrimitive.Root
            ref={ref}
            className={cn(
                "relative h-1 w-full overflow-hidden rounded-full bg-indigo-500/20",
                className
            )}
            {...props}
        >
            <ProgressPrimitive.Indicator
                className={`h-full w-full flex-1 ${indicatorClass} transition-all`}
                style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
            />
        </ProgressPrimitive.Root>
    )
})

Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
