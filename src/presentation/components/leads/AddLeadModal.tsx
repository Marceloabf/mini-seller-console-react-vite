import { useState } from 'react';
import { z } from 'zod';
import type { CreateLead } from '../../../domain/schemas/lead.schema';
import { useCreateLead } from '../../../application/hooks/useLeads';
import { SlideOver } from '../ui/SlideOver';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const sourceOptions = [
  { value: 'website', label: 'Website' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'referral', label: 'Referral' },
  { value: 'social', label: 'Social Media' },
  { value: 'other', label: 'Other' },
];

export function AddLeadModal({ isOpen, onClose, onSuccess }: AddLeadModalProps) {
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    source: 'website',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createLead = useCreateLead();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const leadData: CreateLead = {
        name: form.name,
        company: form.company,
        email: form.email,
        phone: form.phone || undefined,
        source: form.source as CreateLead['source'],
        score: Math.floor(Math.random() * 41) + 60,
        status: 'new',
        notes: form.notes || undefined,
      };

      await createLead.mutateAsync(leadData);
      onSuccess?.();
      onClose();
      setForm({
        name: '',
        company: '',
        email: '',
        phone: '',
        source: 'website',
        notes: '',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        console.error('Failed to create lead:', error);
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Lead"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Input
            label="Name *"
            type="text"
            value={form.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={errors.name}
            placeholder="John Doe"
            required
          />
        </div>

        <div>
          <Input
            label="Company *"
            type="text"
            value={form.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            error={errors.company}
            placeholder="Acme Corp"
            required
          />
        </div>

        <div>
          <Input
            label="Email *"
            type="email"
            value={form.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={errors.email}
            placeholder="john@acme.com"
            required
          />
        </div>

        <div>
          <Input
            label="Phone"
            type="tel"
            value={form.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            error={errors.phone}
            placeholder="+55 11 99999-9999"
          />
        </div>

        <div>
          <Select
            label="Source *"
            value={form.source}
            onChange={(e) => handleInputChange('source', e.target.value)}
            options={sourceOptions}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Additional notes about this lead..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            isLoading={createLead.isPending}
          >
            Create Lead
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </SlideOver>
  );
}