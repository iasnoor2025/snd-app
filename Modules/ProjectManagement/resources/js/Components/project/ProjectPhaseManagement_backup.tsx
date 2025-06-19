import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Modules/Core/resources/js/components/ui/card';
import { Button } from '@/Modules/Core/resources/js/components/ui/button';
import { Input } from '@/Modules/Core/resources/js/components/ui/input';
import { Label } from '@/Modules/Core/resources/js/components/ui/label';
import { DatePicker } from '@/Modules/Core/resources/js/components/ui/date-picker';
import { Textarea } from '@/Modules/Core/resources/js/components/ui/textarea';
import { Badge } from '@/Modules/Core/resources/js/components/ui/badge';
import { Progress } from '@/Modules/Core/resources/js/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Loader2, Plus, Calendar, Edit, BarChart, CheckCircle2 } from 'lucide-react';

interface Project {
  id: number;
  name: string;
  description: string;
  start_date: string;
  expected_end_date: string;
  actual_end_date: string | null;
  status: 'planning' | 'execution' | 'closure' | 'completed';
  budget: number;
  current_phase_id: number | null;
}

interface Phase {
  id: number;
  project_id: number;
  name: string;
  description: string;
  start_date: string;
  expected_end_date: string;
  actual_end_date: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
  order: number;
}

