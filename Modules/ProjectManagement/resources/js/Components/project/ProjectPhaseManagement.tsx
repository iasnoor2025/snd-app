import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Core";
import { Button } from "@/Core";
import { Badge } from "@/Core";
import { Progress } from "@/Core";
import { Input } from "@/Core";
import { Label } from "@/Core";
import { Textarea } from "@/Core";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Core";
import { Calendar, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from "@/Core";

interface Phase {
  id: number;
  name: string;
  description: string;
  start_date: string;
  expected_end_date: string;
  actual_end_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  order: number;
  completion_percentage: number;
}

interface Project {
  id: number;
  name: string;
  description: string;
  start_date: string;
  expected_end_date: string;
  actual_end_date?: string;
  budget: number;
  status: 'planning' | 'in_progress' | 'completed' | 'cancelled';
}

interface ProjectPhaseManagementProps {
  project: Project;
}

const ProjectPhaseManagement: React.FC<ProjectPhaseManagementProps> = ({ project }) => {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPhaseDialog, setShowAddPhaseDialog] = useState(false);
  const [showEditPhaseDialog, setShowEditPhaseDialog] = useState(false);
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [phaseOrder, setPhaseOrder] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    expected_end_date: '',
    order: 1
  });

  // Mock functions - replace with actual implementations
  const formatDate = (date: string) => new Date(date).toLocaleDateString();
  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const getProjectStatusBadge = (status: string) => {
  const { t } = useTranslation('project');

    const variants: Record<string, string> = {
      planning: 'secondary',
      in_progress: 'default',
      completed: 'success',
      cancelled: 'destructive'
    };
    return <Badge variant={variants[status] as any}>{status.replace('_', ' ')}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'secondary',
      in_progress: 'default',
      completed: 'success',
      cancelled: 'destructive'
    };
    return <Badge variant={variants[status] as any}>{status.replace('_', ' ')}</Badge>;
  };

  const calculateOverallProgress = () => {
    if (phases.length === 0) return 0;
    const totalProgress = phases.reduce((sum, phase) => sum + phase.completion_percentage, 0);
    return Math.round(totalProgress / phases.length);
  };

  const getNextPhaseOrder = () => {
    return phases.length > 0 ? Math.max(...phases.map(p => p.order)) + 1 : 1;
  };

  const handleAddPhase = () => {
    // Implementation for adding phase
  };

  const handleEditPhase = () => {
    // Implementation for editing phase
  };

  const handleDeletePhase = (phase: Phase) => {
    // Implementation for deleting phase
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        project ? (
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </div>
                  {getProjectStatusBadge(project.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">{t('date_range')}</h3>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(project.start_date)} - {project.actual_end_date ? formatDate(project.actual_end_date) : formatDate(project.expected_end_date)}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Budget</h3>
                    <div className="font-semibold">{formatCurrency(project.budget)}</div>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">{t('overall_progress')}</h3>
                    <span className="text-sm">{calculateOverallProgress()}%</span>
                  </div>
                  <Progress value={calculateOverallProgress()} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">{t('project_phases')}</h2>
              <Button onClick={() => {
                setPhaseOrder(getNextPhaseOrder());
                setShowAddPhaseDialog(true);
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Phase
              </Button>
            </div>

            {phases.length === 0 ? (
              <Card>
                <CardContent className="py-10">
                  <div className="text-center text-muted-foreground">
                    <p>No phases have been defined for this project.</p>
                    <p className="mt-2">Create your first phase to get started.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {phases.map((phase) => (
                  <Card key={phase.id} className={phase.status === 'in_progress' ? 'border-primary' : ''}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="bg-muted rounded-full h-6 w-6 flex items-center justify-center text-xs mr-3">
                            {phase.order}
                          </span>
                          <CardTitle className="text-lg">{phase.name}</CardTitle>
                        </div>
                        {getStatusBadge(phase.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{phase.description}</p>
                      <div className="grid grid-cols-3 gap-6 mb-4">
                        <div>
                          <p className="text-sm font-medium">{t('lbl_start_date')}</p>
                          <p className="text-sm">{formatDate(phase.start_date)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{t('expected_end_date')}</p>
                          <p className="text-sm">{formatDate(phase.expected_end_date)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{t('actual_end_date')}</p>
                          <p className="text-sm">{formatDate(phase.actual_end_date || '')}</p>
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm">{phase.completion_percentage}%</span>
                        </div>
                        <Progress value={phase.completion_percentage} className="h-2" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingPhase(phase);
                            setFormData({
                              name: phase.name,
                              description: phase.description,
                              start_date: phase.start_date,
                              expected_end_date: phase.expected_end_date,
                              order: phase.order
                            });
                            setShowEditPhaseDialog(true);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePhase(phase)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Dialog open={showAddPhaseDialog} onOpenChange={setShowAddPhaseDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('ttl_add_new_phase')}</DialogTitle>
                  <DialogDescription>
                    Create a new phase for this project.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">{t('lbl_phase_name')}</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t('ph_enter_phase_name')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder={t('ph_enter_phase_description')}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date">{t('lbl_start_date')}</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expected_end_date">{t('expected_end_date')}</Label>
                      <Input
                        id="expected_end_date"
                        type="date"
                        value={formData.expected_end_date}
                        onChange={(e) => setFormData({ ...formData, expected_end_date: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddPhaseDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddPhase}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Phase'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showEditPhaseDialog} onOpenChange={setShowEditPhaseDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('ttl_edit_phase')}</DialogTitle>
                  <DialogDescription>
                    Update the phase details.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit_name">{t('lbl_phase_name')}</Label>
                    <Input
                      id="edit_name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t('ph_enter_phase_name')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_description">Description</Label>
                    <Textarea
                      id="edit_description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder={t('ph_enter_phase_description')}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit_start_date">{t('lbl_start_date')}</Label>
                      <Input
                        id="edit_start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_expected_end_date">{t('expected_end_date')}</Label>
                      <Input
                        id="edit_expected_end_date"
                        type="date"
                        value={formData.expected_end_date}
                        onChange={(e) => setFormData({ ...formData, expected_end_date: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowEditPhaseDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleEditPhase}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Phase'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ) : null
      )}
    </div>
  );
};

export default ProjectPhaseManagement;














