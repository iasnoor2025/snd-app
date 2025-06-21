import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Core";
import { Button } from "@/Core";
import { Input } from "@/Core";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/Core";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/Core";
import { Plus, Loader2, Pencil, Trash2 } from 'lucide-react';
import { Label } from "@/Core";
import axios from 'axios';
import { getTranslation } from "@/Core";

interface Position {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
}

interface PositionSelectorProps {
  value: number | null;
  onChange: (value: number | null) => void;
  initialPositions?: Position[];
  onPositionCreated?: (position: Position) => void;
}

const PositionSelector = ({ value, onChange, initialPositions = [], onPositionCreated }: PositionSelectorProps) => {
  const { t } = useTranslation(['employees', 'common']);
  const [positions, setPositions] = useState<Position[]>(initialPositions);
  const [loading, setLoading] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const [newPositionName, setNewPositionName] = useState('');
  const [newPositionDescription, setNewPositionDescription] = useState('');
  const [editingPositionId, setEditingPositionId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchPositions = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/v1/positions');
      if (Array.isArray(response.data)) {
        setPositions(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setPositions(response.data.data);
      } else {
        throw new Error('Invalid response format from positions API');
      }
    } catch (error: any) {
      toast.error(t('employees:error_fetching_positions'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialPositions && Array.isArray(initialPositions)) {
      const validPositions = initialPositions.filter((p): p is Position =>
        p !== null && p !== undefined && typeof p.id === 'number' && typeof p.name === 'string'
      );
      setPositions(validPositions);
    }
  }, [initialPositions]);

  useEffect(() => {
    fetchPositions();
    // eslint-disable-next-line
  }, []);

  const handleError = (error: any) => {
    if (error.response?.status === 401) {
      toast.error(t('common:session_expired'));
      window.location.href = '/login';
      return;
    }
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error(t('common:unexpected_error'));
    }
  };

  const handleAddPosition = async () => {
    if (!newPositionName.trim()) {
      toast.error(t('employees:position_name_required'));
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const response = await axios.post('/api/v1/positions', {
        name: newPositionName,
        description: newPositionDescription,
        is_active: true
      });
      await fetchPositions();
      setAddingNew(false);
      setNewPositionName('');
      setNewPositionDescription('');
      setEditingPositionId(null);
      if (onPositionCreated) {
        onPositionCreated(response.data);
      }
      toast.success(t('employees:position_created_success'));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || t('employees:error_creating_position');
      const validationErrors = error.response?.data?.errors;
      if (validationErrors) {
        Object.values(validationErrors).forEach((messages: any) => {
          (messages as string[]).forEach((message: string) => {
            toast.error(message);
          });
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePosition = async () => {
    if (!editingPositionId || !newPositionName.trim()) {
      toast.error(t('employees:position_name_required'));
      return;
    }
    setLoading(true);
    try {
      const response = await axios.put(`/api/v1/positions/${editingPositionId}`, {
        name: newPositionName,
        description: newPositionDescription,
        is_active: true
      });
      if (response.data) {
        setPositions(prev => prev.map(p =>
          p.id === editingPositionId ? response.data : p
        ));
        toast.success(t('employees:position_updated_success'));
        setNewPositionName('');
        setNewPositionDescription('');
        setEditingPositionId(null);
        setAddingNew(false);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || t('employees:error_updating_position');
      const validationErrors = error.response?.data?.errors;
      if (validationErrors) {
        Object.values(validationErrors).forEach((messages: any) => {
          (messages as string[]).forEach((message: string) => {
            toast.error(message);
          });
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePosition = async () => {
    if (!value) return;
    setLoading(true);
    try {
      await axios.delete(`/api/v1/positions/${value}`);
      toast.success(t('employees:position_deleted_success'));
      onChange(null);
      await fetchPositions();
    } catch (error: any) {
      handleError(error);
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleEditPosition = (position: Position) => {
    setAddingNew(true);
    setNewPositionName(position.name);
    setNewPositionDescription(position.description || '');
    setEditingPositionId(position.id);
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={value?.toString() || 'none'}
        onValueChange={(val) => {
          const numericValue = val === 'none' ? null : parseInt(val, 10);
          if (numericValue) {
            const selectedPosition = positions.find(p => p.id === numericValue);
            if (selectedPosition) {
              onChange(numericValue);
            }
          } else {
            onChange(null);
          }
        }}
      >
        <SelectTrigger className="h-10">
          <SelectValue placeholder={t('employees:select_position')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem key="select-none" value="none">{t('employees:select_a_position')}</SelectItem>
          {positions.map((position) => (
            <SelectItem
              key={`position-${position.id}`}
              value={position.id ? position.id.toString() : 'none'}
            >
              {getTranslation(position.name) || t('employees:unnamed_position')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value && (
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const selectedPosition = positions.find(p => p.id === value);
              if (selectedPosition) {
                handleEditPosition(selectedPosition);
              }
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-10"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('employees:delete_position')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('employees:confirm_delete_position', { name: positions.find(p => p.id === value)?.name })}
                  {t('common:action_cannot_be_undone')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>{t('common:cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeletePosition}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('common:deleting')}
                    </>
                  ) : (
                    t('common:delete')
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
      <Dialog open={addingNew} onOpenChange={setAddingNew}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setAddingNew(true);
              setNewPositionName('');
              setNewPositionDescription('');
              setEditingPositionId(null);
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPositionId ? t('employees:edit_position') : t('employees:add_new_position')}</DialogTitle>
            <DialogDescription>
              {editingPositionId ? t('employees:update_position_details') : t('employees:enter_position_details')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('employees:position_name')}</Label>
              <Input
                id="name"
                value={newPositionName}
                onChange={(e) => setNewPositionName(e.target.value)}
                placeholder={t('employees:enter_position_name')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (editingPositionId) {
                      handleUpdatePosition();
                    } else {
                      handleAddPosition();
                    }
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t('employees:position_description_optional')}</Label>
              <Input
                id="description"
                value={newPositionDescription}
                onChange={(e) => setNewPositionDescription(e.target.value)}
                placeholder={t('employees:enter_position_description')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (editingPositionId) {
                      handleUpdatePosition();
                    } else {
                      handleAddPosition();
                    }
                  }
                }}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setAddingNew(false);
              setNewPositionName('');
              setNewPositionDescription('');
              setEditingPositionId(null);
            }}>
              {t('common:cancel')}
            </Button>
            <Button
              onClick={editingPositionId ? handleUpdatePosition : handleAddPosition}
              disabled={loading || !newPositionName.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingPositionId ? t('common:updating') : t('common:adding')}
                </>
              ) : (
                editingPositionId ? t('employees:update_position') : t('employees:add_position')
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {loading && <p className="text-sm text-gray-500">{t('employees:loading_positions')}</p>}
    </div>
  );
};

export default PositionSelector;


