export const ProjectPhaseManagement: React.FC<{ projectId: number }> = ({ projectId }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [showAddPhaseDialog, setShowAddPhaseDialog] = useState(false);
  const [showEditPhaseDialog, setShowEditPhaseDialog] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);

  // New phase form state
  const [phaseName, setPhaseName] = useState('');
  const [phaseDescription, setPhaseDescription] = useState('');
  const [phaseStartDate, setPhaseStartDate] = useState<Date | undefined>(new Date());
  const [phaseEndDate, setPhaseEndDate] = useState<Date | undefined>(undefined);
  const [phaseOrder, setPhaseOrder] = useState<string>('');

  // Edit phase form state
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStartDate, setEditStartDate] = useState<Date | undefined>(undefined);
  const [editEndDate, setEditEndDate] = useState<Date | undefined>(undefined);
  const [editActualEndDate, setEditActualEndDate] = useState<Date | undefined>(undefined);
  const [editStatus, setEditStatus] = useState<string>('');
  const [editProgress, setEditProgress] = useState<string>('0');

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const [projectResponse, phasesResponse] = await Promise.all([
        axios.get(`/api/projects/${projectId}`),
        axios.get(`/api/projects/${projectId}/phases`)
      ]);

      setProject(projectResponse.data.data);
      setPhases(phasesResponse.data.data);
    } catch (error) {
      console.error('Error fetching project data:', error);
      toast.error('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhase = async () => {
    if (!phaseName || !phaseDescription || !phaseStartDate || !phaseEndDate || !phaseOrder) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`/api/projects/${projectId}/phases`, {
        name: phaseName,
        description: phaseDescription,
        start_date: phaseStartDate.toISOString().split('T')[0],
        expected_end_date: phaseEndDate.toISOString().split('T')[0],
        order: parseInt(phaseOrder)
      })

      toast.success('Project phase added successfully');
      setShowAddPhaseDialog(false);
      resetAddPhaseForm();
      fetchProjectData();
    } catch (error: any) {
      console.error('Error adding phase:', error);

      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to add phase. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPhase = async () => {
    if (!selectedPhase || !editName || !editDescription || !editStartDate || !editEndDate || !editStatus) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await axios.put(`/api/projects/${projectId}/phases/${selectedPhase.id}`, {
        name: editName,
        description: editDescription,
        start_date: editStartDate.toISOString().split('T')[0],
        expected_end_date: editEndDate.toISOString().split('T')[0],
        actual_end_date: editActualEndDate ? editActualEndDate.toISOString().split('T')[0] : null,
        status: editStatus,
        progress: parseInt(editProgress)
      })

      toast.success('Project phase updated successfully');
      setShowEditPhaseDialog(false);
      fetchProjectData();
    } catch (error: any) {
      console.error('Error updating phase:', error);

      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update phase. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openEditPhaseDialog = (phase: Phase) => {
    const { t } = useTranslation('project');

    setSelectedPhase(phase);
    setEditName(phase.name);
    setEditDescription(phase.description);
    setEditStartDate(new Date(phase.start_date));
    setEditEndDate(new Date(phase.expected_end_date));
    setEditActualEndDate(phase.actual_end_date ? new Date(phase.actual_end_date) : undefined);
    setEditStatus(phase.status);
    setEditProgress(phase.progress.toString());
    setShowEditPhaseDialog(true);
  };

  const resetAddPhaseForm = () => {
    setPhaseName('');
    setPhaseDescription('');
    setPhaseStartDate(new Date());
    setPhaseEndDate(undefined);
    setPhaseOrder('');
  };

  const getNextPhaseOrder = () => {
    if (phases.length === 0) return '1';
    return (Math.max(...phases.map(p => p.order)) + 1).toString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>
      case 'in_progress':
        return <Badge variant="secondary">{t('in_progress')}</Badge>
      case 'completed':
        return <Badge variant="success">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  };

  const getProjectStatusBadge = (status: string) => {
    switch (status) {
      case 'planning':
        return <Badge variant="outline">Planning</Badge>
      case 'execution':
        return <Badge variant="secondary">Execution</Badge>
      case 'closure':
        return <Badge variant="default">Closure</Badge>
      case 'completed':
        return <Badge variant="success">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';

    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  };

  const calculateOverallProgress = () => {
    if (phases.length === 0) return 0;

    const totalProgress = phases.reduce((sum, phase) => {
      return sum + phase.progress;
    }, 0);

    return Math.round(totalProgress / phases.length);
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        project ? (
          <>
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
            </div>

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
                          <p className="text-sm">{formatDate(phase.actual_end_date)}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Progress</p>
                          <span className="text-sm">{phase.progress}%</span>
                        </div>
                        <Progress value={phase.progress} className="h-2" />
                      </div>

                      <div className="flex justify-end mt-4">
                        <Button
                          variant="ghost"
                          onClick={() => openEditPhaseDialog(phase)}
                          className="flex items-center space-x-1"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          {t('ttl_edit_phase')}
                        </Button>

                        {phase.status !== 'completed' && (
                          <Button
                            variant="outline"
                            className="ml-2 flex items-center space-x-1"
                            onClick={async () => {
                              try {
                                await axios.post(`/api/projects/${projectId}/phases/${phase.id}/complete`);
                                toast.success('Phase marked as completed');
                                fetchProjectData();
                              } catch (error) {
                                console.error('Error completing phase:', error);
                                toast.error('Failed to complete phase');
                              }
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Add Phase Dialog */}
            <Dialog open={showAddPhaseDialog} onOpenChange={setShowAddPhaseDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('ttl_add_project_phase')}</DialogTitle>
                  <DialogDescription>
                    Create a new phase for this project
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('lbl_phase_name')}</Label>
                    <Input
                      id="name"
                      value={phaseName}
                      onChange={(e) => setPhaseName(e.target.value)}
                      placeholder={t('ph_eg_research_planning')}
                      disabled={submitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={phaseDescription}
                      onChange={(e) => setPhaseDescription(e.target.value)}
                      placeholder={t('ph_describe_the_objectives_and_activities_of_this')}
                      rows={3}
                      disabled={submitting}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('lbl_start_date')}</Label>
                      <DatePicker
                        date={phaseStartDate}
                        setDate={setPhaseStartDate}
                        disabled={submitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t('expected_end_date')}</Label>
                      <DatePicker
                        date={phaseEndDate}
                        setDate={setPhaseEndDate}
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="order">{t('lbl_phase_order')}</Label>
                    <Input
                      id="order"
                      type="number"
                      value={phaseOrder}
                      onChange={(e) => setPhaseOrder(e.target.value)}
                      min="1"
                      disabled={submitting}
                    />
                    <p className="text-sm text-muted-foreground">
                      Defines the sequence of phases in the project timeline
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddPhaseDialog(false)}
                    disabled={submitting}
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
                        Adding...
                      </>
                    ) : (
                      'Add Phase'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Phase Dialog */}
            <Dialog open={showEditPhaseDialog} onOpenChange={setShowEditPhaseDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('ttl_edit_project_phase')}</DialogTitle>
                  <DialogDescription>
                    Update details for this project phase
                  </DialogDescription>
                </DialogHeader>

                {selectedPhase && (
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">{t('lbl_phase_name')}</Label>
                      <Input
                        id="edit-name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        disabled={submitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={3}
                        disabled={submitting}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('lbl_start_date')}</Label>
                        <DatePicker
                          date={editStartDate}
                          setDate={setEditStartDate}
                          disabled={submitting}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{t('expected_end_date')}</Label>
                        <DatePicker
                          date={editEndDate}
                          setDate={setEditEndDate}
                          disabled={submitting}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>{t('actual_end_date')}</Label>
                      <DatePicker
                        date={editActualEndDate}
                        setDate={setEditActualEndDate}
                        disabled={submitting}
                      />
                      <p className="text-sm text-muted-foreground">
                        Only set this when the phase is fully completed
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={editStatus}
                        onValueChange={setEditStatus}
                        disabled={submitting}
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder={t('ph_select_status')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">{t('in_progress')}</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="progress">Progress (%)</Label>
                      <Input
                        id="progress"
                        type="number"
                        value={editProgress}
                        onChange={(e) => setEditProgress(e.target.value)}
                        min="0"
                        max="100"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowEditPhaseDialog(false)}
                    disabled={submitting}
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
          </>
        ) : null
      )}
    </div>
  );
};

export default ProjectPhaseManagement;














