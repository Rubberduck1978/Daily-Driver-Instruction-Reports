// src/app/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Calendar, Search, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

interface Instruction {
  id: number;
  "Driver ID": string | null;
  "Route": string | null;
  "Run No": string | null;
  "Headway Deviation": number | null;
  "Delay": number | null;
  "Instruction": string | null;
  "Status": string | null;
  "Created at": string | null;
  "Updated at": string | null;
}

export default function Home() {
  const [formData, setFormData] = useState({
    employeeNumber: '',
    route: '',
    runningNumber: '',
    headwayDeviation: '',
    earlyLate: '',
    communicationType: '',
    instruction: ''
  });

  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/instructions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Instruction recorded successfully!');
        setFormData({
          employeeNumber: '',
          route: '',
          runningNumber: '',
          headwayDeviation: '',
          earlyLate: '',
          communicationType: '',
          instruction: ''
        });
        fetchInstructions(); // Refresh the list
      } else {
        toast.error('Failed to record instruction');
      }
    } catch (error) {
      toast.error('An error occurred while recording the instruction');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInstructions = async () => {
    try {
      const response = await fetch('/api/instructions');
      if (response.ok) {
        const data = await response.json();
        setInstructions(data);
      }
    } catch (error) {
      console.error('Error fetching instructions:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 min-h-screen">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">Driver Instruction Tracker</h1>
        <p className="text-purple-200">Record and track instructions given to drivers</p>
      </div>

      <Tabs defaultValue="record" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-purple-700 to-pink-700">
          <TabsTrigger value="record" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900">
            <FileText className="h-4 w-4 mr-2" />
            Record Instruction
          </TabsTrigger>
          <TabsTrigger value="calendar" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="search" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900">
            <Search className="h-4 w-4 mr-2" />
            Search
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900">
            <BarChart3 className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="record" className="space-y-4">
          <Card className="bg-gradient-to-br from-purple-100 to-purple-50 border-purple-300">
            <CardHeader>
              <CardTitle className="text-purple-900">Record New Instruction</CardTitle>
              <CardDescription className="text-purple-700">
                Enter the details below to record a new instruction for a driver
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="employeeNumber">Employee Number (Optional)</Label>
                    <Input
                      id="employeeNumber"
                      placeholder="Emp #"
                      maxLength={15}
                      value={formData.employeeNumber}
                      onChange={(e) => handleInputChange('employeeNumber', e.target.value)}
                      className="bg-amber-50 border-amber-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="route">Route *</Label>
                    <Input
                      id="route"
                      placeholder="Route"
                      required
                      maxLength={10}
                      value={formData.route}
                      onChange={(e) => handleInputChange('route', e.target.value)}
                      className="bg-amber-50 border-amber-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="runningNumber">Running Number *</Label>
                    <Input
                      id="runningNumber"
                      placeholder="Running #"
                      required
                      maxLength={15}
                      value={formData.runningNumber}
                      onChange={(e) => handleInputChange('runningNumber', e.target.value)}
                      className="bg-amber-50 border-amber-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="headwayDeviation">Headway Deviation</Label>
                    <Input
                      id="headwayDeviation"
                      placeholder="e.g., 3.46"
                      maxLength={15}
                      value={formData.headwayDeviation}
                      onChange={(e) => handleInputChange('headwayDeviation', e.target.value)}
                      className="bg-amber-50 border-amber-200"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="earlyLate">How Early or Late</Label>
                    <Input
                      id="earlyLate"
                      placeholder="e.g., 5 min early"
                      maxLength={15}
                      value={formData.earlyLate}
                      onChange={(e) => handleInputChange('earlyLate', e.target.value)}
                      className="bg-amber-50 border-amber-200"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="communicationType">Communication Type</Label>
                    <Select value={formData.communicationType} onValueChange={(value) => handleInputChange('communicationType', value)}>
                      <SelectTrigger className="bg-amber-50 border-amber-200">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="radio">Radio</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="in-person">In Person</SelectItem>
                        <SelectItem value="text">Text Message</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instruction">Instruction *</Label>
                  <Textarea
                    id="instruction"
                    placeholder="Enter the instruction given to the driver"
                    required
                    rows={3}
                    value={formData.instruction}
                    onChange={(e) => handleInputChange('instruction', e.target.value)}
                    className="bg-amber-50 border-amber-200"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-purple-700 hover:bg-purple-800"
                  disabled={isLoading}
                >
                  {isLoading ? 'Recording...' : 'Record Instruction'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card className="bg-gradient-to-br from-purple-100 to-purple-50 border-purple-300">
            <CardHeader>
              <CardTitle className="text-purple-900">Calendar View</CardTitle>
              <CardDescription className="text-purple-700">
                View instructions by date
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-purple-800">Calendar view coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card className="bg-gradient-to-br from-purple-100 to-purple-50 border-purple-300">
            <CardHeader>
              <CardTitle className="text-purple-900">Search Instructions</CardTitle>
              <CardDescription className="text-purple-700">
                Search through recorded instructions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-purple-800">Search functionality coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card className="bg-gradient-to-br from-purple-100 to-purple-50 border-purple-300">
            <CardHeader>
              <CardTitle className="text-purple-900">Reports</CardTitle>
              <CardDescription className="text-purple-700">
                Generate reports and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-purple-800">Reports functionality coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
