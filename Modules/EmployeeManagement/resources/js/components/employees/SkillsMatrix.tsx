import { Button } from '@/../../Modules/Core/resources/js/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/../../Modules/Core/resources/js/components/ui/card';
import { Input } from '@/../../Modules/Core/resources/js/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/../../Modules/Core/resources/js/components/ui/select';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Skill {
    id: number;
    name: string;
    category: string | null;
    description: string | null;
}

interface EmployeeSkill {
    id: number;
    name: string;
    category: string | null;
    description: string | null;
    proficiency: number;
    certified_at: string | null;
}

export function SkillsMatrix({ employeeId }: { employeeId: number }) {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [employeeSkills, setEmployeeSkills] = useState<EmployeeSkill[]>([]);
    const [selectedSkill, setSelectedSkill] = useState<string>('');
    const [proficiency, setProficiency] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchSkills();
        fetchEmployeeSkills();
    }, []);

    const fetchSkills = async () => {
        const res = await fetch('/api/skills');
        const data = await res.json();
        setSkills(data.data);
    };

    const fetchEmployeeSkills = async () => {
        const res = await fetch(`/api/employees/${employeeId}/skills`);
        const data = await res.json();
        setEmployeeSkills(data.data);
    };

    const handleAssignSkill = async () => {
        setIsLoading(true);
        try {
            await fetch(`/api/employees/${employeeId}/skills/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skill_id: selectedSkill, proficiency }),
            });
            toast.success('Skill assigned');
            setSelectedSkill('');
            setProficiency(1);
            fetchEmployeeSkills();
        } catch {
            toast.error('Failed to assign skill');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveSkill = async (skillId: number) => {
        setIsLoading(true);
        try {
            await fetch(`/api/employees/${employeeId}/skills/remove`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skill_id: skillId }),
            });
            toast.success('Skill removed');
            fetchEmployeeSkills();
        } catch {
            toast.error('Failed to remove skill');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProficiency = async (skillId: number, newProficiency: number) => {
        setIsLoading(true);
        try {
            await fetch(`/api/employees/${employeeId}/skills/update-proficiency`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skill_id: skillId, proficiency: newProficiency }),
            });
            toast.success('Proficiency updated');
            fetchEmployeeSkills();
        } catch {
            toast.error('Failed to update proficiency');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Skills Matrix</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex gap-4">
                    <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                        <SelectTrigger className="w-64">
                            <SelectValue placeholder="Select skill" />
                        </SelectTrigger>
                        <SelectContent>
                            {skills.map((skill) => (
                                <SelectItem key={skill.id} value={skill.id.toString()}>
                                    {skill.name} {skill.category ? `(${skill.category})` : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input
                        type="number"
                        min={1}
                        max={5}
                        value={proficiency}
                        onChange={(e) => setProficiency(Number(e.target.value))}
                        className="w-24"
                        placeholder="Proficiency"
                    />
                    <Button onClick={handleAssignSkill} disabled={!selectedSkill || isLoading}>
                        Assign Skill
                    </Button>
                </div>
                <table className="min-w-full border text-sm">
                    <thead>
                        <tr>
                            <th className="border px-2 py-1">Skill</th>
                            <th className="border px-2 py-1">Category</th>
                            <th className="border px-2 py-1">Proficiency</th>
                            <th className="border px-2 py-1">Certified</th>
                            <th className="border px-2 py-1">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employeeSkills.map((skill) => (
                            <tr key={skill.id}>
                                <td className="border px-2 py-1">{skill.name}</td>
                                <td className="border px-2 py-1">{skill.category}</td>
                                <td className="border px-2 py-1">
                                    <Input
                                        type="number"
                                        min={1}
                                        max={5}
                                        value={skill.proficiency}
                                        onChange={(e) => handleUpdateProficiency(skill.id, Number(e.target.value))}
                                        className="w-16"
                                    />
                                </td>
                                <td className="border px-2 py-1">{skill.certified_at ? new Date(skill.certified_at) : '-'}</td>
                                <td className="border px-2 py-1">
                                    <Button variant="destructive" size="sm" onClick={() => handleRemoveSkill(skill.id)} disabled={isLoading}>
                                        Remove
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {employeeSkills.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-2 text-center">
                                    No skills assigned
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
}
