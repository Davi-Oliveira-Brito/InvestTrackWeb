import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva("rounded-xl p-6", {
  variants: {
    variant: {
      content: "bg-card text-card-foreground shadow-sm",
      sage: "bg-canvas-soft text-ink",
      pale: "bg-primary-pale text-ink",
      "metric-wrapper": "rounded-lg bg-canvas-soft p-4",
      "metric-child": "rounded-lg bg-canvas p-4 shadow-sm",
      "resumo-linhas": "rounded-lg bg-canvas p-5 shadow-sm",
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
