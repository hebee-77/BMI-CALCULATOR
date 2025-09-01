
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ArrowRight, Flame } from 'lucide-react';

type UnitSystem = 'metric' | 'imperial';
type BmiResult = {
  bmi: string;
  category: string;
  className: string;
};
type CalorieResult = {
  maintenance: number;
  loseWeight: number;
  gainWeight: number;
};
type Gender = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
type Goal = 'lose' | 'maintain' | 'gain';

export default function BmiCalculator() {
  const [unit, setUnit] = useState<UnitSystem>('metric');
  const [metricValues, setMetricValues] = useState({ weight: '', height: '' });
  const [imperialValues, setImperialValues] = useState({ weight: '', ft: '', in: '' });
  const [result, setResult] = useState<BmiResult | null>(null);
  const [calorieResult, setCalorieResult] = useState<CalorieResult | null>(null);
  const { toast } = useToast();

  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('sedentary');
  const [goal, setGoal] = useState<Goal>('maintain');

  const handleUnitChange = (value: string) => {
    setUnit(value as UnitSystem);
    setResult(null);
    setCalorieResult(null);
  };

  const getBmiDetails = (bmi: number): BmiResult => {
    if (bmi < 18.5) {
      return { bmi: bmi.toFixed(1), category: 'Underweight', className: 'text-blue-400' };
    } else if (bmi < 25) {
      return { bmi: bmi.toFixed(1), category: 'Normal weight', className: 'text-green-400' };
    } else if (bmi < 30) {
      return { bmi: bmi.toFixed(1), category: 'Overweight', className: 'text-yellow-400' };
    } else {
      return { bmi: bmi.toFixed(1), category: 'Obese', className: 'text-red-400' };
    }
  };

  const calculateCalories = (weightKg: number, heightCm: number, age: number, gender: Gender, activityLevel: ActivityLevel) => {
    let bmr;
    if (gender === 'male') {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    }

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9,
    };

    const tdee = bmr * activityMultipliers[activityLevel];
    
    setCalorieResult({
      maintenance: Math.round(tdee),
      loseWeight: Math.round(tdee - 500),
      gainWeight: Math.round(tdee + 500),
    });
  };

  const calculateBmiAndCalories = () => {
    setResult(null);
    setCalorieResult(null);
    let bmi;
    let weightKg: number;
    let heightCm: number;

    const ageNum = parseInt(age);
    if(isNaN(ageNum) || ageNum <= 0) {
        toast({ title: 'Invalid Input', description: 'Please enter a valid age.', variant: 'destructive' });
        return;
    }

    if (unit === 'metric') {
      const weight = parseFloat(metricValues.weight);
      const height = parseFloat(metricValues.height);
      if (isNaN(weight) || isNaN(height) || weight <= 0 || height <= 0) {
        toast({ title: 'Invalid Input', description: 'Please enter valid positive numbers for weight and height.', variant: 'destructive' });
        return;
      }
      weightKg = weight;
      heightCm = height;
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
      weightKg = weight * 0.453592;
      heightCm = totalInches * 2.54;
      bmi = (weight / (totalInches * totalInches)) * 703;
    }
    
    setResult(getBmiDetails(bmi));
    calculateCalories(weightKg, heightCm, ageNum, gender, activityLevel);
  };
  
  const cardClassName = "bg-white/10 backdrop-filter backdrop-blur-sm border border-white/20 text-white shadow-lg";
  const inputClassName = "bg-white/10 border-white/20 placeholder-gray-400 focus:bg-white/10"
  const selectTriggerClassName = "bg-white/10 border-white/20"
  const tabsListClassName = "bg-white/10"


  return (
    <div className="w-full max-w-md">
      <Card className={cn("shadow-lg", cardClassName)}>
        <CardHeader>
          <CardTitle className="text-3xl font-headline tracking-tight">BMI & Calorie QuickCheck</CardTitle>
          <CardDescription className="text-gray-300">Select your preferred units and enter your details below.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={unit} onValueChange={handleUnitChange} className="w-full">
            <TabsList className={cn("grid w-full grid-cols-2", tabsListClassName)}>
              <TabsTrigger value="metric">Metric</TabsTrigger>
              <TabsTrigger value="imperial">Imperial</TabsTrigger>
            </TabsList>
            <TabsContent value="metric" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="metric-weight">Weight (kg)</Label>
                <Input id="metric-weight" type="number" placeholder="e.g., 70" value={metricValues.weight} onChange={(e) => setMetricValues({ ...metricValues, weight: e.target.value })} className={inputClassName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metric-height">Height (cm)</Label>
                <Input id="metric-height" type="number" placeholder="e.g., 175" value={metricValues.height} onChange={(e) => setMetricValues({ ...metricValues, height: e.target.value })} className={inputClassName}/>
              </div>
            </TabsContent>
            <TabsContent value="imperial" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="imperial-weight">Weight (lbs)</Label>
                <Input id="imperial-weight" type="number" placeholder="e.g., 155" value={imperialValues.weight} onChange={(e) => setImperialValues({ ...imperialValues, weight: e.target.value })} className={inputClassName}/>
              </div>
              <div className="space-y-2">
                <Label>Height</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input type="number" placeholder="feet" value={imperialValues.ft} onChange={(e) => setImperialValues({ ...imperialValues, ft: e.target.value })} aria-label="Height in feet" className={inputClassName}/>
                  <Input type="number" placeholder="inches" value={imperialValues.in} onChange={(e) => setImperialValues({ ...imperialValues, in: e.target.value })} aria-label="Height in inches" className={inputClassName}/>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" type="number" placeholder="e.g., 25" value={age} onChange={(e) => setAge(e.target.value)} className={inputClassName}/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
                        <SelectTrigger id="gender" className={selectTriggerClassName}>
                            <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent className={cardClassName}>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="activity-level">Activity Level</Label>
                 <Select value={activityLevel} onValueChange={(v) => setActivityLevel(v as ActivityLevel)}>
                    <SelectTrigger id="activity-level" className={selectTriggerClassName}>
                        <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
                    <SelectContent className={cardClassName}>
                        <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                        <SelectItem value="light">Lightly active (light exercise/sports 1-3 days/week)</SelectItem>
                        <SelectItem value="moderate">Moderately active (moderate exercise/sports 3-5 days/week)</SelectItem>
                        <SelectItem value="active">Very active (hard exercise/sports 6-7 days a week)</SelectItem>
                        <SelectItem value="veryActive">Super active (very hard exercise/sports & physical job)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>


          <Button onClick={calculateBmiAndCalories} className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">
            Calculate BMI & Calories <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
      
      {result && (
        <Card className={cn("mt-6 animate-in fade-in-50 duration-500", cardClassName)}>
          <CardHeader>
            <CardTitle>Your BMI Result</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
             <p className="text-6xl font-bold font-headline">{result.bmi}</p>
             <p className={cn("text-lg font-semibold mt-2", result.className)}>{result.category}</p>
          </CardContent>
        </Card>
      )}

      {calorieResult && (
        <Card className={cn("mt-6 animate-in fade-in-50 duration-500", cardClassName)}>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Flame className="h-6 w-6 text-primary"/>
                    <CardTitle>Daily Calorie Needs</CardTitle>
                </div>
                <CardDescription className="text-gray-300">
                    Choose a goal to see your recommended daily calorie intake. This is an estimate.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <RadioGroup value={goal} onValueChange={(v) => setGoal(v as Goal)} className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                        <RadioGroupItem value="lose" id="lose" className="peer sr-only" />
                        <Label htmlFor="lose" className="flex flex-col items-center justify-between rounded-full border-2 border-white/20 bg-transparent p-4 hover:bg-white/20 hover:text-white peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            Lose Weight
                        </Label>
                    </div>
                     <div>
                        <RadioGroupItem value="maintain" id="maintain" className="peer sr-only" />
                        <Label htmlFor="maintain" className="flex flex-col items-center justify-between rounded-full border-2 border-white/20 bg-transparent p-4 hover:bg-white/20 hover:text-white peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            Maintain
                        </Label>
                    </div>
                     <div>
                        <RadioGroupItem value="gain" id="gain" className="peer sr-only" />
                        <Label htmlFor="gain" className="flex flex-col items-center justify-between rounded-full border-2 border-white/20 bg-transparent p-4 hover:bg-white/20 hover:text-white peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            Gain Weight
                        </Label>
                    </div>
                </RadioGroup>

                <div className="text-center bg-black/20 p-4 rounded-lg">
                    <p className="text-sm text-gray-300">Your suggested daily calorie intake is</p>
                    <p className="text-4xl font-bold font-headline text-primary">
                        {goal === 'lose' && calorieResult.loseWeight}
                        {goal === 'maintain' && calorieResult.maintenance}
                        {goal === 'gain' && calorieResult.gainWeight}
                    </p>
                    <p className="text-sm text-gray-300">calories/day</p>
                </div>

                <div className="mt-4 text-xs text-gray-400 space-y-2">
                    <p>
                        <span className="font-semibold text-gray-300">Maintenance:</span> {calorieResult.maintenance} kcal/day is the amount of calories required to maintain your current weight.
                    </p>
                    <p>
                        <span className="font-semibold text-gray-300">Calorie Deficit (for weight loss):</span> A deficit of 500 kcal/day, like the suggested {calorieResult.loseWeight} kcal/day, is generally recommended for sustainable weight loss of about 1 lb (0.5 kg) per week.
                    </p>
                    <p>
                       <span className="font-semibold text-gray-300">Calorie Surplus (for weight gain):</span> A surplus of 500 kcal/day, like the suggested {calorieResult.gainWeight} kcal/day, can help in gaining weight, primarily muscle mass when combined with strength training.
                    </p>
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
