import { useState, useEffect } from "react";
import { z } from "zod";
import type { Lead, UpdateLead } from "../../../domain/schemas/lead.schema";
import type { CreateOpportunity } from "../../../domain/schemas/opportunity.schema";
import {
  useUpdateLead,
  useConvertLead,
} from "../../../application/hooks/useLeads";
import { useCreateOpportunity } from "../../../application/hooks/useOpportunities";
import { SlideOver } from "../ui/SlideOver";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { formatDate, formatScore } from "../../../shared/utils/formatters";
import {
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Building,
  ArrowRight,
} from "lucide-react";

interface LeadDetailsProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onConversionSuccess?: () => void;
}

const statusOptions = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
];

export function LeadDetails({
  lead,
  isOpen,
  onClose,
  onConversionSuccess,
}: LeadDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ email: "", status: "" });
  const [emailError, setEmailError] = useState("");
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [conversionForm, setConversionForm] = useState({
    amount: "",
    stage: "qualification",
  });

  const updateLead = useUpdateLead();
  const convertLead = useConvertLead();
  const createOpportunity = useCreateOpportunity();

  useEffect(() => {
    if (lead) {
      setEditForm({
        email: lead.email,
        status: lead.status,
      });
      setEmailError("");
      setIsEditing(false);
      setShowConvertDialog(false);
      setConversionForm({
        amount: "",
        stage: "qualification",
      });
    }
  }, [lead]);

  const handleSave = async () => {
    if (!lead) return;

    try {
      const emailSchema = z.string().email("Invalid email format");
      emailSchema.parse(editForm.email);
      setEmailError("");

      const updateData: UpdateLead = {
        id: lead.id,
        email: editForm.email,
        status: editForm.status as Lead["status"],
      };

      await updateLead.mutateAsync(updateData);
      setIsEditing(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setEmailError(error.issues[0].message);
      }
    }
  };

  const handleCancel = () => {
    if (lead) {
      setEditForm({
        email: lead.email,
        status: lead.status,
      });
      setEmailError("");
      setIsEditing(false);
    }
  };

  const handleConvert = async () => {
    if (!lead) return;

    try {
      const opportunityData: CreateOpportunity = {
        name: `${lead.company} - Opportunity`,
        stage: conversionForm.stage as CreateOpportunity["stage"],
        amount: conversionForm.amount
          ? parseFloat(conversionForm.amount)
          : undefined,
        accountName: lead.company,
        leadId: lead.id,
        probability: 50,
      };

      const opportunity = await createOpportunity.mutateAsync(opportunityData);
      await convertLead.mutateAsync({
        leadId: lead.id,
        opportunityId: opportunity.id,
      });

      setShowConvertDialog(false);
      onConversionSuccess?.();
      onClose();
    } catch (error) {
      console.error("Conversion failed:", error);
    }
  };

  if (!lead) return null;

  return (
    <SlideOver isOpen={isOpen} onClose={onClose} title="Lead Details">
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">{lead.name}</h2>
            <Badge
              variant={lead.status === "qualified" ? "success" : "default"}
            >
              {lead.status}
            </Badge>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Building className="h-4 w-4" />
              <span>{lead.company}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="h-4 w-4" />
              <span>{lead.email}</span>
            </div>

            {lead.phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{lead.phone}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-gray-600">
              <TrendingUp className="h-4 w-4" />
              <span>Score: {formatScore(lead.score)}/100</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Created: {formatDate(lead.createdAt)}</span>
            </div>
          </div>
        </div>

        {lead.notes && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Notes</h3>
            <p className="text-sm text-gray-600">{lead.notes}</p>
          </div>
        )}

        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Edit Details
          </h3>

          {!isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Email
                </label>
                <p className="text-sm font-medium">{lead.email}</p>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Status
                </label>
                <p className="text-sm font-medium">{lead.status}</p>
              </div>

              <Button
                onClick={() => setIsEditing(true)}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                Edit
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                label="Email"
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                error={emailError}
              />

              <Select
                label="Status"
                value={editForm.status}
                onChange={(e) =>
                  setEditForm({ ...editForm, status: e.target.value })
                }
                options={statusOptions}
              />

              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  isLoading={updateLead.isPending}
                >
                  Save
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {lead.status === "qualified" && !lead.convertedToOpportunityId && (
          <div className="border-t pt-4">
            {!showConvertDialog ? (
              <Button
                onClick={() => setShowConvertDialog(true)}
                variant="primary"
                className="w-full"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Convert to Opportunity
              </Button>
            ) : (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900">
                  Create Opportunity
                </h3>

                <Input
                  label="Amount (optional)"
                  type="number"
                  placeholder="0.00"
                  value={conversionForm.amount}
                  onChange={(e) =>
                    setConversionForm({
                      ...conversionForm,
                      amount: e.target.value,
                    })
                  }
                />

                <Select
                  label="Stage"
                  value={conversionForm.stage}
                  onChange={(e) =>
                    setConversionForm({
                      ...conversionForm,
                      stage: e.target.value,
                    })
                  }
                  options={[
                    { value: "prospecting", label: "Prospecting" },
                    { value: "qualification", label: "Qualification" },
                    { value: "proposal", label: "Proposal" },
                    { value: "negotiation", label: "Negotiation" },
                  ]}
                />

                <div className="flex gap-2">
                  <Button
                    onClick={handleConvert}
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    isLoading={
                      createOpportunity.isPending || convertLead.isPending
                    }
                  >
                    Convert
                  </Button>
                  <Button
                    onClick={() => setShowConvertDialog(false)}
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {lead.convertedToOpportunityId && (
          <div className="border-t pt-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-800">
                This lead has been converted to an opportunity
              </p>
            </div>
          </div>
        )}
      </div>
    </SlideOver>
  );
}
