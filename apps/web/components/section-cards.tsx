import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import Image from "next/image"

import { Badge } from "~/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Module 1: Revenue (Beacon) */}
      <Card className="relative">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Image
              src="/assets/minecraft/blocks/Beacon.png"
              width={24}
              height={24}
              alt="Beacon"
              style={{ imageRendering: "pixelated" }}
            />
            <CardDescription className="uppercase tracking-widest text-emerald-400 font-bold">Total Revenue</CardDescription>
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl font-pixel text-white mt-2">
            $1,250.00
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
              <IconTrendingUp className="size-4 mr-1" />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm border-t border-[#365314]/50">
          <div className="line-clamp-1 flex gap-2 font-medium text-slate-300">
            Trending up this month <IconTrendingUp className="size-4 text-emerald-400" />
          </div>
          <div className="text-muted-foreground text-xs">
            Visitors for the last 6 months
          </div>
        </CardFooter>
      </Card>

      {/* Module 2: Customers (Redstone) */}
      <Card className="relative">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Image
              src="/assets/minecraft/blocks/Redstone_Block.png"
              width={24}
              height={24}
              alt="Redstone"
              style={{ imageRendering: "pixelated" }}
            />
            <CardDescription className="uppercase tracking-widest text-red-400 font-bold">New Customers</CardDescription>
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl font-pixel text-white mt-2">
            1,234
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/10">
              <IconTrendingDown className="size-4 mr-1" />
              -20%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm border-t border-[#365314]/50">
          <div className="line-clamp-1 flex gap-2 font-medium text-slate-300">
            Down 20% this period <IconTrendingDown className="size-4 text-red-400" />
          </div>
          <div className="text-muted-foreground text-xs">
            Acquisition needs attention
          </div>
        </CardFooter>
      </Card>

      {/* Module 3: Accounts (Barrel) */}
      <Card className="relative">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Image
              src="/assets/minecraft/blocks/Barrel.png"
              width={24}
              height={24}
              alt="Barrel"
              style={{ imageRendering: "pixelated" }}
            />
            <CardDescription className="uppercase tracking-widest text-amber-400 font-bold">Active Accounts</CardDescription>
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl font-pixel text-white mt-2">
            45,678
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10">
              <IconTrendingUp className="size-4 mr-1" />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm border-t border-[#365314]/50">
          <div className="line-clamp-1 flex gap-2 font-medium text-slate-300">
            Strong user retention <IconTrendingUp className="size-4 text-amber-400" />
          </div>
          <div className="text-muted-foreground text-xs">Engagement exceed targets</div>
        </CardFooter>
      </Card>

      {/* Module 4: Growth (Bookshelf) */}
      <Card className="relative">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Image
              src="/assets/minecraft/blocks/Bookshelf.png"
              width={24}
              height={24}
              alt="Bookshelf"
              style={{ imageRendering: "pixelated" }}
            />
            <CardDescription className="uppercase tracking-widest text-blue-400 font-bold">Growth Rate</CardDescription>
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl font-pixel text-white mt-2">
            4.5%
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10">
              <IconTrendingUp className="size-4 mr-1" />
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm border-t border-[#365314]/50">
          <div className="line-clamp-1 flex gap-2 font-medium text-slate-300">
            Steady performance increase <IconTrendingUp className="size-4 text-blue-400" />
          </div>
          <div className="text-muted-foreground text-xs">Meets growth projections</div>
        </CardFooter>
      </Card>
    </div>
  )
}
