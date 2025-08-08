'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { CalendarIcon, SearchIcon, FileTextIcon, BarChart3Icon, CopyIcon, UserIcon } from 'lucide-react'
import { format } from 'date-fns'

export default function Home() {
  const [formData, setFormData] = useState({
    employeeNumber: '',
    route: '',
    runningNumber: '',
    headwayDeviation: '',
    earlyLate: '',
    instruction: '',
    communicationType: ''
  })
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [searchTerm, setSearchTerm] = useState('')
  const [instructions, setInstructions] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [summaryDate, setSummaryDate] = useState<Date | undefined>(new Date())
  const [selectedEmployee, setSelectedEmployee] = useState<string>('')
  const [summaryText, setSummaryText] = useState<string>('')
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [copied, setCopied] = useState(false)
  const [editEmployeeNumber, setEditEmployeeNumber] = useState<string>('')
  const [editTimestamp, setEditTimestamp] = useState<string>('')
  const [allowTimestampEdit, setAllowTimestampEdit] = useState(false)
  const [editingInstructionId, setEditingInstructionId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [dailySummaryText, setDailySummaryText] = useState<string>('')
  const [dailyCopied, setDailyCopied] = useState(false)

  useEffect(() => {
    fetchInstructions()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/instructions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        setFormData({
          employeeNumber: '',
          route: '',
          runningNumber: '',
          headwayDeviation: '',
          earlyLate: '',
          instruction: '',
          communicationType: ''
        })
        // Refresh instructions list
        fetchInstructions()
      }
    } catch (error) {
      console.error('Error submitting instruction:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const fetchInstructions = async () => {
    try {
      const response = await fetch('/api/instructions')
      if (response.ok) {
        const data = await response.json()
        setInstructions(data)
      }
    } catch (error) {
      console.error('Error fetching instructions:', error)
    }
  }

  const filteredInstructions = instructions.filter(instruction => {
    if (!searchTerm) return true
    return (
      (instruction.employeeNumber && instruction.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      instruction.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instruction.runningNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (instruction.headwayDeviation && instruction.headwayDeviation.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (instruction.earlyLate && instruction.earlyLate.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })

  const getDriverStats = () => {
    const stats: { [key: string]: number } = {}
    instructions.forEach(instruction => {
      const key = instruction.employeeNumber || 'Information Entry'
      stats[key] = (stats[key] || 0) + 1
    })
    return Object.entries(stats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
  }

  const getUniqueEmployees = () => {
    const employees = new Set<string>()
    instructions.forEach(instruction => {
      if (instruction.employeeNumber) {
        employees.add(instruction.employeeNumber)
      }
    })
    return Array.from(employees).sort()
  }

  const generateSummary = () => {
    if (!selectedEmployee || !summaryDate) return

    setIsGeneratingSummary(true)
    
    const employeeInstructions = instructions.filter(instruction => {
      if (!instruction.employeeNumber || instruction.employeeNumber !== selectedEmployee) return false
      
      const instructionDate = new Date(instruction.timestamp)
      return instructionDate.toDateString() === summaryDate.toDateString()
    })

    if (employeeInstructions.length === 0) {
      setSummaryText(`No instructions found for employee ${selectedEmployee} on ${format(summaryDate, 'PPP')}.`)
      setIsGeneratingSummary(false)
      return
    }

    const sortedInstructions = employeeInstructions.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    let summary = `DRIVER INSTRUCTION SUMMARY\n`
    summary += `=========================\n\n`
    summary += `Employee: ${selectedEmployee}\n`
    summary += `Date: ${format(summaryDate, 'PPP')}\n`
    summary += `Total Instructions: ${employeeInstructions.length}\n\n`
    summary += `INSTRUCTION DETAILS:\n`
    summary += `-------------------\n\n`

    sortedInstructions.forEach((instruction, index) => {
      summary += `${index + 1}. Time: ${format(new Date(instruction.timestamp), 'HH:mm')}\n`
      summary += `   Route: ${instruction.route}\n`
      summary += `   Running Number: ${instruction.runningNumber}\n`
      if (instruction.headwayDeviation) {
        summary += `   Headway Deviation: ${instruction.headwayDeviation} mins too close to leader\n`
      }
      if (instruction.earlyLate) {
        const earlyLateText = instruction.earlyLate.toLowerCase().includes('e') ? 'Early' : 'Late'
        summary += `   Schedule: ${earlyLateText}\n`
      }
      if (instruction.communicationType) {
        summary += `   Communication: ${instruction.communicationType}\n`
      }
      summary += `   Instruction: ${instruction.instruction}\n\n`
    })

    summary += `Generated on: ${format(new Date(), 'PPP p')}`

    setSummaryText(summary)
    setIsGeneratingSummary(false)
  }

  const getEntryCountForDate = () => {
    if (!selectedDate) return 0
    return instructions.filter(instruction => {
      const instructionDate = new Date(instruction.timestamp)
      return instructionDate.toDateString() === selectedDate.toDateString()
    }).length
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(summaryText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const startEditing = (instruction: any) => {
    setEditingInstructionId(instruction.id)
    setEditEmployeeNumber(instruction.employeeNumber || '')
    setEditTimestamp(format(new Date(instruction.timestamp), 'yyyy-MM-ddTHH:mm'))
    setAllowTimestampEdit(false)
  }

  const saveEdits = async (instructionId: string) => {
    try {
      const updateData: any = {}
      
      if (editEmployeeNumber !== undefined) {
        updateData.employeeNumber = editEmployeeNumber || null
      }
      
      if (allowTimestampEdit && editTimestamp) {
        updateData.timestamp = new Date(editTimestamp)
      }

      const response = await fetch(`/api/instructions/${instructionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        setEditingInstructionId(null)
        fetchInstructions()
      }
    } catch (error) {
      console.error('Error saving edits:', error)
    }
  }

  const cancelEditing = () => {
    setEditingInstructionId(null)
    setEditEmployeeNumber('')
    setEditTimestamp('')
    setAllowTimestampEdit(false)
  }

  const deleteInstruction = async (instructionId: string) => {
    try {
      const response = await fetch(`/api/instructions/${instructionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setShowDeleteConfirm(null)
        fetchInstructions()
      }
    } catch (error) {
      console.error('Error deleting instruction:', error)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 min-h-screen">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">Driver Instruction Tracker</h1>
        <p className="text-purple-200">Record and track instructions given to drivers</p>
      </div>

      <Tabs defaultValue="record" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-purple-700 to-pink-700">
          <TabsTrigger value="record" className="flex items-center gap-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900">
            <FileTextIcon className="h-4 w-4" />
            Record Instruction
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900">
            <CalendarIcon className="h-4 w-4" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900">
            <SearchIcon className="h-4 w-4" />
            Search
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900">
            <BarChart3Icon className="h-4 w-4" />
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
                    <Label htmlFor="employeeNumber" className="text-sm">Employee Number (Optional)</Label>
                    <Input
                      id="employeeNumber"
                      value={formData.employeeNumber}
                      onChange={(e) => handleInputChange('employeeNumber', e.target.value)}
                      placeholder="Emp #"
                      className="bg-amber-50 border-amber-200 h-9 text-sm"
                      maxLength={15}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="route" className="text-sm">Route *</Label>
                    <Input
                      id="route"
                      value={formData.route}
                      onChange={(e) => handleInputChange('route', e.target.value)}
                      placeholder="Route"
                      required
                      className="bg-amber-50 border-amber-200 h-9 text-sm"
                      maxLength={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="runningNumber" className="text-sm">Running Number *</Label>
                    <Input
                      id="runningNumber"
                      value={formData.runningNumber}
                      onChange={(e) => handleInputChange('runningNumber', e.target.value)}
                      placeholder="Running #"
                      required
                      className="bg-amber-50 border-amber-200 h-9 text-sm"
                      maxLength={15}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="headwayDeviation" className="text-sm">Headway Deviation</Label>
                    <Input
                      id="headwayDeviation"
                      value={formData.headwayDeviation}
                      onChange={(e) => handleInputChange('headwayDeviation', e.target.value)}
                      placeholder="e.g., 3.46"
                      className="bg-amber-50 border-amber-200 h-9 text-sm"
                      maxLength={15}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="earlyLate" className="text-sm">How Early or Late</Label>
                    <Input
                      id="earlyLate"
                      value={formData.earlyLate}
                      onChange={(e) => handleInputChange('earlyLate', e.target.value)}
                      placeholder="e.g., 5 min early"
                      className="bg-amber-50 border-amber-200 h-9 text-sm"
                      maxLength={15}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="communicationType" className="text-sm">Communication Type</Label>
                    <Select value={formData.communicationType} onValueChange={(value) => handleInputChange('communicationType', value)}>
                      <SelectTrigger className="bg-amber-50 border-amber-200 h-9 text-sm">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Message Sent">Message Sent</SelectItem>
                        <SelectItem value="Radio Call">Radio Call</SelectItem>
                        <SelectItem value="Information">Information</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instruction" className="text-sm">Instruction *</Label>
                  <Textarea
                    id="instruction"
                    value={formData.instruction}
                    onChange={(e) => handleInputChange('instruction', e.target.value)}
                    placeholder="Enter the instruction given to the driver"
                    required
                    className="bg-amber-50 border-amber-200"
                    rows={3}
                  />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full bg-purple-700 hover:bg-purple-800">
                  {isSubmitting ? 'Recording...' : 'Record Instruction'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-purple-100 to-blue-100 border-purple-300">
              <CardHeader>
                <CardTitle className="text-purple-900">Select Date</CardTitle>
                <CardDescription className="text-purple-700">
                  Choose a date to view instructions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-purple-300">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-purple-900">Instructions for {selectedDate ? format(selectedDate, 'PPP') : 'Selected Date'}</CardTitle>
                    <CardDescription className="text-purple-700">
                      View all instructions given on this date
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-700">{getEntryCountForDate()}</div>
                    <div className="text-sm text-purple-600">Total Entries</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredInstructions
                    .filter(instruction => {
                      if (!selectedDate) return true
                      const instructionDate = new Date(instruction.timestamp)
                      return instructionDate.toDateString() === selectedDate.toDateString()
                    })
                        .map((instruction) => (
                      <div key={instruction.id} className="border rounded-lg p-3 space-y-2 bg-purple-50/80 backdrop-blur-sm border-purple-200">
                        {editingInstructionId === instruction.id ? (
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <Badge variant="outline" className="bg-purple-200 text-purple-900">Employee: {instruction.employeeNumber || 'Information Entry'}</Badge>
                                <p className="text-sm text-purple-700">
                                  {format(new Date(instruction.timestamp), 'PPp')}
                                </p>
                              </div>
                              <Button
                                onClick={cancelEditing}
                                variant="outline"
                                size="sm"
                                className="bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200"
                              >
                                Cancel
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div><strong className="text-purple-800">Route:</strong> {instruction.route}</div>
                              <div><strong className="text-purple-800">Running:</strong> {instruction.runningNumber}</div>
                              {instruction.headwayDeviation && (
                                <div><strong className="text-purple-800">Headway Deviation:</strong> {instruction.headwayDeviation}</div>
                              )}
                              {instruction.earlyLate && (
                                <div><strong className="text-purple-800">Early/Late:</strong> {instruction.earlyLate}</div>
                              )}
                            </div>
                            <p className="text-sm"><strong className="text-purple-800">Instruction:</strong> {instruction.instruction}</p>
                            
                            <div className="border-t border-purple-200 pt-3 space-y-3 bg-purple-100/50 -m-3 p-3 rounded-b-lg">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <Label htmlFor={`edit-employee-cal-${instruction.id}`} className="text-sm text-purple-800">Edit Employee Number</Label>
                                  <Input
                                    id={`edit-employee-cal-${instruction.id}`}
                                    value={editEmployeeNumber}
                                    onChange={(e) => setEditEmployeeNumber(e.target.value)}
                                    placeholder="Enter employee number"
                                    className="bg-amber-50 border-amber-200 h-8 text-sm"
                                    maxLength={15}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`edit-timestamp-cal-${instruction.id}`}
                                      checked={allowTimestampEdit}
                                      onCheckedChange={(checked) => setAllowTimestampEdit(checked as boolean)}
                                    />
                                    <Label htmlFor={`edit-timestamp-cal-${instruction.id}`} className="text-sm text-purple-800">Edit Timestamp</Label>
                                  </div>
                                  {allowTimestampEdit && (
                                    <Input
                                      type="datetime-local"
                                      value={editTimestamp}
                                      onChange={(e) => setEditTimestamp(e.target.value)}
                                      className="bg-amber-50 border-amber-200 h-8 text-sm"
                                    />
                                  )}
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  onClick={() => saveEdits(instruction.id)}
                                  size="sm"
                                  className="bg-purple-700 hover:bg-purple-800 text-white"
                                >
                                  Save Changes
                                </Button>
                                {showDeleteConfirm === instruction.id ? (
                                  <div className="flex space-x-2">
                                    <Button
                                      onClick={() => deleteInstruction(instruction.id)}
                                      size="sm"
                                      variant="destructive"
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Confirm Delete
                                    </Button>
                                    <Button
                                      onClick={() => setShowDeleteConfirm(null)}
                                      size="sm"
                                      variant="outline"
                                      className="bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    onClick={() => setShowDeleteConfirm(instruction.id)}
                                    size="sm"
                                    variant="destructive"
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <Badge variant="outline" className="bg-purple-200 text-purple-900">Employee: {instruction.employeeNumber || 'Information Entry'}</Badge>
                                <p className="text-sm text-purple-700">
                                  {format(new Date(instruction.timestamp), 'PPp')}
                                </p>
                              </div>
                              <Button
                                onClick={() => startEditing(instruction)}
                                variant="outline"
                                size="sm"
                                className="bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200"
                              >
                                Edit
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div><strong className="text-purple-800">Route:</strong> {instruction.route}</div>
                              <div><strong className="text-purple-800">Running:</strong> {instruction.runningNumber}</div>
                              {instruction.headwayDeviation && (
                                <div><strong className="text-purple-800">Headway Deviation:</strong> {instruction.headwayDeviation}</div>
                              )}
                              {instruction.earlyLate && (
                                <div><strong className="text-purple-800">Early/Late:</strong> {instruction.earlyLate}</div>
                              )}
                            </div>
                            <p className="text-sm"><strong className="text-purple-800">Instruction:</strong> {instruction.instruction}</p>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card className="bg-gradient-to-br from-purple-100 to-green-100 border-purple-300">
            <CardHeader>
              <CardTitle className="text-purple-900">Search Instructions</CardTitle>
              <CardDescription className="text-purple-700">
                Search by employee number, route, running number, headway deviation, or early/late status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-purple-600" />
                <Input
                  placeholder="Search by employee number, route, running number, headway deviation, or early/late status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-amber-50 border-amber-200"
                />
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredInstructions.map((instruction) => (
                  <div key={instruction.id} className="border rounded-lg p-3 space-y-2 bg-purple-50/80 border-purple-200">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <Badge variant="outline" className="bg-purple-200 text-purple-900">Employee: {instruction.employeeNumber}</Badge>
                        <p className="text-sm text-purple-700">
                          {format(new Date(instruction.timestamp), 'PPp')}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong className="text-purple-800">Route:</strong> {instruction.route}</div>
                      <div><strong className="text-purple-800">Running:</strong> {instruction.runningNumber}</div>
                      {instruction.headwayDeviation && (
                        <div><strong className="text-purple-800">Headway Deviation:</strong> {instruction.headwayDeviation}</div>
                      )}
                      {instruction.earlyLate && (
                        <div><strong className="text-purple-800">Early/Late:</strong> {instruction.earlyLate}</div>
                      )}
                    </div>
                    <p className="text-sm"><strong className="text-purple-800">Instruction:</strong> {instruction.instruction}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-purple-100 to-yellow-100 border-purple-300">
              <CardHeader>
                <CardTitle className="text-purple-900">Driver Instruction Statistics</CardTitle>
                <CardDescription className="text-purple-700">
                  Number of times each driver has been instructed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {getDriverStats().map(([employeeNumber, count]) => (
                    <div key={employeeNumber} className="flex justify-between items-center p-2 border rounded bg-purple-50/80 border-purple-200">
                      <Badge variant="outline" className="bg-purple-200 text-purple-900">{employeeNumber}</Badge>
                      <span className="font-semibold text-purple-800">{count} instructions</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-100 to-green-100 border-purple-300">
              <CardHeader>
                <CardTitle className="text-purple-900">Daily Report</CardTitle>
                <CardDescription className="text-purple-700">
                  Generate a report of all instructions given on a specific day
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-purple-800">Select Date</Label>
                  <Calendar
                    mode="single"
                    selected={summaryDate}
                    onSelect={setSummaryDate}
                    className="rounded-md border"
                  />
                </div>
                <div className="space-y-2">
                  <Button 
                    onClick={() => {
                      const dailyInstructions = instructions.filter(instruction => {
                        if (!summaryDate) return false
                        const instructionDate = new Date(instruction.timestamp)
                        return instructionDate.toDateString() === summaryDate.toDateString()
                      })
                      
                      if (dailyInstructions.length === 0) {
                        setDailySummaryText(`No instructions found for ${format(summaryDate, 'PPP')}.`)
                        return
                      }
                      
                      const sortedInstructions = dailyInstructions.sort((a, b) => 
                        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                      )
                      
                      let summary = `DAILY INSTRUCTION REPORT\n`
                      summary += `========================\n\n`
                      summary += `Date: ${format(summaryDate, 'PPP')}\n`
                      summary += `Total Instructions: ${dailyInstructions.length}\n\n`
                      summary += `INSTRUCTION DETAILS:\n`
                      summary += `-------------------\n\n`
                      
                      sortedInstructions.forEach((instruction, index) => {
                        summary += `${index + 1}. Time: ${format(new Date(instruction.timestamp), 'HH:mm')}\n`
                        summary += `   Employee: ${instruction.employeeNumber || 'Information Entry'}\n`
                        summary += `   Route: ${instruction.route}\n`
                        summary += `   Running Number: ${instruction.runningNumber}\n`
                        if (instruction.headwayDeviation) {
                          summary += `   Headway Deviation: ${instruction.headwayDeviation} mins too close to leader\n`
                        }
                        if (instruction.earlyLate) {
                          const earlyLateText = instruction.earlyLate.toLowerCase().includes('e') ? 'Early' : 'Late'
                          summary += `   Schedule: ${earlyLateText}\n`
                        }
                        if (instruction.communicationType) {
                          summary += `   Communication: ${instruction.communicationType}\n`
                        }
                        summary += `   Instruction: ${instruction.instruction}\n\n`
                      })
                      
                      summary += `Generated on: ${format(new Date(), 'PPP p')}`
                      
                      setDailySummaryText(summary)
                    }} 
                    disabled={!summaryDate}
                    className="w-full bg-purple-700 hover:bg-purple-800"
                  >
                    Generate Daily Report
                  </Button>
                  {dailySummaryText && (
                    <Button 
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(dailySummaryText)
                          setDailyCopied(true)
                          setTimeout(() => setDailyCopied(false), 2000)
                        } catch (error) {
                          console.error('Failed to copy to clipboard:', error)
                        }
                      }} 
                      variant="outline"
                      className="w-full bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200"
                    >
                      <CopyIcon className="h-4 w-4 mr-2" />
                      {dailyCopied ? 'Copied!' : 'Copy to Clipboard'}
                    </Button>
                  )}
                </div>
                
                {dailySummaryText && (
                  <div className="space-y-2">
                    <Label className="text-purple-800">Daily Report</Label>
                    <Textarea
                      value={dailySummaryText}
                      readOnly
                      className="min-h-[300px] font-mono text-sm bg-amber-50 border-amber-200"
                      placeholder="Generated daily report will appear here..."
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-br from-purple-100 to-indigo-100 border-purple-300">
            <CardHeader>
              <CardTitle className="text-purple-900">All Instructions</CardTitle>
              <CardDescription className="text-purple-700">
                Complete list of all recorded instructions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-purple-100">
                      <TableHead className="text-purple-900">Employee</TableHead>
                      <TableHead className="text-purple-900">Route</TableHead>
                      <TableHead className="text-purple-900">Running</TableHead>
                      <TableHead className="text-purple-900">Headway Deviation</TableHead>
                      <TableHead className="text-purple-900">Early/Late</TableHead>
                      <TableHead className="text-purple-900">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {instructions.map((instruction) => (
                      <TableRow key={instruction.id} className="border-purple-200">
                        <TableCell className="font-medium text-purple-800">{instruction.employeeNumber || 'Information Entry'}</TableCell>
                        <TableCell className="text-purple-700">{instruction.route}</TableCell>
                        <TableCell className="text-purple-700">{instruction.runningNumber}</TableCell>
                        <TableCell className="text-purple-700">{instruction.headwayDeviation || '-'}</TableCell>
                        <TableCell className="text-purple-700">{instruction.earlyLate || '-'}</TableCell>
                        <TableCell className="text-purple-700">
                          {format(new Date(instruction.timestamp), 'MMM dd, HH:mm')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-100 to-purple-50 border-purple-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <FileTextIcon className="h-5 w-5" />
                Generate Employee Summary
              </CardTitle>
              <CardDescription className="text-purple-700">
                Generate a summary of all instructions given to a specific employee on a selected date
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee-select" className="text-purple-800">Select Employee</Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger className="bg-amber-50 border-amber-200">
                      <SelectValue placeholder="Choose an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {getUniqueEmployees().map((employee) => (
                        <SelectItem key={employee} value={employee}>
                          {employee}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-purple-800">Select Date</Label>
                  <Calendar
                    mode="single"
                    selected={summaryDate}
                    onSelect={setSummaryDate}
                    className="rounded-md border"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-purple-800">Actions</Label>
                  <div className="space-y-2">
                    <Button 
                      onClick={generateSummary} 
                      disabled={!selectedEmployee || !summaryDate || isGeneratingSummary}
                      className="w-full bg-purple-700 hover:bg-purple-800"
                    >
                      {isGeneratingSummary ? 'Generating...' : 'Generate Summary'}
                    </Button>
                    {summaryText && (
                      <Button 
                        onClick={copyToClipboard} 
                        variant="outline"
                        className="w-full bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200"
                      >
                        <CopyIcon className="h-4 w-4 mr-2" />
                        {copied ? 'Copied!' : 'Copy to Clipboard'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {summaryText && (
                <div className="space-y-2">
                  <Label className="text-purple-800">Summary Report</Label>
                  <Textarea
                    value={summaryText}
                    readOnly
                    className="min-h-[300px] font-mono text-sm bg-amber-50 border-amber-200"
                    placeholder="Generated summary will appear here..."
                  />
                </div>
              )}

              {selectedEmployee && summaryDate && (
                <Card className="bg-purple-50/80 border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-purple-900">Edit Instructions for {selectedEmployee}</CardTitle>
                    <CardDescription className="text-purple-700">
                      Edit employee number or timestamp for instructions on {format(summaryDate, 'PPP')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {instructions
                        .filter(instruction => {
                          if (!instruction.employeeNumber || instruction.employeeNumber !== selectedEmployee) return false
                          const instructionDate = new Date(instruction.timestamp)
                          return instructionDate.toDateString() === summaryDate.toDateString()
                        })
                        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                        .map((instruction) => (
                          <div key={instruction.id} className="border rounded-lg p-4 space-y-3 bg-purple-50/80 border-purple-200">
                            {editingInstructionId === instruction.id ? (
                              <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="space-y-2">
                                    <Label htmlFor={`edit-employee-${instruction.id}`} className="text-purple-800">Employee Number</Label>
                                    <Input
                                      id={`edit-employee-${instruction.id}`}
                                      value={editEmployeeNumber}
                                      onChange={(e) => setEditEmployeeNumber(e.target.value)}
                                      placeholder="Enter employee number"
                                      className="bg-amber-50 border-amber-200 h-8 text-sm"
                                      maxLength={15}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`edit-timestamp-${instruction.id}`}
                                        checked={allowTimestampEdit}
                                        onCheckedChange={(checked) => setAllowTimestampEdit(checked as boolean)}
                                      />
                                      <Label htmlFor={`edit-timestamp-${instruction.id}`} className="text-purple-800">Edit Timestamp</Label>
                                    </div>
                                    {allowTimestampEdit && (
                                      <Input
                                        type="datetime-local"
                                        value={editTimestamp}
                                        onChange={(e) => setEditTimestamp(e.target.value)}
                                        className="bg-amber-50 border-amber-200 h-8 text-sm"
                                      />
                                    )}
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    onClick={() => saveEdits(instruction.id)}
                                    size="sm"
                                    className="bg-purple-700 hover:bg-purple-800 text-white"
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    onClick={cancelEditing}
                                    variant="outline"
                                    size="sm"
                                    className="bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200"
                                  >
                                    Cancel
                                  </Button>
                                  {showDeleteConfirm === instruction.id ? (
                                    <div className="flex space-x-2">
                                      <Button
                                        onClick={() => deleteInstruction(instruction.id)}
                                        size="sm"
                                        variant="destructive"
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Confirm Delete
                                      </Button>
                                      <Button
                                        onClick={() => setShowDeleteConfirm(null)}
                                        size="sm"
                                        variant="outline"
                                        className="bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      onClick={() => setShowDeleteConfirm(instruction.id)}
                                      size="sm"
                                      variant="destructive"
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                  <div className="space-y-1">
                                    <Badge variant="outline" className="bg-purple-200 text-purple-900">Employee: {instruction.employeeNumber || 'Information Entry'}</Badge>
                                    <p className="text-sm text-purple-700">
                                      {format(new Date(instruction.timestamp), 'PPp')}
                                    </p>
                                  </div>
                                  <Button
                                    onClick={() => startEditing(instruction)}
                                    variant="outline"
                                    size="sm"
                                    className="bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200"
                                  >
                                    Edit
                                  </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div><strong className="text-purple-800">Route:</strong> {instruction.route}</div>
                                  <div><strong className="text-purple-800">Running:</strong> {instruction.runningNumber}</div>
                                  {instruction.headwayDeviation && (
                                    <div><strong className="text-purple-800">Headway Deviation:</strong> {instruction.headwayDeviation}</div>
                                  )}
                                  {instruction.earlyLate && (
                                    <div><strong className="text-purple-800">Early/Late:</strong> {instruction.earlyLate}</div>
                                  )}
                                </div>
                                <p className="text-sm"><strong className="text-purple-800">Instruction:</strong> {instruction.instruction}</p>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}