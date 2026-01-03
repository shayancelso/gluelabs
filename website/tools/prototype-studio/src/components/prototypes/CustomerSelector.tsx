import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Upload, Search, Users, DollarSign, Calendar, User } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

export interface Customer {
  id: string;
  name: string;
  arr: number;
  segment: string | null;
  account_owner: string | null;
  renewal_date: string | null;
}

interface CustomerSelectorProps {
  clientId: string;
  customers: Customer[];
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer | null) => void;
  onCustomersChange: (customers: Customer[]) => void;
}

export function CustomerSelector({
  clientId,
  customers,
  selectedCustomer,
  onSelectCustomer,
  onCustomersChange,
}: CustomerSelectorProps) {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state for adding customer
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    arr: '',
    segment: '',
    account_owner: '',
    renewal_date: '',
  });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.account_owner?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCustomer = async () => {
    if (!newCustomer.name.trim()) {
      toast({ title: 'Error', description: 'Customer name is required', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('client_customers')
        .insert({
          client_id: clientId,
          name: newCustomer.name.trim(),
          arr: parseFloat(newCustomer.arr) || 0,
          segment: newCustomer.segment || null,
          account_owner: newCustomer.account_owner || null,
          renewal_date: newCustomer.renewal_date || null,
        })
        .select()
        .single();

      if (error) throw error;

      const addedCustomer: Customer = {
        id: data.id,
        name: data.name,
        arr: data.arr || 0,
        segment: data.segment,
        account_owner: data.account_owner,
        renewal_date: data.renewal_date,
      };

      onCustomersChange([...customers, addedCustomer]);
      onSelectCustomer(addedCustomer);
      setNewCustomer({ name: '', arr: '', segment: '', account_owner: '', renewal_date: '' });
      setIsAddDialogOpen(false);
      toast({ title: 'Customer added', description: `${addedCustomer.name} has been added` });
    } catch (error) {
      console.error('Error adding customer:', error);
      toast({ title: 'Error', description: 'Failed to add customer', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsSubmitting(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast({ title: 'Error', description: 'CSV file is empty or has no data rows', variant: 'destructive' });
        return;
      }

      // Parse header
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
      const nameIndex = headers.findIndex(h => h.includes('name') || h.includes('customer') || h.includes('company'));
      const arrIndex = headers.findIndex(h => h.includes('arr') || h.includes('revenue') || h.includes('value'));
      const segmentIndex = headers.findIndex(h => h.includes('segment') || h.includes('tier'));
      const ownerIndex = headers.findIndex(h => h.includes('owner') || h.includes('csm') || h.includes('manager'));
      const renewalIndex = headers.findIndex(h => h.includes('renewal') || h.includes('date'));

      if (nameIndex === -1) {
        toast({ title: 'Error', description: 'CSV must have a column for customer name', variant: 'destructive' });
        return;
      }

      // Parse data rows
      const customersToAdd: Omit<Customer, 'id'>[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const name = values[nameIndex];
        if (!name) continue;

        customersToAdd.push({
          name,
          arr: arrIndex >= 0 ? parseFloat(values[arrIndex]?.replace(/[^0-9.-]/g, '')) || 0 : 0,
          segment: segmentIndex >= 0 ? values[segmentIndex] || null : null,
          account_owner: ownerIndex >= 0 ? values[ownerIndex] || null : null,
          renewal_date: renewalIndex >= 0 ? values[renewalIndex] || null : null,
        });
      }

      if (customersToAdd.length === 0) {
        toast({ title: 'Error', description: 'No valid customers found in CSV', variant: 'destructive' });
        return;
      }

      // Insert all customers
      const { data, error } = await supabase
        .from('client_customers')
        .insert(customersToAdd.map(c => ({ ...c, client_id: clientId })))
        .select();

      if (error) throw error;

      const addedCustomers: Customer[] = (data || []).map(d => ({
        id: d.id,
        name: d.name,
        arr: d.arr || 0,
        segment: d.segment,
        account_owner: d.account_owner,
        renewal_date: d.renewal_date,
      }));

      onCustomersChange([...customers, ...addedCustomers]);
      setIsImportDialogOpen(false);
      toast({ title: 'Import complete', description: `${addedCustomers.length} customers imported` });
    } catch (error) {
      console.error('Error importing CSV:', error);
      toast({ title: 'Error', description: 'Failed to import CSV', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }, [clientId, customers, onCustomersChange, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Customer Selection */}
          <div className="flex-1">
            <Label className="text-sm text-muted-foreground mb-2 block">Select Customer to Assess</Label>
            <Select 
              value={selectedCustomer?.id || ''} 
              onValueChange={(id) => {
                const customer = customers.find(c => c.id === id);
                onSelectCustomer(customer || null);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a customer..." />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <div className="relative mb-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search customers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                {filteredCustomers.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No customers found
                  </div>
                ) : (
                  filteredCustomers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      <div className="flex items-center justify-between w-full gap-4">
                        <span className="font-medium">{customer.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(customer.arr)}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-end gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Customer</DialogTitle>
                  <DialogDescription>
                    Add a customer to assess their risk profile
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Customer Name *</Label>
                    <Input
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Acme Corp"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>ARR ($)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={newCustomer.arr}
                          onChange={(e) => setNewCustomer(prev => ({ ...prev, arr: e.target.value }))}
                          placeholder="50000"
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Segment</Label>
                      <Select 
                        value={newCustomer.segment} 
                        onValueChange={(v) => setNewCustomer(prev => ({ ...prev, segment: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Enterprise">Enterprise</SelectItem>
                          <SelectItem value="Mid-Market">Mid-Market</SelectItem>
                          <SelectItem value="SMB">SMB</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Account Owner</Label>
                      <div className="relative">
                        <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={newCustomer.account_owner}
                          onChange={(e) => setNewCustomer(prev => ({ ...prev, account_owner: e.target.value }))}
                          placeholder="John Smith"
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Renewal Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="date"
                          value={newCustomer.renewal_date}
                          onChange={(e) => setNewCustomer(prev => ({ ...prev, renewal_date: e.target.value }))}
                          className="pl-8"
                        />
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleAddCustomer} disabled={isSubmitting} className="w-full">
                    {isSubmitting ? 'Adding...' : 'Add Customer'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Import CSV
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Customers from CSV</DialogTitle>
                  <DialogDescription>
                    Upload a CSV file with columns for: Name, ARR, Segment, Account Owner, Renewal Date
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    {isDragActive ? (
                      <p className="text-sm">Drop the CSV file here...</p>
                    ) : (
                      <>
                        <p className="text-sm font-medium">Drag & drop a CSV file here</p>
                        <p className="text-xs text-muted-foreground mt-1">or click to select a file</p>
                      </>
                    )}
                  </div>
                  {isSubmitting && (
                    <p className="text-sm text-center mt-4 text-muted-foreground">Importing...</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Selected Customer Info */}
        {selectedCustomer && (
          <div className="mt-4 pt-4 border-t flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{selectedCustomer.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>{formatCurrency(selectedCustomer.arr)} ARR</span>
            </div>
            {selectedCustomer.segment && (
              <div className="flex items-center gap-2 text-muted-foreground">
                {selectedCustomer.segment}
              </div>
            )}
            {selectedCustomer.account_owner && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                {selectedCustomer.account_owner}
              </div>
            )}
            {selectedCustomer.renewal_date && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Renewal: {new Date(selectedCustomer.renewal_date).toLocaleDateString()}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
