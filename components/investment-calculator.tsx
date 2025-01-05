'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts'
import '../i18n'

type ChartDataType = { year: number; value: number; adjustedValue: number; }[];

export default function InvestmentCalculator() {
  const { t, i18n } = useTranslation()
  const [initialInvestment, setInitialInvestment] = useState(10000)
  const [annualReturn, setAnnualReturn] = useState(7)
  const [years, setYears] = useState(10)
  const [compoundingFrequency, setCompoundingFrequency] = useState('annually')
  const [contributions, setContributions] = useState(100)
  const [inflationRate, setInflationRate] = useState(2)
  const [futureValue, setFutureValue] = useState(0)
  const [inflationAdjustedValue, setInflationAdjustedValue] = useState(0)
  const [chartData, setChartData] = useState<ChartDataType>();

  useEffect(() => {
    const calculateFutureValue = () => {
      const P = initialInvestment
      const r = annualReturn / 100
      const t = years
      let n = 1
      if (compoundingFrequency === 'monthly') n = 12
      if (compoundingFrequency === 'daily') n = 365
      const C = contributions * (compoundingFrequency === 'annually' ? 1 : 12)

      const FV = P * Math.pow(1 + r/n, n*t) + C * (Math.pow(1 + r/n, n*t) - 1) / (r/n)
      const inflationAdjusted = FV / Math.pow(1 + inflationRate/100, t)

      setFutureValue(FV)
      setInflationAdjustedValue(inflationAdjusted)

      const newChartData: ChartDataType = [];
      for (let i = 0; i <= t; i++) {
        const yearFV = P * Math.pow(1 + r/n, n*i) + C * (Math.pow(1 + r/n, n*i) - 1) / (r/n)
        const yearInflationAdjusted = yearFV / Math.pow(1 + inflationRate/100, i)
        newChartData.push({
          year: i,
          value: Math.round(yearFV),
          adjustedValue: Math.round(yearInflationAdjusted)
        })
      }
      setChartData(newChartData)
    }

    calculateFutureValue()
  }, [initialInvestment, annualReturn, years, compoundingFrequency, contributions, inflationRate])

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </div>
          <div>
            <Button onClick={() => changeLanguage('en')} className="mr-2">English</Button>
            <Button onClick={() => changeLanguage('no')}>Norsk</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="initial-investment">{t('initialInvestment')}</Label>
              <Input
                id="initial-investment"
                type="number"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(Number(e.target.value))}
              />
            </div>
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label htmlFor="annual-return">{t('annualReturn')}</Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('annualReturnTooltip')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Slider
                id="annual-return"
                min={0}
                max={20}
                step={0.1}
                value={[annualReturn]}
                onValueChange={(value) => setAnnualReturn(value[0])}
              />
              <div className="text-right">{annualReturn.toFixed(1)}%</div>
            </div>
            <div>
              <Label htmlFor="years">{t('years')}</Label>
              <Input
                id="years"
                type="number"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
              />
            </div>
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label htmlFor="compounding-frequency">{t('compoundingFrequency')}</Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('compoundingFrequencyTooltip')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Select value={compoundingFrequency} onValueChange={setCompoundingFrequency}>
                <SelectTrigger id="compounding-frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annually">{t('annually')}</SelectItem>
                  <SelectItem value="monthly">{t('monthly')}</SelectItem>
                  <SelectItem value="daily">{t('daily')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
            <Label htmlFor="contributions">{t('monthlyContributions')}</Label>
              <Input
                id="contributions"
                type="number"
                value={contributions}
                onChange={(e) => setContributions(Number(e.target.value))}
              />
            </div>
            <div>
              <TooltipProvider>
              <Tooltip>
                  <TooltipTrigger asChild>
                    <Label htmlFor="inflation-rate">{t('inflationRate')}</Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('inflationRateTooltip')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Slider
                id="inflation-rate"
                min={0}
                max={10}
                step={0.1}
                value={[inflationRate]}
                onValueChange={(value) => setInflationRate(value[0])}
              />
              <div className="text-right">{inflationRate.toFixed(1)}%</div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{t('results')}</h3>
              <p>{t('futureValue')}: {new Intl.NumberFormat(t('langCode'), { style: 'currency', currency: t('currencyCode') }).format(
    futureValue,
  )}</p>
              <p>{t('inflationAdjustedValue')}: {new Intl.NumberFormat(t('langCode'), { style: 'currency', currency: t('currencyCode') }).format(inflationAdjustedValue)}</p>
              <p>{t('totalContributions')}: {new Intl.NumberFormat(t('langCode'), { style: 'currency', currency: t('currencyCode') }).format((initialInvestment + contributions * 12 * years))}</p>
              <p>{t('totalGain')}: {new Intl.NumberFormat(t('langCode'), { style: 'currency', currency: t('currencyCode') }).format((futureValue - initialInvestment - contributions * 12 * years))}</p>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" name={t('futureValue')} />
                  <Line type="monotone" dataKey="adjustedValue" stroke="#82ca9d" name={t('inflationAdjustedValue')} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

