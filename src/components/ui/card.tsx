import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva("rounded-xl p-6", {
  variants: {
    variant: {
      content: "bg-card text-card-foreground",
      sage: "bg-canvas-soft text-ink",
      pale: "bg-primary-pale text-ink",
    },
  },
  defaultVariants: {
    variant: "content",
  },
})

function Card({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Card, cardVariants }
