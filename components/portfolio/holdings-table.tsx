"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { PortfolioHolding } from "@/types/portfolio"

interface HoldingsTableProps {
  holdings: PortfolioHolding[]
  totalValue: number
  totalGainLoss: number
  totalGainLossPercent: number
}

export function HoldingsTable({
  holdings,
  totalValue,
  totalGainLoss,
  totalGainLossPercent,
}: HoldingsTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Holdings</CardTitle>
        <div className="flex gap-4 mt-2">
          <div>
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Gain/Loss</p>
            <p
              className={`text-2xl font-bold ${
                totalGainLoss >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(totalGainLoss)} ({formatPercent(totalGainLossPercent)})
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Asset Class</TableHead>
              <TableHead className="text-right">Units</TableHead>
              <TableHead className="text-right">Avg Cost</TableHead>
              <TableHead className="text-right">Current Price</TableHead>
              <TableHead className="text-right">Current Value</TableHead>
              <TableHead className="text-right">Gain/Loss</TableHead>
              <TableHead className="text-right">Return %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  No holdings found
                </TableCell>
              </TableRow>
            ) : (
              holdings.map((holding) => (
                <TableRow key={holding.userPortId}>
                  <TableCell className="font-medium">
                    {holding.asset?.assetTicker || "N/A"}
                  </TableCell>
                  <TableCell>{holding.asset?.assetName || "Unknown"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{holding.asset?.assetClass || "N/A"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {holding.assetTotalUnits.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(holding.avgCostPerUnit)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(holding.latestClosePrice || 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(holding.currentAmount || 0)}
                  </TableCell>
                  <TableCell
                    className={`text-right ${
                      (holding.gainLoss || 0) >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(holding.gainLoss || 0)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      (holding.gainLossPercent || 0) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatPercent(holding.gainLossPercent || 0)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
