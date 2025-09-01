
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

type UnitSystem = 'metric' | 'imperial';
type BmiResult = {
  bmi: string;
  category: string;
  className: string;
};

export default function BmiCalculator() {
  const [unit, setUnit] = useState<UnitSystem>('metric');
  const [metricValues, setMetricValues] = useState({ weight: '', height: '' });
  const [imperialValues, setImperialValues] = useState({ weight: '', ft: '', in: '' });
  const [result, setResult] = useState<BmiResult | null>(null);
  const { toast } = useToast();

  const handleUnitChange = (value: string) => {
    setUnit(value as UnitSystem);
    setResult(null);
  };

  const getBmiDetails = (bmi: number): BmiResult => {
    if (bmi < 18.5) {
      return { bmi: bmi.toFixed(1), category: 'Underweight', className: 'text-blue-500' };
    } else if (bmi < 25) {
      return { bmi: bmi.toFixed(1), category: 'Normal weight', className: 'text-primary' };
    } else if (bmi < 30) {
      return { bmi: bmi.toFixed(1), category: 'Overweight', className: 'text-yellow-500' };
    } else {
      return { bmi: bmi.toFixed(1), category: 'Obese', className: 'text-destructive' };
    }
  };

  const calculateBmi = () => {
    setResult(null);
    let bmi;

    if (unit === 'metric') {
      const weight = parseFloat(metricValues.weight);
      const height = parseFloat(metricValues.height);
      if (isNaN(weight) || isNaN(height) || weight <= 0 || height <= 0) {
        toast({ title: 'Invalid Input', description: 'Please enter valid positive numbers for weight and height.', variant: 'destructive' });
        return;
      }
      const heightInMeters = height / 100;
      bmi = weight / (heightInMeters * heightInMeters);
    } else {
      const weight = parseFloat(imperialValues.weight);
      const ft = parseFloat(imperialValues.ft);
      const inches = parseFloat(imperialValues.in);
      if (isNaN(weight) || isNaN(ft) || isNaN(inches) || weight <= 0 || (ft <= 0 && inches <= 0)) {
        toast({ title: 'Invalid Input', description: 'Please enter valid positive numbers for weight and height.', variant: 'destructive' });
        return;
      }
      const totalInches = (ft * 12) + inches;
      if (totalInches <= 0) {
        toast({ title: 'Invalid Input', description: 'Total height must be a positive number.', variant: 'destructive' });
        return;
      }
      bmi = (weight / (totalInches * totalInches)) * 703;
    }
    
    setResult(getBmiDetails(bmi));
  };
  
  return (
    <div className="w-full max-w-md">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline tracking-tight">BMI QuickCheck</CardTitle>
          <CardDescription>Select your preferred units and enter your details below.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={unit} onValueChange={handleUnitChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="metric">Metric</TabsTrigger>
              <TabsTrigger value="imperial">Imperial</TabsTrigger>
            </TabsList>
            <TabsContent value="metric" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="metric-weight">Weight (kg)</Label>
                <Input id="metric-weight" type="number" placeholder="e.g., 70" value={metricValues.weight} onChange={(e) => setMetricValues({ ...metricValues, weight: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metric-height">Height (cm)</Label>
                <Input id="metric-height" type="number" placeholder="e.g., 175" value={metricValues.height} onChange={(e) => setMetricValues({ ...metricValues, height: e.target.value })} />
              </div>
            </TabsContent>
            <TabsContent value="imperial" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="imperial-weight">Weight (lbs)</Label>
                <Input id="imperial-weight" type="number" placeholder="e.g., 155" value={imperialValues.weight} onChange={(e) => setImperialValues({ ...imperialValues, weight: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Height</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input type="number" placeholder="feet" value={imperialValues.ft} onChange={(e) => setImperialValues({ ...imperialValues, ft: e.target.value })} aria-label="Height in feet"/>
                  <Input type="number" placeholder="inches" value={imperialValues.in} onChange={(e) => setImperialValues({ ...imperialValues, in: e.target.value })} aria-label="Height in inches"/>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <Button onClick={calculateBmi} className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">
            Calculate BMI <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
      
      {result && (
        <Card className="mt-6 shadow-lg animate-in fade-in-50 duration-500">
          <CardHeader>
            <CardTitle>Your Result</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
             <p className="text-6xl font-bold font-headline">{result.bmi}</p>
             <p className={cn("text-lg font-semibold mt-2", result.className)}>{result.category}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
